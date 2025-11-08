/**
 * Pharmacy Routes
 * /api/pharmacies
 */

const express = require('express');
const router = express.Router();
const {
  getNearbyPharmacies,
  searchPharmacies,
  getPharmacyById,
  placeOrder,
  getOrders,
  getOrderById,
  cancelOrder,
} = require('../controllers/pharmacyController');
const { setDemoUser } = require('../middleware/demoUser');

// Use demo user middleware (replaces auth)
router.use(setDemoUser);

// Pharmacy routes
router.get('/nearby', getNearbyPharmacies);
router.get('/', searchPharmacies);
router.get('/:id', getPharmacyById);

// Order routes (Authentication removed - open access)
router.post('/orders', placeOrder);
router.get('/orders', getOrders);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id/cancel', cancelOrder);

module.exports = router;
