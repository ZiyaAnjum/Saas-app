const mongoose = require('mongoose');
const memoryStore = require('../config/memoryStore');

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true, default: 0 },
    features: { type: [String], default: [] },
    accessLevel: { type: String, enum: ['free', 'basic', 'premium'], required: true },
    storageLimitGB: { type: Number, default: 1 },
  },
  { timestamps: true }
);

const MongoosePlan = mongoose.models.Plan || mongoose.model('Plan', planSchema);

const PlanProxy = {
  find: function (...args) {
    if (mongoose.connection.readyState === 1) {
      return MongoosePlan.find(...args);
    }
    return memoryStore.findPlans();
  },
  findById: function (id) {
    if (mongoose.connection.readyState === 1) {
      return MongoosePlan.findById(id);
    }
    return memoryStore.findPlanById(id);
  },
  create: function (data) {
    if (mongoose.connection.readyState === 1) {
      return MongoosePlan.create(data);
    }
    return memoryStore.createPlan(data);
  },
  deleteMany: function (filter) {
    if (mongoose.connection.readyState === 1) {
      return MongoosePlan.deleteMany(filter);
    }
    return memoryStore.deleteManyPlans();
  },
  insertMany: function (plans) {
    if (mongoose.connection.readyState === 1) {
      return MongoosePlan.insertMany(plans);
    }
    return memoryStore.insertManyPlans(plans);
  },
  countDocuments: function () {
    if (mongoose.connection.readyState === 1) {
      return MongoosePlan.countDocuments();
    }
    return Promise.resolve(memoryStore.plans.length);
  },
};

module.exports = PlanProxy;
