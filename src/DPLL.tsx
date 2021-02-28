import React, {useState} from "react";
import Tree from 'react-d3-tree'
import {getLiterals, invertLiteral, ParsedFormula, parseFormula, setVariable, stringifyFormula} from "./Formula";
import {Switch, Typography} from "antd";
const {Title} = Typography


const getOneLiterals = (parsedFormula: ParsedFormula): Array<string> => {
    return parsedFormula.filter(clause => clause.length === 1).map(x => x[0]);
}

const getPureLiterals = (parsedFormula: ParsedFormula): Array<string> => {
    let literals = parsedFormula.flat();
    let nonNegatedLiterals = literals.filter(literal => !literal.includes("¬"))
    let negatedLiterals = literals.filter(literal => literal.includes("¬")).map(literal => literal.split("¬")[1])
    let pureLiterals = nonNegatedLiterals.filter(x => !negatedLiterals.includes(x)).concat(
        negatedLiterals.filter(x => !nonNegatedLiterals.includes(x)).map(x => "¬" + x)
    );
    // @ts-ignore
    return [...new Set(pureLiterals)];
}



const DPLLAlgorithm = (parsedFormula: ParsedFormula, next : string, options: { OLR: boolean, PLR: boolean }): any => {
    let oneLiterals = getOneLiterals(parsedFormula);
    if (options.OLR && oneLiterals.length > 0) {
        return {
            name: next + " " + stringifyFormula(parsedFormula),
            children: [DPLLAlgorithm(setVariable(parsedFormula,  oneLiterals[0]), "OLR " + oneLiterals[0], options)]
        };
    }
    let pureLiterals = getPureLiterals(parsedFormula);
    if (options.PLR && pureLiterals.length > 0) {
        return {
            name: next + " " + stringifyFormula(parsedFormula),
            children: [DPLLAlgorithm(setVariable(parsedFormula, pureLiterals[0]), "PLR " + pureLiterals[0], options)]
        };
    }
    let literals = getLiterals(parsedFormula);
    if (literals.length > 1) {
        return {
            name: next + " " + stringifyFormula(parsedFormula),
            children: [
                DPLLAlgorithm(setVariable(parsedFormula, literals[0]), "CASE " + literals[0] + " : ", options),
                DPLLAlgorithm(setVariable(parsedFormula, invertLiteral(literals[0])), "CASE " + invertLiteral(literals[0]) + " : ", options)
            ]
        }
    }
    else if(literals.length == 1)
    {
        return {
            name: next + " " + JSON.stringify(parsedFormula),
            children: [
                DPLLAlgorithm(setVariable(parsedFormula, literals[0]), "CASE " + literals[0] + " : ", options),
            ]
        }
    }
    return {name: next + " " + JSON.stringify(parsedFormula)}
}


export const DPLLComponent = (props : {formula : string}) => {
    let parsedFormula = parseFormula(props.formula)
    let [useOLR, setUseOLR] = useState<boolean>(false)
    let [usePLR, setUsePLR] = useState<boolean>(false)
    var result = DPLLAlgorithm(parsedFormula, "START", {OLR: useOLR, PLR: usePLR});
    return (
        <div>
            <Title>DPLL</Title>
            <Switch onClick={()=>{setUsePLR(!usePLR)}} checked={usePLR} unCheckedChildren={<>NO PLR</>} checkedChildren={<>PLR</>}/>
            <Switch onClick={()=>{setUseOLR(!useOLR)}} checked={useOLR} unCheckedChildren={<>NO OLR</>} checkedChildren={<>OLR</>}/>
        <div id="treeWrapper" style={{width: '100vw', height: '90vh'}}>
            <Tree orientation={'vertical'} data={result}/>
        </div>
        </div>
    );
}