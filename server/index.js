const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
const registrationRoutes = require('./routes/registrationRoutes');
const setupRoutes = require('./routes/setupRoutes');
const accountingRoutes = require('./routes/accountingRoutes');

app.use('/api/registrations', registrationRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/accounting', accountingRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'Association Management System API is running' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
