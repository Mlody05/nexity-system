const express = require('express');
const { DocumentStore } = require('ravendb');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

const directoryPath = __dirname;
const files = fs.readdirSync(directoryPath);
const certFile = files.find(f => f.toLowerCase().includes('nexity') && (f.endsWith('.key') || f.endsWith('.pem')));

let store = null;

if (certFile) {
    store = new DocumentStore('https://a.free.nexity.ravendb.cloud', 'NexityDB');
    store.authOptions = {
        certificate: fs.readFileSync(path.join(directoryPath, certFile)),
        type: 'pem'
    };
    store.initialize();
}

app.use(express.static(directoryPath));

// WERSJA PANCERNA - POBIERANIE BEZPOŚREDNIE
app.get('/api/logs', async (req, res) => {
    if (!store) return res.status(500).json({ error: "Brak certyfikatu" });
    
    try {
        const session = store.openSession();
        // Pobieramy dokumenty bezpośrednio z kolekcji 'Logs'
        const logs = await session.loadStartingWith('Logs/', {
            pageSize: 25
        });
        
        // RavenDB zwraca obiekt, zamieniamy go na listę dla Twojej strony
        const listaLogow = Object.values(logs).reverse();
        
        console.log(`Pobrano ${listaLogow.length} logów z USA.`);
        res.json(listaLogow);
    } catch (err) {
        console.log("BŁĄD KRYTYCZNY BAZY:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(directoryPath, 'index.html'));
});

app.listen(port, () => {
    console.log(`NEXITY SYSTEM GOTOWY`);
});


