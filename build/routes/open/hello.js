"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.helloRouter = void 0;
// express is the framework we're going to use to handle requests
const express_1 = __importDefault(require("express"));
// retrieve the router object from express
const helloRouter = express_1.default.Router();
exports.helloRouter = helloRouter;
/**
 * @api {get} /hello Request a Hello World message
 * @apiName GetHello
 * @apiGroup Hello
 *
 * @apiSuccess {String} message the String: "Hello, you sent a GET request"
 */
helloRouter.get('/', (request, response) => {
    console.dir(request);
    response.send({
        message: 'Hello, you sent a GET request',
    });
});
/**
 * @api {post} /hello Request a Hello World message
 * @apiName PostHello
 * @apiGroup Hello
 *
 * @apiSuccess {String} message the String: "Hello, you sent a POST request"
 */
helloRouter.post('/', (request, response) => {
    response.send({
        message: 'Hello, you sent a POST request',
    });
});
//# sourceMappingURL=hello.js.map