import { ParserBasicProp } from "../grammar/parserbasicprop";
import { MacrosParser } from "./macrosparser";
import { MacrosSegment } from "./macrossegment";
import { Segment } from "./segment";
import { TextSegment } from "./textsegment";

/* eslint-disable @typescript-eslint/naming-convention */
enum ParserState {
   NotReady,
   Ready,
   LookingMacrosOpenParenthesisFirstChar,
   WaitCompleteOpenParenthesis,
   ApproveCompletingOpenParenthesis,
   LookingMacrosCloseParenthesisFirstChar,
   WaitCompleteCloseParenthesis
};

/**
 * A state machine that parses the incoming character stream into two groups of segments: plain text (TextSegment) and substitution macro text (MacrosSegment).
 */
export class TemplateParser {
   private macrosParserBasic: ParserBasicProp | undefined;
   private openParenthesis:   string = '';
   private closeParenthesis:  string = '';
   private state:             ParserState = ParserState.Ready;
   private buffer:            Segment[] = [];
   private currentText:       string = '';
   private pos:               number = 0; // must be static in isCompleteOpenParenthesis(..) & isCompleteCloseParenthesis(..) but static is impossible in class routines.
   
   constructor(initMacrosParserBasic: ParserBasicProp) {
      this.state = ParserState.NotReady;
      // this.Values = InitValues;
      this.macrosParserBasic = initMacrosParserBasic;
      this.setMacrosParenthesis();
   }
   
   public startMachine(): boolean {
      if (this.state === ParserState.NotReady) {
         console.error('TemplateParser.startMachine(): Warning! Parser Not Ready! Set correct macros parenthesis.');
         return false;
      }
      this.buffer = [];
      this.currentText = '';
      this.state = ParserState.LookingMacrosOpenParenthesisFirstChar;
      return true;
   }
   
   /**
    * Takes the Segment out of the buffer head. Also, if the buffer is empty and CurrentText is not, it creates the necessary version of the Segment based on the state of the automaton and returns it
    * @returns 
    */
   public pullBufferSegment(): Segment | undefined {
      if (this.currentText !== '') {
         if ( (this.state === ParserState.LookingMacrosOpenParenthesisFirstChar)
             || (this.state === ParserState.WaitCompleteOpenParenthesis) ) {
            this.addTextSegmentInBuffer();
         } else {
            this.addMacrosSegmentInBuffer();
         }
      }
      return this.buffer.shift();
   }

   public readChar(charStr: string): boolean {
      if ((charStr.length > 1) || (charStr.length <= 0)) {
         console.error('TemplateParser.readChar(..): Warning! charStr not correct! charStr = "' + charStr + '"');
         return false;
      }
      switch (this.state) {
         case ParserState.LookingMacrosOpenParenthesisFirstChar:
            if (this.isMacrosOpenParenthesisFirst(charStr)) {
               this.state = ParserState.WaitCompleteOpenParenthesis;
               this.readChar(charStr);
            }
            break;
         case ParserState.WaitCompleteOpenParenthesis: {
               let fault = {value : false};
               if (this.isCompleteOpenParenthesis(charStr, fault)) {
                  this.state = ParserState.ApproveCompletingOpenParenthesis;
                  // this.state = ParserState.LookingMacrosCloseParenthesisFirstChar;
               } else {
                  if (fault.value) {
                     this.state = ParserState.LookingMacrosOpenParenthesisFirstChar;
                     this.readChar(charStr);
                  }
               }
            }
            break;
         case ParserState.ApproveCompletingOpenParenthesis: {
               if (this.isApproveCompleteOpenParenthesis(charStr)) {
                  this.addTextSegmentInBuffer();
                  this.state = ParserState.LookingMacrosCloseParenthesisFirstChar;
                  this.readChar(charStr);
               }
            }
            break;
         case ParserState.LookingMacrosCloseParenthesisFirstChar:
            if (this.isMacrosCloseParenthesisFirst(charStr)) {
               this.state = ParserState.WaitCompleteCloseParenthesis;
               this.readChar(charStr);
            }
            break;
         case ParserState.WaitCompleteCloseParenthesis: {
               let fault = {value : false};
               if (this.isCompleteCloseParenthesis(charStr, fault)) {
                  this.addMacrosSegmentInBuffer();
                  this.state = ParserState.LookingMacrosOpenParenthesisFirstChar;
               } else {
                  if (fault.value) {
                     this.state = ParserState.LookingMacrosCloseParenthesisFirstChar;
                     this.readChar(charStr);
                  }
               }
            }
            break;
         default:
            console.error('TemplateParser.readChar(..): Warning! Please start parser correctly!');
            return false;
            break;
      }
      return true;
   }

   private addTextSegmentInBuffer() {
      if (  this.currentText === '' || 
            this.currentText === '\n' || 
            this.currentText === '\r\n') {
         return;
      }
      let segment = new TextSegment(this.currentText);
      this.buffer.push(segment);
      this.currentText = '';
   }

   private addMacrosSegmentInBuffer() {
      if (!this.macrosParserBasic) {
         console.error('TemplateParser.AddMacrosSegmentInBuffer(): Error! Not work correctly without macrosParserBasic!');
         return;
      }
      let parser = new MacrosParser(this.macrosParserBasic);
      let segment = new MacrosSegment(this.currentText, parser);
      // console.log(`TemplateParser.addMacrosSegmentInBuffer(): Macros segment with text: "${this.currentText}" ready to add in buffer!`);
      this.buffer.push(segment);
      this.currentText = '';
   }

   private isMacrosOpenParenthesisFirst(charStr: string): boolean {
      if (charStr === this.openParenthesis.charAt(0)) {
         return true;      
      }
      this.currentText += charStr;
      return false;
   }

   private isApproveCompleteOpenParenthesis(charStr: string): boolean {
      let len = this.openParenthesis.length;
      if ((this.openParenthesis.substring(1) + charStr) === this.openParenthesis) {
         this.currentText += this.openParenthesis.substring(0,1);
         return false;
      }
      return true;
   }

   private isCompleteOpenParenthesis(charStr: string, fault: {value : boolean}):boolean {
      let len = this.openParenthesis.length;
      if (this.pos >= len) { 
         this.pos = 0; 
         fault.value = true; 
         return false; 
      }
      if (charStr !== this.openParenthesis.charAt(this.pos)) {
         this.pos = 0; 
         fault.value = true; 
         return false;
      }
      this.currentText += charStr;
      if (this.pos === len - 1 ) {
         let textLen = this.currentText.length;
         this.currentText = this.currentText.substring(0, (textLen - len));
         this.pos = 0;
         return true;
      }
      this.pos++;
      return false;
   }

   private isMacrosCloseParenthesisFirst(charStr: string): boolean {
      if (charStr === this.closeParenthesis.charAt(0)) {
         return true;      
      }
      this.currentText += charStr;
      return false;
   }

   private isCompleteCloseParenthesis(charStr: string, fault: {value : boolean}):boolean {
      let len = this.closeParenthesis.length;
      if (this.pos >= len) { 
         this.pos = 0; 
         fault.value = true; 
         return false; 
      }
      if (charStr !== this.closeParenthesis.charAt(this.pos)) {
         this.pos = 0; 
         fault.value = true; 
         return false;
      }
      this.currentText += charStr;
      if (this.pos === len-1) {
         let textLen = this.currentText.length;
         this.currentText = this.currentText.substring(0, (textLen - len)); // Parenthesis deleting from current text
         this.pos = 0;
         return true;
      }
      this.pos++;
      return false;
   }

   private setMacrosParenthesis(): boolean {
      let parser = new MacrosParser(); 
      let op = {value : ''};
      let cp = {value : ''};
      parser.getParenthesis(op, cp);
      this.openParenthesis = op.value;
      this.closeParenthesis = cp.value;
      if ((this.openParenthesis === '') || (this.closeParenthesis === '')) {
         console.error('TemplateParser.SetMacrosParenthesis(): Error! Not to set parenthesis of macros block. Parser NOT READY!');
         this.state = ParserState.NotReady;
         return false;
      }
      if (this.state === ParserState.NotReady) {
         this.state = ParserState.Ready;
      }
      return true;
   }
}