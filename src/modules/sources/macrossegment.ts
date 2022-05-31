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
      if (this.content) {
         result += "(+)";
      }
      if (this.logic) {
         let name = '';
         if (this.logic.isBlockEndMacros({value : name})) {
            result = result.substring(this.logic.getBlockEndMacros().length);
         }
      }
      return result;
   }

   public isNestedContentEndParenthesis(): boolean {
      let name = '';
      if(this.logic) {
         return this.logic.isBlockEndMacros({value : name});
      }
      return false;
   }
   
   public addTextAsResult(preText: {value: string}): boolean {
      if(!this.logic) {
         console.error('MacrosSegment.addTextAsResult(..): Error! Logic of macros translate is invalid! No result text to add.');
         return false;
      }       
      if(!this.originalText) {
         console.error('MacrosSegment.addTextAsResult(..): Error! Original text is undefined! No result text to add.');
         return false;
      }
      this.logic.setMacrosText(this.originalText);  
      return this.logic.applyMacros(preText);
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
