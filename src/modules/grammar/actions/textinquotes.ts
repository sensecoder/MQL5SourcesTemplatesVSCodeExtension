import { Action } from "../action";

const PRODUCTION_SEQUENCE = 'TEXT_IN_QUOTES';

/**
 * Action is placed TEXT_IN_QUOTES lexeme in value stack
*/
export class TextInQuotes extends Action {
   constructor() {
      super();
      this.noActionFlag = false;
   }
   
   public doAction(actionLexeme: string): boolean {
      if (!this.checkIntegrity()) {
         return false;
      }
      if (!this.valueStack) {
         return false;
      }
      this.valueStack.push({value : actionLexeme});
      return true;
   }

   public getProductionSequence() {
      return PRODUCTION_SEQUENCE; 
   };

}