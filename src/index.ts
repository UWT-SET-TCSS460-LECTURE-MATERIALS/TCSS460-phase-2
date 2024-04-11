import express, { Express, Request, Response } from 'express';

import cors from 'cors';

import { routes } from './routes';

const app: Express = express();

const PORT: number = parseInt(process.env.PORT) || 4001;

app.use(cors());

/*
 * This middleware function parses JSON in the body of POST requests
 */
app.use(express.json());

app.use(routes);

app.get('/', (request: Request, response: Response) => {
    response.send('<h1>Hello World!</h1>');
});

app.listen(PORT, () => {
    return console.log(`Express is listening at http://localhost:${PORT}`);
});
