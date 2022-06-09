import { INamedValues } from "./template/interfaces";

export class Settings implements INamedValues {
   private valuesMap: Map<string, any> | undefined;

   constructor(settingsObject: any) {
      this.setAsObject(settingsObject);
   }

   public getByName(name: string): any | undefined {
      if (!this.valuesMap) {
         return undefined;
      }
      return this.valuesMap.get(name);
   }

   public isErrorState(): string | boolean {
      throw new Error("Method not implemented.");
   }

   public setAsObject(object: any) {
      // this.valuesMap = undefined;
      // this.valuesMap = new Map<string, any>();
      let map = new Map<string, any>();
      JSON.stringify(object, (key, value) => {
         try { // убираем индексы массивов
            if ((typeof JSON.parse(key)) === "number") {
               return undefined;
            }
         } catch (error) {            
         }
         map.set(key, value);
         return value;
      });
      this.valuesMap = map;
   }
}