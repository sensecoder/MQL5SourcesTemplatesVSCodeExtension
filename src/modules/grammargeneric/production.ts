import { GrammarSymbol } from "./grammarsymbol";

/**
 * Grammar string which describe an elementary rule
*/
export class Production {
   private leftSide: GrammarSymbol | undefined;
   private rightSide: GrammarSymbol[] | undefined;

   public setLeftSide(symbol: GrammarSymbol): boolean {
      this.leftSide = symbol;
      return true;
   }

   public addToRightSide(symbol: GrammarSymbol): boolean {
      if (!this.rightSide) {
         this.rightSide = [];
      }
      this.rightSide.push(symbol);

      return true;
   }

   public getLeftSide(): GrammarSymbol | undefined {
      return this.leftSide;
   }

   public getRightSideSize(): number {
      if(!this.rightSide) {
         return 0;
      }
      return this.rightSide.length;
   }

   public getRightSide(indx: number): GrammarSymbol | null {
      if(indx < 0 || indx >= this.getRightSideSize()) {
         console.error('Production.getRightSide(): Warning! "indx" is not correct. (indx = ${indx})');
         return null;
      }
      if(!this.rightSide){
         return null;
      }
      return this.rightSide[indx];
   }

   public getRightSideNamesPattern(): string {
      let pattern = '';
      if (this.rightSide) {
         let sizeRS = this.rightSide.length;
         console.log(`Production.getRightSideNamesPattern(): rightSide.length = ${sizeRS}, rightSide = ${JSON.stringify(this.rightSide)}`);
         for(let j = 0; j < sizeRS; j++) {
            let space = (j < sizeRS-1) ? " " : "";  
            let symb = this.getRightSide(j);
            if(symb === null) {
               console.error('Production.getRightSideNamesPattern(): Error! Symbol in right side is null!');
               return "";
            }
            pattern = pattern + symb.getName() + space;
         }
      }

      return pattern;
   }
}