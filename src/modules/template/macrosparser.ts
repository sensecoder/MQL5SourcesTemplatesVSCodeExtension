import { LexicalAnalyzer } from "../grammar/lexicalanalyzer";
import { LRParser } from "../grammar/lrparser";
import { ParserBasicProp } from "../grammar/parserbasicprop";
import { INamedValues } from "./interfaces";

const OPEN_PARENTHESIS = '{{';
const CLOSE_PARENTHESIS = '}}';
const BLOCK_END_MACROS = '/';

/**
 * Macros handler. The main task is to convert the text received in ApplyMacros(..) in accordance with the logic embedded in the macros. However, the macros can also change the state of the class and affect the external logic of working with the template.
 */
export class MacrosParser extends LRParser {
   private variables: INamedValues | undefined;
   private basicProp: ParserBasicProp | undefined;

   constructor(initProp: ParserBasicProp | undefined = undefined) {
      super();
      if (initProp) {
         this.setBasicProp(initProp);
         this.valueStack = [];
      }
   }
   
   public getParenthesis(op: {value: string}, cp: {value: string}) {
      op.value = OPEN_PARENTHESIS;
      cp.value = CLOSE_PARENTHESIS;
   }

   public setMacrosText(textToSet: string) {
      this.lexicalAnalyzer = new LexicalAnalyzer(textToSet);
      this.lexicalAnalyzer.doAnalysis();
   }

   public setBasicProp(initProp: ParserBasicProp): boolean {
      if (!initProp) {
         console.error('MacrosParser.setBasicProp(..): Error! InitProp is invalid!');
         return false;
      }
      this.basicProp = initProp;
      this.reductionTable = initProp.getReductionTable();
      if (!this.reductionTable) {
         console.error('MacrosParser.setBasicProp(..): Error! ReductionTable is invalid!');
         return false;
      }
      this.actionsMap = initProp.getActionsMap();
      if(!this.actionsMap) {
         console.error('MacrosParser.setBasicProp(..): Error! ActionsMap is invalid!');
         return false;
      }
      this.variables = initProp.getVariables();
      if(!this.variables) {
         console.error('MacrosParser.setBasicProp(..): Error! Variables is invalid!');
         return false;
      }
      return true;
   }

   public setVariables(initVariables: INamedValues) {
      if(!initVariables) {
         return false;
      }
      this.variables = initVariables;
      return true;
   }

   public applyMacros(preText: {value: string}): boolean {
      if (!this.basicProp) {
         console.error('MacrosParser.applyMacros(..): Warning! Error with no BasicProp.');
         return false;
      }   
      if (!this.lexicalAnalyzer) {
         console.error('MacrosParser.applyMacros(..): Warning! Error with no macros lexic.');
         return false;
      }
      if (!this.variables) {
         console.error('MacrosParser.applyMacros(..): Warning! Error with no variables.');
         return false;
      }
      if (!this.reductionTable) {
         console.error('MacrosParser.applyMacros(..): Warning! Error with not have grammatic.');
         return false;
      }
      if (!this.valueStack) {
         console.error('MacrosParser.applyMacros(..): Warning! Error with no valueStack.');
         return false;
      }
      this.valueStack.push(preText.value); // on bottom of stack
      this.basicProp.setValueStackForActions(this.valueStack);
      this.parseLexic();
      if (this.valueStack.length === 2) {
         let value = this.valueStack.pop();
         if (!value) {
            let exist = preText.value;
            preText.value = exist + value;
            this.valueStack = [];
         } else {
            console.error('MacrosParser.applyMacros(..): Warning! Value in value stack is invalid!');
         }
      } else {
         console.error('MacrosParser.applyMacros(..):  Warning! Abnormal length of valueStack! length = ' + this.valueStack.length);
      }
   
      return true;
   }

   public getBlockEndMacros(): string {
      return BLOCK_END_MACROS;
   }

   // NOT IMPLEMENTED (yet):
   public isBlockEndMacros(name: {value: string}): boolean {
      return false;
   }

   public isContentIncluded(): boolean {
      return false;
   };
}