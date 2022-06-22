import { Segment } from "./segment";

/* It is simple variant of template segment.
*/
export class TextSegment extends Segment {
   constructor(initOriginalText: string) {
      super();
      this.setOriginalText(initOriginalText);
   }

   public setContent(arrToSet: Segment[]): boolean {
      return false;
   }

   public addTextAsResult(preText: {value: string}): boolean {
      preText.value += this.originalText;
      return true;
   }

   private setOriginalText(initText: string) {
      if (initText[initText.length - 1] === '\r') {
         this.originalText = initText.substring(0, initText.length - 1);
      } else {
         this.originalText = initText;
      }
   }
}