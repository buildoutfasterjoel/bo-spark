#!/usr/bin/env bun
import * as p from "@clack/prompts";
import { rm, exists } from "fs/promises";
import { join } from "path";

const TEMPLATE_REPO = "https://github.com/buildoutfasterjoel/bo-prototype-tpl";

const YB = "\x1b[93m\x1b[1m"; // bright yellow bold — bolt
const DY = "\x1b[33m"; // dim yellow         — particles
const R = "\x1b[0m"; // reset

function banner(): void {
  console.log(`
${DY}╔══════════════════════════════════════════════════════╗${R}

  ${YB}       _____  ${R}    ${YB}██████╗  ██████╗ ${R}
  ${YB}      /    /  ${R}    ${YB}██╔══██╗██╔═══██╗${R}
  ${YB}     /    /   ${R}    ${YB}██████╔╝██║   ██║${R}
  ${YB}    /    /    ${R}    ${YB}██╔══██╗██║   ██║${R}
  ${YB}   /    /____ ${R}    ${YB}██████╔╝╚██████╔╝${R}
  ${YB}  /         / ${R}    ${YB}╚═════╝  ╚═════╝ ${R}
  ${YB} /____     /  ${R}
  ${YB}     /    /   ${R}    ${YB}⚡  S P A R K  ⚡${R}
  ${YB}    /    /    ${R}
  ${YB}   /____/     ${R}

${DY}╚══════════════════════════════════════════════════════╝${R}
`);
}

async function main() {
  console.clear();
  banner();

  // ── Project name ──────────────────────────────────────────────
  const projectName = await p.text({
    message: "What are we calling this prototype?",
    placeholder: "my-prototype",
    validate: (v) => {
      if (!v?.trim()) return "Project name is required";
      if (!/^[a-z0-9-]+$/.test(v))
        return "Lowercase letters, numbers and hyphens only";
      return undefined;
    },
  });
  if (p.isCancel(projectName)) cancel();

  const targetDir = join(process.cwd(), projectName);

  if (await exists(targetDir)) {
    p.cancel(
      `Directory "${projectName}" already exists. Pick a different name.`,
    );
    process.exit(1);
  }

  // ── Credentials ───────────────────────────────────────────────
  p.note(
    [
      "You'll need two tokens — neither is stored anywhere except your local .env file.\n",
      "GitHub Packages → github.com › Settings › Developer settings › Personal access tokens (read:packages scope)",
      "Font Awesome Pro → fontawesome.com › Account › Packages › Pro Token",
    ].join("\n"),
    "Before we clone",
  );

  const githubToken = await p.password({
    message: "GitHub Packages token",
    validate: (v) => (!v?.trim() ? "Token is required" : undefined),
  });
  if (p.isCancel(githubToken)) cancel();

  const fontawesomeToken = await p.password({
    message: "Font Awesome Pro token",
    validate: (v) => (!v?.trim() ? "Token is required" : undefined),
  });
  if (p.isCancel(fontawesomeToken)) cancel();

  // ── Clone ─────────────────────────────────────────────────────
  const spinner = p.spinner();

  spinner.start("Cloning template…");
  const clone = Bun.spawnSync(
    ["git", "clone", "--depth=1", TEMPLATE_REPO, targetDir],
    { stderr: "pipe" },
  );

  if (clone.exitCode !== 0) {
    spinner.stop("Clone failed");
    p.cancel(clone.stderr.toString());
    process.exit(1);
  }

  await rm(join(targetDir, ".git"), { recursive: true, force: true });
  spinner.stop("Template cloned");

  // ── Write .env ────────────────────────────────────────────────
  spinner.start("Writing .env…");
  const env = [
    `GITHUB_PACKAGES_TOKEN=${githubToken}`,
    `FONTAWESOME_PRO_TOKEN=${fontawesomeToken}`,
    "",
  ].join("\n");

  await Bun.write(join(targetDir, ".env"), env);
  spinner.stop(".env written");

  // ── Update package.json name ──────────────────────────────────
  const pkgPath = join(targetDir, "package.json");
  const pkg = await Bun.file(pkgPath).json();
  pkg.name = projectName;
  await Bun.write(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

  // ── bun install ───────────────────────────────────────────────
  spinner.start("Installing dependencies…");
  const install = Bun.spawnSync(["bun", "install"], {
    cwd: targetDir,
    stdout: "pipe",
    stderr: "pipe",
  });

  if (install.exitCode !== 0) {
    spinner.stop("Install failed");
    console.error(install.stderr.toString());
    p.cancel(
      "bun install failed — double-check your tokens have the right scopes.",
    );
    process.exit(1);
  }
  spinner.stop("Dependencies installed");

  // ── Done ──────────────────────────────────────────────────────
  p.outro(
    [
      `✅  Your prototype is ready!\n`,
      `   cd ${projectName}`,
      `   bun dev\n`,
      `   Claude is already set up — open the project and start prompting.\n`,
      `   Tip: your tokens live in .env — never commit that file.`,
    ].join("\n"),
  );
}

function cancel(): never {
  p.cancel("Cancelled.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
