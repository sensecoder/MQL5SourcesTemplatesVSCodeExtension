import { Action } from "../action";

const PRODUCTION_SEQUENCE = 'VARIABLE';

/**
 * Action is placed variable meaning in value stack
*/
export class Variable extends Action {
   constructor() {
      super();
      this.noActionFlag = false;
   }

   public doAction(actionLexeme: string): boolean {
      if (!this.checkIntegrity) {
         return false;
      }
      if (!this.valueStack) {
         return false;
      }
      if (!this.variables) {
         return false;
      }
      
      let meaning = this.variables.getByName(actionLexeme);
      if (meaning === '' || !meaning) {
         console.error('Variable.doAction(..): Warning! Something goes wrong! ActionLexeme = ' + actionLexeme);
         return false;
      }
      this.valueStack.push(meaning);
      return true;
   }

   public getProductionSequence() {
      return PRODUCTION_SEQUENCE; 
   };

}