"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = __importDefault(require("express"));
const login_1 = require("./login");
const register_1 = require("./register");
const authRoutes = express_1.default.Router();
exports.authRoutes = authRoutes;
authRoutes.use(login_1.signinRouter, register_1.registerRouter);
//# sourceMappingURL=index.js.map