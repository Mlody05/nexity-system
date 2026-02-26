const express = require('express');
const { DocumentStore } = require('ravendb');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 10000;

// Parametry bazy
const dbUrl = 'https://a.free.nexity.ravendb.cloud';
const dbName = 'NexityDB';

// 1. Szukamy pliku .pfx w folderze
const files = fs.readdirSync(__dirname);
const certFile = files.find(f => f.toLowerCase().endsWith('.pfx'));

let store = null;

if (certFile) {
    console.log(`--- NEXITY BOOT ---`);
    console.log(`WYKRYTO CERTYFIKAT PFX: ${certFile}`);
    
    try {
        const certPath = path.join(__dirname, certFile);
        const certBuffer = fs.readFileSync(certPath);

        // Inicjalizacja z obsługą PFX
        store = new DocumentStore(dbUrl, dbName);
        store.authOptions = {
            certificate: certBuffer,
            type: 'pfx' // Wymuszenie formatu PFX
        };
        
        store.initialize();
        console.log(`STATUS: Autoryzacja PFX załadowana.`);
    } catch (err) {
        console.error(`BŁĄD ŁADOWANIA PFX: ${err.message}`);
    }
} else {
    console.error(`ALARM: Brak pliku .pfx na GitHubie! Prześlij plik z końcówką .pfx.`);
}

app.use(express.static(__dirname));

// Główny endpoint danych
app.get('/api/logs', async (req, res) => {
    if (!store) return res.status(500).json({ error: "Brak inicjalizacji PFX" });

    try {
        const session = store.openSession();
        // Pobieramy ostatnie logi
        const logs = await session.query({ collection: 'Logs' })
            .orderByDescending('Timestamp')
            .take(25)
            .all();

        console.log(`SUKCES: Pobrano ${logs.length} logów z USA.`);
        res.json(logs);
    } catch (err) {
        console.error(`BŁĄD KOMUNIKACJI: ${err.message}`);
        res.status(500).json({ error: "Błąd bazy (sprawdź czy certyfikat PFX jest aktywny w panelu RavenDB)" });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`====================================`);
    console.log(`NEXITY SYSTEM GOTOWY | PORT: ${port}`);
    console.log(`====================================`);
});



