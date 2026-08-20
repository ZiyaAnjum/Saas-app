const mongoose = require('mongoose');
const memoryStore = require('../config/memoryStore');

const subscriptionSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
    start_date: { type: Date, default: Date.now },
    end_date: { type: Date },
    status: { type: String, enum: ['active', 'cancelled', 'expired'], default: 'active' },
  },
  { timestamps: true }
);

const MongooseSubscription = mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);

const SubscriptionProxy = {
  findOne: function (query) {
    if (mongoose.connection.readyState === 1) {
      return MongooseSubscription.findOne(query);
    }
    return memoryStore.findSubscription(query);
  },
  updateMany: function (filter, update) {
    if (mongoose.connection.readyState === 1) {
      return MongooseSubscription.updateMany(filter, update);
    }
    return memoryStore.updateManySubscriptions(filter, update);
  },
  create: function (data) {
    if (mongoose.connection.readyState === 1) {
      return MongooseSubscription.create(data);
    }
    return memoryStore.createSubscription(data);
  },
};

module.exports = SubscriptionProxy;
