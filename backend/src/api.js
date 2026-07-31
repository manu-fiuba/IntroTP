const express = require('express');
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/api/status', (req, res) => {
  res.json({
    status: 'Running',
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));