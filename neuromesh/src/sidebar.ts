import * as vscode from 'vscode';
import { SettingsManager, NeuroMeshSettings } from './settings';

export class SidebarProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _settingsManager: SettingsManager
  ) {}

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
          vscode.commands.executeCommand('neuromesh.openCustomSettings');
          break;
      }
    });
  }

  /**
   * Update settings and apply them to the sidebar
   */
  public updateSettings(settings: NeuroMeshSettings): void {
    if (!this._view) {
      return;
    }

    // Apply UI settings to the sidebar
    const effectiveTheme = this._settingsManager.getEffectiveTheme();
    const compactMode = settings.ui.compactMode;

    // Send settings update to webview
    this._view.webview.postMessage({
      command: 'updateSettings',
      settings: {
        theme: effectiveTheme,
        compactMode: compactMode,
        showNotifications: settings.ui.showNotifications,
        debugMode: settings.debug.enabled,
        aiConfigured: this._settingsManager.isAIConfigured()
      }
    });

    // Show notification if enabled
    if (settings.ui.showNotifications && settings.debug.enabled) {
      vscode.window.showInformationMessage('NeuroMesh settings updated');
    }
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
              <button id="openSettings" class="icon-button" title="NeuroMesh Settings">
                <span class="icon">⚙️</span>
              </button>
            </div>
          </div>

          <!-- State 1: Empty Workspace -->
          <div id="emptyState" class="content-section hidden">
            <div class="empty-state">
              <h3>Get Started</h3>
              <p>Choose an option to start working with NeuroMesh</p>
              <div class="action-buttons">
                <button id="createProject" class="action-button">
                  <span class="icon">📁</span>
                  Create New Project
                </button>
                <button id="openProject" class="action-button">
                  <span class="icon">📂</span>
                  Open Project
                </button>
                <button id="cloneRepository" class="action-button">
                  <span class="icon">🔗</span>
                  Clone Repository
                </button>
              </div>
            </div>
          </div>

          <!-- State 2: Index Workspace -->
          <div id="indexState" class="content-section hidden">
            <div class="index-state">
              <h3>Workspace Ready</h3>
              <p>Your workspace contains code files. Index it to enable AI assistance and unlock powerful features.</p>
              <button id="indexWorkspace" class="index-button">
                <span class="icon">🔍</span>
                Index Codebase
              </button>
            </div>
          </div>

          <!-- State 3: Chat Interface -->
          <div id="chatState" class="chat-section hidden">
            <!-- File Changes Section -->
            <div class="file-changes-section">
              <div class="file-changes-header">
                <span class="icon">📝</span>
                <h4>Recent Changes</h4>
              </div>
              <div id="fileChangesList" class="file-changes-list">
                <!-- File changes will be populated here -->
              </div>
            </div>

            <!-- Messages Container -->
            <div id="messages" class="messages-container"></div>

            <!-- Input Section -->
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

          <!-- Loading State -->
          <div id="loadingState" class="content-section">
            <div class="loading-state">
              <div class="spinner"></div>
              <p>Checking workspace...</p>
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
      // Get workspace settings for file patterns
      const workspaceSettings = this._settingsManager.getWorkspaceSettings();
      const debugSettings = this._settingsManager.getDebugSettings();

      // Use configured index patterns or fallback to defaults
      const codeFilePatterns = workspaceSettings.indexPatterns.length > 0
        ? workspaceSettings.indexPatterns
        : ['**/*.{js,ts,jsx,tsx,py,java,cpp,c,cs,php,rb,go,rs,swift,kt}'];

      // Use configured exclude patterns
      const excludePatterns = workspaceSettings.excludePatterns.join(',');

      try {
        for (const pattern of codeFilePatterns) {
          const files = await vscode.workspace.findFiles(pattern, excludePatterns, 1);
          if (files.length > 0) {
            isActiveWorkspace = true;
            break;
          }
        }
      } catch (error) {
        if (debugSettings.enabled) {
          console.error('Error checking workspace files:', error);
        }
      }
    }

    this._view.webview.postMessage({
      command: 'updateWorkspaceState',
      state: isActiveWorkspace ? 'active' : 'empty'
    });
  }
}
