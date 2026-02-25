const express = require('express');
const { DocumentStore } = require('ravendb');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// 1. Sprawdzanie plików (Debug)
const directoryPath = __dirname;
const files = fs.readdirSync(directoryPath);
console.log("--- DEBUG SYSTEMU NEXITY ---");
console.log("FOLDER ROBOCZY:", directoryPath);
console.log("PLIKI W FOLDERZE:", files);

// 2. Szukanie certyfikatu
const certFile = files.find(f => f.toLowerCase().includes('nexity') && (f.endsWith('.key') || f.endsWith('.pem')));

let store = null;

if (certFile) {
    console.log("ZNALAZŁEM CERTYFIKAT:", certFile);
    store = new DocumentStore('https://a.free.nexity.ravendb.cloud', 'NexityDB');
    store.authOptions = {
        certificate: fs.readFileSync(path.join(directoryPath, certFile)),
        type: 'pem'
    };
    store.initialize();
} else {
    console.log("BRAK CERTYFIKATU! System nie połączy się z USA.");
}

// 3. Obsługa strony i danych
app.use(express.static(directoryPath));

app.get('/api/logs', async (req, res) => {
    if (!store) return res.status(500).json({ error: "Brak autoryzacji (certyfikatu)" });
    
    try {
        const session = store.openSession();
        const logs = await session.query({ collection: 'Logs' }).orderByDescending('Timestamp').take(20).toList();
        res.json(logs);
    } catch (err) {
        console.log("BŁĄD POBIERANIA:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Główne wejście
app.get('/', (req, res) => {
    res.sendFile(path.join(directoryPath, 'index.html'));
});

app.listen(port, () => {
    console.log("SERWER URUCHOMIONY POPRAWNIE");
    console.log("---------------------------");
});

