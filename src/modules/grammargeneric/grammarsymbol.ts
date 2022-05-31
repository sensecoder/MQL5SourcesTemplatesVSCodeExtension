export class GrammarSymbol {
   protected name: string;
   protected lexeme: string;

   constructor(initName: string, initLexeme: string) {
      this.name = initName;
      this.lexeme = initLexeme;
   }
   
   public getName(): string {
      return this.name;
   }

   public getLexeme(): string {
      return this.lexeme;
   }

   public getCopy(): GrammarSymbol {
      return new GrammarSymbol(this.name, this.lexeme);
   }
}