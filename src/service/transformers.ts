import { IGet } from "@src/global/interfaces";

const validateLengthArrays = function (arr1: Array<any>, arr2: Array<any>):boolean {
    return arr1.every((value, index) => value === arr2[index]);
};

/**
 * 
 * @param arr `function | method`
 * @param typeData `typedata variable`
 * @returns boolean
 * 
*/
const checkObjects = function (arr: Array<any>, typeData: string):boolean {
    return arr.every((pred) => typeof pred === typeData);
};

const transformURL = function ({url}:IGet):string {
    let indent:string = "";
    for(let i of url) {
        if(i !== "/") {
            indent += i;
        }
    }
    return indent;
}

const validateField = function (list: object | Array<any>) {
    if(typeof list === "object") {
        return Object.values(list).every((value) => (!!String(value).trim()))
    } else if(Array.isArray(list)){
        return Array(list).every((value) => (!!String(value).trim()));
    }
}

const setArray = (arr: string[]) => arr.map((value, index, array) => (array[index].replace(value, '?')));

export { validateLengthArrays,checkObjects,validateField,transformURL,setArray };