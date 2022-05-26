import { readFile, readFileSync } from 'fs';

export class Template {
   private template: string | undefined;
   private lines: string[] = [];
   private fileName: string;

   constructor(initFileName: string) {
      this.fileName = initFileName;
      this.readTemplate();
      this.separateByLine();
   }

   public linesCount(): number {
      return this.lines.length;
   }

   public getLine(index: number): string | null {
      if(index < 0 || index >= this.linesCount()) {
         return null;      
      }
      return this.lines[index];
   }

   private readTemplate(): boolean {
      readFile(this.fileName, function (err, data) {
         if (err) {
            return console.error(err);
         }
         return console.log("Asynchronous read: " + data.toString());
      });

      return true;
   }
   
   private separateByLine(): boolean {
      if(!this.template){
         return false;
      }
      this.lines = this.template.split('/r/n');
      
      return true;
   }

   // private deleteLines(){

   // }
}