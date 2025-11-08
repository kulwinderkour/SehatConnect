/**
 * Pharmacy Controller
 * Handles pharmacy search and pharmacy orders
 */

const { Pharmacy, PharmacyOrder, Notification } = require('../models');

/**
 * @desc    Get nearby pharmacies
 * @route   GET /api/pharmacies/nearby
 * @access  Public
 */
const getNearbyPharmacies = async (req, res, next) => {
  try {
    const { latitude, longitude, maxDistance = 5000 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required',
      });
    }

    const pharmacies = await Pharmacy.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      },
      isActive: true,
    });

    res.status(200).json({
      success: true,
      data: { pharmacies },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search pharmacies
 * @route   GET /api/pharmacies
 * @access  Public
 */
const searchPharmacies = async (req, res, next) => {
  try {
    const { search, city, is24x7, homeDelivery, page = 1, limit = 10 } = req.query;

    const query = { isActive: true };

    if (search) {
      query.name = new RegExp(search, 'i');
    }

    if (city) {
      query['address.city'] = new RegExp(city, 'i');
    }

    if (is24x7) {
      query.is24x7 = is24x7 === 'true';
    }

    if (homeDelivery) {
      query['services.homeDelivery'] = homeDelivery === 'true';
    }

    const pharmacies = await Pharmacy.find(query)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ rating: -1 });

    const total = await Pharmacy.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        pharmacies,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get pharmacy by ID
 * @route   GET /api/pharmacies/:id
 * @access  Public
 */
const getPharmacyById = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        error: 'Pharmacy not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { pharmacy },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Place pharmacy order
 * @route   POST /api/pharmacies/orders
 * @access  Private
 */
const placeOrder = async (req, res, next) => {
  try {
    const {
      pharmacyId,
      items,
      deliveryAddress,
      deliveryType,
      prescriptionId,
      contactPhone,
      contactName,
    } = req.body;

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const deliveryCharges = deliveryType === 'home_delivery' ? 50 : 0;
    const tax = subtotal * 0.05; // 5% tax
    const totalAmount = subtotal + deliveryCharges + tax;

    const order = await PharmacyOrder.create({
      patientId: req.user._id,
      pharmacyId,
      items,
      subtotal,
      deliveryCharges,
      tax,
      totalAmount,
      deliveryAddress,
      deliveryType,
      prescriptionId,
      contactPhone: contactPhone || req.user.phone,
      contactName: contactName || req.user.profile.fullName,
      status: 'pending',
    });

    // Create notification for pharmacy
    await Notification.create({
      userId: pharmacyId,
      type: 'order',
      title: 'New Order',
      message: `New order ${order.orderNumber} from ${req.user.profile.fullName}`,
      relatedId: order._id,
      relatedModel: 'PharmacyOrder',
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user orders
 * @route   GET /api/pharmacies/orders
 * @access  Private
 */
const getOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { patientId: req.user._id };

    if (status) {
      query.status = status;
    }

    const orders = await PharmacyOrder.find(query)
      .populate('pharmacyId', 'name address phone')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await PharmacyOrder.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get order by ID
 * @route   GET /api/pharmacies/orders/:id
 * @access  Private
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await PharmacyOrder.findOne({
      _id: req.params.id,
      patientId: req.user._id,
    }).populate('pharmacyId', 'name address phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel order
 * @route   PUT /api/pharmacies/orders/:id/cancel
 * @access  Private
 */
const cancelOrder = async (req, res, next) => {
  try {
    const { cancellationReason } = req.body;

    const order = await PharmacyOrder.findOne({
      _id: req.params.id,
      patientId: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot cancel ${order.status} order`,
      });
    }

    order.status = 'cancelled';
    order.cancellationReason = cancellationReason;
    order.cancelledBy = req.user._id;
    order.cancelledAt = new Date();
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNearbyPharmacies,
  searchPharmacies,
  getPharmacyById,
  placeOrder,
  getOrders,
  getOrderById,
  cancelOrder,
};
