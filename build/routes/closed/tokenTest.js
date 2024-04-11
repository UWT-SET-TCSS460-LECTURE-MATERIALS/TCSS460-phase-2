"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenTestRouter = void 0;
// express is the framework we're going to use to handle requests
const express_1 = __importDefault(require("express"));
// retrieve the router object from express
const tokenTestRouter = express_1.default.Router();
exports.tokenTestRouter = tokenTestRouter;
/**
 * @api {get} /hello Request a Hello World message
 * @apiName GetHello
 * @apiGroup Hello
 *
 * @apiSuccess {String} message the String: "Hello, you sent a GET request"
 */
tokenTestRouter.get('/', (request, response) => {
    response.send({
        message: `Your token is valid and your role is: ${request.claims.role}`,
    });
});
//# sourceMappingURL=tokenTest.js.map