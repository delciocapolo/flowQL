export interface IGet {
    url: string;
    data?: object | string;
}

export interface IDBConfig {
    database: string;
    host: string;
    password: string;
    user: string;
}

export interface IDefineDBParams {
    obj_body: object;
    validate?: boolean;
    insertOnTable(tbl_name: string, fieldTable: Array<string>, valuesField: Array<string>): void;
}

export type IInject =  Omit<IGet, 'data'> & {
    params({ obj_body, validate, insertOnTable }:IDefineDBParams): void;
}

export interface IChangeOn {
    tbl_name: string;
    columnID: string;
    id?: string | number;
    columns: Array<string>;
    values: Array<string | number | unknown>;
}

export type IChangeOnTable = Omit<IDefineDBParams, 'insertOnTable'> & {
    changeOn({tbl_name, columns, values, columnID, id}:IChangeOn): void;
    transformKeys(body: object): Array<string>;
    transformValues(body: object): Array<string>;
}

export type IPut = Omit<IGet, 'data'> & { 
    changeOnTable({obj_body, validate, changeOn, transformKeys, transformValues}: IChangeOnTable): void;
};

export type IDelete = Omit<IGet, 'data'> & {
    deleteOnTable({obj_body, deleteOn}: {obj_body: string | object | null, deleteOn({tbl_name, columnID,id}: Omit<IChangeOn, 'columns'|'values'>):void; }): void;
}