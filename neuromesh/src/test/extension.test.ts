import * as assert from 'assert';
import * as vscode from 'vscode';
import * as myExtension from '../extension';
import { SidebarProvider } from '../sidebar';
import { SettingsManager } from '../settings';

suite('NeuroMesh Extension Test Suite', () => {
	vscode.window.showInformationMessage('Starting NeuroMesh tests...');

	suite('Extension Activation', () => {
		test('Extension should be present', () => {
			assert.ok(vscode.extensions.getExtension('undefined_publisher.neuromesh'));
		});

		test('Extension should activate', async () => {
			const extension = vscode.extensions.getExtension('undefined_publisher.neuromesh');
			if (extension) {
				await extension.activate();
				assert.strictEqual(extension.isActive, true);
			}
		});
	});

	suite('Commands Registration', () => {
		test('Hello World command should be registered', async () => {
			const commands = await vscode.commands.getCommands(true);
			assert.ok(commands.includes('neuromesh.helloWorld'));
		});

		test('Index Workspace command should be registered', async () => {
			const commands = await vscode.commands.getCommands(true);
			assert.ok(commands.includes('neuromesh.indexWorkspace'));
		});

		test('Create Project command should be registered', async () => {
			const commands = await vscode.commands.getCommands(true);
			assert.ok(commands.includes('neuromesh.createProject'));
		});

		test('Open Project command should be registered', async () => {
			const commands = await vscode.commands.getCommands(true);
			assert.ok(commands.includes('neuromesh.openProject'));
		});

		test('Clone Repository command should be registered', async () => {
			const commands = await vscode.commands.getCommands(true);
			assert.ok(commands.includes('neuromesh.cloneRepository'));
		});
	});

	suite('SidebarProvider', () => {
		let sidebarProvider: SidebarProvider;
		let mockExtensionUri: vscode.Uri;
		let mockSettingsManager: SettingsManager;

		setup(() => {
			mockExtensionUri = vscode.Uri.file('/test/path');
			mockSettingsManager = SettingsManager.getInstance();
			sidebarProvider = new SidebarProvider(mockExtensionUri, mockSettingsManager);
		});

		test('SidebarProvider should be instantiable', () => {
			assert.ok(sidebarProvider instanceof SidebarProvider);
		});

		test('SidebarProvider should implement WebviewViewProvider', () => {
			assert.ok('resolveWebviewView' in sidebarProvider);
			assert.strictEqual(typeof sidebarProvider.resolveWebviewView, 'function');
		});
	});

	suite('Command Execution', () => {
		test('Hello World command should execute without error', async () => {
			try {
				await vscode.commands.executeCommand('neuromesh.helloWorld');
				assert.ok(true, 'Command executed successfully');
			} catch (error) {
				assert.fail(`Command execution failed: ${error}`);
			}
		});

		test('Index Workspace command should execute without error', async () => {
			try {
				await vscode.commands.executeCommand('neuromesh.indexWorkspace');
				assert.ok(true, 'Command executed successfully');
			} catch (error) {
				assert.fail(`Command execution failed: ${error}`);
			}
		});
	});
});
