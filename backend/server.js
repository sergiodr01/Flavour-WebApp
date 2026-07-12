require('dotenv').config();
const app = require('./src/infrastructure/in/http/app');

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Flavour API running on port ${PORT}`);
});
