import * as vscode from 'vscode';

export class SidebarProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this._extensionUri, 'media'),
        vscode.Uri.joinPath(this._extensionUri, 'out')
      ]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case 'indexWorkspace':
          vscode.commands.executeCommand('extension.indexWorkspace');
          break;
        case 'createProject':
          vscode.commands.executeCommand('amatipAI.createProject');
          break;
        case 'openProject':
          vscode.commands.executeCommand('workbench.action.openFolder');
          break;
        case 'cloneRepository':
          vscode.commands.executeCommand('git.clone');
          break;
        case 'openSettings':
          vscode.commands.executeCommand('workbench.action.openSettings', 'yourExtensionId');
          break;
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'sidebar.css')
    );

    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'sidebar.js')
    );

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="${styleUri}" rel="stylesheet">
        <title>Sidebar</title>
      </head>
      <body>
        <div id="header">
          <button id="hideSidebar">Hide</button>
          <button id="toggleSize">Toggle Size</button>
          <button id="openSettings">Settings</button>
        </div>
        <div id="dynamicActionArea"></div>
        <div id="chatArea">
          <div id="messages"></div>
          <div id="inputArea">
            <textarea id="messageInput" placeholder="Type a message..."></textarea>
            <button id="sendMessage">Send</button>
          </div>
        </div>
        <script src="${scriptUri}"></script>
      </body>
      </html>`;
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }
}
