//express is the framework we're going to use to handle requests
import express, { NextFunction, Request, Response, Router } from 'express';
//Access the connection to Postgres Database
import { pool, validationFunctions } from '../../core/utilities';

const messageRouter: Router = express.Router();

const isStringProvided = validationFunctions.isStringProvided;

const format = (resultRow) =>
    `{${resultRow.priority}} - [${resultRow.name}] says: ${resultRow.message}`;

function mwValidPriorityQuery(
    request: Request,
    response: Response,
    next: NextFunction
) {
    const priority: string = request.query.priority as string;
    if (
        validationFunctions.isNumberProvided(priority) &&
        parseInt(priority) >= 1 &&
        parseInt(priority) <= 3
    ) {
        next();
    } else {
        console.error('Invalid or missing Priority');
        response.status(400).send({
            message:
                'Invalid or missing Priority - please refer to documentation',
        });
    }
}

function mwValidNameMessageBody(
    request: Request,
    response: Response,
    next: NextFunction
) {
    if (
        isStringProvided(request.body.name) &&
        isStringProvided(request.body.message)
    ) {
        next();
    } else {
        console.error('Missing required information');
        response.status(400).send({
            message:
                'Missing required information - please refer to documentation',
        });
    }
}

/**
 * @apiDefine JSONError
 * @apiError (400: JSON Error) {String} message "malformed JSON in parameters"
 */

/**
 * @api {post} /message Request to add an entry
 *
 * @apiDescription Request to add a message and someone's name to the DB
 *
 * @apiName PostMessage
 * @apiGroup Message
 *
 * @apiBody {string} name someone's name *unique
 * @apiBody {string} message a message to store with the name
 * @apiBody {number} priority a message priority [1-3]
 *
 * @apiSuccess (Success 201) {String} entry the string:
 *      "{<code>priority</code>} - [<code>name</code>] says: <code>message</code>"
 *
 * @apiError (400: Name exists) {String} message "Name exists"
 * @apiError (400: Missing Parameters) {String} message "Missing required information - please refer to documentation"
 * @apiError (400: Invalid Priority) {String} message "Invalid or missing Priority  - please refer to documentation"
 * @apiUse JSONError
 */
messageRouter.post(
    '/',
    mwValidNameMessageBody,
    (request: Request, response: Response, next: NextFunction) => {
        const priority: string = request.body.priority as string;
        if (
            validationFunctions.isNumberProvided(priority) &&
            parseInt(priority) >= 1 &&
            parseInt(priority) <= 3
        ) {
            next();
        } else {
            console.error('Invalid or missing Priority');
            response.status(400).send({
                message:
                    'Invalid or missing Priority - please refer to documentation',
            });
        }
    },
    (request: Request, response: Response) => {
        //We're using placeholders ($1, $2, $3) in the SQL query string to avoid SQL Injection
        //If you want to read more: https://stackoverflow.com/a/8265319
        const theQuery =
            'INSERT INTO DEMO(Name, Message, Priority) VALUES ($1, $2, $3) RETURNING *';
        const values = [
            request.body.name,
            request.body.message,
            request.body.priority,
        ];

        pool.query(theQuery, values)
            .then((result) => {
                // result.rows array are the records returned from the SQL statement.
                // An INSERT statement will return a single row, the row that was inserted.
                response.status(201).send({
                    entry: format(result.rows[0]),
                });
            })
            .catch((error) => {
                if (
                    error.detail != undefined &&
                    (error.detail as string).endsWith('already exists.')
                ) {
                    console.error('Name exists');
                    response.status(400).send({
                        message: 'Name exists',
                    });
                } else {
                    //log the error
                    console.error('DB Query error on POST');
                    console.error(error);
                    response.status(500).send({
                        message: 'server error - contact support',
                    });
                }
            });
    }
);

/**
 * @api {get} /message Request to all retrieve entries
 *
 * @apiDescription Request to retrieve all the entries
 *
 * @apiName GetAllMessages
 * @apiGroup Message
 *
 * @apiSuccess {String[]} entries the aggregate of all entries as the following string:
 *      "{<code>priority</code>} - [<code>name</code>] says: <code>message</code>"
 */
messageRouter.get('/all', (request: Request, response: Response) => {
    const theQuery = 'SELECT name, message, priority FROM Demo';

    pool.query(theQuery)
        .then((result) => {
            response.send({
                entries: result.rows.map(format),
            });
        })
        .catch((error) => {
            //log the error
            console.error('DB Query error on GET all');
            console.error(error);
            response.status(500).send({
                message: 'server error - contact support',
            });
        });
});

/**
 * @api {get} /message Request to retrieve entries
 *
 * @apiDescription Request to retrieve all the entries of <code>priority</code>
 *
 * @apiName GetAllMessagesPri
 * @apiGroup Message
 *
 * @apiQuery {number} priority the priority in which to retrieve all entries
 *
 * @apiSuccess {String[]} entries the aggregate of all entries with <code>priority</code> as the following string:
 *      "{<code>priority</code>} - [<code>name</code>] says: <code>message</code>"
 *
 * @apiError (400: Invalid Priority) {String} message "Invalid or missing Priority  - please refer to documentation"
 * @apiError (404: No messages) {String} message "No Priority <code>priority</code> messages found"
 */
messageRouter.get(
    '/',
    mwValidPriorityQuery,
    (request: Request, response: Response) => {
        const theQuery =
            'SELECT name, message, priority FROM Demo where priority = $1';
        const values = [request.query.priority];

        pool.query(theQuery, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    response.send({
                        entries: result.rows.map(format),
                    });
                } else {
                    response.status(404).send({
                        message: `No Priority ${request.query.priority} messages found`,
                    });
                }
            })
            .catch((error) => {
                //log the error
                console.error('DB Query error on GET by priority');
                console.error(error);
                response.status(500).send({
                    message: 'server error - contact support',
                });
            });
    }
);

/**
 * @api {get} /message/:name Request to retrieve an entry
 *
 * @apiDescription Request to retrieve the complete entry for <code>name</code>.
 * Note this endpoint returns an entry as an object, not a formatted string like the
 * other endpoints.
 *
 * @apiName GetMessageName
 * @apiGroup Message
 *
 * @apiParam {string} name the name to look up.
 *
 * @apiSuccess {Object} entry the message entry object for <code>name</code>
 * @apiSuccess {string} entry.name <code>name</code>
 * @apiSuccess {string} entry.message The message associated with <code>name</code>
 * @apiSuccess {number} entry.priority The priority associated with <code>name</code>
 *
 * @apiError (404: Name Not Found) {string} message "Name not found"
 */
messageRouter.get('/:name', (request: Request, response: Response) => {
    const theQuery = 'SELECT name, message, priority FROM Demo WHERE name = $1';
    let values = [request.params.name];

    pool.query(theQuery, values)
        .then((result) => {
            if (result.rowCount == 1) {
                response.send({
                    entry: result.rows[0],
                });
            } else {
                response.status(404).send({
                    message: 'Name not found',
                });
            }
        })
        .catch((error) => {
            //log the error
            console.error('DB Query error on GET /:name');
            console.error(error);
            response.status(500).send({
                message: 'server error - contact support',
            });
        });
});

/**
 * @api {put} /message Request to change an entry
 *
 * @apiDescription Request to replace the message entry in the DB for name
 *
 * @apiName PutMessage
 * @apiGroup Message
 *
 * @apiBody {String} name the name entry
 * @apiBody {String} message a message to replace with the associated name
 *
 * @apiSuccess {String} entry the string
 *      "Updated: {<code>priority</code>} - [<code>name</code>] says: <code>message</code>"
 *
 * @apiError (404: Name Not Found) {String} message "Name not found"
 * @apiError (400: Missing Parameters) {String} message "Missing required information" *
 * @apiUse JSONError
 */
messageRouter.put(
    '/',
    mwValidNameMessageBody,
    (request: Request, response: Response, next: NextFunction) => {
        const theQuery =
            'UPDATE Demo SET message = $1 WHERE name = $2 RETURNING *';
        const values = [request.body.message, request.body.name];

        pool.query(theQuery, values)
            .then((result) => {
                if (result.rowCount == 1) {
                    response.send({
                        entry: 'Updated: ' + format(result.rows[0]),
                    });
                } else {
                    response.status(404).send({
                        message: 'Name not found',
                    });
                }
            })
            .catch((error) => {
                //log the error
                console.error('DB Query error on PUT');
                console.error(error);
                response.status(500).send({
                    message: 'server error - contact support',
                });
            });
    }
);

/**
 * @api {delete} /message Request to remove entries
 *
 * @apiDescription Request to remove all entries of <code>priority</code>
 *
 * @apiName DeleteMessagesPri
 * @apiGroup Message
 *
 * @apiQuery {number} priority the priority [1-3] to delete all entries
 *
 * @apiSuccess {String[]} entries the aggregate of all deleted entries with <code>priority</code> as the following string:
 *      "{<code>priority</code>} - [<code>name</code>] says: <code>message</code>"
 *
 * @apiError (400: Invalid or missing Priority) {String} message "Invalid or missing Priority - please refer to documentation"
 * @apiError (404: No messages) {String} message "No Priority <code>priority</code> messages found"
 */
messageRouter.delete(
    '/',
    mwValidPriorityQuery,
    (request: Request, response: Response) => {
        const theQuery = 'DELETE FROM Demo  WHERE priority = $1 RETURNING *';
        const values = [request.query.priority];

        pool.query(theQuery, values)
            .then((result) => {
                if (result.rowCount > 0) {
                    response.send({
                        entries: result.rows.map(format),
                    });
                } else {
                    response.status(404).send({
                        message: `No Priority ${request.query.priority} messages found`,
                    });
                }
            })
            .catch((error) => {
                //log the error
                console.error('DB Query error on DELETE by priority');
                console.error(error);
                response.status(500).send({
                    message: 'server error - contact support',
                });
            });
    }
);

/**
 * @api {delete} /message/:name Request to remove an entry
 *
 * @apiDescription Request to remove an entry associated with <code>name</code> in the DB
 *
 * @apiName DeleteMessage
 * @apiGroup Message
 *
 * @apiParam {String} name the name associated with the entry to delete
 *
 * @apiSuccess {String} entry the string
 *      "Deleted: {<code>priority</code>} - [<code>name</code>] says: <code>message</code>"
 *
 * @apiError (404: Name Not Found) {String} message "Name not found"
 */
messageRouter.delete('/:name', (request: Request, response: Response) => {
    const theQuery = 'DELETE FROM Demo  WHERE name = $1 RETURNING *';
    const values = [request.params.name];

    pool.query(theQuery, values)
        .then((result) => {
            if (result.rowCount == 1) {
                response.send({
                    entry: 'Deleted: ' + format(result.rows[0]),
                });
            } else {
                response.status(404).send({
                    message: 'Name not found',
                });
            }
        })
        .catch((error) => {
            //log the error
            console.error('DB Query error on DELETE /:name');
            console.error(error);
            response.status(500).send({
                message: 'server error - contact support',
            });
        });
});

// "return" the router
export { messageRouter };
