const express = require('express');
const { DocumentStore } = require('ravendb');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Funkcja szukająca certyfikatu w folderze
const files = fs.readdirSync(__dirname);
const certFile = files.find(f => f.includes('nexity') && (f.endsWith('.key') || f.endsWith('.pem') || f.endsWith('.pfx')));

const store = new DocumentStore('https://a.free.nexity.ravendb.cloud', 'NexityDB');

if (certFile) {
    console.log(`POŁĄCZENIE: Znaleziono certyfikat: ${certFile}`);
    const certPath = path.join(__dirname, certFile);
    
    // Konfiguracja autoryzacji
    store.authOptions = {
        certificate: fs.readFileSync(certPath),
        type: certFile.endsWith('.pfx') ? 'pfx' : 'pem'
    };
} else {
    console.error("BŁĄD KRYTYCZNY: Nie znaleziono pliku certyfikatu na GitHubie!");
}

store.initialize();

app.use(express.static(path.join(__dirname)));

// Endpoint do pobierania logów
app.get('/api/logs', async (req, res) => {
    try {
        const session = store.openSession();
        const logs = await session.query({ collection: 'Logs' })
            .orderByDescending('Timestamp')
            .take(20)
            .toList();
        res.json(logs);
    } catch (err) {
        console.error('Błąd połączenia z bazą w USA:', err.message);
        res.status(500).json({ error: 'Baza danych odrzuciła połączenie (sprawdź certyfikat)' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`NEXITY SYSTEM gotowy na porcie ${port}`);
});
