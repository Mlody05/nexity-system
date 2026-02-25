const express = require('express');
const { DocumentStore } = require('ravendb');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// DEBUG: Wypisz wszystkie pliki w logach Rendera
const files = fs.readdirSync(__dirname);
console.log("LISTA PLIKÓW NA SERWERZE:", files);

const certFile = files.find(f => f.toLowerCase().includes('nexity') && (f.endsWith('.key') || f.endsWith('.pem') || f.endsWith('.pfx')));

const store = new DocumentStore('https://a.free.nexity.ravendb.cloud', 'NexityDB');

if (certFile) {
    console.log(`SUKCES: Używam certyfikatu: ${certFile}`);
    store.authOptions = {
        certificate: fs.readFileSync(path.join(__dirname, certFile)),
        type: certFile.endsWith('.pfx') ? 'pfx' : 'pem'
    };
} else {
    console.error("ALARM: Na liście plików wyżej nie widzę certyfikatu Nexity!");
}

store.initialize();
app.use(express.static(path.join(__dirname)));

app.get('/api/logs', async (req, res) => {
    try {
        const session = store.openSession();
        const logs = await session.query({ collection: 'Logs' }).orderByDescending('Timestamp').take(20).toList();
        res.json(logs);
    } catch (err) {
        console.error('BŁĄD BAZY:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`System NEXITY aktywny na porcie ${port}`);
});

