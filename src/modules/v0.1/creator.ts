import { UserChoice } from "./userchoiсe";
import { Insertor } from "./insertor";
import * as path from 'path';
import * as vscode from 'vscode';
import { readFileSync } from 'fs';
//import { assert } from "console";

/**
 * Основной класс для расширения mqlSourceTemplate. 
 * Запускает процесс создания шаблона для валидного файла.
 */
export class Creator {
   private file: string = '';
   private extContext: vscode.ExtensionContext;
   // местонахождение файла с настройкаи относительно этого файла:
   private templateSettingsJson: string = path.join(__dirname,'../../res/template_settings.json');

   /**
    * Создаёт шаблоны для валидного файла
    * @param fileName : имя файла в который необходимо поместить шаблон
    */
   constructor(fileName: string, context: vscode.ExtensionContext) {
      this.file = fileName;
      // console.log('Creator: Filename on construction: ' + this.file);
      this.extContext = context;
   }

   /**
    * Запускает процесс создания шаблона
    */
   public createTemplate(){
      // Проверка файла на валидность:
      let possibleOptions = this.checkFile(); // Должны быть получены возможные варианты параметров шаблона
      if(!possibleOptions) {
         console.error('Created file not supported!');
         return false;
      }
      // Пользователь делает свой выбор:
      const userChoice = new UserChoice(possibleOptions, this.extContext);
      let listener = this.receiverUserOptions;
      userChoice.chooseOption(listener, this.file);
   }

   private receiverUserOptions(selectedOptions: any, fileName: string) 
   {
      if(!selectedOptions) {
         console.error('Options not recieved from the user!');
      }
      // Отрисовка шаблона в редакторе файла:
      // console.log('receiverUserOptions: ' + fileName);
      const insertor = new Insertor(selectedOptions, fileName);
      insertor.applyTemplate();
      vscode.window.showInformationMessage('Template Created!');
	   console.log('Template Successfully Created!');
      //return insertor.applyTemplate();
   }

   /**
    * Проверяет файл с настройками и возвращает необходимую часть из него
    */
   private checkFile(): any {
      let fileExtension = this.file.substr(this.file.lastIndexOf(".")+1);
      
      // Чтение файла с настройками:
      let jsonStr = this.readSettingsFile();
      
      // Попробуем сделать объект с настройками:
      let settings: any;
      try {
         settings = JSON.parse(jsonStr);   
      } catch (error) {
         console.error(__filename.substr(__filename.lastIndexOf('\\')+1)+': Error whith "jsonStr", can not create "settings"');
         return null;
      }
      
      // Попробуем вытащить нужные части из настроек:
      let general: any;
      let templates: any;
      try {
         general = settings.General;
         templates = eval('settings.FileExtension.'+fileExtension);   
      } catch (error) {
         console.error(__filename.substr(__filename.lastIndexOf('\\')+1)+': Something bad whith "settings", can not create "general" and "templates"');
         return null;
      }
      if(!templates){
         return null;
      }
      
      // Попробуем объединить эти части:
      let reJson: string = '{"General":'+JSON.stringify(general)+','+
                            JSON.stringify(templates).slice(1);
      try {
         settings = JSON.parse(reJson);   
      } catch (error) {
         console.error(__filename.substr(__filename.lastIndexOf('\\')+1)+': Error whith "reJson", can not create settings');
         settings = null;
      }
      
      return settings;
   }

   /**
    * Считывание данных из файла настроек
    */
   private readSettingsFile(): string {
      let content: string = '';
      try {
         content = readFileSync(this.templateSettingsJson, 'utf8');
      } catch (error) {
         console.error('SettingsFile read error occur! '+this.templateSettingsJson);
      }

      return content;
   }
}