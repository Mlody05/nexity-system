const express = require('express');
const { DocumentStore } = require('ravendb');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 10000;

const dbUrl = 'https://a.free.nexity.ravendb.cloud';
const dbName = 'NexityDB';

// 1. Sprawdzanie plików
const files = fs.readdirSync(__dirname);
const certFile = files.find(f => f.toLowerCase().endsWith('.pfx'));

let store = null;

if (certFile) {
    try {
        const certPath = path.join(__dirname, certFile);
        const certBuffer = fs.readFileSync(certPath);
        
        console.log(`--- DEBUG NEXITY ---`);
        console.log(`Znaleziono plik: ${certFile}`);
        console.log(`Rozmiar certyfikatu: ${certBuffer.length} bajtów`);

        store = new DocumentStore(dbUrl, dbName);
        store.authOptions = {
            certificate: certBuffer,
            type: 'pfx'
        };
        
        store.initialize();
        console.log(`Inicjalizacja zakończona. Próba kontaktu z USA...`);
    } catch (err) {
        console.error(`BŁĄD WEWNĘTRZNY: ${err.message}`);
    }
} else {
    console.log("ALARM: Nie widzę pliku .pfx na liście plików!");
    console.log("Dostępne pliki:", files);
}

app.use(express.static(__dirname));

app.get('/api/logs', async (req, res) => {
    if (!store) return res.status(500).send("Brak inicjalizacji Store");
    
    try {
        const session = store.openSession();
        // Najprostsza metoda pobrania czegokolwiek
        const logs = await session.query({ collection: 'Logs' }).take(10).all();
        res.json(logs);
    } catch (err) {
        console.log(`KOMUNIKAT Z USA: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`SERWER NEXITY NASŁUCHUJE NA PORCIE ${port}`);
});



