import { IActionBasis, INamedValues } from "../template/interfaces";

export class ActionBasis implements IActionBasis {
   private variables: INamedValues | undefined;
   private valueStack: Array<{value : string}> | undefined;

   public getVariables(): INamedValues | undefined {
      return this.variables;
   }

   public getValueStack(): Array<{value : string}> | undefined {
      return this.valueStack;
   }

   public setVariables(initVariables: INamedValues): boolean {
      if (!initVariables) {
         return false;
      }
      this.variables = initVariables;
      return true;
   }

   public setValueStack(initValueStack: Array<{value : string}>): boolean {
      if (!initValueStack) {
         return false;
      }
      this.valueStack = initValueStack;
      return true;
   }
}