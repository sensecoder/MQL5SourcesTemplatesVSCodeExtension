//import { settings } from "cluster";
import { TemplatePrototypeHandler } from "./templateprototypehandler";
import * as path from 'path';
import * as vscode from 'vscode';
import { readFileSync } from 'fs';

export class Insertor {
   private settings: Map<string, any>;
   private file: string = '';
   
   /**
    * Вставляет шаблон с задаными параметрами в открытый editor соответствующего файла.
    * @param options Параметры шаблона
    * @param fileName Файл, к которому будет применятся шаблон
    */
   constructor(options: any, fileName: string) {
      this.settings = this.mapGenerator(options);
      this.file = fileName;
      // console.log('Filename on construction: ' + this.file);
   }

   /**
    * Применяет настройки к шаблону для текущего файла и вставляет их в редактор
    */
   public applyTemplate(): boolean {
      let protoFile = this.getPrototypeFileName();
      let protoHandler = new TemplatePrototypeHandler(protoFile, this.settings);
      let modifiedTemplate = protoHandler.modifyPrototype();
      if (modifiedTemplate === '') {
         return false;
      }

      return this.insertToEditor(modifiedTemplate);
   }

   /**
    * Находит файл с прототипом шаблона и возвращает его URI
    */
   private getPrototypeFileName(): string {
      // Имя файла шаблона должно находится в settings...
      let fileName = this.settings.get('PrototypeFileName');
      if(!fileName){
         console.error(__filename.substring(__filename.lastIndexOf('\\')+1)+': File name of template prototype not found!');
         return '';
      }
      // Надо сделать полное имя:
      fileName = path.join(__dirname,'../../res/'+fileName);

      return fileName;
   }

   /**
    * Вставляет обработанный шаблон в открытый в эдиторе файл
    * @param template Текст шаблона
    */
   private insertToEditor(template: string): boolean {
      let pos = new vscode.Position(0,0);
	   // let activeEditor = vscode.window.activeTextEditor;
      let editor = this.findEditor();
      // console.log(template);
      if (!editor) {
         vscode.window.showErrorMessage('Active editor not exist!');
         return false;
      }
      editor.edit( e => {
         e.insert(pos,template);
         //vscode.TextEdit.insert(pos,'ypa!!!');
         vscode.window.showInformationMessage('is work?');
      });

      return true;
   }

   private findEditor(): vscode.TextEditor | undefined {
      let editor: vscode.TextEditor = Object();
      let editors = vscode.window.visibleTextEditors;
      let documents = vscode.workspace.textDocuments;
      // documents.forEach(document => {
      //    console.log('document = ' + document.fileName);
      // });

      if (documents.length === 0) {
         console.error('Insertor.findEditor(): No one open documents here!');
      } else {
         // console.log('this file = ' + this.file);
         for (let i = 0; i < documents.length; i++) {
            //document = documents[i];
            // console.log('editor[' + i + '] = ' + editor.document.fileName);
            if (documents[i].fileName === this.file) {               
               vscode.window.showTextDocument(documents[i],vscode.ViewColumn.One);
               console.log('Insertor.findEditor(): I will show you document!');
               // return vscode.window.activeTextEditor;
            }
         }
      }

      if (editors.length === 0) {
         console.error('Insertor.findEditor(): No one visible editors here!');
      } else {
         // console.log('this file = ' + this.file);
         for (let i = 0; i < editors.length; i++) {
            editor = editors[i];
            // console.log('editor[' + i + '] = ' + editor.document.fileName);
            if (editor.document.fileName === this.file) {
               vscode.window.showTextDocument(editor.document);
               // editor.show();
               return editor;
            }
         }
      }

      console.error('Insertor.findEditor(): Editor not found!');
   }

   /**
    * Возвращает карту с полями объекта, индексы массивов не включаются.
    * @param object "Расчленяемый" объект
    */
   private mapGenerator(object: any): Map<string, any> {
      let map = new Map<string, any>();
      
      JSON.stringify(object, (key, value) => {
         try { // убираем индексы массивов
            if((typeof JSON.parse(key)) === "number") {
               return undefined;
            }
         } catch (error) {            
         }         
         map.set(key, value);
         return value;
      });
      console.log(`Insertor.mapGenerator(..): map.size = ${map.size}`);
      return map;
   }
}