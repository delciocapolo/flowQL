"use strict";
// import { createConnection } from "mysql2";
// import { randomUUID } from "crypto";
// import { IDBConfig } from "../global/interfaces";
// interface IBaseError {
//     message: string;
//     stack: string;
//     action: string;
//     statusCode: string;
//     errorID: string;
//     requestID: string;
//     context: string;
//     errorLocationCode: string;
//     key: string;
//     type: string;
//     databaseErrorCode: string;
// }
// class BaseError extends Error{
//     constructor({
//         message = "",
//         stack = "",
//         action = "",
//         statusCode = 500,
//         errorID = "",
//         requestID = "",
//         context = "",
//         errorLocationCode = "",
//         key = "",
//         type = "",
//         databaseErrorCode = ""
//     }) {
//         super();
//         this.name = this.constructor.name;
//         this.message = message;
//         this.stack = stack;
//         this.action = action;
//         this.statusCode = statusCode || 500;
//         this.errorID = errorID || randomUUID().toString();
//         this.requestID = requestID;
//         this.context = context;
//         this.errorLocationCode = errorLocationCode;
//         this.key = key;
//         this.type = type;
//         this.databaseErrorCode = databaseErrorCode;
//     }
// }
// export class TypeError extends BaseError {
//     constructor({
//         message = "", 
//         action = "", 
//         requestID = "", 
//         errorID = "", 
//         statusCode = 500, 
//         stack = "", 
//         errorLocationCode = ""
//     }) {
//         super({
//             message: message || "O TIPO DE DADOS DO ARRAY NÃO COENCIDE",
//             action: action || "TENTE VERIFICAR O TIPO DE DADOS DA CONDIÇÃO",
//             requestID: requestID, errorID: errorID, statusCode: statusCode || 500,
//             stack: stack, errorLocationCode: errorLocationCode
//         });
//     }
// }
// export class DatabaseError extends BaseError {
//     constructor({
//                 message = "", 
//                 action = "", 
//                 requestID = "", 
//                 errorID = "", 
//                 statusCode = 500, 
//                 stack = "", 
//                 errorLocationCode = ""
//     }) {
//         super({
//             message: message || "CONEXAO COM BANCO DE DADOS, [NAO] REALIZADA!",
//             action: action || "VERIFIQUE OS CAMPOS INSERIDOS, PARA REALIZAR A CONEXAO",
//             requestID: requestID, errorID: errorID, statusCode: statusCode || 500,
//             stack: stack, errorLocationCode: errorLocationCode
//         });
//     }
//     public testConnection({database,host,password,user}: IDBConfig) {
//         const connection = createConnection({"database":database, "host": host, "password": password, "user": user});
//         connection.connect((err) => {
//             if(err) throw new Error(`${this.message} | ${err}`);
//             return;
//         });
//     }
// }
