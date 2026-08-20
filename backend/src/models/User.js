const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const memoryStore = require('../config/memoryStore');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    current_plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', default: null },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const MongooseUser = mongoose.models.User || mongoose.model('User', userSchema);

const UserProxy = {
  findOne: function (query) {
    if (mongoose.connection.readyState === 1) {
      return MongooseUser.findOne(query);
    }
    if (query && query.email) {
      return memoryStore.findUserByEmail(query.email);
    }
    return Promise.resolve(null);
  },
  findById: function (id) {
    if (mongoose.connection.readyState === 1) {
      return MongooseUser.findById(id);
    }
    return memoryStore.findUserById(id);
  },
  create: function (data) {
    if (mongoose.connection.readyState === 1) {
      return MongooseUser.create(data);
    }
    return memoryStore.createUser(data);
  },
  findByIdAndUpdate: function (id, update) {
    if (mongoose.connection.readyState === 1) {
      return MongooseUser.findByIdAndUpdate(id, update);
    }
    return memoryStore.updateUserById(id, update);
  },
};

module.exports = UserProxy;
