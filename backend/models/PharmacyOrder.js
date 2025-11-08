const mongoose = require('mongoose');

/**
 * Pharmacy Orders Schema
 * Handles medicine orders from pharmacies
 */
const pharmacyOrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },

    // References
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
      index: true,
    },
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: [true, 'Pharmacy ID is required'],
      index: true,
    },
    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription',
    },

    // Order Items
    items: [
      {
        medicineName: {
          type: String,
          required: true,
        },
        genericName: String,
        dosage: String,
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        mrp: Number,
        discount: {
          type: Number,
          default: 0,
        },
        totalPrice: {
          type: Number,
          required: true,
        },
        prescriptionRequired: {
          type: Boolean,
          default: false,
        },
        isAvailable: {
          type: Boolean,
          default: true,
        },
      },
    ],

    // Pricing
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    deliveryCharges: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Delivery
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: [Number], // [longitude, latitude]
      },
    },
    deliveryType: {
      type: String,
      enum: ['home_delivery', 'pickup'],
      default: 'home_delivery',
    },
    deliveryInstructions: String,
    estimatedDeliveryTime: Date,
    actualDeliveryTime: Date,

    // Status
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
      required: true,
      index: true,
    },
    statusHistory: [
      {
        status: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: String,
      },
    ],

    // Payment
    payment: {
      method: {
        type: String,
        enum: ['cash', 'card', 'upi', 'wallet'],
      },
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending',
      },
      transactionId: String,
      paidAt: Date,
    },

    // Contact
    contactPhone: String,
    contactName: String,

    // Cancellation
    cancellationReason: String,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cancelledAt: Date,

    // Delivery Person
    deliveryPerson: {
      name: String,
      phone: String,
      vehicleNumber: String,
    },

    // Rating
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    review: String,
    reviewedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
pharmacyOrderSchema.index({ patientId: 1, createdAt: -1 });
pharmacyOrderSchema.index({ pharmacyId: 1, status: 1 });
pharmacyOrderSchema.index({ status: 1, createdAt: -1 });

// Pre-save middleware to generate order number
pharmacyOrderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('PharmacyOrder').countDocuments();
    this.orderNumber = `ORD${String(count + 1).padStart(8, '0')}`;
  }
  next();
});

// Pre-save middleware to update status history
pharmacyOrderSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
    });
  }
  next();
});

// Method to calculate total
pharmacyOrderSchema.methods.calculateTotal = function () {
  this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  this.totalAmount = this.subtotal - this.discount + this.deliveryCharges + this.tax;
  return this.totalAmount;
};

module.exports = mongoose.model('PharmacyOrder', pharmacyOrderSchema);
