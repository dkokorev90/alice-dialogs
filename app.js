const express = require('express');
const letterCount = require('./apps/letter-count');

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());

app.post('/letter-count', letterCount);

app.listen(PORT, () => {
  console.log(`App [alice-dialogs] is running on: ${PORT}`);
});
