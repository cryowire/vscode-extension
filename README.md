<p align="center"><a href="https://github.com/cryowire">
  <img src="https://raw.githubusercontent.com/cryowire/artwork/main/logo-type/logotype.png" alt="cryowire" width="600" />
</a></p>

<h1 align="center">cryowire/vscode-extension</h1>
<p align="center">Preview <code>cooldown.yaml</code> files as interactive wiring diagrams directly in VS Code.</p>
<p align="center">
  <a href="https://cryowire.github.io/"><img src="https://img.shields.io/badge/Website-cryowire.github.io-38bdf8?style=for-the-badge" alt="Website" /></a>
</p>

## Features

- **Preview button**: Opens automatically in the editor title bar when viewing `cooldown.yaml`
- **Side-by-side preview**: Renders the cryowire viewer in a webview panel beside your editor
- **Auto-reload**: Preview updates when you save the file
- **GitHub integration**: Automatically resolves the raw URL from your git remote

## Usage

1. Open a `cooldown.yaml` file in VS Code
2. Click the preview icon in the editor title bar, or run **Cryowire: Preview Cooldown** from the command palette
3. The viewer opens in a side panel with wiring diagrams, summary tables, and line details

## Development

```bash
npm install
npm run build
```

Press `F5` to launch the Extension Development Host for testing.

## How it works

The extension embeds the [cryowire viewer](https://cryowire.github.io/viewer/) site in a VS Code webview panel. It resolves the `raw.githubusercontent.com` URL from your local git remote and branch, then passes it to the viewer via `?url=` query parameter.
