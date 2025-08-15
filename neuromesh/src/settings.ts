import * as vscode from 'vscode';

/**
 * NeuroMesh Settings Configuration
 * Provides type-safe access to all NeuroMesh extension settings
 */

// Context Settings Interface
export interface ContextSettings {
  enabled: boolean;
  maxFiles: number;
  includeComments: boolean;
}

// API Settings Interface
export interface APISettings {
  openaiKey: string;
  anthropicKey: string;
  customLlmUrl: string;
  customLlmKey: string;
  timeout: number;
  retryAttempts: number;
}

// AI Settings Interface
export interface AISettings {
  enabled: boolean;
  model: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3' | 'local';
  apiKey: string;
  maxTokens: number;
}

// Workspace Settings Interface
export interface WorkspaceSettings {
  autoIndex: boolean;
  indexPatterns: string[];
  excludePatterns: string[];
  maxFileSize: number;
}

// UI Settings Interface
export interface UISettings {
  theme: 'auto' | 'light' | 'dark';
  showNotifications: boolean;
  compactMode: boolean;
}

// Performance Settings Interface
export interface PerformanceSettings {
  enableCaching: boolean;
  cacheTimeout: number;
}

// Debug Settings Interface
export interface DebugSettings {
  enabled: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
}

// Complete Settings Interface
export interface NeuroMeshSettings {
  context: ContextSettings;
  api: APISettings;
  ai: AISettings;
  workspace: WorkspaceSettings;
  ui: UISettings;
  performance: PerformanceSettings;
  debug: DebugSettings;
}

/**
 * NeuroMesh Settings Manager
 * Centralized management of all extension settings
 */
export class SettingsManager {
  private static instance: SettingsManager;
  private _onDidChangeSettings = new vscode.EventEmitter<NeuroMeshSettings>();
  public readonly onDidChangeSettings = this._onDidChangeSettings.event;
  private readonly SETTINGS_VERSION = '1.0.0';

  private constructor() {
    // Listen for configuration changes
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration('neuromesh')) {
        this._onDidChangeSettings.fire(this.getAllSettings());
      }
    });

    // Perform migration check on initialization
    this.checkAndMigrateSettings();
  }

  /**
   * Get the singleton instance of SettingsManager
   */
  public static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager();
    }
    return SettingsManager.instance;
  }

  /**
   * Get the VS Code configuration for NeuroMesh
   */
  private getConfiguration(): vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration('neuromesh');
  }

  /**
   * Get all context-related settings
   */
  public getContextSettings(): ContextSettings {
    const config = this.getConfiguration();
    return {
      enabled: config.get<boolean>('context.enabled', true),
      maxFiles: config.get<number>('context.maxFiles', 50),
      includeComments: config.get<boolean>('context.includeComments', true)
    };
  }

  /**
   * Get all API-related settings
   */
  public getAPISettings(): APISettings {
    const config = this.getConfiguration();
    return {
      openaiKey: config.get<string>('api.openaiKey', ''),
      anthropicKey: config.get<string>('api.anthropicKey', ''),
      customLlmUrl: config.get<string>('api.customLlmUrl', ''),
      customLlmKey: config.get<string>('api.customLlmKey', ''),
      timeout: config.get<number>('api.timeout', 30000),
      retryAttempts: config.get<number>('api.retryAttempts', 3)
    };
  }

  /**
   * Get all AI-related settings
   */
  public getAISettings(): AISettings {
    const config = this.getConfiguration();
    return {
      enabled: config.get<boolean>('ai.enabled', true),
      model: config.get<AISettings['model']>('ai.model', 'gpt-4'),
      apiKey: config.get<string>('ai.apiKey', ''),
      maxTokens: config.get<number>('ai.maxTokens', 4000)
    };
  }

  /**
   * Get all workspace-related settings
   */
  public getWorkspaceSettings(): WorkspaceSettings {
    const config = this.getConfiguration();
    return {
      autoIndex: config.get<boolean>('workspace.autoIndex', true),
      indexPatterns: config.get<string[]>('workspace.indexPatterns', 
        ['**/*.{js,ts,jsx,tsx,py,java,cpp,c,cs,php,rb,go,rs,swift,kt}']),
      excludePatterns: config.get<string[]>('workspace.excludePatterns', 
        ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**']),
      maxFileSize: config.get<number>('workspace.maxFileSize', 1048576)
    };
  }

  /**
   * Get all UI-related settings
   */
  public getUISettings(): UISettings {
    const config = this.getConfiguration();
    return {
      theme: config.get<UISettings['theme']>('ui.theme', 'auto'),
      showNotifications: config.get<boolean>('ui.showNotifications', true),
      compactMode: config.get<boolean>('ui.compactMode', false)
    };
  }

  /**
   * Get all performance-related settings
   */
  public getPerformanceSettings(): PerformanceSettings {
    const config = this.getConfiguration();
    return {
      enableCaching: config.get<boolean>('performance.enableCaching', true),
      cacheTimeout: config.get<number>('performance.cacheTimeout', 3600)
    };
  }

  /**
   * Get all debug-related settings
   */
  public getDebugSettings(): DebugSettings {
    const config = this.getConfiguration();
    return {
      enabled: config.get<boolean>('debug.enabled', false),
      logLevel: config.get<DebugSettings['logLevel']>('debug.logLevel', 'info')
    };
  }

  /**
   * Get all settings as a single object
   */
  public getAllSettings(): NeuroMeshSettings {
    return {
      context: this.getContextSettings(),
      api: this.getAPISettings(),
      ai: this.getAISettings(),
      workspace: this.getWorkspaceSettings(),
      ui: this.getUISettings(),
      performance: this.getPerformanceSettings(),
      debug: this.getDebugSettings()
    };
  }

  /**
   * Update a specific setting
   */
  public async updateSetting<T>(
    section: string,
    value: T,
    target: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Workspace
  ): Promise<void> {
    const config = this.getConfiguration();
    await config.update(section, value, target);
  }

  /**
   * Update multiple settings at once
   */
  public async updateSettings(settings: NeuroMeshSettings): Promise<void> {
    const config = this.getConfiguration();

    // Update each section
    for (const [sectionKey, sectionValue] of Object.entries(settings)) {
      if (sectionValue && typeof sectionValue === 'object') {
        for (const [settingKey, settingValue] of Object.entries(sectionValue)) {
          const fullKey = `${sectionKey}.${settingKey}`;
          await config.update(fullKey, settingValue, vscode.ConfigurationTarget.Workspace);
        }
      }
    }

    // Emit change event
    this._onDidChangeSettings.fire(this.getAllSettings());
  }

  /**
   * Reset all settings to defaults
   */
  public async resetAllSettings(): Promise<void> {
    const config = this.getConfiguration();
    const settingsToReset = [
      'context.enabled', 'context.maxFiles', 'context.includeComments',
      'api.openaiKey', 'api.anthropicKey', 'api.customLlmUrl', 'api.customLlmKey', 'api.timeout', 'api.retryAttempts',
      'ai.enabled', 'ai.model', 'ai.apiKey', 'ai.maxTokens',
      'workspace.autoIndex', 'workspace.indexPatterns', 'workspace.excludePatterns', 'workspace.maxFileSize',
      'ui.theme', 'ui.showNotifications', 'ui.compactMode',
      'performance.enableCaching', 'performance.cacheTimeout',
      'debug.enabled', 'debug.logLevel'
    ];

    for (const setting of settingsToReset) {
      await config.update(setting, undefined, vscode.ConfigurationTarget.Workspace);
    }
  }

  /**
   * Validate settings and return any issues
   */
  public validateSettings(): string[] {
    const issues: string[] = [];
    const settings = this.getAllSettings();

    // Validate context settings
    if (settings.context.maxFiles < 1 || settings.context.maxFiles > 200) {
      issues.push('Context max files must be between 1 and 200');
    }

    // Validate API settings
    if (settings.api.timeout < 5000 || settings.api.timeout > 120000) {
      issues.push('API timeout must be between 5 and 120 seconds');
    }
    if (settings.api.retryAttempts < 1 || settings.api.retryAttempts > 10) {
      issues.push('API retry attempts must be between 1 and 10');
    }
    if (settings.api.customLlmUrl && !this.isValidUrl(settings.api.customLlmUrl)) {
      issues.push('Custom LLM URL must be a valid URL');
    }

    // Validate AI settings
    if (settings.ai.maxTokens < 100 || settings.ai.maxTokens > 32000) {
      issues.push('AI max tokens must be between 100 and 32000');
    }

    // Validate workspace settings
    if (settings.workspace.maxFileSize < 1024) {
      issues.push('Workspace max file size must be at least 1KB');
    }

    // Validate performance settings
    if (settings.performance.cacheTimeout < 60) {
      issues.push('Performance cache timeout must be at least 60 seconds');
    }

    return issues;
  }

  /**
   * Helper method to validate URLs
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if AI functionality is properly configured
   */
  public isAIConfigured(): boolean {
    const aiSettings = this.getAISettings();
    const apiSettings = this.getAPISettings();

    if (!aiSettings.enabled) {
      return false;
    }

    // Check if any API key is configured or using local model
    const hasApiKey = aiSettings.apiKey.length > 0 ||
                     apiSettings.openaiKey.length > 0 ||
                     apiSettings.anthropicKey.length > 0 ||
                     apiSettings.customLlmKey.length > 0;

    return hasApiKey || aiSettings.model === 'local';
  }

  /**
   * Get effective theme based on settings and VS Code theme
   */
  public getEffectiveTheme(): 'light' | 'dark' {
    const uiSettings = this.getUISettings();
    if (uiSettings.theme === 'auto') {
      // Get VS Code's current theme
      const colorTheme = vscode.window.activeColorTheme;
      return colorTheme.kind === vscode.ColorThemeKind.Light ? 'light' : 'dark';
    }
    return uiSettings.theme as 'light' | 'dark';
  }

  /**
   * Check and migrate settings if needed
   */
  private async checkAndMigrateSettings(): Promise<void> {
    const config = this.getConfiguration();
    const currentVersion = config.get<string>('internal.settingsVersion', '0.0.0');

    if (currentVersion !== this.SETTINGS_VERSION) {
      await this.migrateSettings(currentVersion, this.SETTINGS_VERSION);
      await config.update('internal.settingsVersion', this.SETTINGS_VERSION, vscode.ConfigurationTarget.Global);
    }
  }

  /**
   * Migrate settings from one version to another
   */
  private async migrateSettings(fromVersion: string, toVersion: string): Promise<void> {
    const config = this.getConfiguration();

    // Migration logic for different versions
    if (fromVersion === '0.0.0') {
      // Initial migration - set up default values if not present
      const defaultMigrations = [
        { key: 'ai.enabled', defaultValue: true },
        { key: 'ai.model', defaultValue: 'gpt-4' },
        { key: 'workspace.autoIndex', defaultValue: true },
        { key: 'ui.theme', defaultValue: 'auto' },
        { key: 'ui.showNotifications', defaultValue: true },
        { key: 'performance.enableCaching', defaultValue: true },
        { key: 'debug.enabled', defaultValue: false }
      ];

      for (const migration of defaultMigrations) {
        const currentValue = config.get(migration.key);
        if (currentValue === undefined) {
          await config.update(migration.key, migration.defaultValue, vscode.ConfigurationTarget.Workspace);
        }
      }
    }

    // Add more migration logic here for future versions
    console.log(`NeuroMesh settings migrated from ${fromVersion} to ${toVersion}`);
  }

  /**
   * Validate and sanitize settings
   */
  public validateAndSanitizeSettings(): { isValid: boolean; issues: string[]; sanitized: boolean } {
    const issues: string[] = [];
    let sanitized = false;
    const config = this.getConfiguration();

    // Validate and sanitize API settings
    const apiTimeout = config.get<number>('api.timeout', 30000);
    if (apiTimeout < 5000 || apiTimeout > 120000) {
      issues.push('API timeout must be between 5 and 120 seconds');
      config.update('api.timeout', 30000, vscode.ConfigurationTarget.Workspace);
      sanitized = true;
    }

    const retryAttempts = config.get<number>('api.retryAttempts', 3);
    if (retryAttempts < 1 || retryAttempts > 10) {
      issues.push('API retry attempts must be between 1 and 10');
      config.update('api.retryAttempts', 3, vscode.ConfigurationTarget.Workspace);
      sanitized = true;
    }

    // Validate AI settings
    const maxTokens = config.get<number>('ai.maxTokens', 4000);
    if (maxTokens < 100 || maxTokens > 32000) {
      issues.push('AI max tokens must be between 100 and 32000');
      config.update('ai.maxTokens', 4000, vscode.ConfigurationTarget.Workspace);
      sanitized = true;
    }

    // Validate workspace settings
    const maxFileSize = config.get<number>('workspace.maxFileSize', 1048576);
    if (maxFileSize < 1024) {
      issues.push('Workspace max file size must be at least 1KB');
      config.update('workspace.maxFileSize', 1048576, vscode.ConfigurationTarget.Workspace);
      sanitized = true;
    }

    // Validate performance settings
    const cacheTimeout = config.get<number>('performance.cacheTimeout', 3600);
    if (cacheTimeout < 60) {
      issues.push('Performance cache timeout must be at least 60 seconds');
      config.update('performance.cacheTimeout', 3600, vscode.ConfigurationTarget.Workspace);
      sanitized = true;
    }

    // Validate array settings
    const indexPatterns = config.get<string[]>('workspace.indexPatterns', []);
    if (!Array.isArray(indexPatterns) || indexPatterns.length === 0) {
      issues.push('Workspace index patterns must be a non-empty array');
      config.update('workspace.indexPatterns',
        ['**/*.{js,ts,jsx,tsx,py,java,cpp,c,cs,php,rb,go,rs,swift,kt}'],
        vscode.ConfigurationTarget.Workspace);
      sanitized = true;
    }

    const excludePatterns = config.get<string[]>('workspace.excludePatterns', []);
    if (!Array.isArray(excludePatterns)) {
      issues.push('Workspace exclude patterns must be an array');
      config.update('workspace.excludePatterns',
        ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**'],
        vscode.ConfigurationTarget.Workspace);
      sanitized = true;
    }

    return {
      isValid: issues.length === 0,
      issues,
      sanitized
    };
  }

  /**
   * Get settings with fallback values
   */
  public getSettingsWithFallback(): NeuroMeshSettings {
    try {
      return this.getAllSettings();
    } catch (error) {
      console.error('Error getting settings, using fallbacks:', error);
      return this.getFallbackSettings();
    }
  }

  /**
   * Get fallback settings when configuration is corrupted
   */
  public getFallbackSettings(): NeuroMeshSettings {
    return {
      context: {
        enabled: true,
        maxFiles: 50,
        includeComments: true
      },
      api: {
        openaiKey: '',
        anthropicKey: '',
        customLlmUrl: '',
        customLlmKey: '',
        timeout: 30000,
        retryAttempts: 3
      },
      ai: {
        enabled: true,
        model: 'gpt-4',
        apiKey: '',
        maxTokens: 4000
      },
      workspace: {
        autoIndex: true,
        indexPatterns: ['**/*.{js,ts,jsx,tsx,py,java,cpp,c,cs,php,rb,go,rs,swift,kt}'],
        excludePatterns: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**'],
        maxFileSize: 1048576
      },
      ui: {
        theme: 'auto',
        showNotifications: true,
        compactMode: false
      },
      performance: {
        enableCaching: true,
        cacheTimeout: 3600
      },
      debug: {
        enabled: false,
        logLevel: 'info'
      }
    };
  }

  /**
   * Dispose of the settings manager
   */
  public dispose(): void {
    this._onDidChangeSettings.dispose();
  }
}

/**
 * Convenience function to get the settings manager instance
 */
export function getSettingsManager(): SettingsManager {
  return SettingsManager.getInstance();
}
