"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRouter = void 0;
// express is the framework we're going to use to handle requests
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// import dotenv from 'dotenv';
// dotenv.config();
const key = {
    secret: process.env.JSON_WEB_TOKEN,
};
const utilities_1 = require("../../core/utilities");
const isStringProvided = utilities_1.validationFunctions.isStringProvided;
const generateHash = utilities_1.credentialingFunctions.generateHash;
const generateSalt = utilities_1.credentialingFunctions.generateSalt;
const registerRouter = express_1.default.Router();
exports.registerRouter = registerRouter;
/**
 * @api {post} /auth Request to register a user
 * @apiName PostAuth
 * @apiGroup Auth
 *
 * @apiBody {String} first a users first name
 * @apiBody {String} last a users last name
 * @apiBody {String} email a users email *unique
 * @apiBody {String} password a users password
 * @apiBody {String} [username] a username *unique, if none provided, email will be used
 *
 * @apiParamExample {json} Request-Body-Example:
 *  {
 *      "first":"Charles",
 *      "last":"Bryan",
 *      "email":"cfb3@fake.email",
 *      "password":"test12345"
 *  }
 *
 * @apiSuccess (Success 201) {boolean} success true when the name is inserted
 * @apiSuccess (Success 201) {String} email the email of the user inserted
 *
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 *
 * @apiError (400: Username exists) {String} message "Username exists"
 *
 * @apiError (400: Email exists) {String} message "Email exists"
 *
 */
registerRouter.post('/register', (request, response, next) => {
    //Verify that the caller supplied all the parameters
    //In js, empty strings or null values evaluate to false
    if (isStringProvided(request.body.firstname) &&
        isStringProvided(request.body.lastname) &&
        isStringProvided(request.body.username) &&
        isStringProvided(request.body.email) &&
        isStringProvided(request.body.phone) &&
        isStringProvided(request.body.password)) {
        next();
    }
    else {
        response.status(400).send({
            message: 'Missing required information',
        });
    }
}, (request, response, next) => {
    //We're using placeholders ($1, $2, $3) in the SQL query string to avoid SQL Injection
    //If you want to read more: https://stackoverflow.com/a/8265319
    request.role = Math.floor(Math.random() * 3);
    const theQuery = 'INSERT INTO Account(firstname, lastname, username, email, phone, create_date, account_role) VALUES ($1, $2, $3, $4, $5, NOW(), $6) RETURNING account_id';
    const values = [
        request.body.firstname,
        request.body.lastname,
        request.body.username,
        request.body.email,
        request.body.phone,
        request.role,
    ];
    utilities_1.pool.query(theQuery, values)
        .then((result) => {
        //stash the memberid into the request object to be used in the next function
        request.id = result.rows[0].account_id;
        next();
    })
        .catch((error) => {
        //log the error
        // console.log(error)
        if (error.constraint == 'account_username_key') {
            response.status(400).send({
                message: 'Username exists',
            });
        }
        else if (error.constraint == 'account_email_key') {
            response.status(400).send({
                message: 'Email exists',
            });
        }
        else {
            console.log(error);
            response.status(400).send({
                message: 'other error on insert account, see detail',
                detail: error.detail,
            });
        }
    });
}, (request, response) => {
    //We're storing salted hashes to make our application more secure
    //If you're interested as to what that is, and why we should use it
    //watch this youtube video: https://www.youtube.com/watch?v=8ZtInClXe1Q
    const salt = generateSalt(32);
    const saltedHash = generateHash(request.body.password, salt);
    const theQuery = 'INSERT INTO Account_Credential(account_id, salted_hash, salt) VALUES ($1, $2, $3)';
    const values = [request.id, saltedHash, salt];
    utilities_1.pool.query(theQuery, values)
        .then(() => {
        const accessToken = jsonwebtoken_1.default.sign({
            role: request.role,
            id: request.id,
        }, key.secret, {
            expiresIn: '14 days', // expires in 14 days
        });
        //We successfully added the user!
        response.status(201).send({
            accessToken,
            user: {
                firstname: request.body.firstname,
                lastname: request.body.lastname,
                username: request.body.username,
                email: request.body.email,
                phone: request.body.phone,
                id: request.id,
                createDt: new Date().getTime(),
            },
        });
    })
        .catch((error) => {
        //log the error for debugging
        // console.log("PWD insert")
        console.log(error);
        /***********************************************************************
         * If we get an error inserting the PWD, we should go back and remove
         * the user from the member table. We don't want a member in that table
         * without a PWD! That implementation is up to you if you want to add
         * that step.
         **********************************************************************/
        response.status(400).send({
            message: 'other error on insert pwd, see detail',
            detail: error.detail,
        });
    });
});
registerRouter.get('/hash_demo', (request, response) => {
    const password = 'password12345';
    const salt = generateSalt(32);
    const saltedHash = generateHash(password, salt);
    const unsaltedHash = generateHash(password, '');
    response.status(200).send({
        salt: salt,
        salted_hash: saltedHash,
        unsalted_hash: unsaltedHash,
    });
});
//# sourceMappingURL=register.js.map