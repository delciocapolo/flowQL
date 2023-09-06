import server from "./main.server";

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

server.post(
    [
        {
            "url": "/home",
            params({ obj_body, validate, insertInTbl }) {
                const {username, email} = Object(obj_body);
            },
        }
    ]
);
