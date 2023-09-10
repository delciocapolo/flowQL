"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorLength = exports.DatabaseError = exports.InvalidTypes = void 0;
const crypto_1 = require("crypto");
class BaseError extends Error {
    constructor({ message, stack, action, statusCode, errorID, requestID, context, errorLocationCode, key, type, databaseErrorCode }) {
        super();
        this.name = this.constructor.name;
        this.message = message;
        this.stack = stack;
        this.action = action;
        this.statusCode = statusCode || 500;
        this.errorID = errorID || (0, crypto_1.randomUUID)().toString();
        this.requestID = requestID;
        this.context = context;
        this.errorLocationCode = errorLocationCode;
        this.key = key;
        this.type = type;
        this.databaseErrorCode = databaseErrorCode;
    }
}
class InvalidTypes extends BaseError {
    constructor({ message, stack, action, statusCode, errorID, requestID, errorLocationCode }) {
        super({
            message: message || "OS TIPOS DE DADOS NÃO COENCIDEM",
            action: action || "TENTE VERIFICAR O TIPO DE DADOS DA CONDIÇÃO",
            requestID: requestID,
            errorID: errorID, statusCode: statusCode || 500,
            stack: stack, errorLocationCode: errorLocationCode
        });
    }
}
exports.InvalidTypes = InvalidTypes;
class DatabaseError extends BaseError {
    constructor({ message, action, requestID, errorID, statusCode, stack, errorLocationCode }) {
        super({
            message: message || "CONEXAO COM BANCO DE DADOS, [NAO] REALIZADA!",
            action: action || "VERIFIQUE OS CAMPOS INSERIDOS, PARA REALIZAR A CONEXAO",
            requestID: requestID, errorID: errorID, statusCode: statusCode || 500,
            stack: stack, errorLocationCode: errorLocationCode
        });
    }
}
exports.DatabaseError = DatabaseError;
class ErrorLength extends BaseError {
    constructor({ message, action, statusCode, stack }) {
        super({
            message: message || "CONEXAO COM BANCO DE DADOS, [NAO] REALIZADA!",
            action: action || "VERIFIQUE OS CAMPOS INSERIDOS, PARA REALIZAR A CONEXAO",
            statusCode: statusCode || 500, stack: stack
        });
    }
}
exports.ErrorLength = ErrorLength;
