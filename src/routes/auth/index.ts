import express, { Router } from 'express';

import { signinRouter } from './login';
import { registerRouter } from './register';

const authRoutes: Router = express.Router();

authRoutes.use(signinRouter, registerRouter);

export { authRoutes };
