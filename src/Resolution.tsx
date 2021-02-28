import {invertLiteral, ParsedFormula, parseFormula, stringifyFormula} from "./Formula";
import React, {useEffect} from "react";
// @ts-ignore
import cytoscape from 'cytoscape';


const canApplyResolution = (f1: Array<string>, f2: Array<string>) => {
    return f1.some(literal => f2.includes(invertLiteral(literal)));
}

let getLiteralToRemove = (f1: Array<string>, f2: Array<string>): string => {
    return f1.filter(literal => f2.includes(invertLiteral(literal)))[0];
}


function arrayIntersection<T>(array1: Array<T>, array2: Array<T>) {
    return array1.filter(value => array2.includes(value));
}

function arrayDifference(array1: Array<Clause>, array2: Array<Clause>) {
    return array1.filter(x => !array2.some(y => arrayIntersection(x.formula, y.formula).length === y.formula.length));
}

const isClausePresent = (clause: Array<string>, parsedFormula: ParsedFormula) => {
    return parsedFormula.some(x => arrayIntersection(clause, x).length === x.length);
}

const isTautology = (clause: Array<string>) => {
    return clause.some(literal => clause.includes(invertLiteral(literal)));
}

type Clause = { formula: Array<string>, parent: Array<string> | null }
type ResolutionAlgorithmResult = Array<Clause>;
const ResolutionAlgorithm = (parsedFormula: ResolutionAlgorithmResult): Array<ResolutionAlgorithmResult> => {
    let newFormula: ResolutionAlgorithmResult = JSON.parse(JSON.stringify(parsedFormula))
    for (let f1 of parsedFormula) {
        for (let f2 of parsedFormula) {
            if (canApplyResolution(f1.formula, f2.formula)) {
                let literalToRemove = getLiteralToRemove(f1.formula, f2.formula);
                // @ts-ignore
                let clauseToAdd = [...new Set(f1.formula.concat(f2.formula).filter(literal => literal !==
                                                                                              literalToRemove &&
                                                                                              literal !==
                                                                                              invertLiteral(literalToRemove)))];
                if (!isTautology(clauseToAdd) && !isClausePresent(clauseToAdd, newFormula.map(x => x.formula))) {
                    newFormula.push({formula: clauseToAdd, parent: f1.formula})
                }
                if (clauseToAdd.length === 0) {
                    return [parsedFormula, newFormula];
                }
            }
        }
    }
    if (newFormula.length == parsedFormula.length) {
        return [];
    } else {
        return [parsedFormula, ...ResolutionAlgorithm(newFormula)];
    }
    return [];
}


function* pairwise<T>(iterable: Iterable<T>) {
    const iterator = iterable[Symbol.iterator]()
    let current = iterator.next()
    let next = iterator.next()
    while (!current.done) {
        yield [current.value, next.value]
        current = next
        next = iterator.next()
    }
}


export const ResolutionComponent = (props: { formula: string }) => {
    let parsedFormula = parseFormula(props.formula)
    let parsedFormulaWithParent: ResolutionAlgorithmResult = parsedFormula.map((x) => (
        {formula: x, parent: null}
    ))
    var result = ResolutionAlgorithm(parsedFormulaWithParent);
    // @ts-ignore
    let resultDifferences = [parsedFormulaWithParent, ...[...pairwise(result)].slice(0, -1).map(([a, b]) => arrayDifference(b, a))]
    let colors = ["#ef5350", "#EC407A", "#AB47BC", "#7E57C2", "#5C6BC0", "#42A5F5", "#29B6F6", "#26C6DA"]
    let vertices = resultDifferences.map((clausesAtLevel, row) =>
        clausesAtLevel.map((clause: any, col ) => (
            {data: {id: stringifyFormula(clause.formula), row : row, col : col, color : colors[row]}}
        ))).flat();
    let edges = result[result.length - 1].filter(x => x.parent != null).map(clause => (
        {
            data: {source: stringifyFormula(clause.parent as any), target: stringifyFormula(clause.formula as any)}
        }
    ));
    var cy : any;
    
    useEffect(()=>{
     return ()=>{
         cy.unmount();
     }
    }, [])

    return (
        <div ref={(ref) => {
            try {
                cy = cytoscape({
                    layout: {
                        name: 'grid',
                        position: (node) => {
                            return {row: node.data("row"), col: node.data("col")}
                        }
                    },
                    container: ref,
                    elements: [
                        ...vertices,
                        ...edges,
                    ],

                    style: [ // the stylesheet for the graph
                        {
                            selector: 'node',
                            style: {
                                'background-color': 'data(color)',
                                'label': 'data(id)'
                            }
                        },

                        {
                            selector: 'edge',
                            style: {
                                'width': 3,
                                'line-color': '#ccc',
                                'target-arrow-color': '#ccc',
                                'target-arrow-shape': 'triangle',
                                'curve-style': 'bezier'
                            }
                        }
                    ],
                });
            }
            catch (e)
            {

            }
        }} style={{width: '100vw', height: '100vh'}}>
            </div>
            );
        }
