const express = require('express');
const { DocumentStore } = require('ravendb');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 10000;

// Konfiguracja bazy w USA
const dbUrl = 'https://a.free.nexity.ravendb.cloud';
const dbName = 'NexityDB';

// Automatyczne wykrywanie pliku certyfikatu na GitHubie
const files = fs.readdirSync(__dirname);
const certFile = files.find(f => f.includes('nexity') && (f.endsWith('.key') || f.endsWith('.pem')));

let store = null;

if (certFile) {
    console.log(`--- SYSTEM NEXITY ---`);
    console.log(`PRÓBA POŁĄCZENIA Z: ${dbUrl}`);
    console.log(`UŻYTY CERTYFIKAT: ${certFile}`);

    try {
        const certPath = path.join(__dirname, certFile);
        const certBuffer = fs.readFileSync(certPath);

        store = new DocumentStore(dbUrl, dbName);
        store.authOptions = {
            certificate: certBuffer,
            type: 'pem' // Większość plików .key działa jako 'pem'
        };

        store.initialize();
        console.log(`STATUS: Autoryzacja wysłana do bazy.`);
    } catch (err) {
        console.error(`BŁĄD STARTU: ${err.message}`);
    }
} else {
    console.error(`ALARM: Brak pliku certyfikatu (np. free.nexity.client.certificate.key) na GitHub!`);
}

app.use(express.static(__dirname));

// Endpoint do pobierania logów
app.get('/api/logs', async (req, res) => {
    if (!store) return res.status(500).json({ error: "Brak inicjalizacji bazy" });

    try {
        const session = store.openSession();
        // Pobieramy ostatnie 25 zdarzeń
        const logs = await session.query({ collection: 'Logs' })
            .orderByDescending('Timestamp')
            .take(25)
            .all();

        console.log(`POBRANO DANE: ${logs.length} pozycji.`);
        res.json(logs);
    } catch (err) {
        console.error(`BŁĄD KOMUNIKACJI: ${err.message}`);
        // Jeśli baza mówi Forbidden, zwracamy jasny komunikat
        if (err.message.includes("Forbidden")) {
            res.status(403).json({ error: "Baza odrzuciła klucz. Sprawdź czy klucz jest dodany w panelu RavenDB." });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`====================================`);
    console.log(`SYSTEM NEXITY AKTYWNY NA PORCIE ${port}`);
    console.log(`====================================`);
});


