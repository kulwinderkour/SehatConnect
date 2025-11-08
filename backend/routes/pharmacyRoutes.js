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
const { protect } = require('../middleware/authMiddleware');

// Pharmacy routes
router.get('/nearby', getNearbyPharmacies);
router.get('/', searchPharmacies);
router.get('/:id', getPharmacyById);

// Order routes
router.post('/orders', protect, placeOrder);
router.get('/orders', protect, getOrders);
router.get('/orders/:id', protect, getOrderById);
router.put('/orders/:id/cancel', protect, cancelOrder);

module.exports = router;
