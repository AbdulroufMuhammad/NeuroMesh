// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { SidebarProvider } from './sidebar';
import { SettingsManager, getSettingsManager } from './settings';
import { SettingsWebviewProvider } from './settingsWebview';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "neuromesh" is now active!');

	// Initialize the settings manager
	const settingsManager = getSettingsManager();
	context.subscriptions.push(settingsManager);

	// Validate and sanitize settings on startup
	const validationResult = settingsManager.validateAndSanitizeSettings();
	if (!validationResult.isValid) {
		console.warn('NeuroMesh settings validation issues:', validationResult.issues);
		if (validationResult.sanitized) {
			vscode.window.showWarningMessage('Some NeuroMesh settings were invalid and have been reset to defaults.');
		}
	}

	// Log initial settings for debugging
	const initialSettings = settingsManager.getSettingsWithFallback();
	if (initialSettings.debug.enabled) {
		console.log('NeuroMesh initial settings:', initialSettings);
	}

	// Initialize settings webview provider
	const settingsWebviewProvider = new SettingsWebviewProvider(context.extensionUri, settingsManager);

	// Listen for settings changes
	context.subscriptions.push(
		settingsManager.onDidChangeSettings((settings) => {
			if (settings.debug.enabled) {
				console.log('NeuroMesh settings changed:', settings);
			}
			// Apply settings changes to the sidebar
			sidebarProvider.updateSettings(settings);
		})
	);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('neuromesh.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from NeuroMesh!');
	});

	context.subscriptions.push(disposable);

	const sidebarProvider = new SidebarProvider(context.extensionUri, settingsManager);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider('neuromesh.sidebar', sidebarProvider)
	);

	// Auto-index workspace if enabled
	const workspaceSettings = settingsManager.getWorkspaceSettings();
	if (workspaceSettings.autoIndex && vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
		// Delay auto-indexing to allow extension to fully load
		setTimeout(() => {
			vscode.commands.executeCommand('neuromesh.indexWorkspace');
		}, 2000);
	}

	// Register command handlers
	context.subscriptions.push(
		vscode.commands.registerCommand('neuromesh.indexWorkspace', async () => {
			const workspaceFolders = vscode.workspace.workspaceFolders;
			if (!workspaceFolders || workspaceFolders.length === 0) {
				vscode.window.showWarningMessage('No workspace folder is open.');
				return;
			}

			// Get workspace settings
			const workspaceSettings = settingsManager.getWorkspaceSettings();
			const uiSettings = settingsManager.getUISettings();
			const debugSettings = settingsManager.getDebugSettings();

			if (debugSettings.enabled) {
				console.log('Starting workspace indexing with settings:', workspaceSettings);
			}

			vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "NeuroMesh: Indexing workspace...",
				cancellable: false
			}, async (progress: vscode.Progress<{message?: string; increment?: number}>) => {
				progress.report({ increment: 0, message: "Scanning files..." });

				// Use configured file patterns for indexing
				const patterns = workspaceSettings.indexPatterns;
				const excludePatterns = workspaceSettings.excludePatterns.join(',');

				if (debugSettings.enabled) {
					console.log('Using patterns:', patterns);
					console.log('Excluding:', excludePatterns);
				}

				// Simulate indexing process with actual file scanning
				let totalFiles = 0;
				for (const pattern of patterns) {
					try {
						const files = await vscode.workspace.findFiles(pattern, excludePatterns);
						// Filter by max file size
						const validFiles = files.filter(async (file) => {
							try {
								const stat = await vscode.workspace.fs.stat(file);
								return stat.size <= workspaceSettings.maxFileSize;
							} catch {
								return false;
							}
						});
						totalFiles += validFiles.length;
					} catch (error) {
						if (debugSettings.enabled) {
							console.error('Error scanning pattern:', pattern, error);
						}
					}
				}

				await new Promise<void>(resolve => setTimeout(resolve, 1000));
				progress.report({ increment: 50, message: `Analyzing ${totalFiles} files...` });

				await new Promise<void>(resolve => setTimeout(resolve, 1000));
				progress.report({ increment: 100, message: "Indexing complete!" });

				if (uiSettings.showNotifications) {
					vscode.window.showInformationMessage(`Workspace indexed successfully! Found ${totalFiles} files. NeuroMesh is ready to assist you.`);
				}
			});
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('neuromesh.createProject', async () => {
			const projectName = await vscode.window.showInputBox({
				prompt: 'Enter project name',
				placeHolder: 'my-awesome-project',
				validateInput: (value: string) => {
					if (!value || value.trim().length === 0) {
						return 'Project name cannot be empty';
					}
					if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
						return 'Project name can only contain letters, numbers, hyphens, and underscores';
					}
					return null;
				}
			});

			if (projectName) {
				const projectType = await vscode.window.showQuickPick([
					{ label: 'Node.js/TypeScript', description: 'Modern JavaScript/TypeScript project' },
					{ label: 'Python', description: 'Python project with virtual environment' },
					{ label: 'React App', description: 'React application with TypeScript' },
					{ label: 'Empty Project', description: 'Empty folder structure' }
				], {
					placeHolder: 'Select project type'
				});

				if (projectType) {
					vscode.window.showInformationMessage(`Creating ${projectType.label} project: ${projectName}...`);
					// Here you would implement actual project creation logic
				}
			}
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('neuromesh.openProject', async () => {
			const options: vscode.OpenDialogOptions = {
				canSelectMany: false,
				canSelectFiles: false,
				canSelectFolders: true,
				openLabel: 'Open Project Folder',
				title: 'Select Project Folder'
			};

			const folderUri = await vscode.window.showOpenDialog(options);
			if (folderUri && folderUri[0]) {
				await vscode.commands.executeCommand('vscode.openFolder', folderUri[0], false);
			}
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('neuromesh.cloneRepository', async () => {
			const repoUrl = await vscode.window.showInputBox({
				prompt: 'Enter repository URL',
				placeHolder: 'https://github.com/user/repo.git',
				validateInput: (value: string) => {
					if (!value || value.trim().length === 0) {
						return 'Repository URL cannot be empty';
					}
					// Basic URL validation
					try {
						new URL(value);
						return null;
					} catch {
						return 'Please enter a valid URL';
					}
				}
			});

			if (repoUrl) {
				try {
					await vscode.commands.executeCommand('git.clone', repoUrl);
				} catch (error) {
					vscode.window.showErrorMessage('Failed to clone repository. Make sure Git is installed and the URL is correct.');
				}
			}
		})
	);

	// Settings-related commands
	context.subscriptions.push(
		vscode.commands.registerCommand('neuromesh.openSettings', () => {
			vscode.commands.executeCommand('workbench.action.openSettings', 'neuromesh');
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('neuromesh.resetSettings', async () => {
			const result = await vscode.window.showWarningMessage(
				'Are you sure you want to reset all NeuroMesh settings to their defaults?',
				{ modal: true },
				'Reset Settings'
			);

			if (result === 'Reset Settings') {
				try {
					await settingsManager.resetAllSettings();
					vscode.window.showInformationMessage('NeuroMesh settings have been reset to defaults.');
				} catch (error) {
					vscode.window.showErrorMessage('Failed to reset settings: ' + error);
				}
			}
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('neuromesh.validateSettings', () => {
			const validationResult = settingsManager.validateAndSanitizeSettings();
			if (validationResult.isValid) {
				vscode.window.showInformationMessage('All NeuroMesh settings are valid.');
			} else {
				const message = 'Settings validation issues found:\n' + validationResult.issues.join('\n');
				if (validationResult.sanitized) {
					vscode.window.showWarningMessage(message + '\n\nInvalid settings have been automatically corrected.');
				} else {
					vscode.window.showWarningMessage(message);
				}
			}
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('neuromesh.showSettingsInfo', () => {
			const settings = settingsManager.getAllSettings();
			const isAIConfigured = settingsManager.isAIConfigured();
			const effectiveTheme = settingsManager.getEffectiveTheme();

			const info = `NeuroMesh Settings Information:

AI Configuration: ${isAIConfigured ? 'Configured' : 'Not Configured'}
AI Model: ${settings.ai.model}
Effective Theme: ${effectiveTheme}
Auto Index: ${settings.workspace.autoIndex ? 'Enabled' : 'Disabled'}
Debug Mode: ${settings.debug.enabled ? 'Enabled' : 'Disabled'}
Cache: ${settings.performance.enableCaching ? 'Enabled' : 'Disabled'}`;

			vscode.window.showInformationMessage(info, { modal: true });
		})
	);

		// Register custom settings command
		context.subscriptions.push(
			vscode.commands.registerCommand('neuromesh.openCustomSettings', () => {
				settingsWebviewProvider.show();
			})
		);
}

// This method is called when your extension is deactivated
export function deactivate() {}
