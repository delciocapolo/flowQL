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