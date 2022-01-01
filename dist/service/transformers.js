"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformLastParam = exports.setArray = exports.transformURL = exports.validateField = exports.checkObjects = exports.validateLengthArrays = void 0;
const validateLengthArrays = function (arr1, arr2) {
    return arr1.every((value, index) => value === arr2[index]);
};
exports.validateLengthArrays = validateLengthArrays;
/**
 *
 * @param arr `function | method`
 * @param typeData `typedata variable`
 * @returns boolean
 *
*/
const checkObjects = function (arr, typeData) {
    return arr.every((pred) => typeof pred === typeData);
};
exports.checkObjects = checkObjects;
const transformURL = function ({ url }) {
    let indent = "";
    let tmp = url.split("/"), tmpArray = [];
    for (let c of tmp) {
        if (!!c && c !== ' ') {
            tmpArray.push(c);
        }
    }
    indent = tmpArray.join("/");
    return indent;
};
exports.transformURL = transformURL;
const transformLastParam = function (queryString) {
    const arr = queryString.split('&');
    const objectParam = {};
    for (let param of arr) {
        let [key, value] = param.split('=');
        objectParam[key] = value;
    }
    return objectParam;
};
exports.transformLastParam = transformLastParam;
const validateField = function (list) {
    if (typeof list === "object") {
        return Object.values(list).every((value) => (!!String(value).trim()));
    }
    else if (Array.isArray(list)) {
        return Array(list).every((value) => (!!String(value).trim()));
    }
};
exports.validateField = validateField;
const setArray = (arr) => arr.map((value, index, array) => (array[index].replace(value, '?')));
exports.setArray = setArray;
