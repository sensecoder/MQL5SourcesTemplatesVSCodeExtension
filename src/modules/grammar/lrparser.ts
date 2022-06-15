import { GrammarSymbol } from "../grammargeneric/grammarsymbol";
import { IProductionAction, IGrammarBasis } from "../grammargeneric/interfaces";
import { ReductionTable } from "../grammargeneric/reductiontable";
import { LexicalAnalyzer } from "./lexicalanalyzer";
import { Production } from "../grammargeneric/production";

/**
 * Contains rules for transforming a set of tokens from the LexicalAnalyzer. It is the basis for applying rules by traversing the syntax tree from bottom to top.
*/
export class LRParser {
   private parseStack: GrammarSymbol[] = [];
   private inputToken: GrammarSymbol | undefined | null;
   
   protected lexicalAnalyzer: LexicalAnalyzer | undefined;  // Set by child class
   protected reductionTable: ReductionTable | undefined;    // Set by child class
   protected valueStack: Array<{value: string}> | undefined;         // Set by child class
   protected actionsMap: Map<string, IProductionAction> | undefined; // Set by child class

   protected parseLexic() {
      if (!this.checkIntegrity()) {
         console.error('LRParser.parseLexic(): Warning! Integrity broken, parsing impossible.');
         return false;
      }
      if (!this.lexicalAnalyzer) {
         return false;
      }
      if (!this.reductionTable) {
         return false;
      }
      this.inputToken = this.lexicalAnalyzer.getNextSymbol();
      if (!this.inputToken) {
         console.error('LRParser.parseLexic(): Error! Terminal input is clear!');
         return false;
      }
      // console.log(`LRParser.parseLexic(): Ready to parse with inputToken name = "${this.inputToken.getName()}", lexeme = "${this.inputToken.getLexeme()}"`);
      this.shift();
      let topName = this.parseStack[this.parseStack.length - 1].getName(); // least in first time it is must work
      // console.log(`LRParser.parseLexic(): Top name on parseStack is "${topName}"`);
      let freezeCounter = 0;
      const freezeErrorLevel = 2;
      while (!this.isTopOfTable()) {
         // console.log(`LRParser.parseLexic(): *****NOW***** inputToken name = "${this.inputToken?.getName()}", lexeme = "${this.inputToken?.getLexeme()}"`);
         // Тут нужно сделать аварийный выход, если нет inputToken!
         if (!this.tryToReduce()) {
            this.shift();
         }
         if (this.parseStack.length === 0) {
            console.error('LRParser.parseLexic(): wtf?');
            break;
         }
         if (this.parseStack.length > 0) {
            let topSymb = this.parseStack[this.parseStack.length - 1];
            let topSymbName = '';
            if (!topSymb) {
               console.error('LRParser.parseLexic(): Warning! Stack is not empty (length = ' + this.parseStack.length + '), but topSymbol pointer is invalid.');
            } else {
               topSymbName = topSymb.getName();
            }
            if (topName !== topSymbName) {
               freezeCounter = 0;
               topName = topSymbName;
            } else {
               if(freezeCounter > freezeErrorLevel) {
                  console.error('LRParser.parseLexic(): Error! Parsing is freezing, process aborted!');
                  return false;
               }
               freezeCounter++;
            }
         }
      }
      this.parseStack = [];
      this.inputToken = null;
      return true;
   }

   protected doAction(symbolsSequence: GrammarSymbol[]) {
      let pattern = '';
      let actionLexeme = '';
      // console.log('LRParser.doAction(..): Lets do action!');
      while(symbolsSequence.length > 0) {
         let symb = symbolsSequence.pop();
         if (!symb) {
            console.error('LRParser.doAction(..): Warning! Something goes wrong. symb is invalid!');
            return;
         }
         pattern = pattern + symb.getName();
         if (symbolsSequence.length > 0) {
            pattern = pattern + ' ';
         }
         if (symb.getLexeme() !== '') {
            if(actionLexeme !== '') {
               console.error('LRParser.doAction(..): Error! More one action lexeme in sequence is incorrect! We have one: "' + actionLexeme + '" And here is another: "' + symb.getLexeme() + '"');
               return;
            }
            actionLexeme = symb.getLexeme();
         }
      }
      // let action: IProductionAction | undefined;
      if (!this.actionsMap) {
         console.error('LRParser.doAction(..): Error! Actions map is invalid');
         return;
      }
      // console.log(`LRParser.doAction(..): Try get action with pattern: "${pattern}"`);
      let action = this.actionsMap.get(pattern);
      if (!action) {
         console.error('LRParser.doAction(..): Error! Action not found for pattern = ' + pattern);
         return;
      }
      action.doAction(actionLexeme);
   }

   protected setBasis(basis: IGrammarBasis) {
      if(!basis) {
         return false;
      }
      this.reductionTable = basis.getReductionTable();
      this.actionsMap = basis.getActionsMap();
      return false;
   }

   protected finishReduce(levelIndx: number, symbolsSequence: GrammarSymbol[]) {
      if(!this.reductionTable) {
         console.error('LRParser.finishReduce(..): Warning! reductionTable is undefined!');
         return;
      }
      let prod = this.reductionTable.getLevel(levelIndx);
      if (!prod) {
         console.error('LRParser.finishReduce(..): Error! No production found in reduction table level = ' + levelIndx);
         symbolsSequence.splice(0);
         return;
      }
      let symb = prod.getLeftSide();
      if (symb) {
         // console.log(`LRParser.finishReduce(): Reduce to ${symb.getName()}, symbolSequence = ${JSON.stringify(symbolsSequence)}`);
         this.parseStack.push(symb.getCopy());
         this.doAction(symbolsSequence);
      }
      symbolsSequence.splice(0);
      // console.log(`LRParser.finishReduce(): In finish symbolsSequence.length = ${symbolsSequence.length}`);
      // if (this.valueStack) {
      //    if (this.valueStack.length > 0) {
      //       console.log(`LRParser.finishReduce(): On Top of value stack we have: "${this.valueStack[this.valueStack.length - 1].value}"`);
      //    }
      // }
   }

   protected shift() {
      if (!this.inputToken) {
         console.error('LRParser.shift(): Warning! Input token is undefined!');
         return;
      }
      if (!this.lexicalAnalyzer) {
         console.error('LRParser.shift(): Warning! lexicalAnalyzer is undefined!');
         return;
      }
      // console.log('LRParser.shift(): push inputToken to parseStack...');
      this.parseStack.push(this.inputToken);
      this.inputToken = this.lexicalAnalyzer.getNextSymbol();
      if (this.inputToken) {
         // console.log(`LRParser.shift(): New inputToken is "${this.inputToken.getName()}"`);
      } else {
         // console.error(`LRParser.shift(): Error whith new inputToken!`);
      }
   }

   // Used to find symbol in reduction table with name as on top of ParseStack
   private checkErrorWithUnknownSymbol() {
      if(this.parseStack.length === 0) {
         console.error('LRParser.CheckErrorWithUnknownSymbol(): Warning! Parse stack is free.');
         return;
      }
      if(!this.reductionTable) {
         console.error('LRParser.CheckErrorWithUnknownSymbol(): Warning! reductionTable is undefinded.');
         return;
      }
      let topSymb = this.parseStack[this.parseStack.length - 1];
      let suspectedName = '';
      if(!topSymb) {
         console.error('LRParser.CheckErrorWithUnknownSymbol(): Warning! Stack is not free, but topSymbol is invalid.');
      } else {
         suspectedName = topSymb.getName();
      }
      let levels = this.reductionTable.getSize();
      for(let i = (levels - 1); i >= 0; i--) {
         let prod = this.reductionTable.getLevel(i);
         if (prod) {
            let rightSideSize = prod.getRightSideSize();
            for (let j = 0; j < rightSideSize; j++) {
               let symbol = prod.getRightSide(j);
               if(symbol) {
                  if(symbol.getName() === suspectedName) {
                     return;
                  }
               }
            }
         }
      }
      console.error('LRParser.CheckErrorWithUnknownSymbol(): Error! Symbol "' + suspectedName + '" is not found in reduction table!');
   }
   
   private findLevelAndStartReduce(levelIndx: {value: number}): GrammarSymbol[] | null { 
      if (!this.reductionTable) {
         return null;
      }
      let levels = this.reductionTable.getSize();
      let prod: Production | null;
      for (let i = (levels - 1); i >= 0; i--) {
         prod = this.reductionTable.getLevel(i);
         if (prod) {
            let rightSideSize = prod.getRightSideSize();
            // Find reduced sequence:
            let sequenceStack: GrammarSymbol[] = [];
            for (let j = (rightSideSize - 1); j >= 0; j--) {
               let symbol = prod.getRightSide(j);
               if (this.parseStack.length > 0) {
                  let topSymbol = this.parseStack[this.parseStack.length - 1];
                  // console.log(`LRParser.findLevelAndStartReduce(..): here with topSymbol.name = ${topSymbol.getName()} and symbol.name = ${symbol?.getName()}, rightSideSize = ${rightSideSize}, j = ${j}`);
                  if (!topSymbol) {
                     console.error('LRParser.findLevelAndStartReduce(): Warning! Something goes wrong...');
                     levelIndx.value = -1;
                     return null;
                  }
                  if (symbol) {
                     if (topSymbol.getName() === symbol.getName()) {
                        // console.log(`LRParser.findLevelAndStartReduce(..): symbols is equal!`);
                        let parseSymb = this.parseStack.pop();
                        if (parseSymb) {
                           sequenceStack.push(parseSymb);
                        }
                     } else {
                        while (sequenceStack.length !== 0) {
                           let seqSymb = sequenceStack.pop();
                           if (seqSymb) {
                              this.parseStack.push(seqSymb);
                           }
                        }
                        break;
                     }
                  }
               }
            }         
            if (sequenceStack.length > 0) {
               // console.log(`LRParser.findLevelAndStartReduce(..): sequenceStack.length > 0 (=${sequenceStack.length}). Level to reduce = ${i}`);
               // Print(__FUNCTION__ + ": Level to reduce = " + i);
               levelIndx.value = i;
               return sequenceStack;
            }
         }
      }
   
      levelIndx.value = -1;
      return null;
   }

   private shiftReduceConflict() {
      // Contract:
   if (!this.inputToken) {
      // Warning! No InputToken, only Reduce operation possible.
      return false;
   }
   if (!this.reductionTable) {
      return false;
   }

   let levels = this.reductionTable.getSize();
   let prod: Production | null;
   for (let i = (levels - 1); i >= 0; i--) {
      prod = this.reductionTable.getLevel(i);
      if (prod) {
         let rightSideSize = prod.getRightSideSize();
         for(let j = 0; j < rightSideSize; j++) {
            let symbol = prod.getRightSide(j);
            if(!symbol) {
               console.error(`LRParser.shiftReduceConflict(): Error! Something wrong with production? j = ${j}`);
               break;
            }
            let topSymb = this.parseStack[this.parseStack.length - 1];
            let topSymbName = '';
            if(!topSymb) {
               console.error('LRParser.shiftReduceConflict(): Warning! Stack is not free, but topSymbol is invalid.');
            } else {
               topSymbName = topSymb.getName();
            }
            if(topSymbName === symbol.getName()) {
               if(j < (rightSideSize - 1)) {
                  symbol = prod.getRightSide(j + 1);
                  if(symbol) {
                     if(this.inputToken.getName() === symbol.getName()) {
                        return true;
                     }
                  }
               }
            }
         }
      }
   }
   return false;
   }
   
   private tryToReduce() {
      // console.log(`LRParser.tryToReduce(): Let's try!`);
      // Check to Shift/Reduce conflict:
      if (this.shiftReduceConflict()) {
         // console.log(`LRParser.tryToReduce(): Shift/Reduce conflict detected!`);
         return false;
      }
      // Find level for reduce:
      let level = {value : -1};
      let symbolsSequence = this.findLevelAndStartReduce(level);
      if (symbolsSequence === null) {
         return false;
      }
      if (level.value >= 0) {
         // console.log(`LRParser.tryToReduce(): Now go to finish reduce!`);
         this.finishReduce(level.value, symbolsSequence);
         return true;
      }
      // If no level to reduce, check for error in input:
      this.checkErrorWithUnknownSymbol();
   
      return false;
   }

   private isTopOfTable(): boolean {
      let len = this.parseStack.length;
      if(len > 0) {
         let topSymb = this.parseStack[len-1];
         let parseValue = '';
         if (!topSymb) {
            console.error('LRParser.isTopOfTable(): Error! Stack is not free, but topSymbol is invalid.');
            return false;
         } else {
            parseValue = topSymb.getName();
         }
         if (!this.reductionTable) {
            console.error('LRParser.isTopOfTable(): Error! reductionTable is undefined.');
            return false;
         }
         let prod = this.reductionTable.getLevel(0);
         if (prod) {
            let symb = prod.getLeftSide(); // The top symbol of grammar
            if(symb) {
               if(symb.getName() === parseValue) {
                  return true;
               }
            }
         }
      }

      return false;
   }
   
   private checkIntegrity(): boolean {
      if(!this.lexicalAnalyzer) {
         console.error('LRParser.checkIntegrity(): Warning! Error with no macros lexic.');
         return false;
      }
      if(!this.reductionTable) {
         console.error('LRParser.checkIntegrity(): Warning! Error with not have grammatic.');
         return false;
      }

      return true;
   }
}