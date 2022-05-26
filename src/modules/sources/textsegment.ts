import { Segment } from "./segment";

/* It is simple variant of template segment.
*/
export class TextSegment extends Segment {
   constructor(initOriginalText: string) {
      super();
      this.originalText = initOriginalText;
   }

   public setContent(arrToSet: Segment[]): boolean {
      return false;
   }

   public addTextAsResult(preText: string): string {
      preText += this.originalText;
      return preText;
   }
}