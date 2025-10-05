import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username must not exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  lives: {
    type: Number,
    default: 5,
    min: 0,
    max: 5
  },
  lastLifeRegen: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const salt = await bcrypt.genSalt(rounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to regenerate lives
userSchema.methods.regenerateLives = function() {
  const now = Date.now();
  const regenInterval = (parseInt(process.env.LIFE_REGEN_INTERVAL) || 30) * 60 * 1000; // Convert to ms
  const timeSinceLastRegen = now - this.lastLifeRegen.getTime();
  const livesToAdd = Math.floor(timeSinceLastRegen / regenInterval);

  if (livesToAdd > 0 && this.lives < 5) {
    const newLives = Math.min(this.lives + livesToAdd, 5);
    this.lives = newLives;
    this.lastLifeRegen = new Date(this.lastLifeRegen.getTime() + (livesToAdd * regenInterval));
    return true;
  }

  return false;
};

// Method to use a life
userSchema.methods.useLife = function() {
  if (this.lives > 0) {
    this.lives -= 1;
    return true;
  }
  return false;
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;
