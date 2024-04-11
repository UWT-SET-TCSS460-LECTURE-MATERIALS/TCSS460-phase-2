import express, { Router } from 'express';

import { messageRouter } from './message';

const openRoutes: Router = express.Router();

openRoutes.use('/message', messageRouter);

export { openRoutes };
