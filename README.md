# NeuroMesh VS Code Extension

NeuroMesh is an experimental VS Code extension inspired by the Augment Code interface pattern. It focuses on a custom, sectioned settings experience and lays the groundwork for future context‑aware coding assistance.

This README documents what is implemented today, what is intentionally missing, and the roadmap to reach feature parity with the Augment reference you provided.

## Project Overview

NeuroMesh provides a Monaco‑powered custom settings panel organized into sidebar sections that mirror the Augment Settings UI (Context, Tools, Rules & Guidelines, etc.). The goal is to build a solid foundation for a production‑quality developer assistant while clearly separating what exists now from planned functionality.

## Installation & Setup

- Requirements: VS Code 1.54+, Node.js (for development)
- Clone the repo and install deps
  - `npm install`
- Build and run the extension
  - `npm run compile`
  - Press F5 in VS Code to start the Extension Development Host
- Open the NeuroMesh Settings panel
  - Click the gear button in the NeuroMesh sidebar, or run the command "NeuroMesh Settings"

## Implemented Features (✅)

The current project includes the following functionality:

- ✅ Custom settings interface with Monaco Editor
  - Embedded Monaco Editor inside a webview
  - Section‑based editing (each section loads into the editor as JSON)
  - Debounced auto‑save and explicit Save button
  - Per‑section Reset to defaults
- ✅ Sidebar sections (matching the Augment pattern)
  - Context
  - API Keys and LLM Configuration
  - AI Settings
  - Workspace Settings
  - UI Settings
  - Performance Settings
  - Debug Settings
- ✅ Settings persistence to VS Code configuration
  - Changes are stored under `neuromesh.*` keys via `workspace.getConfiguration()`
  - Per‑section JSON is written as individual keys (e.g., `neuromesh.context.enabled`)
  - Fallback/defaults are available for reset
- ✅ Extension activation and basic structure
  - Custom Activity Bar container and webview sidebar
  - Command: `NeuroMesh Settings` opens the custom settings panel
  - TypeScript build via esbuild; eslint and type checks wired in

## Missing Core Features (❌ / 🚧)

The following Augment functionality is not implemented yet. These are either out of scope for the current milestone or planned next:

- ❌ Context engine for code analysis and retrieval
- ❌ Context display within the Settings “Context” section (UI is present; functionality TBD)
- ❌ AI‑powered code suggestions and completions
- ❌ Workspace indexing and file analysis
- ❌ Code understanding and semantic search
- ❌ Integration with LLM providers (OpenAI, Anthropic, others)
- ❌ Real‑time code context awareness across the editor
- ❌ Tools integrations, runbooks, or agent workflows
- ❌ Rules and User Guidelines enforcement or authoring UI
- ❌ Any other core Augment features visible in the reference interface (e.g., advanced context graphs, per‑file status, account management)

## Development Roadmap

Short‑term (Milestone 1)
- Stabilize Monaco‑based settings panel (UX polish, accessibility, theming)
- Add JSON schema/intellisense for each section to guide user edits
- Strong validation with user feedback in the panel
- Persist last‑selected section; support undo of unsaved edits

Mid‑term (Milestone 2)
- Introduce a minimal context indexer (file scanning, filters, basic scoring)
- Add context preview in the Context section (file lists, status, errors)
- Pluggable LLM provider layer with API key validation tests
- Safe telemetry for settings actions (opt‑in)

Long‑term (Milestone 3)
- Full workspace indexing with incremental updates
- Semantic search and code understanding
- Inline/code‑lens suggestions via LLMs
- Real‑time context awareness and multi‑tool orchestration
- Robust error handling and user‑visible diagnostics

## Contributing

We welcome contributions while we converge toward the Augment UX and feature set.

- Code style: TypeScript, ESLint, Prettier‑compatible formatting
- Build: `npm run compile` (type‑check, lint, bundle)
- Test: `npm test` (placeholder, wiring provided)
- PRs: Please describe scope, testing steps, and any user‑visible changes

## Context & Intent

Per our ongoing conversation, this project intentionally mirrors Augment’s settings interface pattern:
- Custom settings UI with a sidebar loaded per section
- Monaco Editor as the main settings editor view (not replacing VS Code’s built‑in settings panel)
- Settings organized by sections similar to the reference image: Context, Tools, Rules & User Guidelines, Account, etc.

Explicitly, we have not yet implemented Augment’s core engine features (context engine, indexer, semantic search, AI completions). Those are identified in the Missing Core Features and Roadmap sections and will be developed iteratively.

## Commands

- NeuroMesh: Hello World (sample)
- NeuroMesh: Index Workspace (placeholder)
- NeuroMesh: Create/Open/Clone Project (placeholders)
- NeuroMesh: NeuroMesh Settings (opens the custom Monaco settings panel)

## For Developers

- The custom settings panel lives in:
  - <code>src/settingsWebview.ts</code>, with HTML/JS/CSS in <code>media/</code>
- Settings are stored in VS Code configuration under `neuromesh.*`
- The sidebar webview calls `neuromesh.openCustomSettings` to open the panel
- Build artifacts are in <code>dist/</code>; type‑only out in <code>out/</code>

---

If you want me to flesh out the JSON schemas per section (for Monaco IntelliSense), or wire a minimal indexer to light up the Context section, say the word and I’ll prepare those next.
- Support for multiple AI models (GPT-4, GPT-3.5-turbo, Claude-3, local models)
- Intelligent code analysis and suggestions
- Context-aware responses based on your workspace

### 🎨 **Modern Interface**
- Clean, dark-themed sidebar with three-state interface
- Responsive design with smooth animations
- Compact mode for space-efficient workflows
- Auto-adapting theme based on VS Code settings

### ⚙️ **Comprehensive Settings System**
- Organized settings in three categories: Context, API Keys & LLM URL, and Configuration
- Native VS Code settings integration
- Automatic validation and migration
- Fallback mechanisms for robust operation

### 📁 **Smart Workspace Management**
- Automatic workspace indexing with configurable patterns
- File size and pattern filtering
- Exclude patterns for node_modules, build folders, etc.
- Auto-indexing on workspace open (configurable)

### 🔧 **Developer-Friendly**
- Debug logging and comprehensive error handling
- Settings validation and sanitization
- Event-driven architecture
- TypeScript support with full type safety

## Requirements

- VS Code 1.54.0 or higher
- Node.js (for development)
- API keys for AI services (OpenAI, Anthropic, or custom endpoints)

## Extension Settings

NeuroMesh provides a comprehensive settings system organized into three main categories:

### Context Settings
* Reserved for future context-related configurations (currently empty)

### API Keys and LLM URL Settings
* `neuromesh.api.openaiKey`: OpenAI API key for GPT models
* `neuromesh.api.anthropicKey`: Anthropic API key for Claude models
* `neuromesh.api.customLlmUrl`: Custom LLM endpoint URL for local/self-hosted models
* `neuromesh.api.customLlmKey`: API key for custom LLM endpoint
* `neuromesh.api.timeout`: API request timeout (5-120 seconds)
* `neuromesh.api.retryAttempts`: Number of retry attempts for failed requests (1-10)

### Configuration Settings
* `neuromesh.ai.enabled`: Enable/disable the AI agent functionality
* `neuromesh.ai.model`: AI model selection (gpt-4, gpt-3.5-turbo, claude-3, local)
* `neuromesh.ai.maxTokens`: Maximum number of tokens for AI responses (100-32000)
* `neuromesh.workspace.autoIndex`: Automatically index workspace when opened
* `neuromesh.workspace.indexPatterns`: File patterns to include when indexing
* `neuromesh.workspace.excludePatterns`: File patterns to exclude when indexing
* `neuromesh.workspace.maxFileSize`: Maximum file size in bytes to index
* `neuromesh.ui.theme`: Theme for the NeuroMesh sidebar (auto, light, dark)
* `neuromesh.ui.showNotifications`: Show notifications for NeuroMesh operations
* `neuromesh.ui.compactMode`: Use compact mode for the sidebar interface
* `neuromesh.performance.enableCaching`: Enable caching for improved performance
* `neuromesh.performance.cacheTimeout`: Cache timeout in seconds
* `neuromesh.debug.enabled`: Enable debug logging for NeuroMesh
* `neuromesh.debug.logLevel`: Log level for debug output (error, warn, info, debug)

For detailed information about the settings system, see [SETTINGS.md](neuromesh/SETTINGS.md).

## Getting Started

### 1. Installation
1. Install the NeuroMesh extension from the VS Code marketplace
2. Open a workspace or project folder
3. Look for the NeuroMesh icon (🧠) in the Activity Bar

### 2. Configuration
1. Open VS Code Settings (Ctrl/Cmd + ,)
2. Search for "NeuroMesh"
3. Configure your API keys and preferences
4. Or use the command palette: `NeuroMesh: Open Settings`

### 3. Usage
- Click the NeuroMesh icon to open the sidebar
- The extension will automatically detect and index your workspace
- Start chatting with the AI assistant for code help
- Use commands from the Command Palette (Ctrl/Cmd + Shift + P)

## Available Commands

- `NeuroMesh: Hello World` - Test command
- `NeuroMesh: Index Workspace` - Manually index the current workspace
- `NeuroMesh: Create New Project` - Create a new project
- `NeuroMesh: Open Project` - Open an existing project
- `NeuroMesh: Clone Repository` - Clone a Git repository
- `NeuroMesh: Open Settings` - Open NeuroMesh settings
- `NeuroMesh: Reset Settings` - Reset all settings to defaults
- `NeuroMesh: Validate Settings` - Validate and fix settings
- `NeuroMesh: Show Settings Info` - Display current settings summary

## Development

### Building from Source
```bash
# Clone the repository
git clone <repository-url>
cd neuromesh

# Install dependencies
npm install

# Compile the extension
npm run compile

# Run tests
npm test

# Launch in development mode
code --extensionDevelopmentPath=.
```

### Testing
The extension includes comprehensive tests for:
- Settings management and validation
- Sidebar functionality
- Extension activation and commands
- TypeScript compilation and linting

Run tests with: `npm test`

## Known Issues

- Settings validation may show warnings on first startup (automatically resolved)
- Large workspaces may take longer to index (configurable file size limits available)

## Release Notes

### 0.0.1

Initial release of NeuroMesh featuring:
- Complete settings system with three organized categories
- Modern sidebar interface with state management
- Workspace indexing with configurable patterns
- Multiple AI provider support
- Comprehensive validation and migration system
- Full TypeScript support and testing suite

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
