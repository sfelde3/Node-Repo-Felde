import express from 'express';
import { authenticateToken, authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Weitere Route
router.get('/about', (req, res) => {
    res.render('about', { title: 'Über uns' });
});

router.get('/contact', (req, res) => {
    res.render('contact', { title: 'Kontaktiere mich doch...' });
});

router.get('/dashboard', authenticateToken, (req, res) => {
    res.render('dashboard', { title: 'Geschützer Bereich' });
});

// Route mit dynamischem Inhalt
router.get('/', authenticateUser, (req, res) => {
    res.render('index',
        { title: 'Willkommen',
          message: 'Willkommen bei Ihrem ersten Express-Server!'
        }
    );
});

export default router;