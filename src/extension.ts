// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// listener subscription
let subscription: vscode.Disposable;

export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "mql5SourcesTemplate" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('mql5SourcesTemplate.helloWorld', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from MQL5SourcesTemplates!');
	});

	context.subscriptions.push(disposable);

	subscription = vscode.workspace.onDidCreateFiles(listenerOfFileCreation);

	vscode.window.showInformationMessage('MQL5 Sources Template Activated!');
}

// this method is called when your extension is deactivated
export function deactivate() {
	subscription.dispose(); // stop listening
}

let listenerOfFileCreation = function(event: vscode.FileCreateEvent) {
	//console.log('It happened', event);
	vscode.window.showInformationMessage('It happened '+event.files.toString());
	let pos = new vscode.Position(0,0);
	//let edit = vscode.TextEdit.insert(pos,'ypa!!!');
	let activeEditor = vscode.window.activeTextEditor;
	if (!activeEditor) {
		vscode.window.showErrorMessage('Active editor not exist!');
		return;
	}
	let document = activeEditor.document;

	activeEditor.edit( e => {
		e.insert(pos,'ypa!!!');
		//vscode.TextEdit.insert(pos,'ypa!!!');
		vscode.window.showInformationMessage('is work?');
	});

};
