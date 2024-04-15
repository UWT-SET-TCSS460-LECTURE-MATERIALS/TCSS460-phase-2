// express is the framework we're going to use to handle requests
import express, { Request, Response, Router, NextFunction } from 'express';

import jwt from 'jsonwebtoken';

const key = {
    secret: process.env.JSON_WEB_TOKEN,
};

import {
    pool,
    validationFunctions,
    credentialingFunctions,
} from '../../core/utilities';

const isStringProvided = validationFunctions.isStringProvided;
const isNumberProvided = validationFunctions.isNumberProvided;
const generateHash = credentialingFunctions.generateHash;
const generateSalt = credentialingFunctions.generateSalt;

const registerRouter: Router = express.Router();

export interface IUserRequest extends Request {
    id: number;
}

// Add more/your own password validation here. The *rules* must be documented
// and the client-side validation should match these rules.
const isValidPassword = (password: string): boolean =>
    isStringProvided(password) && password.length > 7;

// Add more/your own phone number validation here. The *rules* must be documented
// and the client-side validation should match these rules.
const isValidPhone = (phone: string): boolean =>
    isStringProvided(phone) && phone.length >= 10;

// Add more/your own role validation here. The *rules* must be documented
// and the client-side validation should match these rules.
const isValidRole = (priority: string): boolean =>
    validationFunctions.isNumberProvided(priority) &&
    parseInt(priority) >= 1 &&
    parseInt(priority) <= 5;

// Add more/your own email validation here. The *rules* must be documented
// and the client-side validation should match these rules.
const isValidEmail = (email: string): boolean =>
    isStringProvided(email) && email.includes('@');

// middleware functions may be defined elsewhere!
const emailMiddlewareCheck = (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    if (isValidEmail(request.body.email)) {
        next();
    } else {
        response.status(400).send({
            message:
                'Invalid or missing email  - please refer to documentation',
        });
    }
};

/**
 * @api {post} /register Request to register a user
 *
 * @apiDescription Document this route. !**Document the password rules here**!
 * !**Document the role rules here**!
 *
 * @apiName PostAuth
 * @apiGroup Auth
 *
 * @apiBody {String} firstname a users first name
 * @apiBody {String} lastname a users last name
 * @apiBody {String} email a users email *unique
 * @apiBody {String} password a users password
 * @apiBody {String} username a username *unique
 * @apiBody {String} role a role for this user [1-5]
 * @apiBody {String} phone a phone number for this user
 *
 * @apiSuccess (Success 201) {string} accessToken a newly created JWT
 * @apiSuccess (Success 201) {number} id unique user id
 *
 * @apiError (400: Missing Parameters) {String} message "Missing required information"
 * @apiError (400: Invalid Password) {String} message "Invalid or missing password  - please refer to documentation"
 * @apiError (400: Invalid Phone) {String} message "Invalid or missing phone number  - please refer to documentation"
 * @apiError (400: Invalid Email) {String} message "Invalid or missing email  - please refer to documentation"
 * @apiError (400: Invalid Role) {String} message "Invalid or missing role  - please refer to documentation"
 * @apiError (400: Username exists) {String} message "Username exists"
 * @apiError (400: Email exists) {String} message "Email exists"
 *
 */
registerRouter.post(
    '/register',
    emailMiddlewareCheck, // these middleware functions may be defined elsewhere!
    (request: Request, response: Response, next: NextFunction) => {
        //Verify that the caller supplied all the parameters
        //In js, empty strings or null values evaluate to false
        if (
            isStringProvided(request.body.firstname) &&
            isStringProvided(request.body.lastname) &&
            isStringProvided(request.body.username)
        ) {
            next();
        } else {
            response.status(400).send({
                message: 'Missing required information',
            });
        }
    },
    (request: Request, response: Response, next: NextFunction) => {
        if (isValidPhone(request.body.phone)) {
            next();
            return;
        } else {
            response.status(400).send({
                message:
                    'Invalid or missing phone number  - please refer to documentation',
            });
            return;
        }
    },
    (request: Request, response: Response, next: NextFunction) => {
        if (isValidPassword(request.body.password)) {
            next();
        } else {
            response.status(400).send({
                message:
                    'Invalid or missing password  - please refer to documentation',
            });
        }
    },
    (request: Request, response: Response, next: NextFunction) => {
        if (isValidRole(request.body.role)) {
            next();
        } else {
            response.status(400).send({
                message:
                    'Invalid or missing role  - please refer to documentation',
            });
        }
    },
    (request: IUserRequest, response: Response, next: NextFunction) => {
        const theQuery =
            'INSERT INTO Account(firstname, lastname, username, email, phone, create_date, account_role) VALUES ($1, $2, $3, $4, $5, NOW(), $6) RETURNING account_id';
        const values = [
            request.body.firstname,
            request.body.lastname,
            request.body.username,
            request.body.email,
            request.body.phone,
            request.body.role,
        ];
        pool.query(theQuery, values)
            .then((result) => {
                //stash the account_id into the request object to be used in the next function
                // NOTE the TYPE for the Request object in this middleware function
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
                } else if (error.constraint == 'account_email_key') {
                    response.status(400).send({
                        message: 'Email exists',
                    });
                } else {
                    //log the error
                    console.error('DB Query error on register');
                    console.error(error);
                    response.status(500).send({
                        message: 'server error - contact support',
                    });
                }
            });
    },
    (request: IUserRequest, response: Response) => {
        //We're storing salted hashes to make our application more secure
        //If you're interested as to what that is, and why we should use it
        //watch this youtube video: https://www.youtube.com/watch?v=8ZtInClXe1Q
        const salt = generateSalt(32);
        const saltedHash = generateHash(request.body.password, salt);

        const theQuery =
            'INSERT INTO Account_Credential(account_id, salted_hash, salt) VALUES ($1, $2, $3)';
        const values = [request.id, saltedHash, salt];
        pool.query(theQuery, values)
            .then(() => {
                const accessToken = jwt.sign(
                    {
                        role: request.body.role,
                        id: request.id,
                    },
                    key.secret,
                    {
                        expiresIn: '14 days', // expires in 14 days
                    }
                );
                //We successfully added the user!
                response.status(201).send({
                    accessToken,
                    id: request.id,
                });
            })
            .catch((error) => {
                /***********************************************************************
                 * If we get an error inserting the PWD, we should go back and remove
                 * the user from the member table. We don't want a member in that table
                 * without a PWD! That implementation is up to you if you want to add
                 * that step.
                 **********************************************************************/

                //log the error
                console.error('DB Query error on register');
                console.error(error);
                response.status(500).send({
                    message: 'server error - contact support',
                });
            });
    }
);

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

export { registerRouter };
