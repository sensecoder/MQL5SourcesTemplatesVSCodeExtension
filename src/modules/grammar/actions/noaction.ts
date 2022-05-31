import { Action } from "../action";

/** 
 * A class that indicates that no action should be taken on the stack of values when reducing the sequence of the right side of the production that it contains.
*/
export class NoAction extends Action {
   constructor() {
      super();
      this.noActionFlag = true;
   }

   public setProductionSequence(initSequence: string): boolean {
      if (initSequence === '') {
         console.error('NoAction.setProductionSequence(..): Warning! initSequence is not be empty.');
         return false;
      }
      this.productionSequence = initSequence;
      
      return true;
   }
}