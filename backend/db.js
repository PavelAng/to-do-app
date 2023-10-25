import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "to-do-app",
  password: "150274wili",
  port: 5432,
});

export const query = (text, params) => pool.query(text, params);
