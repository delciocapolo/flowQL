"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const main_server_1 = __importDefault(require("./main.server"));
// server.get(["home", "product"]);
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
main_server_1.default.post([
    {
        "url": "/home",
        params({ obj_body, validate, insertInTbl }) {
            const { username, email } = Object(obj_body);
            // insertInTbl("tbl_user", ["username","email"],[username,email]);
        },
    }
]);
