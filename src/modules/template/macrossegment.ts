import { MacrosParser } from "./macrosparser";
import { Segment } from "./segment";

/**
 *  Template text segment describes a substitute macros. Constructor receive a macros handler.
*/
export class MacrosSegment extends Segment {
   private logic: MacrosParser | undefined;

   constructor(initOriginalText: string, initLogic: MacrosParser) {
      super();
      this.originalText = initOriginalText;
      this.logic = initLogic;
   }

   public getName(): string {
      let result = '';
      if (this.originalText !== '') {
         result = this.getFirstWordFromOriginalTextCut20();
      }
      // if (this.content) {
      //    result += "(+)";
      // }
      if (this.logic) {
         // let name = '';
         if (this.logic.isBlockEndMacros({value : result})) {
            // console.log(`MacrosSegment.getName(): Here? And BlockEndMakros.len = ${this.logic.getBlockEndMacros().length}`);   
            result = result.substring(this.logic.getBlockEndMacros().length);
         }
      } else {
         console.error(`MacrosSegment.getName(): Logic is out!`);
      }
      return result;
   }

   public isNestedContentEndParenthesis(): boolean {
      let name = this.getFirstWordFromOriginalTextCut20();
      if (this.logic) {
         return this.logic.isBlockEndMacros({value : name});
      }
      return false;
   }
   
   public addTextAsResult(preText: {value: string}): boolean {
      if(!this.logic) {
         console.error('MacrosSegment.addTextAsResult(..): Error! Logic of macros translate is invalid! No result text to add.');
         return false;
      }       
      if(this.originalText === undefined) {
         console.error('MacrosSegment.addTextAsResult(..): Error! Original text is undefined! No result text to add.');
         return false;
      }
      this.logic.setMacrosText(this.originalText); 
      // console.log(`MacrosSegment.addTextAsResult(..): Let's apply macros!`); 
      if (this.content) {
         // Must be a special macros case
         if (this.logic.isContentIncluded()) {
            console.log(`MacrosSegment.addTextAsResult(..): Getting text from nested content...`);
            preText.value = preText.value + this.getTextFromContent();
         } 
      } else {
         if (!this.logic.applyMacros(preText)) {
            preText.value = preText.value + this.originalText;
            return false;
         }
      }
      return true;
   }

   private getFirstWordFromOriginalTextCut20(): string {
      let result = '';
      if (!this.originalText) {
         return result;
      }
      for (let i = 0; i < this.originalText.length; i++) {
         if (i === 20) {
            break;
         }
         let ch = this.originalText.charAt(i);
         if (ch !== ' ') {
            result += ch;
         } else {
            if (result !== '') {
               break;  
            }
         }
      }
      return result;
   }
}
