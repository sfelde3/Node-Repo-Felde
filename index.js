import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import secrets from './secrets.js';  
import pool from './db.js';
import cookieParser from 'cookie-parser';
 
const app = express();
 
// EJS als View-Engine einrichten
app.set('view engine', 'ejs');

// Middleware, um URL-encoded-Daten zu verarbeiten
app.use(express.urlencoded({ extended: true }));

//Statische route für styles.css
app.use(express.static('public'));

app.use(cookieParser());

 
// Route mit dynamischem Inhalt



// Weitere Route
app.get('/register', (req, res) => {
  res.render('register', { 
    title: 'Registrierung', 
    error: null,
    success: null
});
});
app.get('/about', (req, res) => {
  res.send('Dies ist die About-Seite.');
});
app.get('/login', (req, res) => {
  res.render('login', { 
    title: 'Login', 
    error: null,
    success: null
});
});
app.get('/contact', (req, res) =>{
    res.send('Kontaktiere mich mal!!!')
}); 
app.post('/register', async (req, res) => {
  const { username, name, email, password, confirmPassword } = req.body;

  // Fehlermeldungen initialisieren
  let error = null;
  let success = null;

  // Überprüfen, ob Passwörter übereinstimmen
  if (password !== confirmPassword) {
    error = 'Passwörter stimmen nicht überein.';
    return res.render('register', { title: 'Registrierung', error, success });
  }

  const conn = await pool.getConnection();

  try {
    // Überprüfen, ob der Benutzername bereits existiert
    const existingUser = await conn.query('SELECT * FROM users WHERE username = ?',   
                                                          [username]);
    if (existingUser.length > 0) {
      error = 'Benutzername existiert bereits.';
      return res.render('register', { title: 'Registrierung', error, success });
    }

    // Überprüfen, ob die E-Mail bereits existiert
    const existingEmail = await conn.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingEmail.length > 0) {
      error = 'E-Mail existiert bereits.';
      return res.render('register', { title: 'Registrierung', error, success });
    }

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    // Neuen Benutzer in die Datenbank einfügen
    await conn.query(
      'INSERT INTO users (username, name, email, password_hash) VALUES (?, ?, ?, ?)',
      [username, name, email, hashedPassword]
    );

    // Erfolgsnachricht
    success = 'Erfolgreich registriert!';
    res.render('register', { title: 'Registrierung', error, success });
  } catch (err) {
    console.log(err);
    error = 'Fehler bei der Registrierung.';
    res.render('register', { title: 'Registrierung', error, success });
  } finally {
    conn.release();
  }
});


app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const conn = await pool.getConnection();
  let user;

  try {
      user = await conn.query('SELECT * FROM users WHERE username = ?', [username]);
  } catch (err) {
      console.log(err);
      return res.status(500).render('login', { title: 'Login', error: 'Fehler beim Login'});
  } finally {
    conn.release();
  }

  if (user && user.length === 0) {
    return res.status(404).render('login', { title: 'Login', error: 'Benutzer nicht gefunden.' });
  }

  const isMatch = await bcrypt.compare(password, user[0].password_hash);
  if (!isMatch) {
    return res.status(403).render('login', { title: 'Login', error: 'Falsches Passwort'});
  }
  
  const token = jwt.sign({ username: user[0].username, name: user[0].name, email: user[0].email },
                           secrets.jwt_secret_key,
                           { expiresIn: '1h' });
  res.cookie('token', token, { httpOnly: true }).redirect('/');
});

app.get('/', (req, res) => {
  const token = req.cookies['token'];
  let loggedInUser = false;
  if (token) {
    // Token verifizieren und Benutzerdaten erhalten
    jwt.verify(token, secrets.jwt_secret_key, (err, user) => {
          if (err) {
              // Token ungültig
              console.log(err);
          } else {
              loggedInUser = user;
          }
    });
  }
  //console.log(loggedInUser);
  res.render('index',
      { title: 'Willkommen',
        message: 'Willkommen bei Ihrem ersten Express-Server!',
        user: loggedInUser
      }
  );
});

app.post('/logout', (req, res) => {
  res.clearCookie('token').redirect('/');
});

// Server starten
app.listen(3000, () => {
  console.log('Server läuft auf http://localhost:3000');
});
 