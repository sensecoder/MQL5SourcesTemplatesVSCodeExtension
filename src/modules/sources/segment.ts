/**
 * Template source text segment (base class). AddTextAsResult(..) is released by descendants that add a new "segment" to the received text, which they preliminarily prepare based on the logic of their work. In this case, the transmitted text segment can also be edited.
 */
export class Segment {
   private lineIndex: number | undefined;
   protected content: Segment[] | undefined;
   protected originalText: string | undefined;

   public setLineIndex(indx: number): boolean {
      if(indx<0) {
         return false;
      }
      this.lineIndex = indx;
      return true;
   }

   public getLineIndex(): number | undefined {
      return this.lineIndex;
   }

   public addTextAsResult(preText: {value: string}): boolean { // must realize by derived class
      return false;
   }

   public isNestedContentEndParenthesis(): boolean { // must realize by derived class
      return false;
   }

   public getName(): string { // must realize by derived class
      return '';
   }

   public setContent(arrToSet: Segment[]): boolean {
      if(this.content) {
         console.error('Segment.setContent(): Warning! Content already exist.');
         return false;
      }
      this.content = arrToSet;
      return true;
   }
   
   protected getTextFromContent(): string | null {
      let result = '';
      if(!this.content){
         console.error('Segment.getTextFromContent(): Warning! Content is not exist.');
         return null;
      }
      let lineIndx = 0;
      let lineEnd = '';
      this.content.forEach(segment => {
         if(segment) {
            if(lineIndx !== segment.getLineIndex()) {
               lineEnd = '\r\n';
               lineIndx = <number>segment.getLineIndex();
            } else {
               lineEnd = '';
            }
            result = result + lineEnd;
            segment.addTextAsResult({value : result});
         }   
      }); 

      return result;
   }

   protected addContent(segmentToAdd: Segment): boolean {
      if(!this.content) {
         this.content = [];
      }
      if (segmentToAdd.isNestedContentEndParenthesis()) {
         return this.packNestedContent(segmentToAdd.getName());
      }
      this.content.push(segmentToAdd);

      return true;
   }

   private packNestedContent(name: string): boolean {
      if (name === '') {
         return false;
      }
      if(!this.content) {
         return false;
      }
      let nestedContent: Segment[] = [];
      for (let index = (this.content.length - 1); index >= 0; index--) {
         const segment = this.content[index];
         if(segment) {
            if (segment.getName() === name) {
               if(segment.setContent(nestedContent)) {
                  this.content.splice(index + 1);
                  return true;
               }
            }
            nestedContent.unshift(segment);
         }
      }

      console.error('Segment.packNestedContent(): Warning! Unable to pack nested content whith "name" = "${name}"');
      return false;
   }
}