const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.static(path.join(__dirname, 'cricket')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'cricket', 'index.html'));
});

app.listen(port, () => {
  console.log(`Dev server running at http://localhost:${port}`);
});
