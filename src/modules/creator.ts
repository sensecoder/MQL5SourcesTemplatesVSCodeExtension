import { UserChoice } from "./userchoiсe";
import { Insertor } from "./insertor";
import * as path from 'path';
import { readFile, readFileSync } from 'fs';

/**
 * Основной класс для расширения mqlSourceTemplate. 
 * Запускает процесс создания шаблона для валидного файла.
 */
export class Creator {
   private file: string = '';
   // местонахождение файла с настройкаи относительно этого файла:
   private templateSettingsJson: string = path.join(__dirname,'../res/template_settings.json');

   /**
    * Создаёт шаблоны для валидного файла
    * @param fileName : имя файла в который необходимо поместить шаблон
    */
   constructor(fileName:string) {
      this.file = fileName;
   }

   /**
    * Запускает процесс создания шаблона
    */
   public createTemplate(): boolean {
      // Проверка файла на валидность:
      let possibleOptions = this.checkFile(); // Должны быть получены возможные варианты параметров шаблона
      if(!possibleOptions) {
         console.log('Created file not supported!');
         return false;
      }
      // Пользователь делает свой выбор:
      const userChoice = new UserChoice(possibleOptions);
      let selectedOptions = userChoice.chooseOption();
      if(!selectedOptions) {
         console.log('Options not recieved from the user!');
         return false;
      }
      // Отрисовка шаблона в редакторе файла:
      const insertor = new Insertor(selectedOptions, this.file);
      return insertor.applyTemplate();
   }

   private checkFile(): any {
      let fileExtension = '*'+this.file.substr(this.file.lastIndexOf("."));
      let settings: any; 
      let approve: boolean = false;
      settings = JSON.parse(this.readSettingsFile(),(key, value) => {
         if(key === fileExtension || approve) {
            console.log('mi tyt!');
            approve = true;
            return value;
         }
      });
      // settings = JSON.parse(this.readSettingsFile());

      let reJson: string = JSON.stringify(settings);
      console.log('reJson = ' + reJson);

      return null;
   }

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