// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Settings } from './modules/settings';
import { SettingsHandler } from './modules/settings_handler';
import { TemplateHandler } from './modules/template_handler';
import { UserChoiceHandler } from './modules/user_choice_handler';
import { Insertor } from './modules/v0.1/insertor';

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
	waitEditor,
	templateApplied,
	abortAndRestart
}

// ?Listener subscription
let subscription: vscode.Disposable;
let anotherSubscription: vscode.Disposable;

// Extension context
let extContext: vscode.ExtensionContext;

// Name of the processed file
let fileName: string = '';

// Automaton state
let automatonState: AutomatonState;

export function activate(context: vscode.ExtensionContext) {

	console.log('Extension "mql5SourcesTemplate" is now active!');

	// let disposable = vscode.commands.registerCommand('mql5SourcesTemplate.helloWorld', () => {
	// 	vscode.window.showInformationMessage('Hello World from MQL5SourcesTemplates!');
	// });
	// context.subscriptions.push(disposable);

	extContext = context;
	toDo(Message.startAutomaton);
	// console.log(`Automaton state: ${automatonState}`);	

	//console.log('Current dir='+__dirname);
	// vscode.window.showInformationMessage('MQL5 Sources Template Activated!');
}

// this method is called when your extension is deactivated
export function deactivate() {
	subscription.dispose(); // stop listening
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
					// Отрисовка шаблона в редакторе файла:
					// console.log('receiverUserOptions: ' + fileName);
					automatonState = AutomatonState.applyingTemplate;
					let settings = new Settings(argsArr[0]);
					let templateHandler = new TemplateHandler(settings);
					let text = templateHandler.renderText();
					console.log('This a text = ' + text);
					const insertor = new Insertor(argsArr[0], fileName);
					insertor.applyTemplate();
					vscode.window.showInformationMessage('Template Created!');
					console.log('Template Successfully Created!');
					toDo(Message.templateApplied);
					//return insertor.applyTemplate();
				}
			break;
		case Message.abortAndRestart:
				fileName = '';
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
/*
	

	
	// const templateCreator = new Creator(file, extContext);
	// templateCreator.createTemplate();
*/
};

function userMakeChoice(settings: any) {
	const userChoice = new UserChoiceHandler(settings, extContext);
   let listener = userChoiceReciever;
   userChoice.chooseOption(listener, fileName);
}

function checkFile() {
	const settingsHandler = new SettingsHandler();
	let settings = settingsHandler.getSettingsForFile(fileName);

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