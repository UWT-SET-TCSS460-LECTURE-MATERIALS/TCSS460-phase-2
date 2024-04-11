"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signinRouter = void 0;
// express is the framework we're going to use to handle requests
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// import dotenv from 'dotenv';
// dotenv.config();
const utilities_1 = require("../../core/utilities");
const isStringProvided = utilities_1.validationFunctions.isStringProvided;
const generateHash = utilities_1.credentialingFunctions.generateHash;
const signinRouter = express_1.default.Router();
exports.signinRouter = signinRouter;
const key = {
    secret: process.env.JSON_WEB_TOKEN,
};
/**
 * @api {get} /auth Request to sign a user in the system
 * @apiName GetAuth
 * @apiGroup Auth
 *
 * @apiHeader {String} authorization "username:password" uses Basic Auth
 *
 * @apiSuccess {boolean} success true when the name is found and password matches
 * @apiSuccess {String} message "Authentication successful!"
 * @apiSuccess {String} token JSON Web Token
 *
 *  * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Authentication successful!",
 *       "token": "eyJhbGciO...abc123"
 *     }
 *
 * @apiError (400: Missing Authorization Header) {String} message "Missing Authorization Header"
 *
 * @apiError (400: Malformed Authorization Header) {String} message "Malformed Authorization Header"
 *
 * @apiError (404: User Not Found) {String} message "User not found"
 *
 * @apiError (400: Invalid Credentials) {String} message "Credentials did not match"
 *
 */
signinRouter.post('/login', (request, response, next) => {
    // obtain auth credentials from HTTP Header
    if (isStringProvided(request.body.email) &&
        isStringProvided(request.body.password)) {
        next();
    }
    else {
        response.status(400).send({
            message: 'Missing required information',
        });
    }
}, (request, response) => {
    const theQuery = `SELECT salted_hash, salt, Account_Credential.account_id, account.email, account.firstname, account.lastname, account.phone, account.username, account.account_role, account.create_date FROM Account_Credential
                      INNER JOIN Account ON
                      Account_Credential.account_id=Account.account_id 
                      WHERE Account.email=$1`;
    const values = [request.body.email];
    utilities_1.pool.query(theQuery, values)
        .then((result) => {
        if (result.rowCount == 0) {
            response.status(404).send({
                message: 'User not found',
            });
            return;
        }
        //Retrieve the salt used to create the salted-hash provided from the DB
        const salt = result.rows[0].salt;
        //Retrieve the salted-hash password provided from the DB
        const storedSaltedHash = result.rows[0].salted_hash;
        //Generate a hash based on the stored salt and the provided password
        const providedSaltedHash = generateHash(request.body.password, salt);
        //Did our salted hash match their salted hash?
        if (storedSaltedHash === providedSaltedHash) {
            //credentials match. get a new JWT
            const accessToken = jsonwebtoken_1.default.sign({
                role: result.rows[0].account_role,
                id: result.rows[0].account_id,
            }, key.secret, {
                expiresIn: '14 days', // expires in 14 days
            });
            //package and send the results
            response.json({
                accessToken,
                user: {
                    firstname: result.rows[0].firstname,
                    lastname: result.rows[0].lastname,
                    username: result.rows[0].username,
                    email: result.rows[0].email,
                    phone: result.rows[0].phone,
                    id: result.rows[0].account_id,
                    createDt: result.rows[0].create_date,
                },
            });
        }
        else {
            //credentials dod not match
            response.status(400).send({
                message: 'Credentials did not match',
            });
        }
    })
        .catch((err) => {
        //log the error
        console.log(err);
        response.status(400).send({
            message: err.detail,
        });
    });
});
//# sourceMappingURL=login.js.map