// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { readFile, readFileSync } from 'fs';
import { dirname } from 'path';
import { pathToFileURL } from 'url';
import * as vscode from 'vscode';
import { Creator } from "./modules/creator";

// listener subscription
let subscription: vscode.Disposable;
let anotherSubscription: vscode.Disposable;

// Extension context
let extContext: vscode.ExtensionContext;

let fileExtension = ''; // Created file extension

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
	extContext = context;

	//console.log('Current dir='+__dirname);
	vscode.window.showInformationMessage('MQL5 Sources Template Activated!');
}

// this method is called when your extension is deactivated
export function deactivate() {
	subscription.dispose(); // stop listening
}

let listenerOfFileCreation = function(event: vscode.FileCreateEvent) {
	// Тут надо проверить какой именно файл был создан
	let file = event.files.toString();
	file = event.files[0].fsPath;
	// fileExtension = '*'+file.substr(file.lastIndexOf("."));
	// vscode.window.showInformationMessage('It happened '+fileExtension);
	//vscode.window.showInformationMessage(`File detected: ${file}`);
	console.log('New created file detected: '+file.substr(file.lastIndexOf('/')+1));

	const templateCreator = new Creator(file, extContext);
	templateCreator.createTemplate();
	// if(templateCreator.createTemplate()) {
	// 	vscode.window.showInformationMessage('Template Created!');
	// 	console.log('Template Successfully Created!');
	// }
	// else {
	// 	console.error('Template NOT Created!');
	// 	vscode.window.showWarningMessage('Template NOT Created!');
	// }
	// if (extensionValid()) {
	// 	anotherSubscription = vscode.window.onDidChangeVisibleTextEditors(listenerOfEditorIsVisible);	
	// }
};

let listenerOfEditorIsVisible = function (event: vscode.TextEditor[]) {
	let pos = new vscode.Position(0,0);
	let activeEditor = vscode.window.activeTextEditor;
	if (!activeEditor) {
		vscode.window.showErrorMessage('Active editor not exist!');
		return;
	}
	activeEditor.edit( e => {
		e.insert(pos,'ypa!!!');
		//vscode.TextEdit.insert(pos,'ypa!!!');
		vscode.window.showInformationMessage('is work?');
	});
	anotherSubscription.dispose();
};

function extensionValid(): boolean {
	vscode.window.showInformationMessage('Extension validation...');
	//let file: string = readFileSync('./res/template_settings.json','utf-8');
	//vscode.window.showInformationMessage('File = '+file);
	readFile('G:/Anton/My Programs/VSCode/Extension/mql5SourcesTemplate/src/res/template_settings.json', function (err, data) {
		if (err) {
			return console.error(err);
		}
		return console.log("Asynchronous read: " + data.toString());
   });
	vscode.window.showInformationMessage('Done?');
	return(false);
}