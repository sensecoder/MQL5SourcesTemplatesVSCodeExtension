import { IProductionAction } from "../grammargeneric/interfaces";
import { ReductionTable } from "../grammargeneric/reductiontable";
import { INamedValues } from "../template/interfaces";
import { ActionBasis } from "./actionbasis";
import { Actions } from "./actions";
import * as path from 'path';
import { NoAction } from "./actions/noaction";

const REDUCTION_TABLE_FN = path.join(__dirname,'../../res/macros.grm');

/**
 * Get access to basic grammar construction and variables
*/
export class ParserBasicProp {
   private reductionTable: ReductionTable | undefined;
   private actionsMap:     Map<string, IProductionAction> | undefined;
   private variables:      INamedValues;
   private actionBasis:    ActionBasis;
   private actions:        Actions = new Actions();
   private mapKeys:        string[] = [];

   constructor(initValues: INamedValues) {
      this.variables = initValues;
      this.actionBasis = new ActionBasis();
      this.actionBasis.setVariables(initValues);
      if (!this.makeReductionTable()) {
         console.error('ParserBasicProp.constructor(): Error with creation Reduction Table!');
      }
      if(!this.fillActionsMap()) {
         console.error('ParserBasicProp.constructor(): Error with creation ActionsMap!');
      }
   }
   
   public getVariables(): INamedValues {
      return this.variables;
   }

   public getActionsMap(): Map<string, IProductionAction> | undefined {
      return this.actionsMap;
   }

   public getReductionTable(): ReductionTable | undefined {
      return this.reductionTable;
   }

   public setValueStackForActions(initStack: Array<{value : string}>): boolean {
      if(!this.actionBasis) {
         console.error('ParserBasicProp.setValueStackForActions(..): Error! ActionBasis is invalid!');
         return false;
      }
      return this.actionBasis.setValueStack(initStack);
   }

   public setVariables(initVariables: INamedValues) {
      this.variables = initVariables;
   }

   private addMapKey(key: string) {
      this.mapKeys.push(key);
      return true;
   }

   private fillActionsMap(): boolean {
      if (!this.reductionTable) {
         console.error('ParserBasicProp.fillActionsMap(): Warning! Reduction table is invalid. Ipossible fill the actions map.');
         return false;
      }
      let size = this.reductionTable.getSize();
      // console.log(`ParserBasicProp.fillActionsMap(): reductionTable size = ${size}`);
      this.makeActionsMap();
      for (let i = 0; i < size; i++) {
         let prod = this.reductionTable.getLevel(i);
         if (!prod) {
            return false;
         }
         let pattern = prod.getRightSideNamesPattern();
         if (pattern === '') {
            console.error('ParserBasicProp.fillActionsMap(): Error! Pattern is empty!');
            return false;
         } 
         let action = this.actions.getActionByPattern(pattern);
         if (!action) {
            // console.log('ParserBasicProp.fillActionsMap(): NO Action detected!');
            action = new NoAction();
            this.actions.insert(action);
         } else {
            // console.log('ParserBasicProp.fillActionsMap(): Action detected!');
            action.setBasis(this.actionBasis);
         }
         let key = pattern;
         if (!this.actionsMap) {
            return false;
         }
         // console.log('ParserBasicProp.fillActionsMap(): Add action to map!');
         this.actionsMap.set(key, action);
         this.addMapKey(key);
      }
      return true;
   }
   
   private makeActionsMap(): boolean {
      this.actionsMap = new Map<string, IProductionAction>();
      return true;
   }

   private makeReductionTable(): boolean {
      this.reductionTable = new ReductionTable();
      if (!this.reductionTable.completeFromFile(REDUCTION_TABLE_FN)) {
         console.error('ParserBasicProp.makeReductionTable(): Error with filling reduction table from file!');
         return false;
      }
      return true;
   }
}