import http from "node:http";
import qs from "node:querystring";

import axios, { AxiosError } from "axios";
import {createConnection, Connection, createPool} from "mysql2";
import { config } from "dotenv";
import debug from "debug";

import {IGet,IDBConfig} from "./global/interfaces"

config({"debug": true});


interface IInject extends IGet{
    params({ obj_body, validate, insertInTbl }:IDefineDBParms): void;
}

interface IDefineDBParms {
    obj_body?: object;
    validate?: boolean;
    insertInTbl?(tbl_name: string, fieldTable: Array<string>, valuesField: Array<string>): void;
}

interface IDefineDBGeneric {
    arr: Array<any>;
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
        this.PORT = Number(process.env.PORT);
        this.log = debug("api:main");

        // Inicializar metodo
        this.listen();
    }

    protected configServer(req:http.IncomingMessage, res:http.ServerResponse) {
        res.writeHead(200, {"Content-Type": "application/json"});
        // res.writeHead(200, {"Content-Security-Policy:": "*"});
        res.writeHead(200, {"Cross-Allow-Origin": "*"});
    }

    /**
     * 
     * @param arr `function | method`
     * @param typeData `typedata variable`
     * @returns boolean
     */
    private checkObjects(arr: Array<any>, typeData: string):boolean {
        return arr.every((pred) => typeof pred === typeData);
            // (arr[0] as string) : arr.every((pred) => typeof pred === "object") ? (arr[0] as object) : (arr[0] as never)
    }
    
    private transformURL({url}:IGet):string {
        let indent:string = "";
        for(let i of url) {
            if(i !== "/") {
                indent += i;
            }
        }
        return indent;
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
        if(!this.checkObjects(urls, "string") && !this.checkObjects(urls, "object")) {
            throw new Error("Error => O tipo da condicao, nao coencide");
        }
        if(this.checkObjects(urls, "string")) {
            urls.map((url) => {
                const tempURL = String(url);
                const param = this.transformURL({"url": tempURL});
                
                this.server.on("request", (req, res) => {
                    if(req.url === `/${param}` && req.method === "GET") {
                        res.end(JSON.stringify({"message": `Rota ${param} definida`}));
                    }
                });

            });
        } 
        else if(this.checkObjects(urls, "object")) {
            urls!.map((urlParam) => {
                const {url, data} = Object(urlParam);
                const param = this.transformURL({"url": url});
                
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

    private validateLengthArrays(arr1: Array<any>, arr2: Array<any>):boolean {
        return arr1.every((value, index) => value === arr2[index]);
    }

    private validateField(list: object | Array<any>) {
        if(typeof list === "object") {
            return Object.values(list).every((value) => (!!String(value).trim()))
        } else if(Array.isArray(list)){
            return Array(list).every((value) => (!!String(value).trim()));
        }
    }

    public async post(urls: Array<IInject>, dbConfig?: IDBConfig) {
        switch (!!dbConfig) {
            case true:
                const connect = this.connectionDB(dbConfig!);

                urls.map((urlParam) => {
                    const {url, data, params} = urlParam;
                    const param = this.transformURL({"url": url});

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

                                params({"obj_body": parsedBody, "validate": this.validateField(parsedBody)!, insertInTbl(tbl_name, fieldTable, valuesField) {
                                        if(fieldTable.length !== valuesField.length) {
                                            throw new Error("O numero de campos que serao inseridos, nao pode ser diferente do numero de valores que serao inseridos");
                                        }
                                        const [field, values] = [fieldTable.toString(), setArray(valuesField).toString()]
                                        connect.execute(`INSERT INTO ${tbl_name}(${field}) VALUES (${values})`, valuesField, (err) => (err ? console.log("Erro ao inserir os dados! "+err) : console.log("Valores inseridos com sucesso")));
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