const express = require('express');
const { DocumentStore } = require('ravendb');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

const directoryPath = __dirname;
const files = fs.readdirSync(directoryPath);

// Szukanie certyfikatu
const certFile = files.find(f => f.toLowerCase().includes('nexity') && (f.endsWith('.key') || f.endsWith('.pem')));

let store = null;

if (certFile) {
    store = new DocumentStore('https://a.free.nexity.ravendb.cloud', 'NexityDB');
    store.authOptions = {
        certificate: fs.readFileSync(path.join(directoryPath, certFile)),
        type: 'pem'
    };
    store.initialize();
    console.log("SYSTEM: Baza RavenDB zainicjalizowana poprawnie.");
}

app.use(express.static(directoryPath));

// POPRAWIONY ENDPOINT DANYCH
app.get('/api/logs', async (req, res) => {
    if (!store) return res.status(500).json({ error: "Brak inicjalizacji bazy" });
    
    try {
        const session = store.openSession();
        // Nowa składnia zapytania dla RavenDB
        const logs = await session.query({ collection: 'Logs' })
            .orderByDescending('Timestamp')
            .take(20)
            .all(); // Zmieniono z toList() na all()
            
        res.json(logs);
    } catch (err) {
        console.log("BŁĄD POBIERANIA:", err.message);
        res.status(500).json({ error: "Problem z zapytaniem do bazy w USA" });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(directoryPath, 'index.html'));
});

app.listen(port, () => {
    console.log(`NEXITY ONLINE | Port: ${port}`);
});


