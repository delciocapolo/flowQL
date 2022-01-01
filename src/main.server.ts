import http from "node:http";
import qs from "node:querystring";
import URL from "node:url";

import axios, { AxiosError } from "axios";
import {createConnection, Connection} from "mysql2";
import { config } from "dotenv";
import debug from "debug";

import {IGet,IDBConfig} from "./global/interfaces"
import { checkObjects,validateField,transformURL,setArray,transformLastParam } from "./service/transformers"; 

config({"debug": true});


interface IDefineDBParams {
    obj_body: object;
    validate?: boolean;
    insertInTbl(tbl_name: string, fieldTable: Array<string>, valuesField: Array<string>): void;
}

type IInject =  Omit<IGet, 'data'> & {
    params({ obj_body, validate, insertInTbl }:IDefineDBParams): void;
}

interface IChangeOn {
    tbl_name: string;
    columnID: string;
    id?: string | number;
    columns: Array<string>;
    values: Array<string | number | unknown>;
}
type IChangeOnTable = Omit<IDefineDBParams, 'insertInTbl'> & {
    changeOn({tbl_name, columns, values, columnID, id}:IChangeOn): void;
    transformKeys(body: object): Array<string>;
    transformValues(body: object): Array<string>;
}
type IPut = Omit<IGet, 'data'> & { 
    changeOnTable({obj_body, validate, changeOn, transformKeys, transformValues}: IChangeOnTable): void;
};

type IDelete = Omit<IGet, 'data'> & {
    deleteOnTable({obj_body, deleteOn}: {obj_body: string | object | null, deleteOn({tbl_name, columnID,id}: Omit<IChangeOn, 'columns'|'values'>):void; }): void;
}

// /produto | GET(rota, dados_de_retorno);
// /produto | POST(rota, manipular_dados_do_usuario);
// /produto | PUT(rota, mudar_dados_do_usuario);
// /produto | DELETE(rota, eliminar_registos);

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
                        return res.end(JSON.stringify({"message": `Rota ${param} definida`}));
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
                        console.log(`Boolean: ${!!data} | data: ${data}`);
                        if(!!data) {
                            return res.end(JSON.stringify(data));
                        }
                        return res.end(JSON.stringify({"message": `Rota ${param} definida`}));
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

                                params({"obj_body": parsedBody, "validate": validateField(parsedBody)!, insertInTbl(tbl_name, fieldTable, valuesField) {
                                        if((fieldTable.length !== valuesField.length) || fieldTable.length === 0 || valuesField.length === 0) {
                                            throw new Error("O número de campos que serão inseridos, não pode ser diferente do número de valores que serão inseridos!");
                                        }
                                        if(!tbl_name) {
                                            throw new Error("O nome da tabela nao pode estar vazia!");
                                        }

                                        const [field, values] = [fieldTable.toString(), setArray(valuesField).toString()];
                                        connect.execute(`INSERT INTO ${tbl_name}(${field}) VALUES (${values})`, valuesField, (err) => (err ? console.log("Erro ao inserir os dados! "+err) : console.log("Valores inseridos com sucesso!")));
                                    }
                                });

                                return res.end(JSON.stringify({"message": "sucess", 'status': 200}));
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

                                return res.end(JSON.stringify({"message": "sucess", 'status': 200}));
                            });
                        }
                    })
                });
                break;
            default:
                break;
        }
    }

    public put(urls: Array<IPut>, dbConfig?: IDBConfig) {
        const self = this;

        switch (!!dbConfig) {
            case true:
                const connect = this.connectionDB(dbConfig!);

                urls.map((urlParam) => {
                    const {url, changeOnTable} = urlParam;
                    const param = transformURL({"url": url});

                    this.server.on("request", (req, res) => {
                        if(req.url === `/${param}` && req.method === "PUT") {
                            const datas: Array<Buffer> = [];

                            req.on("data", (chunk) => {
                                datas.push(chunk);
                            });
                            req.on("close", () => {
                                const body = Buffer.concat(datas).toString();
                                const parsedBody = qs.parse(body);

                                changeOnTable({"obj_body": parsedBody, "validate": validateField(parsedBody)!, 
                                    changeOn({ tbl_name, columns, values, columnID, id }) {
                                        if((columns.length !== values.length) || columns.length == 0 || values.length === 0) {
                                            throw new Error("O número de campos que serão inseridos, não pode ser diferente do número de valores que serão inseridos!");
                                        }
                                        if(!tbl_name || !columnID || !id ) {
                                            throw new Error("Campos como ['Nome da tabela','coluna de id', 'id'] nao podem estar vazias!");
                                        }
                                        columns.map((column, index) => {
                                            connect.execute(`UPDATE ${tbl_name} SET ${column} = ? WHERE ${columnID} = ? LIMIT 1`, [values[index], id], (err) => {
                                                if(err) throw new Error(`Erro ao atualizar o registro! ${err.stack}`);
                                                self.log("Registro atualizado com sucesso!");
                                                return;
                                            });
                                        });
                                    },
                                    transformKeys(body) {
                                        const keys:Array<string> = Object.keys(body).map((key) => (key));
                                        return keys;
                                    },
                                    transformValues(body) {
                                        const values:Array<string> = Object.values(body).map((value) => (value));
                                        return values;
                                    },
                                });
                                return res.end(JSON.stringify({"message": "sucess", 'status': 200}));
                            });
                        }
                    });
                });
                break;
            case false:
                urls.map((urlParam) => {
                    const {url, changeOnTable} = urlParam;
                    const param = transformURL({"url": url});

                    this.server.on("request", (req, res) => {
                        if(req.url === `/${param}` && req.method === "PUT") {
                            const datas: Array<Buffer> = [];

                            req.on("data", (chunk) => {
                                datas.push(chunk);
                            });
                            req.on("close", () => {
                                const body = Buffer.concat(datas).toString();
                                const parsedBody = qs.parse(body);

                                changeOnTable({"obj_body": parsedBody, "validate": validateField(parsedBody)!, 
                                    changeOn({ tbl_name, columns, values, columnID, id }) {
                                        throw new Error("Não pode usar a função [insertInTbl], sem definir as configurações para conexão com o banco de dados!");
                                    },
                                    transformKeys(body) {
                                        throw new Error("Não pode usar a função [insertInTbl], sem definir as configurações para conexão com o banco de dados!");
                                    },
                                    transformValues(body) {
                                        throw new Error("Não pode usar a função [insertInTbl], sem definir as configurações para conexão com o banco de dados!");
                                    }
                                });
                                return res.end(JSON.stringify({"message": "sucess", 'status': 200}));
                            })
                        }
                    });
                });
                break;
            default:
                break;
        }
    }

    public delete(urls: Array<IDelete>, dbConfig?: IDBConfig) {
        const self = this;

        switch(!!dbConfig) {
            case true:
                const connect = this.connectionDB(dbConfig!);
                urls.map((urlParam) => {
                    const {url, deleteOnTable} = urlParam;
                    const param = transformURL({"url": url});

                    this.server.on("request", (req, res) => {
                        const params = URL.parse(req.url!);
                        const baseParams = transformURL({"url": params.pathname!});
                        
                        if(`/${baseParams}` === `/${param}` && req.method === "DELETE") {
                            deleteOnTable({
                                "obj_body": transformLastParam(params.query!), 
                                deleteOn({ tbl_name, columnID, id }) {
                                    const { del } = Object(transformLastParam(params.query!));
                                    connect.execute(`DELETE FROM ${tbl_name} WHERE ${columnID} = ?`, [id || del], (err) => {
                                        if(err) throw new Error(`Erro ao deletar registro! ${err}`);
                                        self.log(`Registro deletado com sucesso!`);
                                        return;
                                    });
                                }
                            });
                            return res.end(JSON.stringify({"msg": "Registo deletado"}));
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

    public listen(PORT?:number) {
        this.server
            .listen(this.PORT || PORT!, "localhost", 
            () => this.log(`Server is running! At http://localhost:${this.PORT || PORT!}`));
    }

}

export default new Server();