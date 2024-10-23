import mariadb from 'mariadb';
import secret from './secrets.js';

const pool = mariadb.createPool({
    host: secret.db_server,
    user: secret.db_username,
    password: secret.db_password,
    database: secret.db_database,
    connectionLimit: 5
});


export default pool;

