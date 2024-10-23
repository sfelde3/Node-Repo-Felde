import express from 'express';
import bcrypt from 'bcryptjs';
 
import pool from './db.js';
 
const app = express();
 
// EJS als View-Engine einrichten
app.set('view engine', 'ejs');

// Middleware, um URL-encoded-Daten zu verarbeiten
app.use(express.urlencoded({ extended: true }));

 
// Route mit dynamischem Inhalt
app.get('/', (req, res) => {
  res.render('index', { title: 'Willkommen', message: 'Willkommen bei Ihrem ersten Express-Server!' });
});
 

 
// Weitere Route
app.get('/register', (req, res) => {
  res.render('register', { title: 'Registrierung' });
});
app.get('/about', (req, res) => {
  res.send('Dies ist die About-Seite.');
});
app.get('/contact', (req, res) =>{
    res.send('Kontaktiere mich mal!!!')
}); 
app.post('/register', async (req, res) => {
  console.log(req.body);
  const { username, name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const conn = await pool.getConnection();
 
  try {
    await conn.query('INSERT INTO users (username, name, email, password_hash) VALUES (?, ?, ?, ?)',
      [username, name, email, hashedPassword]);
    res.status(201).redirect('/');
  } catch (err) {
    console.log(err);
    res.status(500).send('Fehler bei der Registrierung');
  } finally {
    conn.release();
  }
});
// Server starten
app.listen(3000, () => {
  console.log('Server läuft auf http://localhost:3000');
});
 