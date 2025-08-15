import * as vscode from 'vscode';
import { SettingsManager } from './settings';

export class SettingsWebviewProvider {
  private _panel?: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private readonly _settingsManager: SettingsManager;

  constructor(extensionUri: vscode.Uri, settingsManager: SettingsManager) {
    this._extensionUri = extensionUri;
    this._settingsManager = settingsManager;
  }

  public show() {
    if (this._panel) {
      this._panel.reveal();
      return;
    }

    this._panel = vscode.window.createWebviewPanel(
      'neuromeshSettings',
      'NeuroMesh Settings',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(this._extensionUri, 'media'),
          vscode.Uri.joinPath(this._extensionUri, 'out')
        ]
      }
    );

    this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);

    this._panel.onDidDispose(() => {
      this._panel = undefined;
    });

    this._panel.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case 'getSections':
          this._sendSections();
          break;
        case 'getSettings':
          this._sendSettings(message.section);
          break;
        case 'updateSetting':
          await this._updateSetting(message.key, message.value);
          break;
        case 'updateSectionSettings':
          await this._updateSectionSettings(message.section, message.settings);
          break;
        case 'resetSection':
          await this._resetSection(message.section);
          break;
        case 'showError':
          vscode.window.showErrorMessage(message.message);
          break;
      }
    });

    // Send initial data
    setTimeout(() => this._sendSections(), 100);
  }

  private _sendSections() {
    if (!this._panel) {
      return;
    }

    const sections = [
      { id: 'context', name: 'Context', icon: '🧠' },
      { id: 'api', name: 'API Keys and LLM Configuration', icon: '🔑' },
      { id: 'ai', name: 'AI Settings', icon: '🤖' },
      { id: 'workspace', name: 'Workspace Settings', icon: '📁' },
      { id: 'ui', name: 'UI Settings', icon: '🎨' },
      { id: 'performance', name: 'Performance Settings', icon: '⚡' },
      { id: 'debug', name: 'Debug Settings', icon: '🐛' }
    ];

    this._panel.webview.postMessage({
      command: 'setSections',
      sections
    });
  }

  private _sendSettings(section: string) {
    if (!this._panel) {
      return;
    }

    const allSettings = this._settingsManager.getAllSettings();
    let sectionSettings: any = {};
    let sectionConfig: any = {};

    switch (section) {
      case 'context':
        sectionSettings = allSettings.context || {
          enabled: true,
          maxFiles: 50,
          includeComments: true
        };
        sectionConfig = {
          enabled: { type: 'boolean', description: 'Enable context awareness', default: true },
          maxFiles: { type: 'number', description: 'Maximum files in context', min: 1, max: 200, default: 50 },
          includeComments: { type: 'boolean', description: 'Include code comments in context', default: true }
        };
        break;
      case 'api':
        sectionSettings = allSettings.api || {
          openaiKey: '',
          anthropicKey: '',
          customLlmUrl: '',
          customLlmKey: '',
          timeout: 30,
          retryAttempts: 3
        };
        sectionConfig = {
          openaiKey: { type: 'string', description: 'OpenAI API Key', secret: true, default: '' },
          anthropicKey: { type: 'string', description: 'Anthropic API Key', secret: true, default: '' },
          customLlmUrl: { type: 'string', description: 'Custom LLM URL', default: '' },
          customLlmKey: { type: 'string', description: 'Custom LLM Key', secret: true, default: '' },
          timeout: { type: 'number', description: 'Request timeout (seconds)', min: 5, max: 120, default: 30 },
          retryAttempts: { type: 'number', description: 'Retry attempts', min: 1, max: 10, default: 3 }
        };
        break;
      case 'ai':
        sectionSettings = allSettings.ai || {
          enabled: true,
          model: 'gpt-4',
          apiKey: '',
          maxTokens: 4000
        };
        sectionConfig = {
          enabled: { type: 'boolean', description: 'Enable AI functionality', default: true },
          model: { type: 'enum', description: 'AI model', options: ['gpt-4', 'gpt-3.5-turbo', 'claude-3', 'local'], default: 'gpt-4' },
          apiKey: { type: 'string', description: 'API key (leave empty to use environment)', secret: true, default: '' },
          maxTokens: { type: 'number', description: 'Maximum tokens', min: 100, max: 32000, default: 4000 }
        };
        break;
      case 'workspace':
        sectionSettings = allSettings.workspace || {
          autoIndex: true,
          indexPatterns: ['**/*.{js,ts,jsx,tsx,py,java,cpp,c,cs,php,rb,go,rs,swift,kt}'],
          excludePatterns: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**'],
          maxFileSize: 1048576
        };
        sectionConfig = {
          autoIndex: { type: 'boolean', description: 'Auto-index workspace on startup', default: true },
          indexPatterns: { type: 'array', description: 'File patterns to include in indexing', default: ['**/*.{js,ts,jsx,tsx,py,java,cpp,c,cs,php,rb,go,rs,swift,kt}'] },
          excludePatterns: { type: 'array', description: 'File patterns to exclude from indexing', default: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**'] },
          maxFileSize: { type: 'number', description: 'Maximum file size to index (bytes)', default: 1048576 }
        };
        break;
      case 'ui':
        sectionSettings = allSettings.ui || {
          theme: 'auto',
          showNotifications: true,
          compactMode: false
        };
        sectionConfig = {
          theme: { type: 'enum', description: 'UI theme', options: ['auto', 'light', 'dark'], default: 'auto' },
          showNotifications: { type: 'boolean', description: 'Show notifications', default: true },
          compactMode: { type: 'boolean', description: 'Use compact UI mode', default: false }
        };
        break;
      case 'performance':
        sectionSettings = allSettings.performance || {
          enableCaching: true,
          cacheTimeout: 3600
        };
        sectionConfig = {
          enableCaching: { type: 'boolean', description: 'Enable caching', default: true },
          cacheTimeout: { type: 'number', description: 'Cache timeout (seconds)', default: 3600 }
        };
        break;
      case 'debug':
        sectionSettings = allSettings.debug || {
          enabled: false,
          logLevel: 'info'
        };
        sectionConfig = {
          enabled: { type: 'boolean', description: 'Enable debug mode', default: false },
          logLevel: { type: 'enum', description: 'Log level', options: ['error', 'warn', 'info', 'debug'], default: 'info' }
        };
        break;
    }

    this._panel.webview.postMessage({
      command: 'setSettings',
      section,
      settings: sectionSettings,
      config: sectionConfig
    });
  }

  private async _updateSetting(key: string, value: any) {
    try {
      const [section, setting] = key.split('.');
      const currentSettings = this._settingsManager.getAllSettings() as any;

      if (!currentSettings[section]) {
        currentSettings[section] = {};
      }

      currentSettings[section][setting] = value;
      await this._settingsManager.updateSettings(currentSettings);
      
      if (this._panel) {
        this._panel.webview.postMessage({
          command: 'settingUpdated',
          key,
          value,
          success: true
        });
      }
    } catch (error) {
      if (this._panel) {
        this._panel.webview.postMessage({
          command: 'settingUpdated',
          key,
          value,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  private async _updateSectionSettings(section: string, settings: any) {
    try {
      // Persist all keys for this section
      for (const [key, value] of Object.entries(settings)) {
        await this._settingsManager.updateSetting(`neuromesh.${section}.${key}`, value);
      }

      // Reload UI with persisted values
      this._sendSettings(section);

      if (this._panel) {
        this._panel.webview.postMessage({
          command: 'sectionSaved',
          section,
          success: true
        });
      }
    } catch (error) {
      vscode.window.showErrorMessage(error instanceof Error ? error.message : 'Unknown error saving settings');
    }
  }

  private async _resetSection(section: string) {
    try {
      const fallbackSettings = this._settingsManager.getFallbackSettings() as any;

      if (fallbackSettings[section]) {
        // Write each key to VS Code configuration
        for (const [key, value] of Object.entries(fallbackSettings[section])) {
          await this._settingsManager.updateSetting(`neuromesh.${section}.${key}`, value);
        }

        this._sendSettings(section);

        if (this._panel) {
          this._panel.webview.postMessage({
            command: 'sectionReset',
            section,
            success: true
          });
        }
      }
    } catch (error) {
      if (this._panel) {
        this._panel.webview.postMessage({
          command: 'sectionReset',
          section,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'settings.css')
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'settings.js')
    );

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NeuroMesh Settings</title>
    <link href="${styleUri}" rel="stylesheet">
    <script src="https://unpkg.com/monaco-editor@0.44.0/min/vs/loader.js"></script>
</head>
<body>
    <div class="settings-container">
        <div class="sidebar">
            <div class="sidebar-header">
                <h2>NeuroMesh Settings</h2>
            </div>
            <div class="sidebar-sections" id="sections">
                <!-- Sections will be populated by JavaScript -->
            </div>
        </div>
        <div class="main-content">
            <div class="content-header">
                <h3 id="section-title">Select a section</h3>
                <div class="header-actions">
                    <button id="reset-section" class="reset-btn" style="display: none;">Reset Section</button>
                    <button id="save-settings" class="save-btn" style="display: none;">Save</button>
                </div>
            </div>
            <div class="content-body" id="content">
                <div class="placeholder">Select a section from the sidebar to view its settings.</div>
                <div id="editor-container" style="display: none; height: 100%; width: 100%;"></div>
            </div>
        </div>
    </div>
    <script src="${scriptUri}"></script>
</body>
</html>`;
  }
}
