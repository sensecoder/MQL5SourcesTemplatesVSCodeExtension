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
      // console.log(`Variable.doAction(): Variable action in action!`);
      if (!this.checkIntegrity()) {
         console.error(`Variable.doAction(): Not check integrity!`);
         return false;
      }
      // if (!this.basis) {
      //    console.error(`Variable.doAction(): Not has basis!`);
      //    return false;
      // }
      // let valueStack = this.basis.getValueStack();
      if (!this.valueStack) {
         console.error(`Variable.doAction(): Not has valueStack!`);
         return false;
      }
      // let variables = this.basis.getVariables();
      if (!this.variables) {
         console.error(`Variable.doAction(): Not has variables!`);
         return false;
      }

      let meaning = this.variables.getByName(actionLexeme);
      if (meaning === '' || !meaning) {
         console.error('Variable.doAction(..): Warning! Something goes wrong! ActionLexeme = ' + actionLexeme);
         return false;
      }
      // console.log(`Variable.doAction(): Find the meaning = "${meaning}"`);
      this.valueStack.push({value : meaning});
      return true;
   }

   public getProductionSequence() {
      return PRODUCTION_SEQUENCE; 
   };

}