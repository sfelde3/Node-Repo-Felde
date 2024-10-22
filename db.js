import mariadb from 'mariadb';

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'sf',
    password: '08111981',
    database: 'todo_list',
    connectionLimit: 5
});

export default pool;

