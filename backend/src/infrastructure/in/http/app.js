const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const ingredientRoutes = require('./routes/ingredientRoutes');
const flavorRoutes = require('./routes/flavorRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Flavour API running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/flavors', flavorRoutes);

app.use(errorHandler);

module.exports = app;
