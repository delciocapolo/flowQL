import http from "node:http";
import qs from "node:querystring";

import axios, { AxiosError } from "axios";
import {createConnection, Connection, createPool} from "mysql2";
import { config } from "dotenv";
import debug from "debug";

import {IGet,IDBConfig} from "./global/interfaces"
import { validateLengthArrays,checkObjects,validateField,transformURL } from "./service/transformers"; 

config({"debug": true});


interface IInject extends IGet{
    params({ obj_body, validate, insertInTbl }:IDefineDBParams): void;
}

interface IDefineDBParams {
    obj_body?: object;
    validate?: boolean;
    insertInTbl(tbl_name: string, fieldTable: Array<string>, valuesField: Array<string>): void;
}

// /produto | GET(rota, dados_de_retorno)
// /produto | POST(rota, )
/**
 * app.post(rota, (req, res) => { 
 * 
 * })
 */

class Server {
    public readonly server: http.Server;
    private readonly PORT: number | never;
    protected log: debug.Debugger;

    constructor() {
        this.server = new http.Server(this.configServer);
        this.PORT = Number(process.env.PORT) || 3333;
        this.log = debug("api:main");

        // Inicializar metodo
        this.listen();
    }

    protected configServer(req:http.IncomingMessage, res:http.ServerResponse) {
        res.writeHead(200, {"Content-Type": "application/json"});
        // res.writeHead(200, {"Content-Security-Policy:": "*"});
        res.writeHead(200, {"Cross-Allow-Origin": "*"});
    }

    private async Request({url}:IGet):Promise<{message: string}> {
        try {
            const response = await axios.get(`http://127.0.0.1:${this.PORT}/${url}`);
            const responseJSON = await response.data;
            return responseJSON;
        } catch (err) {
            throw new Error(`Erro => ${err}`);
        }
    }

    public get(urls: Array<IGet> | Array<string>) {
        if(!checkObjects(urls, "string") && !checkObjects(urls, "object")) {
            throw new Error("Error => O tipo da condicao, nao coencide");
        }
        if(checkObjects(urls, "string")) {
            urls.map((url) => {
                const tempURL = String(url);
                const param = transformURL({"url": tempURL});
                
                this.server.on("request", (req, res) => {
                    if(req.url === `/${param}` && req.method === "GET") {
                        res.end(JSON.stringify({"message": `Rota ${param} definida`}));
                    }
                });

            });
        } 
        else if(checkObjects(urls, "object")) {
            urls!.map((urlParam) => {
                const {url, data} = Object(urlParam);
                const param = transformURL({"url": url});
                
                this.server.on("request", (req, res) => {
                    if(req.url === `/${param}` && req.method === "GET") {
                        res.end(JSON.stringify(data));
                    }
                });
            })
        }
    }
    
    private connectionDB({database,host,password,user}: IDBConfig): Connection {
        const connection = createConnection({"database": database, "host": host, "password": password, user: user});

        connection.connect((err) => {
            if(err) throw new Error(err.message);
            return;
        })

        return connection;
    }

    public post(urls: Array<IInject>, dbConfig?: IDBConfig) {
        switch (!!dbConfig) {
            case true:
                const connect = this.connectionDB(dbConfig!);

                urls.map((urlParam) => {
                    const {url, params} = urlParam;
                    const param = transformURL({"url": url});

                    this.server.on("request", (req, res) => {
                        if(req.url === `/${param}` && req.method === "POST") {
                            const datas:Array<Buffer> = [];
                            
                            req.on("data", (chunk) => {
                                datas.push(chunk);
                            });

                            req.on("end", () => {
                                const body = Buffer.concat(datas).toString();
                                const parsedBody = qs.parse(body);
                                
                                const setArray = (arr: string[]) => arr.map((value, index, array) => (array[index].replace(value, '?')));

                                params({"obj_body": parsedBody, "validate": validateField(parsedBody)!, insertInTbl(tbl_name, fieldTable, valuesField) {
                                        if(fieldTable.length !== valuesField.length) {
                                            throw new Error("O número de campos que serão inseridos, não pode ser diferente do número de valores que serão inseridos!");
                                        }
                                        const [field, values] = [fieldTable.toString(), setArray(valuesField).toString()]
                                        connect.execute(`INSERT INTO ${tbl_name}(${field}) VALUES (${values})`, valuesField, (err) => (err ? console.log("Erro ao inserir os dados! "+err) : console.log("Valores inseridos com sucesso!")));
                                    }
                                });

                                res.end(JSON.stringify({"message": "sucess", 'status': 200}));
                            });
                        }
                    })
                });
                break;
            case false:
                urls.map((urlParam) => {
                    const {url, params} = urlParam;
                    const param = transformURL({"url": url});

                    this.server.on("request", (req, res) => {
                        if(req.url === `/${param}` && req.method === "POST") {
                            const datas:Array<Buffer> = [];
                            
                            req.on("data", (chunk) => {
                                datas.push(chunk);
                            });

                            req.on("end", () => {
                                const body = Buffer.concat(datas).toString();
                                const parsedBody = qs.parse(body);

                                params({"obj_body": parsedBody, "validate": validateField(parsedBody)!, insertInTbl(tbl_name, fieldTable, valuesField) {
                                        throw new Error("Não pode usar a função [insertInTbl], sem definir as configurações para conexão com o banco de dados!");
                                    }
                                });

                                res.end(JSON.stringify({"message": "sucess", 'status': 200}));
                            });
                        }
                    })
                });
                break;
            default:
                break;
        }
    }

    public listen(PORT?:number) {
        this.server
            .listen(this.PORT || PORT!, "localhost", 
            () => console.log(`Server is running! At http://localhost:${this.PORT || PORT!}`));
    }

}

export default new Server();