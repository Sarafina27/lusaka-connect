import "server-only";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST!,
  port: Number(process.env.MYSQL_PORT!),
  user: process.env.MYSQL_USER!,
  password: process.env.MYSQL_PASSWORD!,
  database: process.env.MYSQL_DATABASE!,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;

export async function query<T = mysql.RowDataPacket[]>(
  sql: string,
  params: unknown[] = []
): Promise<T> {
  const [rows] = await pool.execute(sql, params);
  return rows as T;
}