const express = require('express');
const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.send('OK'));

app.listen(5000, () => {
  console.log('Task service listening on port 5000');
});
