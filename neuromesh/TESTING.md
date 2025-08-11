# NeuroMesh Extension Testing Guide

## Overview
This document provides comprehensive testing instructions for the NeuroMesh VS Code extension.

## Prerequisites
- VS Code installed
- Node.js and npm installed
- Extension dependencies installed (`npm install`)

## Automated Testing

### Unit Tests
Run the unit tests with:
```bash
npm test
```

Note: If the automated tests fail due to network issues (downloading VS Code), you can still run manual tests.

### Compilation Test
Ensure the extension compiles without errors:
```bash
npm run compile
```

### Linting Test
Check code quality:
```bash
npm run lint
```

## Manual Testing

### 1. Extension Development Testing

#### Launch Extension in Development Mode
1. Open the NeuroMesh project in VS Code
2. Press `F5` or go to Run > Start Debugging
3. This will open a new VS Code window with the extension loaded

#### Alternative Method
1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Run "Developer: Reload Window" to reload the extension

### 2. Core Functionality Testing

#### Test Extension Activation
1. Open the new VS Code window (Extension Development Host)
2. Check that the NeuroMesh icon appears in the Activity Bar (left sidebar)
3. Click on the NeuroMesh icon to open the sidebar

#### Test Commands
Test each command through the Command Palette (`Ctrl+Shift+P`):

1. **Hello World Command**
   - Run: `NeuroMesh: Hello World`
   - Expected: Information message "Hello World from NeuroMesh!" appears

2. **Index Workspace Command**
   - Run: `NeuroMesh: Index Workspace`
   - Expected: Progress notification appears showing indexing process
   - Expected: Success message after completion

3. **Create Project Command**
   - Run: `NeuroMesh: Create New Project`
   - Expected: Input box for project name appears
   - Test validation: Try empty name, invalid characters
   - Expected: Project type selection appears after valid name

4. **Open Project Command**
   - Run: `NeuroMesh: Open Project`
   - Expected: Folder selection dialog appears

5. **Clone Repository Command**
   - Run: `NeuroMesh: Clone Repository`
   - Expected: Input box for repository URL appears
   - Test validation: Try invalid URLs
   - Expected: Git clone operation (requires Git installed)

### 3. Sidebar Testing

#### Sidebar UI Elements
1. Open NeuroMesh sidebar
2. Verify presence of:
   - NeuroMesh logo and title
   - Settings button (⚙️)
   - Dynamic action area
   - AI Assistant section
   - Message input area
   - Send button

#### Sidebar Functionality
1. **Settings Button**
   - Click the settings button
   - Expected: VS Code settings open to NeuroMesh section

2. **Workspace State Detection**
   - Test with empty workspace
   - Test with workspace containing code files
   - Expected: Different UI states based on workspace content

3. **Message Interface**
   - Type in the message input area
   - Click send button
   - Expected: UI responds (note: actual AI functionality may not be implemented)

### 4. Integration Testing

#### Workspace Integration
1. Open different types of workspaces:
   - Empty folder
   - JavaScript/TypeScript project
   - Python project
   - Multi-language project

2. Test workspace indexing in each scenario

#### Git Integration
1. Open a Git repository
2. Test clone repository command
3. Verify Git operations work correctly

### 5. Error Handling Testing

#### Invalid Inputs
1. Test commands with invalid inputs:
   - Empty project names
   - Invalid repository URLs
   - Non-existent folders

2. Verify appropriate error messages appear

#### Network Issues
1. Test clone repository with network disconnected
2. Verify graceful error handling

### 6. Performance Testing

#### Extension Startup
1. Measure extension activation time
2. Check for any console errors during startup

#### Memory Usage
1. Monitor VS Code memory usage with extension active
2. Test with large workspaces

## Test Scenarios

### Scenario 1: New User Experience
1. Install extension
2. Open VS Code
3. Click NeuroMesh icon
4. Follow through creating a new project

### Scenario 2: Existing Project Workflow
1. Open existing code project
2. Index workspace
3. Use AI assistant features

### Scenario 3: Repository Management
1. Clone a repository
2. Index the cloned project
3. Navigate through project structure

## Expected Results

### Success Criteria
- [ ] Extension loads without errors
- [ ] All commands are registered and executable
- [ ] Sidebar displays correctly
- [ ] Workspace detection works
- [ ] Project creation workflow functions
- [ ] Repository cloning works (with Git installed)
- [ ] No console errors during normal operation
- [ ] UI is responsive and intuitive

### Known Limitations
- AI chat functionality may be placeholder
- Some features may require additional setup
- Network-dependent features require internet connection

## Troubleshooting

### Common Issues
1. **Extension doesn't load**: Check console for errors, ensure compilation succeeded
2. **Commands not found**: Verify extension is activated
3. **Sidebar empty**: Check workspace state detection
4. **Git operations fail**: Ensure Git is installed and configured

### Debug Mode
1. Open Developer Tools: `Help > Toggle Developer Tools`
2. Check Console tab for errors
3. Use debugger in extension development mode

## Reporting Issues
When reporting issues, include:
- VS Code version
- Extension version
- Operating system
- Steps to reproduce
- Console error messages
- Screenshots if applicable
