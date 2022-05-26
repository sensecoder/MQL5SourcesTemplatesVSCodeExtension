import { readFileSync } from "fs";
import { GrammarSymbol } from "./grammarsymbol";
import { Production } from "./production";

export class ReductionTable {
   private levels: Production[] | undefined;

   public addLevel(level: Production): boolean {
      if(!this.levels) {
         this.levels = [];
      }
      this.levels.push(level);

      return true;
   }

   public getSize(): number {
      if(!this.levels) {
         return -1;
      }
      return this.levels.length;
   }

   public getLevel(indx: number): Production | null {
      if(!this.levels) {
         return null;
      }
      if(indx < 0 || indx >= this.levels.length) {
         console.error('ReductionTable.getLevel(): Warning! "indx" is not correct. (indx = ${indx})');
         return null;
      }
      return this.levels[indx];
   }

   public completeFromFile(fileName: string): boolean {
      let fileStr = '';
      try {
         fileStr = readFileSync(fileName, 'utf8');
      } catch (error) {
         console.error('ReductionTable.completeFromFile(): File read error occur! fileName = ${fileName}');
      }
      if (fileStr === '') {
         console.error('ReductionTable.completeFromFile(): File not readable. fileName = ${fileName}');
         return false;
      }
      let prodStrArr = fileStr.split('/r/n');
      prodStrArr.forEach(prodStr => {
         this.addStrAsLevel(prodStr);
      });

      return true;
   }

   private addStrAsLevel(productionStr: string) {
      if (productionStr === '') {
         return;
      }
      let separator = '->';
      let orSign = '|';
      let separatorIndx = productionStr.indexOf(separator);
      if(separatorIndx < 0) {
         console.error('ReductionTable.addStrAsLevel(): Error! Input string is not a grammar production! ("${productionStr}")');
         return;
      }
      let leftSide = productionStr.substring(0,separatorIndx).trim();
      let rightSide = productionStr.substring(separatorIndx+separator.length).trim();
      let prod: Production;
      let symb: GrammarSymbol;
      if(leftSide === '') {
         return;
      }
      let startPos = 0;
      if(rightSide !== '') {
         let orPos = -1;
         do {
            orPos = rightSide.indexOf(orSign, startPos);
            prod = new Production();
            symb = new GrammarSymbol(leftSide, '');
            prod.setLeftSide(symb);
            let rightStr = rightSide.substring(startPos, orPos).trim();
            let beginPos = 0;
            let spacePos = -1;
            do {
               spacePos = rightStr.indexOf(' ', beginPos);
               let symbStr = rightStr.substring(beginPos, spacePos - beginPos);
               symb = new GrammarSymbol(symbStr, '');
               prod.addToRightSide(symb);
               beginPos = spacePos + 1;
            } while (spacePos > 0);
            startPos = orPos + orSign.length;
            this.addLevel(prod);   
         } while (orPos > 0);
      }
   }
}