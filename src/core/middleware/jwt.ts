import jwt, { JwtPayload } from 'jsonwebtoken';
import { Response, NextFunction } from 'express';

import { IJwtRequest } from '../models/JwtRequest.model';

const config = {
    secret: process.env.JSON_WEB_TOKEN,
};

export const checkToken = (
    request: IJwtRequest,
    response: Response,
    next: NextFunction
) => {
    let token: string =
        (request.headers['x-access-token'] as string) ||
        (request.headers['authorization'] as string); // Express headers are auto converted to lowercase

    if (token != undefined) {
        if (token.startsWith('Bearer ')) {
            // Remove Bearer from string
            token = token.slice(7, token.length);
        }

        jwt.verify(token, config.secret, (error, decoded: JwtPayload) => {
            if (error) {
                response.status(403).json({
                    success: false,
                    message: 'Token is not valid',
                });
            } else {
                request.claims = decoded;
                next();
            }
        });
    } else {
        response.status(401).json({
            success: false,
            message: 'Auth token is not supplied',
        });
    }
};
