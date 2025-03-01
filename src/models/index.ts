import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PhotoSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  likes: {
    type: Number,
    default: 0,
  },
});

const FrameSchema = new mongoose.Schema({
  originImageUrl: {
    type: String,
    required: true,
  },
  frameX: {
    type: Number,
    required: true,
  },
  frameY: {
    type: Number,
    required: true,
  },
  frameWidth: {
    type: Number,
    required: true,
  },
  frameHeight: {
    type: Number,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  likes: {
    type: Number,
    default: 0,
  },
});

const TutorialImageSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  optimalFrameX: {
    type: Number,
  },
  optimalFrameY: {
    type: Number,
  },
  optimalFrameWidth: {
    type: Number,
  },
  optimalFrameHeight: {
    type: Number,
  },
});

// Define models if they don't exist already to prevent overwrite errors
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Photo = mongoose.models.Photo || mongoose.model('Photo', PhotoSchema);
export const Frame = mongoose.models.Frame || mongoose.model('Frame', FrameSchema);
export const TutorialImage = mongoose.models.TutorialImage || mongoose.model('TutorialImage', TutorialImageSchema); 