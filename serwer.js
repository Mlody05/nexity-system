
const express = require('express');
const { DocumentStore } = require('ravendb');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 10000;

const dbUrl = 'https://a.free.nexity.ravendb.cloud';
const dbName = 'NexityDB';

// AUTOMATYCZNE SZUKANIE PLIKU .PFX
const files = fs.readdirSync(__dirname);
const certFile = files.find(f => f.toLowerCase().endsWith('.pfx'));

let store = null;

if (certFile) {
    console.log(`--- SYSTEM NEXITY ---`);
    console.log(`WYKRYTO PLIK: ${certFile}`);
    
    try {
        const certPath = path.join(__dirname, certFile);
        const certBuffer = fs.readFileSync(certPath);

        store = new DocumentStore(dbUrl, dbName);
        store.authOptions = {
            certificate: certBuffer,
            type: 'pfx'
        };
        
        store.initialize();
        console.log("STATUS: Baza danych zainicjalizowana.");
    } catch (err) {
        console.error(`BŁĄD ODCZYTU: ${err.message}`);
    }
} else {
    console.error("ALARM: Nie znaleziono żadnego pliku .pfx!");
    console.log("Pliki na serwerze:", files);
}

app.use(express.static(__dirname));

app.get('/api/logs', async (req, res) => {
    if (!store) return res.status(500).json({ error: "Brak certyfikatu" });
    
    try {
        const session = store.openSession();
        const logs = await session.query({ collection: 'Logs' })
            .orderByDescending('Timestamp')
            .take(20)
            .all();
            
        console.log(`POBRANO: ${logs.length} logów.`);
        res.json(logs);
    } catch (err) {
        console.log("BŁĄD KOMUNIKACJI:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`====================================`);
    console.log(`NEXITY ONLINE | PORT: ${port}`);
    console.log(`====================================`);
});



