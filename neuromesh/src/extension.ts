// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { SidebarProvider } from './sidebar';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "neuromesh" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('neuromesh.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from NeuroMesh!');
	});

	context.subscriptions.push(disposable);

	const sidebarProvider = new SidebarProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider('neuromesh.sidebar', sidebarProvider)
	);

	// Register command handlers
	context.subscriptions.push(
		vscode.commands.registerCommand('neuromesh.indexWorkspace', async () => {
			const workspaceFolders = vscode.workspace.workspaceFolders;
			if (!workspaceFolders || workspaceFolders.length === 0) {
				vscode.window.showWarningMessage('No workspace folder is open.');
				return;
			}

			vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "NeuroMesh: Indexing workspace...",
				cancellable: false
			}, async (progress: vscode.Progress<{message?: string; increment?: number}>) => {
				progress.report({ increment: 0, message: "Scanning files..." });

				// Simulate indexing process
				await new Promise<void>(resolve => setTimeout(resolve, 1000));
				progress.report({ increment: 50, message: "Analyzing code structure..." });

				await new Promise<void>(resolve => setTimeout(resolve, 1000));
				progress.report({ increment: 100, message: "Indexing complete!" });

				vscode.window.showInformationMessage('Workspace indexed successfully! NeuroMesh is ready to assist you.');
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
}

// This method is called when your extension is deactivated
export function deactivate() {}
