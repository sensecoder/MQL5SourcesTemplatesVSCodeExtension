//import { settings } from "cluster";
import { TemplatePrototypeHandler } from "./templateprototypehandler";
import * as path from 'path';
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
         console.error(__filename.substr(__filename.lastIndexOf('\\')+1)+': File name of template prototype not found!');
         return '';
      }
      // Надо сделать полное имя:
      fileName = path.join(__dirname,'../res/'+fileName);

      return fileName;
   }

   private readPrototypeFile(fileName: string): string {
      let content: string = '';
      try {
         content = readFileSync(fileName, 'utf8');
      } catch (error) {
         console.error(__filename.substr(__filename.lastIndexOf('\\')+1)+': Template prototype file read error occur! fileName = '+fileName);
      }

      return content;
   }

   /**
    * Вставляет обработанный шаблон в открытый в эдиторе файл
    * @param template Текст шаблона
    */
   private insertToEditor(template: string): boolean {
      
      return false;
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

      return map;
   }
}