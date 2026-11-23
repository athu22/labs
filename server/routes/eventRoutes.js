const express = require('express');
const router = express.Router();
const { optionalAuth, requireAuth, requireRole } = require('../middleware/authMiddleware');
const eventCtrl = require('../controllers/eventController');
const paymentCtrl = require('../controllers/eventPaymentController');
const checkinCtrl = require('../controllers/eventCheckinController');

const STAFF_ROLES = ['super-admin', 'admin', 'event-staff'];

// --- Public Event Discovery & Member Verification ---
router.get('/public', eventCtrl.getPublicEvents);
router.get('/public/:id', optionalAuth, eventCtrl.getPublicEventById);
router.post('/verify-member', eventCtrl.verifyMemberId);

// --- Registration & Online Payment Verification ---
router.post('/:id/register', optionalAuth, eventCtrl.registerForEvent);
router.post('/payments/verify', optionalAuth, paymentCtrl.verifyOnlinePayment);

// --- Digital Ticket Lookup & User Ticket History ---
router.get('/tickets/:code', optionalAuth, eventCtrl.getTicketByCode);
router.get('/my-registrations', optionalAuth, requireAuth, eventCtrl.getMyEventRegistrations);

// --- Cash Payment Verification (Super Admin & Authorized Event Staff) ---
router.get('/cash/pending', optionalAuth, requireRole(...STAFF_ROLES), paymentCtrl.getPendingCashRegistrations);
router.get('/cash/logs', optionalAuth, requireRole(...STAFF_ROLES), paymentCtrl.getCashVerificationLogs);
router.post('/cash/:regId/verify', optionalAuth, requireRole(...STAFF_ROLES), paymentCtrl.verifyCashPayment);

// --- Venue QR Scanner & Multi-Activity Operations (Entry, Welcome Kit, Breakfast, Lunch) ---
// Open for venue staff & volunteers without pre-adding employee accounts:
router.post('/checkin/scan', optionalAuth, checkinCtrl.scanTicket);
router.post('/checkin/confirm', optionalAuth, checkinCtrl.confirmCheckin);
router.post('/activities/record', optionalAuth, checkinCtrl.recordActivity);
router.get('/checkin/recent', optionalAuth, checkinCtrl.getRecentCheckins);

// --- Live Activity Dashboard & Activity Reports ---
router.get('/activities/dashboard', optionalAuth, requireRole(...STAFF_ROLES), checkinCtrl.getEventActivityDashboard);
router.get('/activities/reports', optionalAuth, requireRole(...STAFF_ROLES), checkinCtrl.getActivityReports);

// --- Staff Roles & Permissions Management (Super Admin) ---
router.get('/staff-permissions', optionalAuth, requireRole('super-admin'), checkinCtrl.getStaffPermissions);
router.post('/staff-permissions', optionalAuth, requireRole('super-admin'), checkinCtrl.saveStaffPermissions);
router.delete('/staff-permissions/:id', optionalAuth, requireRole('super-admin'), checkinCtrl.deleteStaffPermission);

// --- WhatsApp API Config, Notification Settings & Message Logs ---
router.get('/whatsapp/config', optionalAuth, requireRole('super-admin'), checkinCtrl.getWhatsAppApiConfig);
router.post('/whatsapp/config', optionalAuth, requireRole('super-admin'), checkinCtrl.saveWhatsAppApiConfig);
router.post('/whatsapp/test-send', optionalAuth, requireRole('super-admin'), checkinCtrl.sendTestWhatsAppMessage);
router.get('/notification-settings/:eventId', optionalAuth, requireRole('super-admin'), checkinCtrl.getNotificationSettings);
router.put('/notification-settings/:eventId', optionalAuth, requireRole('super-admin'), checkinCtrl.updateNotificationSettings);
router.get('/whatsapp/logs', optionalAuth, requireRole(...STAFF_ROLES), checkinCtrl.getWhatsAppLogs);
router.post('/whatsapp/retry/:logId', optionalAuth, requireRole('super-admin'), checkinCtrl.retryWhatsAppMessage);

// --- Super Admin Event Analytics & Reports (Legacy) ---
router.get('/analytics', optionalAuth, requireRole('super-admin'), checkinCtrl.getEventAnalytics);

// --- Event Management CRUD (Super Admin & Staff View) ---
router.get('/', optionalAuth, requireRole(...STAFF_ROLES), eventCtrl.getAllEvents);
router.get('/:id/registrations', optionalAuth, requireRole(...STAFF_ROLES), eventCtrl.getEventRegistrations);
router.post('/', optionalAuth, requireRole('super-admin'), eventCtrl.createEvent);
router.put('/:id', optionalAuth, requireRole('super-admin'), eventCtrl.updateEvent);
router.patch('/:id/status', optionalAuth, requireRole('super-admin'), eventCtrl.updateEventStatus);
router.patch('/:id/featured', optionalAuth, requireRole('super-admin', 'admin'), eventCtrl.toggleFeaturedEvent);
router.delete('/:id', optionalAuth, requireRole('super-admin'), eventCtrl.deleteEvent);

module.exports = router;
