import * as assert from 'assert';
import * as vscode from 'vscode';
import { SettingsManager, NeuroMeshSettings } from '../settings';

suite('NeuroMesh Settings Test Suite', () => {
  let settingsManager: SettingsManager;

  setup(() => {
    settingsManager = SettingsManager.getInstance();
  });

  teardown(() => {
    // Clean up any test settings
  });

  test('Settings Manager Singleton', () => {
    const instance1 = SettingsManager.getInstance();
    const instance2 = SettingsManager.getInstance();
    assert.strictEqual(instance1, instance2, 'SettingsManager should be a singleton');
  });

  test('Get Context Settings', () => {
    const contextSettings = settingsManager.getContextSettings();
    assert.ok(contextSettings, 'Context settings should be defined');
    assert.strictEqual(typeof contextSettings.enabled, 'boolean', 'Context enabled should be a boolean');
    assert.strictEqual(typeof contextSettings.maxFiles, 'number', 'Max files should be a number');
    assert.strictEqual(typeof contextSettings.includeComments, 'boolean', 'Include comments should be a boolean');
    assert.ok(contextSettings.maxFiles >= 1 && contextSettings.maxFiles <= 200, 'Max files should be between 1 and 200');
  });

  test('Get API Settings', () => {
    const apiSettings = settingsManager.getAPISettings();
    assert.ok(apiSettings, 'API settings should be defined');
    assert.strictEqual(typeof apiSettings.openaiKey, 'string', 'OpenAI key should be a string');
    assert.strictEqual(typeof apiSettings.anthropicKey, 'string', 'Anthropic key should be a string');
    assert.strictEqual(typeof apiSettings.customLlmUrl, 'string', 'Custom LLM URL should be a string');
    assert.strictEqual(typeof apiSettings.customLlmKey, 'string', 'Custom LLM key should be a string');
    assert.strictEqual(typeof apiSettings.timeout, 'number', 'Timeout should be a number');
    assert.strictEqual(typeof apiSettings.retryAttempts, 'number', 'Retry attempts should be a number');
  });

  test('Get AI Settings', () => {
    const aiSettings = settingsManager.getAISettings();
    assert.ok(aiSettings, 'AI settings should be defined');
    assert.strictEqual(typeof aiSettings.enabled, 'boolean', 'AI enabled should be a boolean');
    assert.ok(['gpt-4', 'gpt-3.5-turbo', 'claude-3', 'local'].includes(aiSettings.model), 'AI model should be valid');
    assert.strictEqual(typeof aiSettings.apiKey, 'string', 'API key should be a string');
    assert.strictEqual(typeof aiSettings.maxTokens, 'number', 'Max tokens should be a number');
  });

  test('Get Workspace Settings', () => {
    const workspaceSettings = settingsManager.getWorkspaceSettings();
    assert.ok(workspaceSettings, 'Workspace settings should be defined');
    assert.strictEqual(typeof workspaceSettings.autoIndex, 'boolean', 'Auto index should be a boolean');
    assert.ok(Array.isArray(workspaceSettings.indexPatterns), 'Index patterns should be an array');
    assert.ok(Array.isArray(workspaceSettings.excludePatterns), 'Exclude patterns should be an array');
    assert.strictEqual(typeof workspaceSettings.maxFileSize, 'number', 'Max file size should be a number');
  });

  test('Get UI Settings', () => {
    const uiSettings = settingsManager.getUISettings();
    assert.ok(uiSettings, 'UI settings should be defined');
    assert.ok(['auto', 'light', 'dark'].includes(uiSettings.theme), 'Theme should be valid');
    assert.strictEqual(typeof uiSettings.showNotifications, 'boolean', 'Show notifications should be a boolean');
    assert.strictEqual(typeof uiSettings.compactMode, 'boolean', 'Compact mode should be a boolean');
  });

  test('Get Performance Settings', () => {
    const performanceSettings = settingsManager.getPerformanceSettings();
    assert.ok(performanceSettings, 'Performance settings should be defined');
    assert.strictEqual(typeof performanceSettings.enableCaching, 'boolean', 'Enable caching should be a boolean');
    assert.strictEqual(typeof performanceSettings.cacheTimeout, 'number', 'Cache timeout should be a number');
  });

  test('Get Debug Settings', () => {
    const debugSettings = settingsManager.getDebugSettings();
    assert.ok(debugSettings, 'Debug settings should be defined');
    assert.strictEqual(typeof debugSettings.enabled, 'boolean', 'Debug enabled should be a boolean');
    assert.ok(['error', 'warn', 'info', 'debug'].includes(debugSettings.logLevel), 'Log level should be valid');
  });

  test('Get All Settings', () => {
    const allSettings = settingsManager.getAllSettings();
    assert.ok(allSettings, 'All settings should be defined');
    assert.ok(allSettings.context, 'Context settings should be included');
    assert.ok(allSettings.api, 'API settings should be included');
    assert.ok(allSettings.ai, 'AI settings should be included');
    assert.ok(allSettings.workspace, 'Workspace settings should be included');
    assert.ok(allSettings.ui, 'UI settings should be included');
    assert.ok(allSettings.performance, 'Performance settings should be included');
    assert.ok(allSettings.debug, 'Debug settings should be included');
  });

  test('Settings Validation - Valid Settings', () => {
    const validationResult = settingsManager.validateAndSanitizeSettings();
    assert.ok(validationResult, 'Validation result should be defined');
    assert.strictEqual(typeof validationResult.isValid, 'boolean', 'isValid should be a boolean');
    assert.ok(Array.isArray(validationResult.issues), 'Issues should be an array');
    assert.strictEqual(typeof validationResult.sanitized, 'boolean', 'Sanitized should be a boolean');
  });

  test('AI Configuration Check', () => {
    const isConfigured = settingsManager.isAIConfigured();
    assert.strictEqual(typeof isConfigured, 'boolean', 'AI configured check should return a boolean');
  });

  test('Effective Theme', () => {
    const effectiveTheme = settingsManager.getEffectiveTheme();
    assert.ok(['light', 'dark'].includes(effectiveTheme), 'Effective theme should be light or dark');
  });

  test('Fallback Settings', () => {
    const fallbackSettings = settingsManager.getSettingsWithFallback();
    assert.ok(fallbackSettings, 'Fallback settings should be defined');
    assert.ok(fallbackSettings.context, 'Fallback context settings should be included');
    assert.ok(fallbackSettings.api, 'Fallback API settings should be included');
    assert.ok(fallbackSettings.ai, 'Fallback AI settings should be included');
    assert.ok(fallbackSettings.workspace, 'Fallback workspace settings should be included');
    assert.ok(fallbackSettings.ui, 'Fallback UI settings should be included');
    assert.ok(fallbackSettings.performance, 'Fallback performance settings should be included');
    assert.ok(fallbackSettings.debug, 'Fallback debug settings should be included');
  });

  test('Settings Event Emitter', (done) => {
    let eventFired = false;
    const disposable = settingsManager.onDidChangeSettings((settings) => {
      eventFired = true;
      assert.ok(settings, 'Settings should be provided in event');
      disposable.dispose();
      done();
    });

    // Simulate a settings change by updating a setting
    vscode.workspace.getConfiguration('neuromesh').update('debug.enabled', true, vscode.ConfigurationTarget.Workspace);
    
    // If event doesn't fire within 1 second, fail the test
    setTimeout(() => {
      if (!eventFired) {
        disposable.dispose();
        done(new Error('Settings change event was not fired'));
      }
    }, 1000);
  });

  test('Context Settings Update', async () => {
    const originalValue = settingsManager.getContextSettings().enabled;
    const newValue = !originalValue;

    await settingsManager.updateSetting('context.enabled', newValue);

    const updatedSettings = settingsManager.getContextSettings();
    assert.strictEqual(updatedSettings.enabled, newValue, 'Context setting should be updated');

    // Restore original value
    await settingsManager.updateSetting('context.enabled', originalValue);
  });

  test('Context Settings Validation', () => {
    const contextSettings = settingsManager.getContextSettings();

    // Test default values
    assert.strictEqual(contextSettings.enabled, true, 'Context should be enabled by default');
    assert.strictEqual(contextSettings.maxFiles, 50, 'Default max files should be 50');
    assert.strictEqual(contextSettings.includeComments, true, 'Include comments should be true by default');

    // Test validation
    const issues = settingsManager.validateSettings();
    const contextIssues = issues.filter(issue => issue.includes('Context'));
    assert.strictEqual(contextIssues.length, 0, 'Default context settings should be valid');
  });

  test('Settings Update', async () => {
    const originalValue = settingsManager.getDebugSettings().enabled;
    const newValue = !originalValue;

    await settingsManager.updateSetting('debug.enabled', newValue);

    const updatedSettings = settingsManager.getDebugSettings();
    assert.strictEqual(updatedSettings.enabled, newValue, 'Setting should be updated');

    // Restore original value
    await settingsManager.updateSetting('debug.enabled', originalValue);
  });

  test('Settings Reset', async () => {
    // Change a setting first
    await settingsManager.updateSetting('debug.enabled', true);
    
    // Reset all settings
    await settingsManager.resetAllSettings();
    
    // Verify settings are reset (should be default values)
    const settings = settingsManager.getAllSettings();
    assert.ok(settings, 'Settings should still be available after reset');
  });
});
