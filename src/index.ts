import server from "./main.server";

server.listen(4002);

// Variavel de configuracao do banco de dados
const configDB = {
    "database": "crie um banco de dados(flowQL)", 
    "host": "adicione o seu host(padrão, localhost)",
    "user": "tipo de usuário(padrão, root)",
    "password": "informe a sua password"
};

// O banco de dados, dev conter uma tabela, tbl_user, com os campos, (id, username, email);

// Metodo (get), corresponde ao verbo http GET
server.get(["////home/product", "product"]);

server.get(['home/user/discover','/product/category/desk']);

server.get([
    {"url":"home", "data": {"msg": "Hello world"}},
    {
        "url":"product", 
        "data": {
            "msg": "All for sales",
            "usernames": ["Banana", "Apple", "Orange"]
        }
    }
]);

// Metodo (post), corresponde ao verbo http POST
server.post(
    [
        {
            "url": "/user",
            params({ obj_body, validate, insertOnTable }) {
                const { username, email } = Object(obj_body);
                if(validate) {
                    insertOnTable("tbl_user", ["username","email"], [username, email]);
                }
            }
        }
    ], 
    configDB
);

// Metodo (put), corresponde ao verbo http PUT
server.put(
    [
        {
            "url": "user",
            changeOnTable({ obj_body, validate, changeOn, transformKeys, transformValues }) {
                const keys = transformKeys(obj_body);
                const values = transformValues(obj_body);

                if(validate) {
                    changeOn({
                        "tbl_name": "tbl_user", 
                        "columnID": "id", 
                        "columns": keys, 
                        "values": values, 
                        "id": 1
                    });
                }
            },
        }
    ],
    configDB
);

// Metodo (delete), corresponde ao verbo http DELETE
server.delete(
    [
        {
            "url": "/user",
            deleteOnTable({ obj_body, deleteOn }) {
                const { del } = Object(obj_body);
                deleteOn({"tbl_name": "tbl_user", "columnID": "id", "id": del});
            },
        }
    ],
    configDB
);