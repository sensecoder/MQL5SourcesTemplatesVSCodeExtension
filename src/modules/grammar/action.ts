import { IProductionAction } from "../grammargeneric/interfaces";
import { IActionBasis, INamedValues } from "../sources/interfaces";

/**
 * Base class for actions during level reduction in ReductionTable
*/
export class Action implements IProductionAction {
   protected noActionFlag:       boolean = false;
   protected valueStack:         string[] = [];
   protected variables:          INamedValues | undefined;
   protected basis:              IActionBasis | undefined;
   protected productionSequence: string = '';

   public getProductionSequence(): string {
      return this.productionSequence;
   }

   public doAction(actionLexeme: string): boolean { // child will implement
      return false;
   }

   public isNoAction(): boolean {
      return this.noActionFlag;
   }

   public setBasis(initBasis: IActionBasis): boolean {
      if(!initBasis) {
         return false;
      }
      this.basis = initBasis;
      return true;
   }

   public checkIntegrity(): boolean {
      if(!this.basis) {
         console.error('Action.checkIntegrity(): Error! Basis is invalid!');
         return false;
      }
      this.valueStack = this.basis.getValueStack();
      if(!this.valueStack) {
         console.error('Action.checkIntegrity(): Error! ValueStack is invalid!');
         return false;
      }
      this.variables = this.basis.getVariables();
      if(!this.variables) {
         console.error('Action.checkIntegrity(): Error! Variables is invalid!');
         return false;
      }
      return true;
   }
}