import mongoose from 'mongoose';

const vetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clinicName: {
    type: String,
    required: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  specialization: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  zipCode: {
    type: String,
    required: true
  },
  latitude: Number,
  longitude: Number,
  yearsOfExperience: {
    type: Number,
    default: 0
  },
  availableHours: String,
  bio: String,
  qualifications: [String],
  specialties: [String],
  availableDays: [String],
  startTime: String,
  endTime: String,
  consultationFee: Number,
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  isApproved: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

vetSchema.index({ city: 1 });
vetSchema.index({ specialization: 1 });
vetSchema.index({ rating: -1 });
vetSchema.index({ isApproved: 1 });

const Vet = mongoose.model('Vet', vetSchema);

export default Vet;
