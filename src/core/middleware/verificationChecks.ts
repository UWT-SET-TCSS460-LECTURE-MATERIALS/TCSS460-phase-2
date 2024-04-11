import { NextFunction, Response } from 'express';
import { IJwtRequest } from '../models/JwtRequest.model';

export const checkParamsIdToJwtId = (
    request: IJwtRequest,
    response: Response,
    next: NextFunction
) => {
    if (request.params.id !== request.claims.id) {
        response.status(400).send({
            message: 'Credentials do not match for this user.',
        });
    }
    next();
};
