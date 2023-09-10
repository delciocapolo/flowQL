import { randomUUID } from "crypto";

interface IBaseError {
    message: string;
    stack?: string;
    action: string;
    statusCode?: number;
    errorID?: string;
    requestID?: string;
    context?: string | undefined;
    errorLocationCode?: string;
    key?: string | undefined;
    type?: string | undefined;
    databaseErrorCode?: string;
}

class BaseError extends Error {
    message: string;
    stack: string | undefined;
    action: string;
    statusCode: number;
    errorID: string | undefined;
    requestID: string | undefined;
    context: string | undefined;
    errorLocationCode: string | undefined;
    key: string | undefined;
    type: string | undefined;
    databaseErrorCode: string | undefined;

    constructor({
        message,
        stack,
        action,
        statusCode,
        errorID,
        requestID,
        context,
        errorLocationCode,
        key,
        type,
        databaseErrorCode
    }: IBaseError) {
        super();
        this.name = this.constructor.name;
        this.message = message;
        this.stack = stack;
        this.action = action;
        this.statusCode = statusCode || 500;
        this.errorID = errorID || randomUUID().toString();
        this.requestID = requestID;
        this.context = context;
        this.errorLocationCode = errorLocationCode;
        this.key = key;
        this.type = type;
        this.databaseErrorCode = databaseErrorCode;
    }
}

export class InvalidTypes extends BaseError {
    constructor({
        message, 
        stack, 
        action, 
        statusCode, 
        errorID, 
        requestID, 
        errorLocationCode
    }: Omit<IBaseError, "context"|"key"|"type"|"databaseErrorCode">) {
        super({
            message: message || "OS TIPOS DE DADOS NÃO COENCIDEM",
            action: action || "TENTE VERIFICAR O TIPO DE DADOS DA CONDIÇÃO",
            requestID: requestID, 
            errorID: errorID, statusCode: statusCode || 500,
            stack: stack, errorLocationCode: errorLocationCode
        });
    }
}

export class DatabaseError extends BaseError {
    constructor({
                message, 
                action, 
                requestID, 
                errorID, 
                statusCode, 
                stack, 
                errorLocationCode
    }: Omit<IBaseError, "context"|"key"|"type"|"databaseErrorCode">) {
        super({
            message: message || "CONEXAO COM BANCO DE DADOS, [NAO] REALIZADA!",
            action: action || "VERIFIQUE OS CAMPOS INSERIDOS, PARA REALIZAR A CONEXAO",
            requestID: requestID, errorID: errorID, statusCode: statusCode || 500,
            stack: stack, errorLocationCode: errorLocationCode
        });
    }
}

export class ErrorLength extends BaseError {
    constructor({
        message, 
        action,
        statusCode, 
        stack
    }: Omit<IBaseError, "context"|"key"|"type"|"databaseErrorCode"|"requestID"|"errorID"|"errorLocationCode">) {
        super({
            message: message || "CONEXAO COM BANCO DE DADOS, [NAO] REALIZADA!",
            action: action || "VERIFIQUE OS CAMPOS INSERIDOS, PARA REALIZAR A CONEXAO", 
            statusCode: statusCode || 500, stack: stack
        });
    }
}