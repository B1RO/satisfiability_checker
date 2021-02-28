export type ParsedFormula = Array<Array<string>>
export const parseFormula = (formula: string): ParsedFormula => {
    return JSON.parse(formula.replaceAll("{", "[").replaceAll("}", "]").replace(/(¬?[a-z]+)/g, '"$1"'));
}

export const getLiterals = (parsedFormula: ParsedFormula) => {
    // @ts-ignore
    return [...new Set(parsedFormula.flat())];
}

export const setVariable = (parsedFormula: ParsedFormula, variable: string) => {
    return parsedFormula.filter(clause => !clause.includes(variable)).map(clause => clause.filter(literal => invertLiteral(literal) !==
                                                                                                             variable));
}

export const invertLiteral = (literal: string) => {
    if (literal.includes("¬")) {
        return literal.split("¬")[1];
    } else return "¬" + literal;
}

export const stringifyFormula = (formula : ParsedFormula) : string =>
{
    return JSON.stringify(formula).replaceAll("[","{").replaceAll("]","}").replaceAll('"',"");
}
