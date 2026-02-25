const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serwowanie plików statycznych (Twojego index.html)
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Serwer NEXITY dla Nikolety działa na porcie ${port}`);
});
