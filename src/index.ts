const passwordDB = "#3dvan1a^2+/-D";

import server from "./main.server";

server.listen(4002);

const configDB = {
    "database": "flowQLDB", 
    "host": "localhost",
    "user": "root",
    "password": passwordDB
}

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

// server.put([
//     {
//         "url": "home",
//         changeOnTable({ obj_body, validate, changeOn, transformKeys, transformValues }) {
//             const keys = transformKeys(obj_body);
//             const valuesBody = transformValues(obj_body);
//             changeOn({"tbl_name": "tbl_user", "columns": keys, "values": valuesBody, "columnID": "id", "id": 2});
//         }
//     }
// ], {"database": "flowQLDB", "host": "localhost", "password": "#3dvan1a^2+/-D", "user": "root"});

// server.delete([
//     {
//         'url': 'home/product', 
//         deleteOnTable({ obj_body, deleteOn }) {
//             console.log(obj_body);
//             deleteOn({"tbl_name": "tbl_user", "columnID": "id", "id": 2});
//         }
//     }
// ], {"database": "flowQLDB", "host": "localhost", "password": "#3dvan1a^2+/-D", "user": "root"});



// -----------------------------------

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