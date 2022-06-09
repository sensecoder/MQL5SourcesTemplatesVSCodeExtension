import { fstat, readFileSync, writeFileSync } from 'fs';
import * as path from 'path';

/**
 * It has information about the settings of templates for files with different extension. Normally it stored in 'template_setting.json'
 */
export class SettingsHandler {
   private templateSettingsJson: string = path.join(__dirname,'../res/template_settings.json');
   
   /**
    * Checking validity of input file extension in settings file. In a good case will return a settings object for its template.
    * @param fileName 
    */
   public getSettingsForFile(fileName: string): any {
      let fileExtension = fileName.substring(fileName.lastIndexOf(".") + 1);      
      let settings = this.getSettingsAsObject();
      
      // Trying to pull out the necessary parts from the settings:
      let general: any;
      let templates: any;
      try {
         general = settings.General;
         templates = eval('settings.FileExtension.'+fileExtension);   
      } catch (error) {
         console.error('SettingsHandler.getSettingsForFile(..): Something bad whith "settings", can not create "general" and "templates"');
         return null;
      }
      if (!templates) { // In this case we have an invalid file extension.
         return null;
      }
      
      // Trying unite the parts in new settings object:
      let reJson: string = '{"General":'+JSON.stringify(general)+','+
                            JSON.stringify(templates).slice(1);
      try {
         settings = JSON.parse(reJson);   
      } catch (error) {
         console.error('SettingsHandler.getSettingsForFile(..): Error whith "reJson", can not create settings.');
         settings = null;
      }
      
      return settings;
   }

   public getSettingsAsObject(): any {
      let jsonStr = this.readSettingsFile();
      
      // Trying make settings object:
      let settings: any;
      try {
         settings = JSON.parse(jsonStr);   
      } catch (error) {
         console.error('SettingsHandler.getSettingsForFile(..): Error whith "jsonStr", can not create "settings"');
         return null;
      }

      return settings;
   }

   public saveGeneral(newGeneral: any): boolean {
      let settings = this.getSettingsAsObject();
      
      try {
         let general = settings.General;
      } catch (error) {
         console.error('SettingsHandler.saveGeneral(..): Something bad whith "settings", can not find "General" object!');
         return false;
      }
      // eslint-disable-next-line @typescript-eslint/naming-convention
      newGeneral = {General : {...newGeneral}};
      settings = {...settings, ...newGeneral};
      this.saveSettings(settings);

      return true;
   }

   private saveSettings(settings: any): boolean {
      let strSettings = JSON.stringify(settings);
      let openQuotes = false;
      let tab = '';
      for (let index = 0; index < strSettings.length; index++) {
         const char = strSettings.charAt(index);
         // console.log(`SettingsHandler.saveSettings(..): loop... ${strSettings.length}, tab.len = ${tab.length}`);
         if (char === '"') {
            if (!openQuotes) {
               openQuotes = true;
            } else {
               openQuotes = false;
            }
            // console.log('SettingsHandler.saveSettings(..): 3');
         }
         if (!openQuotes) {
            if (char === '{' || char === '[') {
               tab += '   ';
               strSettings = strSettings.slice(0, index + 1).concat('\n', tab,  strSettings.slice(index + 1));
               // console.log('SettingsHandler.saveSettings(..): 1');
            }
            if (char === '}' || char === ']') {
               if (tab.length > 0) {
                  tab = tab.slice(3);
               }
               strSettings = strSettings.slice(0, index).concat('\n',tab, strSettings.slice(index));
               index = index + 1 + tab.length;
               // console.log('SettingsHandler.saveSettings(..): 2');
            }
            if (char === ',') {
               strSettings = strSettings.slice(0, index + 1).concat('\n', tab, strSettings.slice(index + 1));
               // console.log('SettingsHandler.saveSettings(..): 4');
            }
            if (char === ':') {
               strSettings = strSettings.slice(0, index + 1).concat(' ', strSettings.slice(index + 1));
               // console.log('SettingsHandler.saveSettings(..): 4');
            }
         }
      }
      console.log('SettingsHandler.saveSettings(..): Saving proceed...');
      writeFileSync(this.templateSettingsJson, strSettings);

      return true;
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