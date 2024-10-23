import express from 'express';
const app = express();
 
// EJS als View-Engine einrichten
app.set('view engine', 'ejs');
 
// Route mit dynamischem Inhalt
app.get('/', (req, res) => {
  res.render('index', { title: 'Willkommen', message: 'Willkommen bei Ihrem ersten Express-Server!' });
});
 

 
// Weitere Route
app.get('/about', (req, res) => {
  res.send('Dies ist die About-Seite.');
});
app.get('/contact', (req, res) =>{
    res.send('Kontaktiere mich mal!!!')
}) 
// Server starten
app.listen(3000, () => {
  console.log('Server läuft auf http://localhost:3000');
});
 