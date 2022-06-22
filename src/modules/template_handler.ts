import * as path from 'path';
import { INamedValues } from "./template/interfaces";
import { Template } from './template/template';

export class TemplateHandler {
   private settigs: INamedValues;

   constructor(initSettings: INamedValues) {
      this.settigs = initSettings;
   }

   public renderText(): string {
      let result = '';
      let templateFileName = this.getPrototypeFileName();
      if (templateFileName !== '') {
         let template = new Template(templateFileName);
         template.setVariables(this.settigs);
         let text = template.render();
         if (text) {
            result = text;
         }
      }

      return result;
   }

   private getPrototypeFileName(): string {
      let result = '';
      let nameFromSettings = this.settigs.getByName('TemplateFileName');
      if (!nameFromSettings) {
         console.error('TemplateHandler.getPrototypeFileName(): File name of template prototype not found!');
      } else {
         result = path.join(__dirname,'../res/'+nameFromSettings);
      }

      return result;
   }
}