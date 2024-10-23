import pool from './db.js';
import {createServer} from 'http';

async function getTodos(res){
    let conn;
    try{
        conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM todos');
    console.log(rows);
    res.writeHead(200, {'Content-Type' : 'application/json'})
    res.end(JSON.stringify(rows));
    }catch(err){
        console.error(err);
        res.writeHead(500, {'Content-Type' : 'text/plain'})
    }finally{
        if(conn != undefined){
            conn.release();
        }
        
    }
   
}
const server = createServer((req, res) =>{
    getTodos(res);
});
server.listen(3000, '0.0.0.0', () =>{
    console.log('Server lauft on PORT 3000');
});