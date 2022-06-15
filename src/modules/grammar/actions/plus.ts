import { Action } from "../action";

const PRODUCTION_SEQUENCE = 'Concat PLUS TextValue';

/**
 * Action is concatinate two elements in value stack
*/
export class Plus extends Action {
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
      let val2 = this.valueStack.pop();
      let val1 = this.valueStack.pop();
      if(!val1 || !val2) {
         console.error('Plus.doAction(): Error! Something goes wrong!');
         return false;
      }
      let sum = {value : val1.value + val2.value};
      this.valueStack.push(sum);
      return true;
   }

   public getProductionSequence() {
      return PRODUCTION_SEQUENCE; 
   };

}