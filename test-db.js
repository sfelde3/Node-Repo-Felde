import pool from './db.js';
try{
    const conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM todos');
    console.log(rows);
    
}finally{
    conn.release();
}