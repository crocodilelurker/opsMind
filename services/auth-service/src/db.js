import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.warn("[auth-service] WARNING: DATABASE_URL is not defined in the environment variables.");
}

const pool = new Pool({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 5000,
    query_timeout: 10000
});

pool.on("connect", () => {
    console.log(`[auth-service] Pg Database Client connected to pool`);
});

pool.on("error", (err) => {
    console.error(`[auth-service] Unexpected PG pool error:`, err);
});

export const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log(`[auth-service] Database query executed:`, {
            duration: `${duration}ms`,
            rowsCount: res.rowCount
        });
        return res;
    } catch (err) {
        const duration = Date.now() - start;
        console.error(`[auth-service] Database query error after ${duration}ms:`, {
            error: err.message
        });
        throw err;
    }
};