import { ReductionTable } from "./reductiontable";

/**
 * Interface for classes realized reduction actions for production in reduction table.
*/
export interface IProductionAction {
   doAction(actionLexeme: string): boolean;
   isNoAction(): boolean;
}

/**
 * Provides access to the ReductionTable and ActionsMap. These are the basic elements that define the functionality of a grammatical parse tree.
*/
export interface IGrammarBasis {
   getReductionTable(): ReductionTable;
   getActionsMap(): Map<string, IProductionAction>;
}