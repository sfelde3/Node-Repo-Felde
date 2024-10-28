import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import pool from '../db.js';
import secrets from '../secrets.js';

const router = express.Router();

router.get('/register', (req, res) => {
    res.render('register', { title: 'Registrierung' });
});

router.post('/register', async (req, res) => {
    const { username, name, email, password, password_check } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // check password
    if (password !== password_check) {
        return res.status(400).render('register',
            { title: 'Registrierung', error: 'Die Passwörter stimmen nicht überein.',
            username: username, name: name, email: email}
        );
    }

    const conn = await pool.getConnection();
    try {
        // check unique username
        let rows = await conn.query("SELECT COUNT(*) AS userCount FROM users WHERE username = ?", username);
        if (rows[0].userCount > 0) {
            return res.status(400).render('register',
                { title: 'Registrierung', error: `Der Benutzername "${username}" existiert bereits.`,
                username: username, name: name, email: email}
            );
        }

        // check unique email
        rows = await conn.query("SELECT COUNT(*) AS emailCount FROM users WHERE email = ?", email);
        if (rows[0].emailCount > 0) {
            return res.status(400).render('register',
                { title: 'Registrierung', error: `Die E-Mail "${email}" wird bereits verwendet.`,
                username: username, name: name, email: email}
            );
        }

        await conn.query('INSERT INTO users (username, name, email, password_hash) VALUES (?, ?, ?, ?)',
        [username, name, email, hashedPassword]);
        // res.status(201).redirect('/login');
        return res.status(201).render('index',
            { title: 'Erfolgreich registriert', success: `Sie haben sich erfolgreich registriert.`}
        );
    } catch (err) {
        console.log(err);
        return res.status(500).render('register',
        { title: 'Registrierung', error: 'Fehler bei der Registrierung',
            username: username, name: name, email: email}
        );
    } finally {
        conn.release();
    }
});

router.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

router.post('/login', async (req, res) => {
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
    const token = jwt.sign({ id: user[0].id, username: user[0].username, name: user[0].name, email: user[0].email },
                            secrets.jwt_secret_key,
                            { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true }).redirect('/');
});

router.post('/logout', (req, res) => {
    res.clearCookie('token').redirect('/');
});

export default router;