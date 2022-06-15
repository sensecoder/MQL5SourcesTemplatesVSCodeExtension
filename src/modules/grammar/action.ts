import { IProductionAction } from "../grammargeneric/interfaces";
import { IActionBasis, INamedValues } from "../template/interfaces";

/**
 * Base class for actions during level reduction in ReductionTable
*/
export class Action implements IProductionAction {
   protected noActionFlag:       boolean = false;
   protected valueStack:         Array<{value : string}> | undefined;
   protected variables:          INamedValues | undefined;
   protected basis:              IActionBasis | undefined;
   protected productionSequence: string = '';

   public getProductionSequence(): string {
      return this.productionSequence;
   }

   public doAction(actionLexeme: string): boolean { // child will implement
      // if (this.noActionFlag) {
      //    console.log('Action.doAction(..): NO ACTION!');
      // }
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
      if (!this.basis) {
         console.error('Action.checkIntegrity(): Error! Basis is invalid!');
         return false;
      }
      this.valueStack = this.basis.getValueStack();
      if (!this.valueStack) {
         console.error('Action.checkIntegrity(): Error! ValueStack is invalid!');
         return false;
      } else {
         // console.log('Action.checkIntegrity(): ValueStack is OK!');
      }
      this.variables = this.basis.getVariables();
      if (!this.variables) {
         console.error('Action.checkIntegrity(): Error! Variables is invalid!');
         return false;
      }
      return true;
   }
}