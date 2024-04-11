"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
// Obtain a Pool of DB connections.
const pg_1 = require("pg");
const pgConfig = process.env.PGHOST !== undefined
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
console.dir(pgConfig);
const pool = new pg_1.Pool(pgConfig);
exports.pool = pool;
//# sourceMappingURL=sql_conn.js.map