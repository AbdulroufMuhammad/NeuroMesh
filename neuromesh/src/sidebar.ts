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

    // Initial workspace state check
    setTimeout(() => this._updateWorkspaceState(), 100);

    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case 'checkWorkspaceState':
          this._updateWorkspaceState();
          break;
        case 'indexWorkspace':
          vscode.commands.executeCommand('neuromesh.indexWorkspace');
          break;
        case 'createProject':
          vscode.commands.executeCommand('neuromesh.createProject');
          break;
        case 'openProject':
          vscode.commands.executeCommand('neuromesh.openProject');
          break;
        case 'cloneRepository':
          vscode.commands.executeCommand('neuromesh.cloneRepository');
          break;
        case 'openSettings':
          vscode.commands.executeCommand('workbench.action.openSettings', 'neuromesh');
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
        <title>NeuroMesh Assistant</title>
      </head>
      <body>
        <div class="container">
          <!-- Header Section -->
          <div class="header">
            <div class="logo-section">
              <div class="logo-icon">🧠</div>
              <h2 class="title">NeuroMesh</h2>
            </div>
            <div class="header-actions">
              <button id="openSettings" class="icon-button" title="Settings">
                <span class="icon">⚙️</span>
              </button>
            </div>
          </div>

          <!-- Dynamic Content Area -->
          <div id="dynamicActionArea" class="content-section">
            <div class="loading-state">
              <div class="spinner"></div>
              <p>Checking workspace...</p>
            </div>
          </div>

          <!-- Chat Section -->
          <div class="chat-section">
            <div class="chat-header">
              <h3>AI Assistant</h3>
              <span class="status-indicator online"></span>
            </div>
            <div id="messages" class="messages-container"></div>
            <div class="input-container">
              <div class="input-wrapper">
                <textarea
                  id="messageInput"
                  placeholder="Ask me anything about your code..."
                  rows="1"
                ></textarea>
                <button id="sendMessage" class="send-button" title="Send message">
                  <span class="icon">➤</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <script src="${scriptUri}"></script>
      </body>
      </html>`;
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private async _updateWorkspaceState() {
    if (!this._view) {
      return;
    }

    const workspaceFolders = vscode.workspace.workspaceFolders;
    let isActiveWorkspace = false;

    if (workspaceFolders && workspaceFolders.length > 0) {
      // Check if workspace contains code files
      const codeFilePatterns = ['**/*.{js,ts,jsx,tsx,py,java,cpp,c,cs,php,rb,go,rs,swift,kt}'];

      try {
        for (const pattern of codeFilePatterns) {
          const files = await vscode.workspace.findFiles(pattern, '**/node_modules/**', 1);
          if (files.length > 0) {
            isActiveWorkspace = true;
            break;
          }
        }
      } catch (error) {
        console.error('Error checking workspace files:', error);
      }
    }

    this._view.webview.postMessage({
      command: 'updateWorkspaceState',
      state: isActiveWorkspace ? 'active' : 'empty'
    });
  }
}
