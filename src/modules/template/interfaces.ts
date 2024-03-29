/** 
 * Allows get a value by name.
*/
export interface INamedValues {
   getByName(name: string): any | undefined;
   // 'false' if no error, else return a string with error description (...trash)
   isErrorState(): boolean | string;
}

/**
 * Provide access to basic values for action classes
*/
export interface IActionBasis {
   getVariables(): INamedValues | undefined;
   getValueStack(): Array<{value : string}> | undefined;
}

