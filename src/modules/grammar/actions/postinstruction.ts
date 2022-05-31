import { Action } from "../action";

const PRODUCTION_SEQUENCE = 'Concat INSTRUCTION';
const REFERENCE_LEN = 64;

/** 
 * Action is realize some instruction on end of macros
*/
export class PostInstruction extends Action {
   constructor() {
      super();
      this.noActionFlag = false;
   }
   
   public doAction(actionLexeme: string): boolean {
      if (!this.checkIntegrity) {
         return false;
      }
      if(actionLexeme === "inMQLHeadStandard") {
         return this.inMQLHeadStandard();
      }
      if(actionLexeme === "inMQLCommentBlockStandard") {
         return this.inMQLCommentBlockStandard();
      }
      return true;
   }

   public getProductionSequence() {
      return PRODUCTION_SEQUENCE; 
   };

   private cutCommentBlockLine(text: {value: string}): string {
      let result = '';
      let lastSpacePos = 0;
      let textLen = text.value.length;
      if (textLen < REFERENCE_LEN) {
         result = text.value;
         text.value = '';
         return result;
      }
      for (let i = 0; i < textLen; i++) {
         let ch = text.value.charAt(i);
         if (ch === ' ') {
            lastSpacePos = i;
         } else {
            if (i === REFERENCE_LEN) {
               if (lastSpacePos !== 0) {
                  result = text.value.slice(0, lastSpacePos); 
               } else {
                  result = text.value.slice(0, REFERENCE_LEN); 
                  lastSpacePos = REFERENCE_LEN-1;
               }
               break;
            }
         }
      }
      text.value = text.value.substring(lastSpacePos+1);
      return result;
   }

   private examAndChangePreText(preText: {value: string}, remValue: string): boolean {
      // preText need to contain (from end) some spaces and "//|" in start of it.
      let len = preText.value.length;
      if (len === 0) {
         console.error('PostInstruction.examAndChangePreText(..): Warning! Lenght of preText = 0.');
         return false;
      }
      let spacesCount = 0;
      for (let i = (len - 1); i>=0; i--) {
         let ch = preText.value.charAt(i);
         if (ch === ' ') {
            spacesCount++;
         } else {
            if (preText.value.substring(i-2, 3) === '//|') {
               break;   // all is good
            } else {
               console.error('PostInstruction.examAndChangePreText(..): Error! Found not correct construction! 1: "' + preText.value.substring(i, 1) + '"; 2: "' + preText.value.substring(i-2, 3) + '"');
               return false;
            }
         }
      }
      // Need to reduce (оr increase) number of spaces according to lenght of inserting string.
      let lenStr = remValue.length;
      if (spacesCount > 1) {
         spacesCount--;   // one space is reserved
      }
      if ((lenStr + spacesCount) > REFERENCE_LEN) { // need to reduce
         preText.value = preText.value.substring(0, len - ((lenStr + spacesCount) - REFERENCE_LEN));
      } else { // need add some spaces
         let spaces = REFERENCE_LEN - (lenStr + spacesCount);
         let spacesStr = '';
         for (let i = 0; i < spaces; i++) {
            spacesStr += ' ';
         }
         preText.value = preText.value + spacesStr;
      }
      return true;
   }

   private inMQLHeadStandard(): boolean {
      if (!this.valueStack) {
         return false;
      }
      if (this.valueStack.length === 2) { // in standard case need that
         let preText = {value: ''};
         preText.value = this.valueStack[this.valueStack.length - 2];
         let remValue = this.valueStack[this.valueStack.length - 1];
         if (!preText.value) {
            console.error('PostInstruction.inMQLHeadStandard(): Error! preText is invalid!');
            return false;
         }
         if (!this.examAndChangePreText(preText, remValue)) {
            console.error('PostInstruction.inMQLHeadStandard(): Error! PreText is incorrect!');
            return false;
         }
      } else {
         console.error('PostInstruction.inMQLHeadStandard(): Warning! valueStack.lenth != 2 (=' + this.valueStack.length + '). Instruction not proceed...');
         return false;
      }
      return true;
   }

   private inMQLCommentBlockStandard(): boolean {  
      let text = {value : this.valueStack[this.valueStack.length - 1]};
      if(!text.value) {
         console.error('PostInstruction.inMQLCommentBlockStandard(): Error! Something bad with valueStack!');
         return false;
      }
      let result = "//+------------------------------------------------------------------+\r\n";
      let stop = false;
      while (!stop) {
         let commentBlockLine = this.cutCommentBlockLine(text);
         if (commentBlockLine !== '') {
            let len = commentBlockLine.length;
            if (len < REFERENCE_LEN) {
               let spaces = REFERENCE_LEN - len;
               for (let i = 0; i <= spaces; i++) {
                  commentBlockLine = commentBlockLine + ' ';
               }
            }
            result = result + '//| ' + commentBlockLine + '|\r\n';
         } else {
            stop = true;
         }
      }
      result = result + "//+------------------------------------------------------------------+\r\n";
      this.valueStack[this.valueStack.length - 1] = result;
      return true;
   }
}