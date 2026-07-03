import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "127.0.0.1",
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "kuwala",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export type DbRow = Record<string, unknown>;

export async function query<T = DbRow>(sql: string, params: unknown[] = []) {
  const [rows] = await pool.execute<mysql.RowDataPacket[] | mysql.RowDataPacket[][]>(sql, params);
  return rows as T[];
}

export async function getConnection() {
  return pool.getConnection();
}

export default pool;
