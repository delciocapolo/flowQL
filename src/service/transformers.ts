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

const transformURL = function ({url}: {url: string}):string {
    let indent:string = "";
    let tmp = url.split("/"), tmpArray = [];
    for(let c of tmp) {
        if(!!c && c !== ' ') {
            tmpArray.push(c);
        }
    }
    indent = tmpArray.join("/");
    return indent;
}
const transformLastParam = function(queryString: string):object {
    const arr = queryString.split('&');
    const objectParam: Record<string, any> = {};
    for(let param of arr) {
        let [key, value] = param.split('=');
        objectParam[key] = value;
    }
    return objectParam;
}
const validateField = function (list: object | Array<any>) {
    if(typeof list === "object") {
        return Object.values(list).every((value) => (!!String(value).trim()))
    } else if(Array.isArray(list)){
        return Array(list).every((value) => (!!String(value).trim()));
    }
}

const setArray = (arr: string[]) => arr.map((value, index, array) => (array[index].replace(value, '?')));

export { validateLengthArrays,checkObjects,validateField,transformURL,setArray,transformLastParam };