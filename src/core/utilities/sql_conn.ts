// Obtain a Pool of DB connections.
import { Pool, PoolConfig } from 'pg';

const pgConfig: PoolConfig =
    process.env.PGHOST !== undefined
        ? {
              host: process.env.PGHOST,
              port: parseInt(process.env.PGPORT),
              user: process.env.PGUSER,
              database: process.env.PGDATABASE,
              password: process.env.PGPASSWORD,
          }
        : {
              connectionString: process.env.DATABASE_URL,
              ssl: {
                  rejectUnauthorized: false,
              },
          };

const pool = new Pool(pgConfig);

export { pool };
