export class TemplatePrototypeHandler {
   private protoText: string = '';
   private modifiedText: string = '';
   private tokensParams: any;
   
   /**
    * Обработчик текста с прототипом шаблона. 
    * @param protoTemplate Текст прототипа шаблона
    * @param params Параметры, необходимые для соответствующей обработки
    */
   constructor(protoTemplate: string, params: any) {
      this.protoText = protoTemplate;
      this.tokensParams = params;
   }

   /**
    * Модифицирует переданый объекту класса прототип шаблона в соответствии с параметрами.
    */
   public modifyPrototype(): string {
      
      return this.modifiedText;
   }
}