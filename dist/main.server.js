"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_http_1 = __importDefault(require("node:http"));
const node_querystring_1 = __importDefault(require("node:querystring"));
const node_url_1 = __importDefault(require("node:url"));
const axios_1 = __importDefault(require("axios"));
const mysql2_1 = require("mysql2");
const dotenv_1 = require("dotenv");
const debug_1 = __importDefault(require("debug"));
const transformers_1 = require("./service/transformers");
(0, dotenv_1.config)({ "debug": true });
// /produto | GET(rota, dados_de_retorno);
// /produto | POST(rota, manipular_dados_do_usuario);
// /produto | PUT(rota, mudar_dados_do_usuario);
// /produto | DELETE(rota, eliminar_registos);
class Server {
    constructor() {
        this.server = new node_http_1.default.Server(this.configServer);
        this.PORT = Number(process.env.PORT) || 3333;
        this.log = (0, debug_1.default)("api:main");
        // Inicializar metodo
        this.listen();
    }
    configServer(req, res) {
        res.writeHead(200, { "Content-Type": "application/json" });
        // res.writeHead(200, {"Content-Security-Policy:": "*"});
        res.writeHead(200, { "Cross-Allow-Origin": "*" });
    }
    Request({ url }) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(`http://127.0.0.1:${this.PORT}/${url}`);
                const responseJSON = yield response.data;
                return responseJSON;
            }
            catch (err) {
                throw new Error(`Erro => ${err}`);
            }
        });
    }
    get(urls) {
        if (!(0, transformers_1.checkObjects)(urls, "string") && !(0, transformers_1.checkObjects)(urls, "object")) {
            throw new Error("Error => O tipo da condicao, nao coencide");
        }
        if ((0, transformers_1.checkObjects)(urls, "string")) {
            urls.map((url) => {
                const tempURL = String(url);
                const param = (0, transformers_1.transformURL)({ "url": tempURL });
                this.server.on("request", (req, res) => {
                    if (req.url === `/${param}` && req.method === "GET") {
                        return res.end(JSON.stringify({ "message": `Rota ${param} definida` }));
                    }
                });
            });
        }
        else if ((0, transformers_1.checkObjects)(urls, "object")) {
            urls.map((urlParam) => {
                const { url, data } = Object(urlParam);
                const param = (0, transformers_1.transformURL)({ "url": url });
                this.server.on("request", (req, res) => {
                    if (req.url === `/${param}` && req.method === "GET") {
                        console.log(`Boolean: ${!!data} | data: ${data}`);
                        if (!!data) {
                            return res.end(JSON.stringify(data));
                        }
                        return res.end(JSON.stringify({ "message": `Rota ${param} definida` }));
                    }
                });
            });
        }
    }
    connectionDB({ database, host, password, user }) {
        const connection = (0, mysql2_1.createConnection)({ "database": database, "host": host, "password": password, user: user });
        connection.connect((err) => {
            if (err)
                throw new Error(err.message);
            return;
        });
        return connection;
    }
    post(urls, dbConfig) {
        switch (!!dbConfig) {
            case true:
                const connect = this.connectionDB(dbConfig);
                urls.map((urlParam) => {
                    const { url, params } = urlParam;
                    const param = (0, transformers_1.transformURL)({ "url": url });
                    this.server.on("request", (req, res) => {
                        if (req.url === `/${param}` && req.method === "POST") {
                            const datas = [];
                            req.on("data", (chunk) => {
                                datas.push(chunk);
                            });
                            req.on("end", () => {
                                const body = Buffer.concat(datas).toString();
                                const parsedBody = node_querystring_1.default.parse(body);
                                params({ "obj_body": parsedBody, "validate": (0, transformers_1.validateField)(parsedBody), insertInTbl(tbl_name, fieldTable, valuesField) {
                                        if ((fieldTable.length !== valuesField.length) || fieldTable.length === 0 || valuesField.length === 0) {
                                            throw new Error("O número de campos que serão inseridos, não pode ser diferente do número de valores que serão inseridos!");
                                        }
                                        if (!tbl_name) {
                                            throw new Error("O nome da tabela nao pode estar vazia!");
                                        }
                                        const [field, values] = [fieldTable.toString(), (0, transformers_1.setArray)(valuesField).toString()];
                                        connect.execute(`INSERT INTO ${tbl_name}(${field}) VALUES (${values})`, valuesField, (err) => (err ? console.log("Erro ao inserir os dados! " + err) : console.log("Valores inseridos com sucesso!")));
                                    } });
                                return res.end(JSON.stringify({ "message": "sucess", 'status': 200 }));
                            });
                        }
                    });
                });
                break;
            case false:
                urls.map((urlParam) => {
                    const { url, params } = urlParam;
                    const param = (0, transformers_1.transformURL)({ "url": url });
                    this.server.on("request", (req, res) => {
                        if (req.url === `/${param}` && req.method === "POST") {
                            const datas = [];
                            req.on("data", (chunk) => {
                                datas.push(chunk);
                            });
                            req.on("end", () => {
                                const body = Buffer.concat(datas).toString();
                                const parsedBody = node_querystring_1.default.parse(body);
                                params({ "obj_body": parsedBody, "validate": (0, transformers_1.validateField)(parsedBody), insertInTbl(tbl_name, fieldTable, valuesField) {
                                        throw new Error("Não pode usar a função [insertInTbl], sem definir as configurações para conexão com o banco de dados!");
                                    } });
                                return res.end(JSON.stringify({ "message": "sucess", 'status': 200 }));
                            });
                        }
                    });
                });
                break;
            default:
                break;
        }
    }
    put(urls, dbConfig) {
        const self = this;
        switch (!!dbConfig) {
            case true:
                const connect = this.connectionDB(dbConfig);
                urls.map((urlParam) => {
                    const { url, changeOnTable } = urlParam;
                    const param = (0, transformers_1.transformURL)({ "url": url });
                    this.server.on("request", (req, res) => {
                        if (req.url === `/${param}` && req.method === "PUT") {
                            const datas = [];
                            req.on("data", (chunk) => {
                                datas.push(chunk);
                            });
                            req.on("close", () => {
                                const body = Buffer.concat(datas).toString();
                                const parsedBody = node_querystring_1.default.parse(body);
                                changeOnTable({ "obj_body": parsedBody, "validate": (0, transformers_1.validateField)(parsedBody),
                                    changeOn({ tbl_name, columns, values, columnID, id }) {
                                        if ((columns.length !== values.length) || columns.length == 0 || values.length === 0) {
                                            throw new Error("O número de campos que serão inseridos, não pode ser diferente do número de valores que serão inseridos!");
                                        }
                                        if (!tbl_name || !columnID || !id) {
                                            throw new Error("Campos como ['Nome da tabela','coluna de id', 'id'] nao podem estar vazias!");
                                        }
                                        columns.map((column, index) => {
                                            connect.execute(`UPDATE ${tbl_name} SET ${column} = ? WHERE ${columnID} = ? LIMIT 1`, [values[index], id], (err) => {
                                                if (err)
                                                    throw new Error(`Erro ao atualizar o registro! ${err.stack}`);
                                                self.log("Registro atualizado com sucesso!");
                                                return;
                                            });
                                        });
                                    },
                                    transformKeys(body) {
                                        const keys = Object.keys(body).map((key) => (key));
                                        return keys;
                                    },
                                    transformValues(body) {
                                        const values = Object.values(body).map((value) => (value));
                                        return values;
                                    },
                                });
                                return res.end(JSON.stringify({ "message": "sucess", 'status': 200 }));
                            });
                        }
                    });
                });
                break;
            case false:
                urls.map((urlParam) => {
                    const { url, changeOnTable } = urlParam;
                    const param = (0, transformers_1.transformURL)({ "url": url });
                    this.server.on("request", (req, res) => {
                        if (req.url === `/${param}` && req.method === "PUT") {
                            const datas = [];
                            req.on("data", (chunk) => {
                                datas.push(chunk);
                            });
                            req.on("close", () => {
                                const body = Buffer.concat(datas).toString();
                                const parsedBody = node_querystring_1.default.parse(body);
                                changeOnTable({ "obj_body": parsedBody, "validate": (0, transformers_1.validateField)(parsedBody),
                                    changeOn({ tbl_name, columns, values, columnID, id }) {
                                        throw new Error("Não pode usar a função [insertInTbl], sem definir as configurações para conexão com o banco de dados!");
                                    },
                                    transformKeys(body) {
                                        throw new Error("Não pode usar a função [insertInTbl], sem definir as configurações para conexão com o banco de dados!");
                                    },
                                    transformValues(body) {
                                        throw new Error("Não pode usar a função [insertInTbl], sem definir as configurações para conexão com o banco de dados!");
                                    } });
                                return res.end(JSON.stringify({ "message": "sucess", 'status': 200 }));
                            });
                        }
                    });
                });
                break;
            default:
                break;
        }
    }
    delete(urls, dbConfig) {
        const self = this;
        switch (!!dbConfig) {
            case true:
                const connect = this.connectionDB(dbConfig);
                urls.map((urlParam) => {
                    const { url, deleteOnTable } = urlParam;
                    const param = (0, transformers_1.transformURL)({ "url": url });
                    this.server.on("request", (req, res) => {
                        const params = node_url_1.default.parse(req.url);
                        const baseParams = (0, transformers_1.transformURL)({ "url": params.pathname });
                        if (`/${baseParams}` === `/${param}` && req.method === "DELETE") {
                            deleteOnTable({
                                "obj_body": (0, transformers_1.transformLastParam)(params.query),
                                deleteOn({ tbl_name, columnID, id }) {
                                    const { del } = Object((0, transformers_1.transformLastParam)(params.query));
                                    connect.execute(`DELETE FROM ${tbl_name} WHERE ${columnID} = ?`, [id || del], (err) => {
                                        if (err)
                                            throw new Error(`Erro ao deletar registro! ${err}`);
                                        self.log(`Registro deletado com sucesso!`);
                                        return;
                                    });
                                }
                            });
                            return res.end(JSON.stringify({ "msg": "Registo deletado" }));
                        }
                    });
                });
                break;
            case false:
                break;
            default:
                break;
        }
    }
    listen(PORT) {
        this.server
            .listen(this.PORT || PORT, "localhost", () => this.log(`Server is running! At http://localhost:${this.PORT || PORT}`));
    }
}
exports.default = new Server();
