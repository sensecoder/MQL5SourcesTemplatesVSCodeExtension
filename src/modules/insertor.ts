//import { settings } from "cluster";
import { TemplatePrototypeHandler } from "./templateprototypehandler";

export class Insertor {
   private settings: any;
   private file: string = '';
   
   /**
    * Вставляет шаблон с задаными параметрами в открытый editor соответствующего файла.
    * @param options Параметры шаблона
    * @param fileName Файл, к которому будет применятся шаблон
    */
   constructor(options: any, fileName: string) {
      this.settings = options;
      this.file = fileName;
   }

   /**
    * Применяет настройки к шаблону для текущего файла и вставляет их в редактор
    */
   public applyTemplate(): boolean {
      let protoTemplate = this.getTextFromPrototype();
      let protoHandler = new TemplatePrototypeHandler(protoTemplate, this.settings);
      let modifiedTemplate = protoHandler.modifyPrototype();
      if (modifiedTemplate === '') {
         return false;
      }

      return this.insertToEditor(modifiedTemplate);
   }

   /**
    * Находит файл с прототипом шаблона и возвращает его текст
    */
   private getTextFromPrototype(): string {
      let protoTemplate = '';

      return protoTemplate;
   }

   /**
    * Вставляет обработанный шаблон в открытый в эдиторе файл
    * @param template Текст шаблона
    */
   private insertToEditor(template: string): boolean {
      
      return false;
   }
}