const express = require('express');
const { DocumentStore } = require('ravendb');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Ścieżka do Twojego certyfikatu (pobieramy go z plików które wgrałeś)
const certPath = path.join(__dirname, 'free.nexity.client.certificate.key');

const store = new DocumentStore('https://a.free.nexity.ravendb.cloud', 'NexityDB');

// Ładowanie certyfikatu jeśli istnieje
if (fs.existsSync(certPath)) {
    store.authOptions = {
        certificate: fs.readFileSync(certPath),
        type: 'pem'
    };
}

store.initialize();

app.use(express.static(path.join(__dirname)));

// Endpoint do pobierania logów dla Twojej strony
app.get('/api/logs', async (req, res) => {
    try {
        const session = store.openSession();
        // Pobieramy 20 ostatnich logów
        const logs = await session.query({ collection: 'Logs' })
            .orderByDescending('Timestamp')
            .take(20)
            .toList();
        res.json(logs);
    } catch (err) {
        console.error('Błąd bazy:', err);
        res.status(500).json({ error: 'Błąd połączenia z USA' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`System NEXITY aktywny na porcie ${port}`);
});
