import http from "node:http";
import qs from "node:querystring";

import axios, { AxiosError } from "axios";
import {createConnection, Connection, createPool} from "mysql2";
import { config } from "dotenv";
import debug from "debug";

import {IGet,IDBConfig} from "./global/interfaces"

config({"debug": true});


interface IInject extends IGet{
    params: () => void | Array<string>;
}


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

    private checkUnique(arr1: Array<any>, arr2: Array<any>):boolean {
        return arr1.every((value, index) => value === arr2[index]);
    }

    public async post(urls: Array<IInject>, dbConfig?: IDBConfig) {
        if(!dbConfig) {
            urls.map((urlParam) => {
                const {url, data,params} = urlParam;
                const param = this.transformURL({"url": url});

                this.server.on("request", (req, res) => {
                    if(req.url === `/${param}` && req.method === "POST") {
                        const data:Array<Buffer> = [];
                        
                        req.on("data", (chunk) => {
                            data.push(chunk);
                        });

                        req.on("end", () => {
                            const body = Buffer.concat(data).toString();
                            const parsedBody = qs.parse(body);
                            console.log(parsedBody['email']);
                            res.end(JSON.stringify({"msg": parsedBody}));
                        });
                    }
                })
            })
        }
    }

    public listen(PORT?:number) {
        this.server
            .listen(this.PORT || PORT!, "localhost", 
            () => console.log(`Server is running! At http://localhost:${this.PORT || PORT!}`));
    }

}

export default new Server();