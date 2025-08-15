# NeuroMesh Settings System

The NeuroMesh extension provides a comprehensive settings system that allows users to customize the behavior of the AI coding assistant. Settings are organized into logical categories and can be accessed through VS Code's native settings interface.

## Settings Categories

### 1. Context Settings
- **Purpose**: Reserved for future context-related configurations
- **Current Status**: Empty (placeholder for future features)

### 2. API Keys and LLM URL Settings
Configure API access for various AI services and custom endpoints.

#### Available Settings:
- `neuromesh.api.openaiKey` - OpenAI API key for GPT models
- `neuromesh.api.anthropicKey` - Anthropic API key for Claude models  
- `neuromesh.api.customLlmUrl` - Custom LLM endpoint URL for local/self-hosted models
- `neuromesh.api.customLlmKey` - API key for custom LLM endpoint
- `neuromesh.api.timeout` - API request timeout (5-120 seconds, default: 30)
- `neuromesh.api.retryAttempts` - Number of retry attempts for failed requests (1-10, default: 3)

### 3. Configuration Settings
Main configuration options for NeuroMesh functionality.

#### AI Settings:
- `neuromesh.ai.enabled` - Enable/disable AI agent functionality (default: true)
- `neuromesh.ai.model` - AI model selection (gpt-4, gpt-3.5-turbo, claude-3, local)
- `neuromesh.ai.apiKey` - Legacy API key setting (use specific API key settings instead)
- `neuromesh.ai.maxTokens` - Maximum tokens for AI responses (100-32000, default: 4000)

#### Workspace Settings:
- `neuromesh.workspace.autoIndex` - Automatically index workspace on open (default: true)
- `neuromesh.workspace.indexPatterns` - File patterns to include in indexing
- `neuromesh.workspace.excludePatterns` - File patterns to exclude from indexing
- `neuromesh.workspace.maxFileSize` - Maximum file size to index in bytes (default: 1MB)

#### UI Settings:
- `neuromesh.ui.theme` - Sidebar theme (auto, light, dark, default: auto)
- `neuromesh.ui.showNotifications` - Show operation notifications (default: true)
- `neuromesh.ui.compactMode` - Use compact sidebar interface (default: false)

#### Performance Settings:
- `neuromesh.performance.enableCaching` - Enable caching for performance (default: true)
- `neuromesh.performance.cacheTimeout` - Cache timeout in seconds (min: 60, default: 3600)

#### Debug Settings:
- `neuromesh.debug.enabled` - Enable debug logging (default: false)
- `neuromesh.debug.logLevel` - Debug log level (error, warn, info, debug, default: info)

## Accessing Settings

### Through VS Code Settings UI
1. Open VS Code Settings (Ctrl/Cmd + ,)
2. Search for "NeuroMesh"
3. Configure settings through the UI

### Through Command Palette
- `NeuroMesh: Open Settings` - Opens NeuroMesh settings in VS Code
- `NeuroMesh: Reset Settings` - Resets all settings to defaults
- `NeuroMesh: Validate Settings` - Validates and fixes invalid settings
- `NeuroMesh: Show Settings Info` - Displays current settings summary

### Programmatic Access
```typescript
import { getSettingsManager } from './settings';

const settingsManager = getSettingsManager();
const allSettings = settingsManager.getAllSettings();
const aiSettings = settingsManager.getAISettings();
```

## Settings Validation and Migration

### Automatic Validation
- Settings are automatically validated on extension startup
- Invalid values are sanitized and reset to defaults
- Validation errors are logged and reported to users

### Migration System
- Settings schema changes are automatically migrated
- Version tracking ensures smooth upgrades
- Fallback mechanisms prevent extension failures

### Validation Rules
- API timeout: 5-120 seconds
- Retry attempts: 1-10
- AI max tokens: 100-32000
- File size limits: minimum 1KB
- Cache timeout: minimum 60 seconds
- Array settings must be valid arrays
- URL settings must be valid URLs

## Settings Architecture

### SettingsManager Class
Central management class providing:
- Type-safe settings access
- Event-driven updates
- Validation and sanitization
- Migration handling
- Fallback mechanisms

### Event System
```typescript
settingsManager.onDidChangeSettings((settings) => {
  // React to settings changes
  console.log('Settings updated:', settings);
});
```

### Integration Points
- Extension activation and initialization
- Sidebar behavior and theming
- Workspace indexing configuration
- AI service communication
- Debug logging and notifications

## Best Practices

### For Users
1. Use specific API key settings instead of the legacy `ai.apiKey`
2. Configure appropriate file patterns for your workspace
3. Enable debug mode for troubleshooting
4. Validate settings after making changes

### For Developers
1. Always use the SettingsManager for settings access
2. Handle settings changes through event listeners
3. Provide fallback values for critical functionality
4. Validate settings before using them
5. Use type-safe interfaces for settings access

## Troubleshooting

### Common Issues
1. **AI not working**: Check API key configuration and model selection
2. **Indexing problems**: Verify file patterns and exclusions
3. **Performance issues**: Adjust cache settings and file size limits
4. **UI problems**: Check theme settings and compact mode

### Debug Mode
Enable debug mode (`neuromesh.debug.enabled`) to:
- See detailed logging in the console
- Track settings changes
- Monitor indexing operations
- Diagnose API communication issues

### Settings Reset
If settings become corrupted:
1. Use "Reset NeuroMesh Settings" command
2. Or manually delete settings from VS Code configuration
3. Restart VS Code to reinitialize with defaults

## Future Enhancements

The settings system is designed to be extensible:
- Context settings will be populated with AI context management options
- Additional AI providers can be easily added
- Workspace-specific settings can be implemented
- Advanced caching and performance options can be added

For more information, see the source code in `src/settings.ts`.
