import { readFileSync } from 'fs';

export class TemplatePrototypeHandler {
   private protoFile: string = '';
   private protoText: string = '';
   private modifiedText: string = '';
   private tokensParams: any;
   
   /**
    * Обработчик текста с прототипом шаблона. 
    * @param protoTemplate Текст прототипа шаблона
    * @param params Параметры, необходимые для соответствующей обработки
    */
   constructor(protoFileName: string, params: any) {
      this.protoFile = protoFileName;
      this.tokensParams = params;
      this.readProtoFile();
   }

   /**
    * Модифицирует переданый объекту класса прототип шаблона в соответствии с параметрами.
    */
   public modifyPrototype(): string {
      
      return this.modifiedText;
   }

   private readProtoFile(){
      try {
         this.protoText = readFileSync(this.protoFile, 'utf8');
      } catch (error) {
         console.error(__filename.substr(__filename.lastIndexOf('\\')+1)+': Template prototype file read error occur! fileName = '+this.protoFile);
      }
   }
}