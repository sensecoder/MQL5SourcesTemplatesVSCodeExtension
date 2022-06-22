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
      if (this.content) {
         console.error('Segment.setContent(): Warning! Content already exist.');
         return false;
      }
      this.content = arrToSet;
      return true;
   }

   public addContent(segmentToAdd: Segment): boolean {
      if (!this.content) {
         this.content = [];
      }
      if (segmentToAdd.isNestedContentEndParenthesis()) {
         return this.packNestedContent(segmentToAdd.getName());
      }
      this.content.push(segmentToAdd);

      return true;
   }

   public getTextFromContent(): string | null {
      let result = '';
      if (!this.content){
         console.error('Segment.getTextFromContent(): Warning! Content is not exist.');
         return null;
      }
      let lineIndx = 0;
      if (this.content[0]) {
         if (this.content[0].getLineIndex() !== undefined) {
            lineIndx = <number>this.content[0].getLineIndex();
         }
      }
      let lineEnd = '';
      this.content.forEach(segment => {
         if (segment) {
            // console.log(`segment.name = ${segment.getName()}`);
            if (lineIndx !== segment.getLineIndex()) {
               lineEnd = '\r\n';
               lineIndx = <number>segment.getLineIndex();
            } else {
               lineEnd = '';
            }
            result = result + lineEnd;
            let resultObj = {value : result};
            segment.addTextAsResult(resultObj);
            result = resultObj.value;
         }   
      }); 

      return result;
   }


   private packNestedContent(name: string): boolean {
      // console.log(`Segment.packNestedContent(..): Start packing nested content with name: "${name}"`);
      if (name === '') {
         return false;
      }
      if (!this.content) {
         console.error(`Segment.packNestedContent(..): Impossible pack nested content with name: "${name}"! Content is out!`);
         return false;
      }
      let nestedContent: Segment[] = [];
      for (let index = (this.content.length - 1); index >= 0; index--) {
         const segment = this.content[index];
         if (segment) {
            if (segment.getName() === name) {
               // console.log(`Segment.packNestedContent(..): Found segment with name: "${name}", move content with len = ${nestedContent.length} at him as nested content...`);
               if (segment.setContent(nestedContent)) {
                  this.content.splice(index + 1);
                  // console.log(`Segment.packNestedContent(..): Moving OK!`);
                  return true;
               } else {
                  console.error(`Segment.packNestedContent(..): Moving ERROR!`);
                  return false;
               }
            }
            nestedContent.unshift(segment);
         }
      }

      console.error(`Segment.packNestedContent(): Warning! Unable to pack nested content whith "name" = "${name}"`);
      return false;
   }
}