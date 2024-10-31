import express, { Router } from 'express';

import { checkToken } from '../../core/middleware';
import { tokenTestRouter } from './tokenTest';
import { messageRouter } from './closed_message';

const closedRoutes: Router = express.Router();

closedRoutes.use('/jwt_test', checkToken, tokenTestRouter);

closedRoutes.use('/c/message', checkToken, messageRouter);

export { closedRoutes };
