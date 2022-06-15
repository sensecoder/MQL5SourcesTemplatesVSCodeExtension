import { GrammarSymbol } from "../grammargeneric/grammarsymbol";

/* eslint-disable @typescript-eslint/naming-convention */
enum InputMessage {
   space_symbol,
   double_quotes_symbol,
   plus_symbol,
   slash_symbol,
   any_other_symbol,
   EOI
};
enum AutomatStates {
   ReadyToInput,
   ReadTextInQuotes,
   WaitToEndQuotes,
   ReadWord,
   WaitBlockName,
   ReadBlockName,
   Done,
   Error
};

/**
 * Contains a queue of tokens (GrammarSymbol) obtained by parsing the text passed during creation. Tokens are determined in accordance with internal rules.
*/
export class LexicalAnalyzer {
   private text: string;
   private symbolsQueue: GrammarSymbol[] = [];
   private automatState: AutomatStates | undefined;
   private automatString: string | undefined;
   private errorMessage: string = '';

   constructor(initText: string) {
      this.text = initText;
   }
   
   public getNextSymbol(): GrammarSymbol | null | undefined {
      if (this.symbolsQueue.length <= 0) {
         return null;
      }
      return this.symbolsQueue.shift();
   }
   
   public doAnalysis(): boolean {
      let len = this.text.length;
      // console.log(`LexicalAnalyzer.doAnalysis(): Ready to analyze text with len = ${len}`);
      this.automatState = AutomatStates.ReadyToInput;
      this.automatString = '';
      for (let i = 0; i <= len; i++) {
         if (i === len){
            // console.log(`LexicalAnalyzer.doAnalysis(): Reach end of text!`);
            this.handleState(InputMessage.EOI);
            break;
         }
         let symb = this.text.charAt(i);
         this.handleState(this.detectMessage(symb), symb);
      }
      this.automatState = this.wtfState();
      if (this.automatState === AutomatStates.Error) { // in this line typescript compiler detect an error if not to do a wtfState()
         this.symbolsQueue = [];
         return false;
      }
      // console.log(`LexicalAnalyzer.doAnalysis(): Analysis DONE with symbolsQueue.len = ${this.symbolsQueue.length}`);

      return true;
   }

   /**
    * Only to prevent a silly compiler error in doAnalysis()
    * @returns 
    */
   private wtfState(): AutomatStates | undefined {
      return this.automatState;
   }

   private isInstruction() {
      if (this.automatString === 'inMQLHeadStandard') {
         return true;
      }
      if (this.automatString === 'inMQLCommentBlockStandard') {
         return true;
      }
      return false;
   }

   private addEOI() {
      if (this.automatString !== undefined) {
         this.symbolsQueue.push(new GrammarSymbol('EOI',''));
      } else {
         console.error('LexicalAnalyzer.addEOI(): automatString Error!');
      }
      this.automatString = '';
   }
   
   private addBlockNameGrammarSymbol() {
      if(this.automatString) {
         this.symbolsQueue.push(new GrammarSymbol('BLOCK_NAME',this.automatString));
      }
   }
   
   private addSlashGrammarSymbol() {
      this.symbolsQueue.push(new GrammarSymbol('SLASH',''));
   }

   private addGrammarSymbol() {
      if (!this.automatString) {
         console.error('LexicalAnalyzer.addGrammarSymbol(): Error! "automatString" is undefined!');
         return;
      }
      let token: GrammarSymbol;
      if (this.isInstruction()) {
         token = new GrammarSymbol('INSTRUCTION',this.automatString);
         // console.log(`LexicalAnalyzer.addGrammarSymbol(): New token is a INSTRUCTION with lexeme: ${this.automatString}`);
      } else {
         token = new GrammarSymbol('VARIABLE',this.automatString);
         // console.log(`LexicalAnalyzer.addGrammarSymbol(): New token is a VARIABLE with lexeme: ${this.automatString}`);
      }
      this.symbolsQueue.push(token);
      this.automatString = '';
   }

   private addTextInQuotesGrammarSymbol() {
      this.removeSymbol();    // Last should be a doublequotes
      if (this.automatString) {
         this.symbolsQueue.push(new GrammarSymbol('TEXT_IN_QUOTES',this.automatString));
      } else {
         this.symbolsQueue.push(new GrammarSymbol('TEXT_IN_QUOTES',''));
      }
      this.automatString = '';
   }
   
   private removeSymbol() {
      if (!this.automatString) {
         return;
      }
      let len = this.automatString.length;
      if (len > 0) {
         this.automatString = this.automatString.slice(0, len-1);
      }
   }
   
   private addSymbol(symbol: string) {
      this.automatString += symbol;
   }
   
   private addPlusGrammarSymbol() {
      this.symbolsQueue.push(new GrammarSymbol('PLUS','+'));
   }
   
   private detectMessage(symbol: string): InputMessage {
      if(symbol === ' ') {
         return(InputMessage.space_symbol);
      }
      if(symbol === '"') {
         return(InputMessage.double_quotes_symbol);
      }
      if(symbol === '+') {
         return(InputMessage.plus_symbol);
      }
      return(InputMessage.any_other_symbol);
   }

   private handleState(message: InputMessage, symbol: string = '') {
      switch (this.automatState) {
         case AutomatStates.ReadyToInput:
            {
               switch (message) {
                  case InputMessage.space_symbol:
                     // nothing to do
                     break;
                  case InputMessage.double_quotes_symbol:
                     this.automatState = AutomatStates.ReadTextInQuotes;
                     break;
                  case InputMessage.plus_symbol:
                     this.addPlusGrammarSymbol();
                     break;
                  case InputMessage.slash_symbol:
                     this.automatState = AutomatStates.WaitBlockName;
                     this.addSlashGrammarSymbol();
                     break;
                  case InputMessage.any_other_symbol:
                     this.automatState = AutomatStates.ReadWord;
                     // console.log(`LexicalAnalyzer.handleState(..): Automat in ReadWord state!`);
                     this.addSymbol(symbol);
                     break;
                  case InputMessage.EOI:
                     this.automatState = AutomatStates.Done;
                     this.addEOI();
                     break;
                  default:
                     this.automatState = AutomatStates.Error;
                     this.errorMessage = "Unknown error with message while handle!";
                     break;
               }
            }
            break;
         case AutomatStates.WaitToEndQuotes:
            {
               switch (message) {
                  case InputMessage.space_symbol:
                     this.automatState = AutomatStates.ReadyToInput;
                     this.addTextInQuotesGrammarSymbol();
                     break;
                  case InputMessage.double_quotes_symbol:
                     this.addSymbol(symbol);
                     break;
                  case InputMessage.plus_symbol:
                     this.automatState = AutomatStates.ReadyToInput;
                     this.addTextInQuotesGrammarSymbol();
                     this.addPlusGrammarSymbol();
                     break;
                  case InputMessage.slash_symbol:
                     this.addSymbol(symbol);
                     break;
                  case InputMessage.any_other_symbol:
                     this.automatState = AutomatStates.ReadTextInQuotes;
                     this.addSymbol(symbol);
                     break;
                  case InputMessage.EOI:
                     this.automatState = AutomatStates.Done;
                     this.addTextInQuotesGrammarSymbol();
                     this.addEOI();
                     break;
                  default:
                     this.automatState = AutomatStates.Error;
                     this.errorMessage = "Unknown error with message while handle!";
                     break;
               }
            }
            break;
         case AutomatStates.ReadWord:
            {
               switch (message) {
                  case InputMessage.space_symbol:
                     this.automatState = AutomatStates.ReadyToInput;
                     // console.log(`LexicalAnalyzer.handleState(..): Word was readed!`);
                     this.addGrammarSymbol();
                     break;
                  case InputMessage.double_quotes_symbol:
                     this.automatState = AutomatStates.Error;
                     this.errorMessage = "Error with not expected symbol!";
                     break;
                  case InputMessage.plus_symbol:
                     this.automatState = AutomatStates.ReadyToInput;
                     this.addGrammarSymbol();
                     this.addPlusGrammarSymbol();
                     break;
                  case InputMessage.slash_symbol:
                     this.addSymbol(symbol);
                     break;
                  case InputMessage.any_other_symbol:
                     this.addSymbol(symbol);
                     break;
                  case InputMessage.EOI:
                     this.automatState = AutomatStates.Done;
                     this.addGrammarSymbol();
                     this.addEOI();
                     break;
                  default:
                     this.automatState = AutomatStates.Error;
                     this.errorMessage = "Unknown error with message while handle!";
                     break;
               }
            }
            break;
         case AutomatStates.WaitBlockName:
            {
               switch (message) {
                  case InputMessage.space_symbol:
                     this.automatState = AutomatStates.Error;
                     this.errorMessage = "Error with not expected symbol!";
                     break;
                  case InputMessage.double_quotes_symbol:
                     this.automatState = AutomatStates.Error;
                     this.errorMessage = "Error with not expected symbol!";
                     break;
                  case InputMessage.plus_symbol:
                     this.automatState = AutomatStates.Error;
                     this.errorMessage = "Error with not expected symbol!";
                     break;
                  case InputMessage.slash_symbol:
                     this.automatState = AutomatStates.Error;
                     this.errorMessage = "Error with not expected symbol!";
                     break;
                  case InputMessage.any_other_symbol:
                     this.automatState = AutomatStates.ReadBlockName;
                     this.addSymbol(symbol);
                     break;
                  case InputMessage.EOI:
                     this.automatState = AutomatStates.Error;
                     this.errorMessage = "Error with no block name!";
                     break;
                  default:
                     this.automatState = AutomatStates.Error;
                     this.errorMessage = "Unknown error with message while handle!";
                     break;
               }
            }
            break;
         case AutomatStates.ReadBlockName:
            {
               switch (message) {
                  case InputMessage.space_symbol:
                     this.automatState = AutomatStates.ReadyToInput;
                     this.addBlockNameGrammarSymbol();
                     break;
                  case InputMessage.double_quotes_symbol:
                     this.automatState = AutomatStates.Error;
                     this.errorMessage = "Error with not expected symbol!";
                     break;
                  case InputMessage.plus_symbol:
                     this.automatState = AutomatStates.Error;
                     this.errorMessage = "Error with not expected symbol!";
                     break;
                  case InputMessage.slash_symbol:
                     this.automatState = AutomatStates.Error;
                     this.errorMessage = "Error with not expected symbol!";
                     break;
                  case InputMessage.any_other_symbol:
                     this.addSymbol(symbol);
                     break;
                  case InputMessage.EOI:
                     this.automatState = AutomatStates.Done;
                     this.addBlockNameGrammarSymbol();
                     this.addEOI();
                     break;
                  default:
                     this.automatState = AutomatStates.Error;
                     this.errorMessage = "Unknown error with message while handle!";
                     break;
               }
            }
            break;
         default:
            break;
      }
   }
}