"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openRoutes = void 0;
const express_1 = __importDefault(require("express"));
const hello_1 = require("./hello");
const message_1 = require("./message");
const openRoutes = express_1.default.Router();
exports.openRoutes = openRoutes;
openRoutes.use('/hello', hello_1.helloRouter);
openRoutes.use('/demoSql', message_1.messageRouter);
//# sourceMappingURL=index.js.map