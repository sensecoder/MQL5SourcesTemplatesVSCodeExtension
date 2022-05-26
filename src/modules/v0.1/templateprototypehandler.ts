/* eslint-disable @typescript-eslint/naming-convention */
import { assert } from 'console';
import { readFileSync } from 'fs';

// Обозначение макросов в прототипе шаблона:
const MACROS_OPEN = '<{';       // Определяющая макрос открывающая скобка в тексте прототипа (только 2 знака допустимо)
const MACROS_CLOSE = '}>';      // Соответственно закрывающая
const BLOCK_MACROS_END = '<{/'; // Завершающая скобка блока текста, на который влияет макрос (3 знака)

// Зарезервированные токены:
enum ReservedTokens {
   'Optional',                   // Определяет блок текста в прототипе, который может отстутствовать. Используется в семантике с условием (r+o+v). Блок текста заканчивается обязательным закрывающим токеном /Optional.
   'inMQLHeadStandard',          // Является параметром к переменной, указывающим что она находится в "шапке файла" (что является явным задротством) и поэтому переменную нужно расположить так, чтобы не нарушить прекрасный строй шапки.
   'inMQLCommentBlockStandard'   // Указывает, что прежде чем разместить переменную в тексте, её необходимо "обернуть" в блок комментариев
}
// Токены операторы:
enum OperatorsTokens {
   'if',             // Оператор условия, после него обязательно должна идти переменная типа boolean
   '='               // Оператор присваивания
}
// Схемы токенов:
enum TokensSchemas {
   'v',              // Переменная, значение ищется в файле настроек, либо оставляется как есть
   'v+r',            // Переменная с параметром. Применяется особый алгоритм в ставки в текст.
   'v+o+v',          // Операция над переменными (для начала возможно лишь присваивание)
   'r+o+v'           // Операция между зарезервированным токеном и переменной (для начала - условие)
}

export class TemplatePrototypeHandler {
   private protoFile: string = '';
   private protoText: string = '';
   private modifiedText: string = '';
   private tokensParams: Map<string, any>;
   private fatalError = false;      // Флаг фатальной ошибки, которая завершает работу обработчика 
   private action: any;
   
   /**
    * Обработчик текста с прототипом шаблона. 
    * @param protoTemplate Текст прототипа шаблона
    * @param params Параметры, необходимые для соответствующей обработки
    */
   constructor(protoFileName: string, params: Map<string, any>, protoText = '') {   
      this.tokensParams = params;
      this.action = this.defaultAction;
      
      if (protoFileName === '') {
         if (protoText !== '') {
            this.protoText = protoText; // Можно передать как текст
            return;
         }
      }
      this.protoFile = protoFileName;
      this.readProtoFile();
   }

   /**
    * Модифицирует переданый объекту класса прототип шаблона в соответствии с параметрами.
    * И возвращает готовый для вставки шаблон.
    */
   public modifyPrototype(): string {
      if (this.protoText === '') {
         return '';
      }

      // let abr = 'asJLfslLKFDl';
      // console.log('Test = ' + abr.toLowerCase());
      // if (<boolean><unknown>abr) {
      //    console.log('Test done!');
      // }
      // return '';

      let i = 0;
      while (i < this.protoText.length) {
         if (this.protoText[i] !== MACROS_OPEN[0]) {
            this.modifiedText = this.modifiedText + this.protoText[i];
         }
         else {
            i++;
            if ((i < this.protoText.length) && (this.protoText[i] === MACROS_OPEN[1])) {
               i = this.detectMacros(i+1); // i+1 означает что переходим уже за скобку MACROS_OPEN
               if (this.fatalError) {
                  console.error(this.errorHead() + ' : Fatal error while modified prototype of template!');                  
                  return '';
               }
            } else {
               
            }
         }

         i++;
      }

      // console.log(this.modifiedText);

      return this.modifiedText;
   }

   /**
    * Определяет макрос, который идёт с соответствующей позции в прототипе шаблона. И призводит все необходимые действия с ним. Возвращает позицию последней закрывающей скобки макроса.
    * @param indx Позиция макроса в тексте шаблона
    */
   private detectMacros(indx: number): number {
      let i = indx;

      // Паранойные проверки:
      if(i < MACROS_OPEN.length) {
         console.error(this.errorHead + ' : Это не макрос - это обман!');
         this.fatalError = true;
         return i;   // что-то не так, поскольку должна умещаться скобка, открывающая токен
      } else {
         if (this.protoText.substr(i-2, MACROS_OPEN.length) !== MACROS_OPEN) {
            console.error(this.errorHead + ' : Да шо вы гоните - это никакой не макрос!');
            this.fatalError = true;
            return i;
         }
      }

      // Определение тела макроса:
      let macrosBody: string = '';
      while (i < this.protoText.length) {
         // Вылавливание недопустимого:
         if (this.protoText[i] === MACROS_OPEN[0]) { // Не нормальная и подозрительная ситуация с недопустимым символом начала нового макроса (возможно) (ещё одна паранойя)
            if (((i+1)<this.protoText.length) && (this.protoText[i+1] === MACROS_OPEN[1])) {
               // Худшие опасения подтвердились и детектирован ещё один макрос внутри макроса - это грубая ошибка!
               console.error(this.errorHead() + ': Macros inside makros! Impossible!');
               this.fatalError = true;
               return i;
            }
         }
         // Ожидание закрывающих макрос скобок:
         if (this.protoText[i] === MACROS_CLOSE[0]) {
            if (((i+1)<this.protoText.length) && (this.protoText[i+1] === MACROS_CLOSE[1])) {
               // Есть закрывающая скобка, тело макроса готово, теперь оно отправляется на анализ:
               i=i+1;   // Индекс перемещается за скобку
               return this.macrosAnlysis(macrosBody, i);
            }
         }
         
         macrosBody = macrosBody + this.protoText[i];
         i++;
      }

      return i;
   }

   /**
    * Анализирует макрос и производит все необходимые действия, вытекающие из этого анализа
    * @param macrosBody Тело макроса
    * @param indx Позиция в protoText за макросом
    */
   private macrosAnlysis(macrosBody: string, indx: number): number {
      let i = indx;
      // Нужно разбить макрос на токены и определить их типы, схему и семантику схемы.
      // Типы токенов:
      // * Во-первых, есть Зарезервированный(е) токены;
      // * Есть токены - Переменные, у них есть значение присвоенное либо в тексте прототипа, либо в файле настроек "template_settings.json";
      // * Так же есть Операторы;
      // Разобью тело макроса на слова (они же токены):
      let bodyWords: string[] = [];
      let j = 0;
      let word = '';
      let push = (_word: string) => {
            if(_word !== '') {
            bodyWords.push(_word);
         }
      };
      while (j < macrosBody.length) {
         if (macrosBody[j] === ' ') {
            push(word);
            word = '';
         } else {
            word = word + macrosBody[j];   
         }         
         j++;
      }
      push(word);
      // Получу схему наборов токенов:
      let schema = this.tokenSchema(bodyWords);
      // По схеме и словам получу функцию семантического действия:
      this.detectAction(bodyWords, schema);
      
      return this.action(bodyWords, indx);
   }

   /**
    * Определяет какой конкретно метод необходимо применить для реализации семантики заложенной в макросе
    * @param wordsArr Набор слов в макросе
    * @param schema Схема токенов
    */
   private detectAction(wordsArr: Array<string>, schema: string) {
      
      switch (schema) {
         case 'v':   // Самое простое - нужно вставить переменную
               this.action = this.insertVariable;
            break;
         case 'v+r':
               if (wordsArr[1] === 'inMQLHeadStandard') {
                  this.action = this.insertVariableInMQLHeadStandard;
               };
               if (wordsArr[1] === 'inMQLCommentBlockStandard') {
                  this.action = this.insertVariableInMQLCommentBlockStandard;
               }
            break;
         case 'v+o+v':
               if (wordsArr[1] === '=') {
                  this.action = this.insertVariableByDefaultValue;
               }
            break;
         case 'r+o+v':
               if (wordsArr[0] === 'Optional') {
                  if (wordsArr[1] === 'if') {
                     this.action = this.insertBlockByCondition;
                  }
               }
            break;
      
         default:
               this.action = this.defaultAction;
            break;
      }
   }

   /**
    * Действие вставки блока текста, по условию описанному в макросе.
    * @param wordsArr 
    * @param indx 
    */
   private insertBlockByCondition(wordsArr: Array<string>, indx: number): number {
      // First, need to find end of text block:
      let blockEnd = indx;
      // wordsArr = ['Optional', 'if', 'variable']
      let blockText = '';
      let i = indx+1; // Why +1??? but its work!
      // console.log(wordsArr);
      
      while (i < this.protoText.length) {
         if (this.protoText[i] !== BLOCK_MACROS_END[0]) {
            blockText = blockText + this.protoText[i];
         } else { // possible end of block
            if ((i+BLOCK_MACROS_END.length+wordsArr[0].length+MACROS_CLOSE.length) < this.protoText.length) {
               let blockEndWord = this.protoText.substr(i,(BLOCK_MACROS_END.length+wordsArr[0].length+MACROS_CLOSE.length));
               if(blockEndWord === (BLOCK_MACROS_END+wordsArr[0]+MACROS_CLOSE)){
                  blockEnd = i + blockEndWord.length-1;
                  break;
               } else {
                  blockText = blockText + this.protoText[i];
               }
            }
         }
         i++;
      }
      // Test on error:
      if (blockEnd === indx) {
         console.error(this.errorHead() + ' Macros error! Not found End of optional text block!');
         this.fatalError = true;
         return indx;
      }
      // When block is found, need to decide include this one or not?
      let variable = wordsArr[2];
      let condition = false;
      if (this.tokensParams.has(variable)) {
         // console.log('variable = ' + variable + ' params = ' + this.tokensParams.get(variable));
         condition = <boolean>this.tokensParams.get(variable);
      } else {
         if (variable.toLowerCase() === 'true') {
            condition = true;
         }
      }
      if (condition) {
         // In first, need to handle whith care this text block...
         let modifiedBlockText = '';
         let handler = new TemplatePrototypeHandler('',this.tokensParams,blockText);
         modifiedBlockText = handler.modifyPrototype();
         this.modifiedText = this.modifiedText + modifiedBlockText;
      } else {
         // In this case need to check on end of line in template prototype and remove "blockEnd" position behind them
         i = blockEnd + 1; // F***ing + 1
         while (i < this.protoText.length) {
            if(this.protoText[i] !== ' ') { // Spaces ignores
               // console.log('here! text = "' + this.protoText[i] +'"');
               if(this.protoText[i] === '\r' || this.protoText[i] === '\n') {
                  // console.log('maybe here?');
                  if(this.protoText[i+1] === '\n') {
                     blockEnd = i+1;
                     break;
                  } else {
                     blockEnd = i;
                     break;
                  }
               } else {
                  break;
               }
            }
            i++;
         }
      }

      return blockEnd;
   }

   /**
    * Действие вставки переменной с присвоенным значением по-умолчанию
    * @param wordsArr 
    * @param indx 
    */
   private insertVariableByDefaultValue(wordsArr: Array<string>, indx: number): number {
      // wordsArr = ['variable', '=', 'defaultValue']
      let variable = wordsArr[0];
      
      if (this.tokensParams.has(variable)) { // Maybe user has set value
         variable = <string>this.tokensParams.get(variable);
         if (variable === '') { // User dont set value
            variable = wordsArr[2];
         }
      } else {
        variable = wordsArr[2];
      }

      this.modifiedText = this.modifiedText + variable;
      return indx;
   }
   
   /**
    * Действие вставки переменной
    * @param wordsArr 
    * @param indx 
    */
   private insertVariable(wordsArr: Array<string>, indx: number): number {
      let variable = wordsArr[0];
      
      if (this.tokensParams.has(variable)) {
         variable = <string>this.tokensParams.get(variable);
      }

      this.modifiedText = this.modifiedText + variable;
      return indx;
   }

   private cutFirstLineOfText(text: string, lineLen: number): string {
      let line = text;
      if(line.length > lineLen) {
         if(line[lineLen] !== ' ') {
            // Try to cut by word
            let lastWordBegin = line.lastIndexOf(' ', lineLen);
            if (lastWordBegin > 0) {
               line = line.substr(0, lastWordBegin);
            } else {
               // Hard cut
               line = line.substr(0, lineLen);
            }
         } else {
            line = line.substr(0, lineLen);
         }
      }
      // Check in line linebreak symbol:
      for (let i = 0; i < line.length; i++) {
         const symb = line[i];
         if(line[i] === '\r' || line[i] === '\n') {
            line = line.substr(0,i);
         } 
      }

      return line.trimRight();
   }

   /**
    * Inserting text from wordsArr[0] variable with comment block decoration like in classic MQL
    * @param wordsArr 
    * @param indx 
    * @returns 
    */
   private insertVariableInMQLCommentBlockStandard(wordsArr: Array<string>, indx: number): number {
      let variable = wordsArr[0];
      let insertedText = '';
      
      if (this.tokensParams.has(variable)) {
         variable = <string>this.tokensParams.get(variable);
      }

      let strTopBottom = "//+------------------------------------------------------------------+";
      insertedText = insertedText + strTopBottom + '\r\n';
      let symbolsInLine = 64;
      while (variable.length > 0) {
         // Lets cut text of comment to appropriate len of line
         let line = this.cutFirstLineOfText(variable,symbolsInLine);
         if(variable.length > line.length) {
            variable = variable.substr(line.length);
            variable = variable.trim();
         } else {
            variable = '';
         }
         if (line.length < symbolsInLine) {
            let needSpaces = symbolsInLine - line.length;
            for (let i = 0; i < needSpaces; i++) {
               line = line + ' ';
            }
         }
         insertedText = insertedText + '//| ' + line + ' |\r\n';
      }
      insertedText = insertedText + strTopBottom; // Final!

      this.modifiedText = this.modifiedText + insertedText;
      return indx;
   }
   
   /**
    * Действие вставки переменной со сдвигом влево (в стандартном для MQL заголовке шаблона)
    * @param wordsArr 
    * @param indx 
    */
   private insertVariableInMQLHeadStandard(wordsArr: Array<string>, indx: number): number {
      let variable = wordsArr[0];
      
      if (this.tokensParams.has(variable)) {
         variable = <string>this.tokensParams.get(variable);
      }

      let len = variable.length;
      let strEnd = '\n';
      let protoStrLen = 0;
      let pos = indx;
      for (let i = pos; i >= 0; i--) {
         if (this.protoText[i] === strEnd) {
            break;
         }
         protoStrLen++;
      }
      // console.log('protoStrLen = ' + protoStrLen);
      let modifiedStrLen = 0;
      pos = this.modifiedText.length-1;
      for (let i = pos; i >= 0; i--) {
         if (this.modifiedText[i] === strEnd) {
            break;
         }
         modifiedStrLen++;
      }
      
      if (len > (protoStrLen-3)) { // Cut variable string if it bigger of Head
         variable = variable.substr(len-(protoStrLen-3));
         len = variable.length;
      }

      let diffLen = protoStrLen - modifiedStrLen;
      // console.log('diffLen = ' + diffLen + '; len = ' + len);
      assert(diffLen > 0, ' Error! diffLen must be above zero! diffLen ='+diffLen);
      if (diffLen < len) {
         this.modifiedText = this.modifiedText.substr(0, this.modifiedText.length-(len-diffLen));
         // console.log('modifiedText reduced!');         
      } else {
         for (let i = 0; i < (diffLen-len); i++) {
            this.modifiedText = this.modifiedText + ' ';
         }
         // console.log('modifiedText expanded!');
      }

      this.modifiedText = this.modifiedText + variable;
      return indx;
   }

   /**
    * Действие по-умолчанию, как заглушка
    * @param wordsArr 
    * @param indx 
    */
   private defaultAction(wordsArr: Array<string>, indx: number): number {
      
      return indx;
   }

   /**
    * Определяет схему токенов
    * @param wordsArr Массив со словами из которых состоит тело схемы
    */
   private tokenSchema(wordsArr: Array<string>): string {
      let schema = '';
      for (let i = 0; i < wordsArr.length; i++) {
         const word = wordsArr[i];
         if(this.isReservedToken(word)){ 
            schema = schema + 'r';
         } else {
            if(this.isOperatorToken(word)){
               schema = schema + 'o';
            } else {
               schema = schema + 'v';
            }
         }
         if((i+1) !== wordsArr.length) {
            schema = schema + "+";
         }
      }

      return schema;
   }

   /**
    * Определяет, является ли слово зарезервированным токеном
    * @param word Слово для проверки
    */
   private isReservedToken(word: string): boolean {
      for (const indx in ReservedTokens) {
         if (word === ReservedTokens[indx]) {
            return true;
         }
      }
      return false;
   }

   /**
    * Определяет, является ли слово токеном-оператором
    * @param word Слово для проверки
    */
   private isOperatorToken(word: string): boolean {
      for (const indx in OperatorsTokens) {
         if (word === OperatorsTokens[indx]) {
            return true;
         }
      }
      return false;
   }

   private readProtoFile(){
      try {
         this.protoText = readFileSync(this.protoFile, 'utf8');
      } catch (error) {
         console.error(__filename.substr(__filename.lastIndexOf('\\')+1)+': Template prototype file read error occur! fileName = '+this.protoFile);
      }
   }

   private errorHead(): string{
      return __filename.substr(__filename.lastIndexOf('\\')+1);
   }
}