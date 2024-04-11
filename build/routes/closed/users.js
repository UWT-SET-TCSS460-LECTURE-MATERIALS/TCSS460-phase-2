"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRouter = void 0;
//express is the framework we're going to use to handle requests
const express_1 = __importDefault(require("express"));
//Access the connection to Postgress Database
const utilities_1 = require("../../core/utilities");
const middleware_1 = require("../../core/middleware");
const usersRouter = express_1.default.Router();
exports.usersRouter = usersRouter;
const isStringProvided = utilities_1.validationFunctions.isStringProvided;
/**
 * @apiDefine JSONError
 * @apiError (400: JSON Error) {String} message "malformed JSON in parameters"
 */
const rowToUser = (resultRow) => {
    const { account_id, account_role, create_date } = resultRow, user = __rest(resultRow, ["account_id", "account_role", "create_date"]);
    user.id = resultRow.account_id;
    user.createDt = resultRow.create_date;
    user.password = 'nope';
    return user;
};
/**
 * @api {post} /demosql Request to add someone's name to the DB
 * @apiName PostDemoSql
 * @apiGroup DemoSql
 *
 * @apiBody {String} name someone's name *unique
 * @apiBody {String} message a message to store with the name
 *
 * @apiSuccess (Success 201) {boolean} success true when the name is inserted
 * @apiSuccess (Success 201) {String} message the string "Inserted: ***name***" where ***name*** corresponds
 * to the parameter string name.
 *
 * @apiError (400: Name exists) {String} message "Name exists"
 *
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 *
 * @apiUse JSONError
 */
// messageRouter.post(
//     '/',
//     (request: Request, response: Response, next: NextFunction) => {
//         if (
//             isStringProvided(request.body.name) &&
//             isStringProvided(request.body.message)
//         ) {
//             next();
//         } else {
//             response.status(400).send({
//                 message: 'Missing required information',
//             });
//         }
//     },
//     (request: Request, response: Response) => {
//         const theQuery =
//             'INSERT INTO DEMO(Name, Message) VALUES ($1, $2) RETURNING *';
//         const values = [request.body.name, request.body.message];
//         pool.query(theQuery, values)
//             .then((result) => {
//                 // result.rows array are the records returned from the SQL statement.
//                 // An INSERT statement will return a single row, the row that was inserted.
//                 response.status(201).send({
//                     success: true,
//                     message: `[${result.rows[0].name}] says: ${result.rows[0].message}`,
//                 });
//             })
//             .catch((error) => {
//                 // log the error
//                 console.log(error);
//                 if (
//                     error.detail != undefined &&
//                     (error.detail as string).endsWith('already exists.')
//                 ) {
//                     response.status(400).send({
//                         message: 'Name exists',
//                     });
//                 } else {
//                     response.status(400).send({
//                         message: error,
//                     });
//                 }
//             });
//     }
// );
/**
 * @api {get} /demosql/:name Request to get all demo entries in the DB
 * @apiName GetDemoSql
 * @apiGroup DemoSql
 *
 * @apiParam {String} [name] the name to look up. If no name provided, all names are returned
 *
 * @apiSuccess {boolean} success true when the name is inserted
 * @apiSuccess {Object[]} names List of names in the Demo DB
 * @apiSuccess {String} names.name The name
 * @apiSuccess {String} names.message The message associated with the name
 *
 * @apiError (404: Name Not Found) {String} message "Name not found"
 *
 * @apiUse JSONError
 */
usersRouter.get('/users/:id(\\d+)', middleware_1.checkParamsIdToJwtId, (request, response) => {
    const theQuery = 'SELECT * FROM account WHERE account_id = $1';
    utilities_1.pool.query(theQuery, [request.params.id])
        .then((result) => {
        if (result.rowCount > 0) {
            response.send(rowToUser(result.rows[0]));
        }
        else {
            response.status(404).send({
                message: 'User not found',
            });
        }
    })
        .catch((error) => {
        //log the error
        console.log('Error on SELECT');
        console.log(error);
        response.status(400).send({
            error,
        });
    });
});
usersRouter.get('/users/', (request, response) => {
    const theQuery = 'SELECT * FROM account';
    utilities_1.pool.query(theQuery)
        .then((result) => {
        if (result.rowCount > 0) {
            response.send(result.rows.map((row) => rowToUser(row)));
        }
        else {
            response.status(404).send({
                message: 'User not found',
            });
        }
    })
        .catch((error) => {
        //log the error
        console.log('Error on SELECT');
        console.log(error);
        response.status(400).send({
            error,
        });
    });
});
/**
 * @api {put} /demosql Request to replace the message entry in the DB for name
 * @apiName PutDemoSql
 * @apiGroup DemoSql
 *
 * @apiBody {String} name the name entry
 * @apiBody {String} message a message to replace with the associated name
 *
 * @apiSuccess {boolean} success true when the name is inserted
 * @apiSuccess {String} message the string "Updated: ***name***" where ***name*** corresponds
 * to the parameter string name.
 *
 * @apiError (404: Name Not Found) {String} message "Name not found"
 *
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 *
 * @apiUse JSONError
 */
usersRouter.put('/users/details/:id(\\d+)', middleware_1.checkParamsIdToJwtId, (request, response, next) => {
    if (isStringProvided(request.body.firstname) &&
        isStringProvided(request.body.lastname) &&
        isStringProvided(request.body.username) &&
        isStringProvided(request.body.phone) &&
        utilities_1.validationFunctions.isNumberProvided(request.params.id)) {
        next();
    }
    else {
        response.status(400).send({
            message: 'Missing required information',
        });
    }
}, (request, response) => {
    const theQuery = `UPDATE account SET 
                firstname = $1,
                lastname = $2,
                username = $3,
                phone = $4
            WHERE account_id = $5 RETURNING *`;
    const values = [
        request.body.firstname,
        request.body.lastname,
        request.body.username,
        request.body.phone,
        request.body.id,
    ];
    utilities_1.pool.query(theQuery, values)
        .then((result) => {
        if (result.rowCount > 0) {
            response.send(rowToUser(result.rows[0]));
        }
        else {
            response.status(404).send({
                message: 'Name not found',
            });
        }
    })
        .catch((error) => {
        //log the error
        console.log(error);
        response.status(400).send({
            message: error,
        });
    });
});
usersRouter.put('/users/password/:id(\\d+)', middleware_1.checkParamsIdToJwtId, (request, response, next) => {
    if (isStringProvided(request.body.firstname) &&
        isStringProvided(request.body.lastname) &&
        isStringProvided(request.body.username) &&
        isStringProvided(request.body.phone) &&
        utilities_1.validationFunctions.isNumberProvided(request.params.id)) {
        next();
    }
    else {
        response.status(400).send({
            message: 'Missing required information',
        });
    }
}, (request, response) => {
    const theQuery = `UPDATE account SET 
                firstname = $1,
                lastname = $2,
                username = $3,
                phone = $4
            WHERE account_id = $5 RETURNING *`;
    const values = [
        request.body.firstname,
        request.body.lastname,
        request.body.username,
        request.body.phone,
        request.body.id,
    ];
    utilities_1.pool.query(theQuery, values)
        .then((result) => {
        if (result.rowCount > 0) {
            response.send(rowToUser(result.rows[0]));
        }
        else {
            response.status(404).send({
                message: 'Name not found',
            });
        }
    })
        .catch((error) => {
        //log the error
        console.log(error);
        response.status(400).send({
            message: error,
        });
    });
});
/**
 * @api {delete} /demosql/:name Request to remove entry in the DB for name
 * @apiName DeleteDemoSql
 * @apiGroup DemoSql
 *
 * @apiParam {String} name the name entry  to delete
 *
 * @apiSuccess {boolean} success true when the name is delete
 * @apiSuccess {String} message the string "Deleted: ***name***" where ***name*** corresponds
 * to the parameter string name.
 *
 * @apiError (404: Name Not Found) {String} message "Name not found"
 *
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 *
 * @apiUse JSONError
 */
usersRouter.delete('/:name', (request, response) => {
    if (isStringProvided(request.params.name)) {
        const theQuery = 'DELETE FROM Demo  WHERE name = $1 RETURNING *';
        const values = [request.params.name];
        utilities_1.pool.query(theQuery, values)
            .then((result) => {
            if (result.rowCount == 1) {
                response.send({
                    success: true,
                    message: 'Deleted: ' + result.rows[0].name,
                });
            }
            else {
                response.status(404).send({
                    message: 'Name not found',
                });
            }
        })
            .catch((err) => {
            //log the error
            // console.log(err)
            response.status(400).send({
                message: err.detail,
            });
        });
    }
    else {
        response.status(400).send({
            message: 'Missing required information',
        });
    }
});
//# sourceMappingURL=users.js.map