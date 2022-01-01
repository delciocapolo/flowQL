"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const main_server_1 = __importDefault(require("./main.server"));
main_server_1.default.get(["////home/product", "product"]);
// server.get([
//     {"url":"home", "data": {"msg": "Hello world"}},
//     {
//         "url":"product", 
//         "data": {
//             "msg": "Hello world",
//             "usernames": ["Delcio", "Andre", "Capolo"]
//         }
//     }
// ]);
// server.post(
//     [
//         {
//             "url": "/home",
//             params({ obj_body, validate, insertInTbl }) {
//                 const {username, email} = Object(obj_body);
//                 console.log(username);
//             }
//         }
//     ]
// );
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
main_server_1.default.delete([
    {
        'url': 'home/product',
        deleteOnTable({ obj_body, deleteOn }) {
            console.log(obj_body);
            deleteOn({ "tbl_name": "tbl_user", "columnID": "id", "id": 2 });
        }
    }
], { "database": "flowQLDB", "host": "localhost", "password": "#3dvan1a^2+/-D", "user": "root" });
