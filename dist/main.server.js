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
const axios_1 = __importDefault(require("axios"));
const mysql2_1 = require("mysql2");
const dotenv_1 = require("dotenv");
const debug_1 = __importDefault(require("debug"));
(0, dotenv_1.config)({ "debug": true });
// /produto | GET(rota, dados_de_retorno)
// /produto | POST(rota, )
/**
 * server.post(
 * "dbNameMysql": "user_adm",
 * [
 * {
 *  url:"user",
 *  params: {
 *      "route": "user/adm",
 *      "tblNameMysql": "adm",
 *      "body": ["nome","salario","cargo"],
 *      "values": ["valor1", "valor2", "valor3"]
 *  }
 * }
 * ])
 * app.post(rota, (req, res) => {
 *
 * })
 */
class Server {
    constructor() {
        this.server = new node_http_1.default.Server(this.configServer);
        this.PORT = Number(process.env.PORT);
        this.log = (0, debug_1.default)("api:main");
        // Inicializar metodo
        this.listen();
    }
    configServer(req, res) {
        res.writeHead(200, { "Content-Type": "application/json" });
        // res.writeHead(200, {"Content-Security-Policy:": "*"});
        res.writeHead(200, { "Cross-Allow-Origin": "*" });
    }
    /**
     *
     * @param arr `function | method`
     * @param typeData `typedata variable`
     * @returns boolean
     */
    checkObjects(arr, typeData) {
        return arr.every((pred) => typeof pred === typeData);
        // (arr[0] as string) : arr.every((pred) => typeof pred === "object") ? (arr[0] as object) : (arr[0] as never)
    }
    transformURL({ url }) {
        let indent = "";
        for (let i of url) {
            if (i !== "/") {
                indent += i;
            }
        }
        return indent;
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
        if (!this.checkObjects(urls, "string") && !this.checkObjects(urls, "object")) {
            throw new Error("Error => O tipo da condicao, nao coencide");
        }
        if (this.checkObjects(urls, "string")) {
            urls.map((url) => {
                const tempURL = String(url);
                const param = this.transformURL({ "url": tempURL });
                this.server.on("request", (req, res) => {
                    if (req.url === `/${param}` && req.method === "GET") {
                        res.end(JSON.stringify({ "message": `Rota ${param} definida` }));
                    }
                });
            });
        }
        else if (this.checkObjects(urls, "object")) {
            urls.map((urlParam) => {
                const { url, data } = Object(urlParam);
                const param = this.transformURL({ "url": url });
                this.server.on("request", (req, res) => {
                    if (req.url === `/${param}` && req.method === "GET") {
                        res.end(JSON.stringify(data));
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
    checkUnique(arr1, arr2) {
        return arr1.every((value, index) => value === arr2[index]);
    }
    post(urls, dbConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!dbConfig) {
                urls.map((urlParam) => {
                    const { url, data, params } = urlParam;
                    const param = this.transformURL({ "url": url });
                    this.server.on("request", (req, res) => {
                        if (req.url === `/${param}` && req.method === "POST") {
                            const data = [];
                            req.on("data", (chunk) => {
                                data.push(chunk);
                            });
                            req.on("end", () => {
                                const body = Buffer.concat(data).toString();
                                const parsedBody = node_querystring_1.default.parse(body);
                                console.log(parsedBody['email']);
                                res.end(JSON.stringify({ "msg": parsedBody }));
                            });
                        }
                    });
                });
            }
        });
    }
    listen(PORT) {
        this.server
            .listen(this.PORT || PORT, "localhost", () => console.log(`Server is running! At http://localhost:${this.PORT || PORT}`));
    }
}
exports.default = new Server();
