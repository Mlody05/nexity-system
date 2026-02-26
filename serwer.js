const express = require('express');
const { DocumentStore } = require('ravendb');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 10000;

// DOKŁADNE PARAMETRY
const dbUrl = 'https://a.free.nexity.ravendb.cloud';
const dbName = 'NexityDB';
const certName = 'free.nexity.client.certificate.2026-02-24.pfx'; // Twoja nazwa pliku

const certPath = path.join(__dirname, certName);

let store = null;

// 1. Sprawdzenie czy plik istnieje
if (fs.existsSync(certPath)) {
    console.log(`--- SYSTEM NEXITY ---`);
    console.log(`Zlokalizowano certyfikat: ${certName}`);
    
    try {
        const certBuffer = fs.readFileSync(certPath);
        
        store = new DocumentStore(dbUrl, dbName);
        store.authOptions = {
            certificate: certBuffer,
            type: 'pfx'
        };
        
        store.initialize();
        console.log("Inicjalizacja bazy zakończona pomyślnie.");
    } catch (err) {
        console.error(`BŁĄD ODCZYTU CERTYFIKATU: ${err.message}`);
    }
} else {
    console.error(`ALARM: Nie znaleziono pliku ${certName} na GitHubie!`);
    console.log("Pliki które widzę:", fs.readdirSync(__dirname));
}

app.use(express.static(__dirname));

// 2. Pobieranie danych
app.get('/api/logs', async (req, res) => {
    if (!store) return res.status(500).json({ error: "Brak zainicjalizowanej bazy" });
    
    try {
        const session = store.openSession();
        // Pobieramy ostatnie zdarzenia
        const logs = await session.query({ collection: 'Logs' })
            .orderByDescending('Timestamp')
            .take(20)
            .all();
            
        console.log(`POBRANO DANE: ${logs.length} pozycji.`);
        res.json(logs);
    } catch (err) {
        console.log("BŁĄD KOMUNIKACJI Z USA:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`====================================`);
    console.log(`NEXITY SYSTEM ONLINE NA PORCIE ${port}`);
    console.log(`====================================`);
});




