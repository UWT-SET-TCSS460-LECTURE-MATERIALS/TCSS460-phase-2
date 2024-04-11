"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closedRoutes = void 0;
const express_1 = __importDefault(require("express"));
const middleware_1 = require("../../core/middleware");
const tokenTest_1 = require("./tokenTest");
const users_1 = require("./users");
const closedRoutes = express_1.default.Router();
exports.closedRoutes = closedRoutes;
closedRoutes.use(middleware_1.checkToken);
closedRoutes.use('/jwt_test', tokenTest_1.tokenTestRouter);
closedRoutes.use('/', users_1.usersRouter);
//# sourceMappingURL=index.js.map