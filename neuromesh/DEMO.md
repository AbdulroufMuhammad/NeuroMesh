# NeuroMesh Extension Demo

## Quick Demo Guide

This guide provides a quick demonstration of the NeuroMesh extension features.

### Prerequisites
- VS Code installed
- NeuroMesh extension compiled (`npm run compile`)

### Demo Steps

#### 1. Launch Extension Development Mode
1. Open the NeuroMesh project folder in VS Code
2. Press `F5` or go to `Run > Start Debugging`
3. A new VS Code window will open with the extension loaded

#### 2. Explore the NeuroMesh Interface
1. In the new window, look for the NeuroMesh icon (🧠) in the Activity Bar (left sidebar)
2. Click the icon to open the NeuroMesh sidebar
3. Observe the interface:
   - Header with NeuroMesh branding
   - Settings button
   - Dynamic action area
   - AI Assistant chat interface

#### 3. Test Core Commands

**Hello World Command:**
1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Type "NeuroMesh: Hello World"
3. Press Enter
4. See the welcome message

**Index Workspace Command:**
1. Open Command Palette
2. Type "NeuroMesh: Index Workspace"
3. Watch the progress notification
4. See completion message

**Create Project Command:**
1. Open Command Palette
2. Type "NeuroMesh: Create New Project"
3. Enter a project name (e.g., "my-test-project")
4. Select a project type from the dropdown

**Open Project Command:**
1. Open Command Palette
2. Type "NeuroMesh: Open Project"
3. Browse and select a folder

**Clone Repository Command:**
1. Open Command Palette
2. Type "NeuroMesh: Clone Repository"
3. Enter a Git repository URL (e.g., "https://github.com/microsoft/vscode.git")

#### 4. Test Sidebar Functionality
1. Click the settings button (⚙️) in the sidebar
2. Verify it opens VS Code settings
3. Try typing in the message input area
4. Click the send button

#### 5. Test Workspace Detection
1. Open different types of folders:
   - Empty folder
   - Folder with code files
2. Observe how the sidebar adapts to different workspace states

### Expected Results

✅ **Extension loads successfully**
- No errors in the console
- NeuroMesh icon appears in Activity Bar
- Sidebar opens when clicked

✅ **Commands work correctly**
- All commands are available in Command Palette
- Commands execute without errors
- Appropriate feedback is shown

✅ **UI is responsive**
- Sidebar displays correctly
- Buttons are clickable
- Interface adapts to workspace state

✅ **Integration works**
- Settings button opens VS Code settings
- Workspace detection functions
- Progress notifications appear

### Demo Script

Here's a suggested script for demonstrating the extension:

---

**"Welcome to NeuroMesh, an AI Coding Agent extension for VS Code!"**

1. **"First, let me show you how to access NeuroMesh..."**
   - Point to the NeuroMesh icon in the Activity Bar
   - Click to open the sidebar

2. **"The sidebar provides a clean interface with several key areas..."**
   - Point out the header with branding
   - Show the settings button
   - Highlight the AI Assistant section

3. **"NeuroMesh provides several useful commands..."**
   - Open Command Palette
   - Demonstrate "Hello World" command
   - Show "Index Workspace" with progress indicator

4. **"For project management, NeuroMesh can help you..."**
   - Demonstrate "Create New Project" workflow
   - Show project type selection
   - Demonstrate "Open Project" functionality

5. **"For developers working with Git repositories..."**
   - Show "Clone Repository" command
   - Demonstrate URL validation

6. **"The extension adapts to your workspace..."**
   - Show different workspace states
   - Demonstrate workspace detection

7. **"Everything is designed to integrate seamlessly with VS Code..."**
   - Show settings integration
   - Demonstrate responsive UI

---

### Troubleshooting Demo Issues

**Extension doesn't appear:**
- Check console for errors (`Help > Toggle Developer Tools`)
- Ensure compilation was successful
- Try reloading the window (`Developer: Reload Window`)

**Commands not working:**
- Verify extension is activated
- Check for any error messages
- Restart the Extension Development Host

**Sidebar issues:**
- Check if workspace detection is working
- Verify media files are loaded correctly
- Look for JavaScript errors in console

### Demo Tips

1. **Prepare your environment:** Have a clean VS Code workspace ready
2. **Test beforehand:** Run through the demo steps to ensure everything works
3. **Have examples ready:** Prepare sample project names and repository URLs
4. **Show error handling:** Demonstrate validation (empty names, invalid URLs)
5. **Highlight integration:** Emphasize how NeuroMesh works within VS Code

### Next Steps After Demo

1. **Development:** Show how to extend the extension
2. **Testing:** Demonstrate the testing framework
3. **Deployment:** Explain packaging and distribution
4. **Customization:** Show configuration options

This demo showcases NeuroMesh as a foundation for an AI-powered coding assistant that integrates seamlessly with the VS Code development environment.
