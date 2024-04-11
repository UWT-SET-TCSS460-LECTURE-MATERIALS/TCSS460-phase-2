"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config = {
    secret: process.env.JSON_WEB_TOKEN,
};
const checkToken = (request, response, next) => {
    let token = request.headers['x-access-token'] ||
        request.headers['authorization']; // Express headers are auto converted to lowercase
    if (token != undefined) {
        if (token.startsWith('Bearer ')) {
            // Remove Bearer from string
            token = token.slice(7, token.length);
        }
        jsonwebtoken_1.default.verify(token, config.secret, (err, decoded) => {
            if (err) {
                return response.status(403).json({
                    success: false,
                    message: 'Token is not valid',
                });
            }
            else {
                request.claims = decoded;
                next();
            }
        });
    }
    else {
        return response.status(401).json({
            success: false,
            message: 'Auth token is not supplied',
        });
    }
};
exports.checkToken = checkToken;
//# sourceMappingURL=jwt.js.map