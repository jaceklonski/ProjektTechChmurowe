const express = require('express');
const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.send('OK'));

app.listen(4000, () => console.log('Auth service listening on port 4000'));
