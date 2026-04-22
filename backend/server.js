/**
 * Server Entry Point
 */

require('dotenv').config(); // ✅ Load env FIRST

const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️ Database: ${process.env.DB_NAME} on ${process.env.DB_HOST}`);
});