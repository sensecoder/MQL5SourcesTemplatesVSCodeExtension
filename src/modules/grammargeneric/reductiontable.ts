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
         console.error(`ReductionTable.getLevel(): Warning! "indx" is not correct. (indx = ${indx})`);
         return null;
      }
      return this.levels[indx];
   }

   public completeFromFile(fileName: string): boolean {
      let fileStr = '';
      try {
         fileStr = readFileSync(fileName, 'utf8');
      } catch (error) {
         console.error(`ReductionTable.completeFromFile(): File read error occur! fileName = ${fileName}`);
      }
      if (fileStr === '') {
         console.error(`ReductionTable.completeFromFile(): File not readable. fileName = ${fileName}`);
         return false;
      }
      let prodStrArr = fileStr.split('\n');
      prodStrArr.forEach(prodStr => {
         // console.log(`ReductionTable.completeFromFile(): ProdStr = ${prodStr}`); 
         this.addStrAsLevel(prodStr);
      });

      if(this.levels) {
         // console.log(`ReductionTable.completeFromFile(): Reduction levels size = ${this.levels.length}`);
         for (let index = 0; index < this.levels.length; index++) {
            const element = this.levels[index];
            let rs = '';
            for (let i = 0; i < element.getRightSideSize(); i++) {
               rs = rs + element.getRightSide(i)?.getName();
               if (i !== (element.getRightSideSize() - 1)) {
                  rs = rs + ' ';
               }
            }
            // console.log(`ReductionTable.completeFromFile(): Level ${index}: ${element.getLeftSide()?.getName()} => ${rs}`);   
         }
           
      }

      return true;
   }

   private addStrAsLevel(productionStr: string) {
      if (productionStr === '') {
         console.error(`ReductionTable.addStrAsLevel(..): Error! productionString is empty!`);
         return;
      }
      let separator = '->';
      let orSign = '|';
      let separatorIndx = productionStr.indexOf(separator);
      if(separatorIndx < 0) {
         console.error(`ReductionTable.addStrAsLevel(): Error! Input string is not a grammar production! ("${productionStr}")`);
         return;
      }
      let leftSide = productionStr.substring(0,separatorIndx).trim();
      // console.log(`ReductionTable.addStrAsLevel(): leftSide = ${leftSide}`);
      let rightSide = productionStr.substring(separatorIndx + separator.length).trim();
      //  console.log(`ReductionTable.addStrAsLevel(): rightSide = ${rightSide}`);
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
            // console.log(`ReductionTable.addStrAsLevel: orPos = ${orPos}`);
            prod = new Production();
            symb = new GrammarSymbol(leftSide, '');
            prod.setLeftSide(symb);
            let rightStr = '';
            if (orPos > 0) {
               rightStr = rightSide.substring(startPos, orPos).trim();
            } else {
               rightStr = rightSide.substring(startPos).trim();
            }
            // console.log(`ReductionTable.addStrAsLevel: rightStr = ${rightStr}`);
            let beginPos = 0;
            let spacePos = -1;
            do {
               spacePos = rightStr.indexOf(' ', beginPos);
               // console.log(`ReductionTable.addStrAsLevel: spacePos = ${spacePos}`);
               let symbStr = '';
               if (spacePos > 0) {
                  symbStr = rightStr.substring(beginPos, spacePos);
                  // console.log(`ReductionTable.addStrAsLevel: symbStr = ${symbStr}`);
               } else {
                  symbStr = rightStr.substring(beginPos);
               }
               // console.log(`ReductionTable.addStrAsLevel: symbStr = ${symbStr}`);
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