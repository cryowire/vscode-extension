import * as vscode from "vscode";
import { execSync } from "child_process";
import * as path from "path";

const VIEWER_BASE = "https://cryo-wiring.github.io/viewer/";

export function activate(context: vscode.ExtensionContext) {
  const command = vscode.commands.registerCommand(
    "cryo-wiring.previewCooldown",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage("No active editor");
        return;
      }

      const filePath = editor.document.uri.fsPath;
      const rawUrl = resolveRawUrl(filePath);

      if (rawUrl) {
        openViewerPanel(context, rawUrl, filePath);
      } else {
        // Fallback: open viewer site in external browser (user can drag-drop)
        vscode.env.openExternal(vscode.Uri.parse(VIEWER_BASE));
        vscode.window.showInformationMessage(
          "Could not resolve GitHub URL. Opened viewer site — drag & drop your file."
        );
      }
    }
  );

  context.subscriptions.push(command);
}

/**
 * Resolve the raw.githubusercontent.com URL for a local file
 * by inspecting the git remote and current branch.
 */
function resolveRawUrl(filePath: string): string | null {
  try {
    const dir = path.dirname(filePath);

    // Get the GitHub remote URL
    const remoteUrl = execSync("git remote get-url origin", {
      cwd: dir,
      encoding: "utf-8",
    }).trim();

    // Parse owner/repo from remote URL
    // Supports: git@github.com:owner/repo.git, https://github.com/owner/repo.git
    const match =
      remoteUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)/) ||
      remoteUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)\.git/);
    if (!match) return null;
    const [, owner, repo] = match;

    // Get the current branch
    const branch = execSync("git rev-parse --abbrev-ref HEAD", {
      cwd: dir,
      encoding: "utf-8",
    }).trim();

    // Get the repo root
    const repoRoot = execSync("git rev-parse --show-toplevel", {
      cwd: dir,
      encoding: "utf-8",
    }).trim();

    // Get relative path from repo root
    const relativePath = path.relative(repoRoot, filePath).replace(/\\/g, "/");

    return `https://raw.githubusercontent.com/${owner}/${repo}/refs/heads/${branch}/${relativePath}`;
  } catch {
    return null;
  }
}

/**
 * Open the cryo-wiring viewer in a webview panel,
 * embedding the viewer site via iframe.
 */
function openViewerPanel(
  context: vscode.ExtensionContext,
  rawUrl: string,
  filePath: string
) {
  const fileName = path.basename(filePath);
  const panel = vscode.window.createWebviewPanel(
    "cryoWiringViewer",
    `Cryo-Wiring: ${fileName}`,
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    }
  );

  const viewerUrl = `${VIEWER_BASE}?url=${encodeURIComponent(rawUrl)}`;

  panel.webview.html = getWebviewHtml(viewerUrl);

  // Update when the source file changes
  const watcher = vscode.workspace.onDidSaveTextDocument((doc) => {
    if (doc.uri.fsPath === filePath) {
      // Reload iframe by re-setting HTML (cache-bust with timestamp)
      const bustUrl = `${viewerUrl}&_t=${Date.now()}`;
      panel.webview.html = getWebviewHtml(bustUrl);
    }
  });

  panel.onDidDispose(() => watcher.dispose());
  context.subscriptions.push(watcher);
}

function getWebviewHtml(viewerUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #0a0f1e;
    }
    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  </style>
</head>
<body>
  <iframe src="${viewerUrl}" allow="clipboard-read; clipboard-write"></iframe>
</body>
</html>`;
}

export function deactivate() {}
