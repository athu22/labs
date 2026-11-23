const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Dev-Root-Email', 'X-Dev-Root-Uid'],
  })
);

// Razorpay Webhook requires raw request body for HMAC signature verification
const { handleRazorpayWebhook } = require('./controllers/eventPaymentController');
app.post(
  '/api/events/webhook/razorpay',
  express.raw({ type: 'application/json' }),
  handleRazorpayWebhook
);

app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));

// Routes
const registrationRoutes = require('./routes/registrationRoutes');
const setupRoutes = require('./routes/setupRoutes');
const accountingRoutes = require('./routes/accountingRoutes');
const eventRoutes = require('./routes/eventRoutes');

app.use('/api/registrations', registrationRoutes);
app.use('/api/setup', setupRoutes);
app.use('/api/accounting', accountingRoutes);
app.use('/api/events', eventRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'Association Management System API is running' });
});



app.post("/api/account/register", async (req, res) => {

  const { data } = req.body;
  console.log(data);
  if (!data) {
    return res.json({ success: false, message: "No data provided" });
  }
  const user = await Account.create(data);
  if (user) {
    return res.json({ success: true, message: "User registered successfully", user });
  } else {
    return res.json({ success: false, message: "Failed to register user" });
  }
})

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
