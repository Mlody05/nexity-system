const express = require('express');
const { DocumentStore } = require('ravendb');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 10000;

// PARAMETRY TWOJEGO SYSTEMU
const dbUrl = 'https://a.free.nexity.ravendb.cloud';
const dbName = 'NexityDB';
const certName = 'free.nexity.client.certificate.key'; // Upewnij się, że to DOKŁADNA nazwa na GitHubie

const certPath = path.join(__dirname, certName);

// 1. Sprawdzenie czy plik fizycznie istnieje przed startem
if (!fs.existsSync(certPath)) {
    console.error(`!!! ALARM: Plik ${certName} NIE ISTNIEJE w folderze serwera !!!`);
}

// 2. Konfiguracja Store z wymuszonym certyfikatem
const authOptions = {
    certificate: fs.readFileSync(certPath),
    type: 'pem'
};

const store = new DocumentStore(dbUrl, dbName);
store.authOptions = authOptions;
store.initialize();

console.log("NEXITY: System autoryzacji zainicjalizowany.");

app.use(express.static(__dirname));

// 3. Endpoint pobierania danych
app.get('/api/logs', async (req, res) => {
    try {
        const session = store.openSession();
        // Najbezpieczniejsza metoda pobierania danych
        const logs = await session.query({ collection: 'Logs' })
            .orderByDescending('Timestamp')
            .take(20)
            .all();
            
        res.json(logs);
    } catch (err) {
        console.error("BŁĄD KOMUNIKACJI Z USA:", err.message);
        res.status(500).json({ error: "Błąd autoryzacji certyfikatu" });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`>>> SYSTEM NEXITY DZIAŁA NA PORCIE ${port} <<<`);
});


