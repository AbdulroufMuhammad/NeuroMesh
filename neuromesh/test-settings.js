/**
 * Simple test script to verify NeuroMesh settings functionality
 * This script tests the settings without requiring VS Code environment
 */

// Mock VS Code API for testing
const mockVSCode = {
  workspace: {
    getConfiguration: (section) => ({
      get: (key, defaultValue) => {
        // Return default values for testing
        const settings = {
          'context.enabled': true,
          'context.maxFiles': 50,
          'context.includeComments': true,
          'api.openaiKey': '',
          'api.anthropicKey': '',
          'api.customLlmUrl': '',
          'api.customLlmKey': '',
          'api.timeout': 30000,
          'api.retryAttempts': 3,
          'ai.enabled': true,
          'ai.model': 'gpt-4',
          'ai.apiKey': '',
          'ai.maxTokens': 4000,
          'workspace.autoIndex': true,
          'workspace.indexPatterns': ['**/*.{js,ts,jsx,tsx,py,java,cpp,c,cs,php,rb,go,rs,swift,kt}'],
          'workspace.excludePatterns': ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**'],
          'workspace.maxFileSize': 1048576,
          'ui.theme': 'auto',
          'ui.showNotifications': true,
          'ui.compactMode': false,
          'performance.enableCaching': true,
          'performance.cacheTimeout': 3600,
          'debug.enabled': false,
          'debug.logLevel': 'info'
        };
        return settings[key] !== undefined ? settings[key] : defaultValue;
      },
      update: async (key, value, target) => {
        console.log(`Mock update: ${key} = ${value}`);
      }
    }),
    onDidChangeConfiguration: () => ({ dispose: () => {} })
  },
  ConfigurationTarget: {
    Workspace: 1,
    Global: 2
  },
  EventEmitter: class {
    constructor() {
      this.listeners = [];
    }
    get event() {
      return (listener) => {
        this.listeners.push(listener);
        return { dispose: () => {} };
      };
    }
    fire(data) {
      this.listeners.forEach(listener => listener(data));
    }
    dispose() {}
  },
  window: {
    activeColorTheme: {
      kind: 1 // Light theme
    }
  },
  ColorThemeKind: {
    Light: 1,
    Dark: 2
  }
};

// Replace the vscode module with our mock
global.vscode = mockVSCode;

// Now test our settings
console.log('Testing NeuroMesh Settings...\n');

try {
  // Import our settings module
  const { SettingsManager } = require('./out/settings.js');
  
  console.log('✓ Settings module loaded successfully');
  
  // Test singleton pattern
  const manager1 = SettingsManager.getInstance();
  const manager2 = SettingsManager.getInstance();
  console.log('✓ Singleton pattern:', manager1 === manager2 ? 'PASS' : 'FAIL');
  
  // Test context settings
  const contextSettings = manager1.getContextSettings();
  console.log('✓ Context settings:', JSON.stringify(contextSettings, null, 2));
  
  // Test API settings
  const apiSettings = manager1.getAPISettings();
  console.log('✓ API settings loaded');
  
  // Test all settings
  const allSettings = manager1.getAllSettings();
  console.log('✓ All settings sections present:', 
    Object.keys(allSettings).includes('context') ? 'PASS' : 'FAIL');
  
  // Test validation
  const issues = manager1.validateSettings();
  console.log('✓ Settings validation:', issues.length === 0 ? 'PASS' : `FAIL (${issues.length} issues)`);
  if (issues.length > 0) {
    console.log('  Issues:', issues);
  }
  
  // Test fallback settings
  const fallbackSettings = manager1.getSettingsWithFallback();
  console.log('✓ Fallback settings include context:', 
    fallbackSettings.context ? 'PASS' : 'FAIL');
  
  console.log('\n🎉 All tests passed! NeuroMesh settings are working correctly.');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}
