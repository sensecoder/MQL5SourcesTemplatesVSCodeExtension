// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Settings } from './modules/settings';
import { SettingsHandler } from './modules/settings_handler';
import { TemplateHandler } from './modules/template_handler';
import { UserChoiceHandler } from './modules/user_choice_handler';

// States of the automaton
const enum AutomatonState {
	waitingFileCreation,
	checkingNewFile,
	waitingUserChoice,
	waitingEditor,
	applyingTemplate
}

// Messages
const enum Message {
	startAutomaton,
	fileCreated,
	fileAccepted,
	userMadeChoice,
	awaitEditor,
	templateApplied,
	abortAndRestart
}

// Listener subscription
let subscription: vscode.Disposable;
let editorAwaitSubscription: vscode.Disposable;

// Extension context
let extContext: vscode.ExtensionContext;

// Name of the processed file
let fileName: string = '';

// Automaton state
let automatonState: AutomatonState;

// Result template text
let templateText = '';

// File created editor param
let newEditorColumn: vscode.ViewColumn | undefined;
let newDocument: vscode.TextDocument | undefined;

export function activate(context: vscode.ExtensionContext) {
	console.log('Extension "mql5SourcesTemplate" is now active!');
	extContext = context;
	toDo(Message.startAutomaton);
}

// this method is called when your extension is deactivated
export function deactivate() {
	subscription.dispose(); // stop listening
	editorAwaitSubscription.dispose();
}

function toDo(message: Message, ...argsArr: any[]) {
	switch (message) {
		case Message.startAutomaton:
				if (!automatonState) {		
					subscription = vscode.workspace.onDidCreateFiles(listenerOfFileCreation);
					automatonState = AutomatonState.waitingFileCreation;
				}
			break;
		case Message.fileCreated:
				if (automatonState === AutomatonState.waitingFileCreation) {
					fileName = argsArr[0];
					automatonState = AutomatonState.checkingNewFile;
					checkFile();
				}
			break;
		case Message.fileAccepted:
				if (automatonState === AutomatonState.checkingNewFile) {
					automatonState = AutomatonState.waitingUserChoice;
					const userChoice = new UserChoiceHandler(argsArr[0], extContext);
					userChoice.chooseOption(userChoiceReciever, fileName);
				}
			break;
		case Message.userMadeChoice:
				if (automatonState === AutomatonState.waitingUserChoice) {
					let settings = new Settings(argsArr[0]);
					let templateHandler = new TemplateHandler(settings);
					templateText = templateHandler.renderText();
					// console.log(templateText);
					if (newDocument) {
						vscode.window.showTextDocument(newDocument, newEditorColumn);
					}
					editorAwaitSubscription = vscode.window.onDidChangeActiveTextEditor(activeEditorCheck);
					automatonState = AutomatonState.waitingEditor;
				}
			break;
		case Message.abortAndRestart:
				fileName = '';
				templateText = '';
				newEditorColumn = undefined;
				newDocument = undefined;
				automatonState = AutomatonState.waitingFileCreation;
			break;
		case Message.templateApplied:
				console.log('extention.toDo(): Great work!');
				toDo(Message.abortAndRestart);
			break;
	
		default:
			break;
	}
}

let listenerOfFileCreation = function(event: vscode.FileCreateEvent) {
	// Тут надо проверить какой именно файл был создан
	let file = event.files.toString();
	file = event.files[0].fsPath;
	console.log('New created file detected: ' + file.substring(file.lastIndexOf('/') + 1));
	toDo(Message.fileCreated, file);
};

function checkFile() {
	const settingsHandler = new SettingsHandler();
	let settings = settingsHandler.getSettingsForFile(fileName);
	editorAwaitSubscription = vscode.window.onDidChangeActiveTextEditor(newEditorCheck);

	if (!settings) {
		console.log('extension.checkFile(): This file is not supported!');
		toDo(Message.abortAndRestart);
	} else {
		console.log('extension.checkFile(): Let\'s make a template for this file!');
		toDo(Message.fileAccepted, settings);
	}
}

let userChoiceReciever = function(message: string, selectedOptions: any) 
{
	switch (message) {
		case 'accept':
				console.log(selectedOptions);		
				toDo(Message.userMadeChoice, selectedOptions);	
			break;
		case 'saveGeneral':
				let settingsHandler = new SettingsHandler();
				settingsHandler.saveGeneral(selectedOptions);	
			break;
	
		default:
			break;
	}
	if (!selectedOptions) {
		console.error('extension.receiverUserOptions(..): Options not recieved from the user!');
		toDo(Message.abortAndRestart);
	}
};

let newEditorCheck = function(editor: vscode.TextEditor | undefined) {
	if (editor === undefined) {//activeEditor) {
		// vscode.window.showErrorMessage('Active editor not exist!');
		return;
	}
	if (editor.document.fileName === fileName) {
		// vscode.window.showInformationMessage('New editor detected!');
		newEditorColumn = editor.viewColumn;
		newDocument = editor.document;
		editorAwaitSubscription.dispose();
	} else {
		console.error(`extension.newEditorCheck(): Something goes wrong! A new editor has been created without matching file name! Abort process!`);
		editorAwaitSubscription.dispose();
		toDo(Message.abortAndRestart);
	}
};

let activeEditorCheck = function (editor: vscode.TextEditor | undefined) {
	if (editor === undefined) {//activeEditor) {
		// vscode.window.showErrorMessage('Active editor not exist!');		
		return;
	}
	if (editor.document.fileName !== fileName) {
		// Need to find according document
		// vscode.window.showInformationMessage('need to find editor!');
		let documents = vscode.workspace.textDocuments;
		if (documents.length === 0) {
         console.error('extension.activeEditorCheck(..): No one open documents here!');
			editorAwaitSubscription.dispose();
			toDo(Message.abortAndRestart);
      } else {
         // console.log('this file = ' + this.file);
         for (let i = 0; i < documents.length; i++) {
            //document = documents[i];
            // console.log('editor[' + i + '] = ' + editor.document.fileName);
				if (documents[i].fileName === fileName) {               
               vscode.window.showTextDocument(documents[i], newEditorColumn);
               console.log('extension.activeEditorCheck(..): I will show you document!');
               return;
					// return vscode.window.activeTextEditor;
            }
         }
      }
		return;
	}
	let pos = new vscode.Position(0,0);
	editor.edit( e => {
		e.insert(pos,templateText);
		// vscode.window.showInformationMessage('is work?');
	});
	editorAwaitSubscription.dispose();
	toDo(Message.templateApplied);
};