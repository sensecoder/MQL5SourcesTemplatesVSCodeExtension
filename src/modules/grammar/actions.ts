import { Action } from "./action";
import { Plus } from "./actions/plus";
import { PostInstruction } from "./actions/postinstruction";
import { TextInQuotes } from "./actions/textinquotes";
import { Variable } from "./actions/variable";

export class Actions {
   private array: Action[] = [];
   
   constructor() {
      this.initializeArray();
   }
   
   public isClear(): boolean {
      if (this.array.length <= 0) {
         return true;
      }
      return false;
   }

   public getActionByPattern(pattern: string): Action | null {
      let size = this.array.length;
      // console.log(`Actions.getActionByPattern(..): Try get action class with pattern = ${pattern}`);
      for (let index = 0; index < size; index++) {
         const element = this.array[index];
         if (element) {
            if (pattern === element.getProductionSequence()) {
               // console.log(`Actions.getActionByPattern(..): Found action class with pattern = ${pattern}`);
               return element;
            }
         } else {
            console.error('Actions.getActionByPattern(..): Warning! Out of pointer in array[' + index + ']');
         }
      }

      return null;
   }

   public insert(action: Action):boolean {
      this.array.push(action);
      
      return true;
   }

   private initializeArray(): boolean {
      if (  !this.insert(new Plus()) ||
            !this.insert(new TextInQuotes()) ||
            !this.insert(new Variable()) ||
            !this.insert(new PostInstruction())) {
         return false;
      }
      return true;
   }
}