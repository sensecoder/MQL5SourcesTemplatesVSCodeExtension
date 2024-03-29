import { readFileSync } from 'fs';
import { ParserBasicProp } from '../grammar/parserbasicprop';
import { INamedValues } from './interfaces';
import { Segment } from './segment';
import { TemplateParser } from './templateparser';
import { TextSegment } from './textsegment';

export class Template {
   private template: string | undefined;
   private lines: string[] = [];
   private fileName: string;
   private macrosParserBasic: ParserBasicProp | undefined;
   private mainSegment: Segment;

   constructor(initFileName: string) {
      this.fileName = initFileName;
      this.mainSegment = new Segment();
      this.readTemplate();
      this.separateByLine();
   }

   public render(): string | null {
      if (!this.processTemplate()) {
         console.error('Template.render(): Error! Process template failed!');
         return null;
      } 
      return(this.mainSegment.getTextFromContent());
   }

   public setVariables(initVar: INamedValues): boolean {
      this.macrosParserBasic = new ParserBasicProp(initVar);

      return true;
   }
   
   private processLine(indx: number, line: string): boolean {
      if (!this.macrosParserBasic) {
         console.error('Template.processLine(..): Error! Values is out of pointer!');
         return false;
      }
      let parser = new TemplateParser(this.macrosParserBasic);
      if (!parser.startMachine()) {
         console.error('Template.processLine(..): Error! Parser not started!');
         return false;
      }
      let len = line.length;
      // console.log(`Template.processLine(..): len = ${len}`);
      for (let i = 0; i < len; i++) {
         parser.readChar(line.charAt(i));
      }
      let segment = parser.pullBufferSegment();
      if (len === 0) {
         segment = new TextSegment('');
      }
      let n = 0;
      while (segment) {
         segment.setLineIndex(indx);
         this.mainSegment.addContent(segment);
         segment = parser.pullBufferSegment();
         n++;
      }
      // console.log(`'Template.processLine(..): Added ${n} segments (almost)!`);
      return true;
   }

   private processTemplate(): boolean {
      let linesCount = this.linesCount();
      if (linesCount <= 0) {
         console.error('Template.processTemplate(): Warning! Template has no one line!');
         return false;
      }
      for (let i = 0; i < linesCount; i++) {
         let line = this.getLine(i);
         if (line === null) {
            console.error('Template.processTemplate(): Warning! line[' + i + '] out of pointer!');
         } else {
            if (!this.processLine(i, line)) {
               return false;
            }
         }
      }
      return true;
   }

   private linesCount(): number {
      return this.lines.length;
   }

   private getLine(index: number): string | null {
      if(index < 0 || index >= this.linesCount()) {
         return null;      
      }
      return this.lines[index];
   }

   private readTemplate(): boolean {
      try {
         this.template = readFileSync(this.fileName, 'utf8');
      } catch (error) {
         console.error(`Template.readTemplate(): File read error occur! fileName = ${this.fileName}, error = ${error}`);
         return false;
      }
      
      return true;
   }
   
   private separateByLine(): boolean {
      if (!this.template){
         return false;
      }
      let lineBreaker = this.detectLineBreaker();
      if (lineBreaker !== undefined) {
         this.lines = this.template.split(lineBreaker);   
      } else {
         console.error('Template.separateByLine(): Warning! Not detect any line breaker in the template. Maybe it consist only one line?...');
         this.lines.push(this.template);
      }
      // console.log(`Template.separateByLine(): lines.lenth = ${this.lines.length}`);
      
      return true;
   }

   private detectLineBreaker(): string | undefined {
      if (!this.template){
         return undefined;
      }
      let newLineSignPos = this.template.indexOf('\n');
      if (newLineSignPos >= 0) {
         if (newLineSignPos > 0) {
            if (this.template[newLineSignPos - 1] === '\r') {
               return '\r\n';
            } else {
               return '\n';
            }
         }
      } else {
         newLineSignPos = this.template.indexOf('\r');
         if (newLineSignPos >= 0) {
            return '\r';
         }
      }
   }

   // private deleteLines(){

   // }
}