import { UserChoice } from "./userchoiсe";
import { Insertor } from "./insertor";

/**
 * Основной класс для расширения mqlSourceTemplate. 
 * Запускает процесс создания шаблона для валидного файла.
 */
export class Creator {
   private file: string ='';

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

      return null;
   }
}