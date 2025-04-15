// express is the framework we're going to use to handle requests
import express, { Request, Response, Router } from 'express';
import { IJwtRequest } from '../../core/models';

// retrieve the router object from express
const tokenTestRouter: Router = express.Router();

/**
 * @api {get} /jwt_test Test token authenticator
 * @apiName JWT Test
 * @apiGroup JWT Test
 *
 * @apiHeader {String} Authorization The string "Bearer " + a valid JSON Web Token (JWT).
 *
 * @apiSuccess {String} message  the string
 *  "Your token is valid and your role is: <code>role</code>"
 *
 * @apiError (403: Token is not valid) {String} message "Token is not valid" when the provided Auth token is
 * invalid for any reason.
 * @apiError (401: Auth token is not supplied) {String} message "Auth token is not supplied" when no Auth token
 * is provided
 */
tokenTestRouter.get('/', (request: IJwtRequest, response: Response) => {
    response.send({
        message: `Your token is valid and your role is: ${request.claims.role}`,
    });
});

export { tokenTestRouter };
