import { Request } from 'express';

import { JwtPayload } from 'jsonwebtoken';

export interface IJwtRequest extends Request {
    claims?: JwtPayload;
}
