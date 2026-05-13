# ⚡ bo-spark

Spin up a Buildout prototype in seconds.

## Usage

```bash
bunx github:buildoutfasterjoel/bo-spark
```

You'll be prompted for:
- **Project name** — becomes your directory name and package name
- **Buildout's Blueprint Design System Token** — `read:packages` scope, used to pull the private design system and icon packages
- **FontAwesomeProp Token** — for installing and using icons within your prototypes.

Both tokens are written to a `.env` file in your new project and are never stored anywhere else.

## What you get

- TanStack Start project with routing pre-configured
- Design system + icon packages installed
- Layout wired up with logos and global styles
- Claude skills in `.claude/skills/` so Claude knows how to work within the design system

## Requirements

- [Bun](https://bun.sh) installed
- Git installed
- Valid tokens with the right scopes

## Template repo

[buildoutfasterjoel/bo-prototype-tpl](https://github.com/buildoutfasterjoel/bo-prototype-tpl)
