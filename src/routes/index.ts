import express, { Router } from 'express';

import { openRoutes } from './open';
import { authRoutes } from './auth';
import { closedRoutes } from './closed';

const routes: Router = express.Router();

routes.use(openRoutes);
routes.use(authRoutes);
routes.use(closedRoutes);

export { routes };
