import { IActionBasis, INamedValues } from "../template/interfaces";

export class ActionBasis implements IActionBasis {
   private variables: INamedValues | undefined;
   private valueStack: string[] = [];

   public getVariables(): INamedValues | undefined {
      return this.variables;
   }

   public getValueStack(): string[] {
      return this.valueStack;
   }

   public setVariables(initVariables: INamedValues): boolean {
      if (!initVariables) {
         return false;
      }
      this.variables = initVariables;
      return true;
   }

   public setValueStack(initValueStack: string[]): boolean {
      if (!initValueStack) {
         return false;
      }
      this.valueStack = initValueStack;
      return true;
   }
}