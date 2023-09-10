import http from "node:http";
import qs from "node:querystring";
import URL from "node:url";

import {createConnection, Connection} from "mysql2";
import debug from "debug";

import { 
    IGet, 
    IDBConfig, 
    IInject,
    IPut,
    IDelete
} from "./global/interfaces";

import { 
    checkObjects, 
    validateField, 
    transformURL, 
    setArray, 
    transformLastParam
} from "./service/transformers";

import { DatabaseError,ErrorLength, InvalidTypes } from "./errors";


class Server {
    public readonly server: http.Server;
    protected log: debug.Debugger;
    protected msgDBError: { message: string, action: string };
    protected msgErrorLength: { message: string, action: string };

    constructor() {
        this.server = new http.Server(this.configServer);
        this.log = debug("api:main");
        this.msgDBError = {
            message: "CONEXAO COM BANCO DE DADOS [NAO] REALIZADA!",
            action: "VERIFIQUE OS VALORES DEFINIDOS PARA CONEXAO COM BANCO DE DADOS ou SE O SERVIDOR [MYSQL] ESTÁ RODANDO"
        };
        this.msgErrorLength = {
            message: "O NÚMERO DE CAMPOS QUE SERÃO INSERIDOS, NÃO PODE SER DIFERENTE DO NÚMERO DE VALORES QUE SERÃO INSERIDOS",
            action: "DEFINA O MESMO NÚMERO DE VALORES NO ARRAY DO OBJECTO(COLUNA DA TABELA DO BANCO DE DADOS) E NO ARRAY DO OBJECTO VALUES(VALORES PARA A TABELA QUE SERÃO INSERIDOS OS VALORES)"
        }
    }

    protected configServer(req:http.IncomingMessage, res:http.ServerResponse) {
        res.writeHead(200, {"Content-Type": "application/json"});
        res.writeHead(200, {"Cross-Allow-Origin": "*"});
    }

    /**
     * 
     * @param params ({`database`, `host`, `password`, `user`})
     * @returns `Connection`
     * This function create a connection with Database set
     */
    private connectionDB({database,host,password,user}: IDBConfig): Connection {
        const connection = createConnection({"database": database, "host": host, "password": password, user: user});

        connection.connect((err) => {
            if(err) throw new Error(err.message);
            return;
        })

        return connection;
    }
    
    /**
     * 
     * @param urls [ { "`url`": "route name", "`data`": {"`message`": "return data"} } ] | ["`route1`","`rout2`",...]
     * If you define as `Object Array`, then, you must to define url and data(return data). Otherwise, you must to define as `String Array`
     * and the return will be default(a message, to show that the riute is set).
     */
    public get(urls: Array<IGet> | Array<string>) {
        if(!checkObjects(urls, "string") && !checkObjects(urls, "object")) {
            throw new InvalidTypes({"message": "OS TIPOS DE DADOS INSERIDOS NA CONDIÇÃO NÃO COENCIDEM", "action": "INSIRA VALORES VÁLIDOS"});
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
                        if(!!data) {
                            return res.end(JSON.stringify(data));
                        }
                        return res.end(JSON.stringify({"message": `Rota ${param} definida`}));
                    }
                });
            })
        }
    }

    /**
     * 
     * @param urls [ { "`url`": "route name", params({ obj_body, validate, insertOnTable }) { // code to manipulate the body request and others } } ]
     * @param dbConfig ({ database,host,password,user }) params to create connection to Database
     * 
     */
    public post(urls: Array<IInject>, dbConfig?: IDBConfig) {
        const self = this;
        
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

                                params({"obj_body": parsedBody, "validate": validateField(parsedBody)!, insertOnTable(tbl_name, fieldTable, valuesField) {
                                        if((fieldTable.length !== valuesField.length) || fieldTable.length === 0 || valuesField.length === 0) {
                                            throw new ErrorLength({"message": self.msgErrorLength["message"], "action": self.msgErrorLength["action"]});
                                        }
                                        if(!tbl_name) {
                                            throw new Error("CAMPOS COMO [tbl_name, fieldTable, valuesField] ");
                                        }

                                        const [field, values] = [fieldTable.toString(), setArray(valuesField).toString()];
                                        connect.execute(`INSERT INTO ${tbl_name}(${field}) VALUES (${values})`, valuesField, (err) => {
                                            if(err) {
                                                throw new Error(`ERRO AO INSERIR REGISTO: ${err.stack}`);
                                            }
                                            self.log("REGISTO INSERIDO COM SUCESSO");
                                            return res.end(JSON.stringify({"message": "sucess", 'status': 200}));
                                        });
                                    }
                                });

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

                                params({"obj_body": parsedBody, "validate": validateField(parsedBody)!, insertOnTable(tbl_name, fieldTable, valuesField) {
                                    throw new DatabaseError({"message": self.msgDBError["message"], "action": self.msgDBError["action"]});
                                    }
                                });

                                return res.end();
                            });
                        }
                    })
                });
                break;
            default:
                break;
        }
    }

    /**
     * 
     * @param urls [ { "`url`": "route name", params({ obj_body, validate, changeOn, transformKeys, transformValues }) { // code to manipulate the body request and others } } ]
     * @param dbConfig ({ database,host,password,user }) params to create connection to Database
     * 
     */
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
                                            throw new ErrorLength({"message": self.msgErrorLength["message"], "action": self.msgErrorLength["action"]});
                                        }
                                        if(!tbl_name || !columnID || !id ) {
                                            throw new Error("CAMPOS COMO ['Nome da tabela','coluna de id', 'id'] NÃO PODEM ESTAR VAZIOS");
                                        }
                                        columns.map((column, index) => {
                                            connect.execute(`UPDATE ${tbl_name} SET ${column} = ? WHERE ${columnID} = ? LIMIT 1`, [values[index], id], (err) => {
                                                if(err) throw new Error(`[ERRO AO ATUALIZAR REGISTO]: ${err.stack}`);
                                                self.log("REGISTO ATUALIZADO COM SUCESSO");
                                                return res.end(JSON.stringify({"message": "sucess", 'status': 200}));
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
                                        throw new DatabaseError({"message": self.msgDBError["message"], "action": self.msgDBError["action"]});
                                    },
                                    transformKeys(body) {
                                        throw new DatabaseError({"message": self.msgDBError["message"], "action": self.msgDBError["action"]});
                                    },
                                    transformValues(body) {
                                        throw new DatabaseError({"message": self.msgDBError["message"], "action": self.msgDBError["action"]});
                                    }
                                });
                                return res.end();
                            })
                        }
                    });
                });
                break;
            default:
                break;
        }
    }

    /**
     * 
     * @param urls [ { "`url`": "route name", params({ obj_body:object, deleteOn({"tbl_name": "table name", "columnID": "id column", "id": 2}): void }) { // code to manipulate the body request and others } } ]
     * @param dbConfig ({ database,host,password,user }) params to create connection to Database
     * 
     */
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
                                    if(!tbl_name || !columnID || !id) {
                                        throw new Error("CAMPOS COMO [tbl_name, columnId, id] NÃO PODEM ESTAR VAZIOS!");
                                    }
                                    
                                    const { del } = Object(transformLastParam(params.query!));

                                    connect.execute(`DELETE FROM ${tbl_name} WHERE ${columnID} = ?`, [id || del], (err) => {
                                        if(err) throw new Error(`ERRO AO DELETAR REGISTO!! ${err}`);
                                        self.log(`REGISTO DELETADO COM SUCESSO!`);
                                        return res.end(JSON.stringify({"message": "REGISTO DELETADO COM SUCESSO"}));
                                    });
                                }
                            });
                        }
                    });
                });
                break;
            case false:
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
                                    throw new DatabaseError({"message": self.msgDBError["message"], "action": self.msgDBError["action"]});
                                }
                            });
                            return res.end();
                        }
                    });
                });
                break;
            default:
                break;
        }
    }
    /**
     * @param port (port: number) set the PORT to server listen
     */
    public listen(port:number) {
        this.server
            .listen(port, "localhost", 
            () => this.log(`SERVIDOR ESTÁ RODANDO NA PORTA: http://localhost:${port}`));
    }

}

export default new Server();