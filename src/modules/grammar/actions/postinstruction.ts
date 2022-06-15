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
      if (!this.checkIntegrity()) {
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
      let newStrSign = '\n';
      let lastSpacePos = 0;
      let textLen = text.value.length;
      let checkOnNewStrSignStr = text.value.substring(0,REFERENCE_LEN);
      // console.log(`PostInstruction.cutCommentBlockLine(..): **** Str = ${checkOnNewStrSignStr}`);
      if (checkOnNewStrSignStr.includes(newStrSign)) {
         // console.log(`PostInstruction.cutCommentBlockLine(..): **** Got new Str Sign!`);
         let newStrSignPos = checkOnNewStrSignStr.indexOf(newStrSign);
         result = text.value.substring(0, newStrSignPos);
         text.value = text.value.substring(newStrSignPos + newStrSign.length);
         return result;
      }
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
      text.value = text.value.substring(lastSpacePos + 1);
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
      // console.log(`PostInstruction.examAndChangePreText(..): Babystep 2: PreTExt = \n"${preText.value}"`);
      for (let i = (len - 1); i>=0; i--) {
         let ch = preText.value.charAt(i);
         if (ch === ' ') {
            spacesCount++;
         } else { 
            if (preText.value.substring(i-2, i + 1) === '//|') {
               break;   // all is good
            } else {
               console.error('PostInstruction.examAndChangePreText(..): Error! Found not correct construction! 1: "' + preText.value.substring(i, i + 1) + '"; 2: "' + preText.value.substring(i-2, i + 1) + '"');
               return false;
            }
         }
      }
      // console.log(`PostInstruction.examAndChangePreText(..): Babystep 3: PreTExt = \n"${preText.value}"`);
      // Need to reduce (оr increase) number of spaces according to lenght of inserting string.
      let lenStr = remValue.length;
      // console.log(`PostInstruction.examAndChangePreText(..): remValue = ${remValue}, spacesCount = ${spacesCount}`);
      if (spacesCount > 1) {
         spacesCount--;   // one space is reserved
      }
      if ((lenStr + spacesCount) > REFERENCE_LEN) { // need to reduce
         // console.log(`PostInstruction.examAndChangePreText(..): Need to reduce!`);
         preText.value = preText.value.substring(0, len - ((lenStr + spacesCount) - REFERENCE_LEN));
      } else { // need add some spaces
         // console.log(`PostInstruction.examAndChangePreText(..): Need to add some spaces!`);
         let spaces = REFERENCE_LEN - (lenStr + spacesCount);
         let spacesStr = '';
         for (let i = 0; i < spaces; i++) {
            spacesStr += ' ';
         }
         preText.value = preText.value + spacesStr;
      }
      // console.log(`PostInstruction.examAndChangePreText(..): Babystep 4: PreTExt = \n"${preText.value}"`);
      return true;
   }

   private inMQLHeadStandard(): boolean {
      if (!this.valueStack) {
         return false;
      }
      if (this.valueStack.length === 2) { // in standard case need that
         let preText = this.valueStack[this.valueStack.length - 2];
         let remValue = this.valueStack[this.valueStack.length - 1].value;
         if (remValue === undefined) {
            console.error('PostInstruction.inMQLHeadStandard(): Error! remValue is invalid!');
            return false;
         }
         if (preText.value === undefined) {
            console.error('PostInstruction.inMQLHeadStandard(): Error! preText is invalid!');
            return false;
         }
         // console.log('PostInstruction.inMQLHeadStandard(): Baby step 1');
         if (!this.examAndChangePreText(preText, remValue)) {
            console.error('PostInstruction.inMQLHeadStandard(): Error! PreText is incorrect!');
            return false;
         }
         // this.valueStack[this.valueStack.length - 2] = preText;
      } else {
         console.error('PostInstruction.inMQLHeadStandard(): Warning! valueStack.lenth != 2 (=' + this.valueStack.length + '). Instruction not proceed...');
         return false;
      }
      return true;
   }

   private inMQLCommentBlockStandard(): boolean {  
      if (!this.valueStack) {
         return false;
      }
      let text = this.valueStack[this.valueStack.length - 1];
      if (!text.value) {
         console.error('PostInstruction.inMQLCommentBlockStandard(): Error! Something bad with valueStack!');
         return false;
      }
      let result = "//+------------------------------------------------------------------+\n";
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
            result = result + '//| ' + commentBlockLine + '|\n';
         } else {
            stop = true;
         }
      }
      result = result + "//+------------------------------------------------------------------+";
      this.valueStack[this.valueStack.length - 1].value = result;
      return true;
   }
}