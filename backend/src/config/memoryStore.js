const bcrypt = require('bcryptjs');

const defaultPlans = [
  {
    _id: '65f000000000000000000001',
    name: 'Free',
    price: 0,
    accessLevel: 'free',
    storageLimitGB: 1,
    features: ['1GB storage', 'Basic access', 'Community support'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '65f000000000000000000002',
    name: 'Basic',
    price: 9.99,
    accessLevel: 'basic',
    storageLimitGB: 10,
    features: ['10GB storage', 'Standard access', 'Email support'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '65f000000000000000000003',
    name: 'Premium',
    price: 29.99,
    accessLevel: 'premium',
    storageLimitGB: 100,
    features: ['100GB storage', 'Full access', 'Priority support', 'Advanced analytics'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

class MemoryStore {
  constructor() {
    this.plans = [...defaultPlans];
    this.users = [];
    this.subscriptions = [];
  }

  // --- Plan Methods ---
  findPlans() {
    const plansCopy = this.plans.map(p => ({ ...p }));
    const resultPromise = Promise.resolve(plansCopy);
    resultPromise.sort = (sortObj = {}) => {
      if (sortObj.price) {
        plansCopy.sort((a, b) => (a.price - b.price) * (sortObj.price > 0 ? 1 : -1));
      }
      return Promise.resolve(plansCopy);
    };
    return resultPromise;
  }

  async findPlanById(id) {
    const p = this.plans.find(x => String(x._id) === String(id));
    return p ? { ...p } : null;
  }

  async createPlan(data) {
    const newPlan = {
      _id: `65f00000000000000000000${this.plans.length + 1}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.plans.push(newPlan);
    return { ...newPlan };
  }

  async deleteManyPlans() {
    this.plans = [];
    return { deletedCount: 0 };
  }

  async insertManyPlans(plans) {
    for (const p of plans) {
      this.plans.push({
        _id: p._id || `65f00000000000000000000${this.plans.length + 1}`,
        ...p,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    return this.plans;
  }

  // --- User Methods ---
  findUserByEmail(email) {
    const normalizedEmail = (email || '').toLowerCase().trim();
    const user = this.users.find(u => u.email.toLowerCase().trim() === normalizedEmail);
    if (!user) {
      const p = Promise.resolve(null);
      p.select = () => p;
      return p;
    }

    const formatUser = (u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      password: u.password,
      current_plan: u.current_plan,
      role: u.role || 'user',
      comparePassword: async function (candidatePassword) {
        return bcrypt.compare(candidatePassword, u.password);
      },
    });

    const userObj = formatUser(user);
    const p = Promise.resolve(userObj);
    p.select = () => Promise.resolve(userObj);
    return p;
  }

  findUserById(id) {
    const user = this.users.find(u => String(u._id) === String(id));
    if (!user) {
      const p = Promise.resolve(null);
      p.populate = () => p;
      return p;
    }

    const formatUser = (u) => {
      let populatedPlan = u.current_plan;
      if (typeof u.current_plan === 'string' || (u.current_plan && u.current_plan._id)) {
        const planId = u.current_plan._id || u.current_plan;
        populatedPlan = this.plans.find(p => String(p._id) === String(planId)) || u.current_plan;
      }

      const obj = {
        _id: u._id,
        name: u.name,
        email: u.email,
        current_plan: u.current_plan,
        role: u.role || 'user',
        comparePassword: async function (candidatePassword) {
          return bcrypt.compare(candidatePassword, u.password);
        },
      };

      return {
        ...obj,
        populate: async function (field) {
          if (field === 'current_plan') {
            obj.current_plan = populatedPlan;
          }
          return obj;
        },
      };
    };

    const formatted = formatUser(user);
    const p = Promise.resolve(formatted);
    p.populate = async (field) => {
      if (field === 'current_plan') {
        const planId = user.current_plan?._id || user.current_plan;
        formatted.current_plan = this.plans.find(pl => String(pl._id) === String(planId)) || null;
      }
      return formatted;
    };
    return p;
  }

  async createUser({ name, email, password, role = 'user' }) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = {
      _id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      current_plan: null,
      role,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.users.push(newUser);
    return {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      current_plan: null,
    };
  }

  async updateUserById(id, update) {
    const user = this.users.find(u => String(u._id) === String(id));
    if (!user) return null;
    if (update.current_plan !== undefined) {
      user.current_plan = update.current_plan;
    }
    user.updated_at = new Date();
    return { ...user };
  }

  // --- Subscription Methods ---
  findSubscription(filter = {}) {
    let matched = this.subscriptions.filter(s => {
      if (filter.user_id && String(s.user_id) !== String(filter.user_id)) return false;
      if (filter.status && s.status !== filter.status) return false;
      return true;
    });

    const sub = matched[matched.length - 1] || null;
    if (!sub) {
      const p = Promise.resolve(null);
      p.populate = () => p;
      return p;
    }

    const createSubInstance = (s) => ({
      _id: s._id,
      user_id: s.user_id,
      plan_id: s.plan_id,
      start_date: s.start_date,
      end_date: s.end_date,
      status: s.status,
      save: async function () {
        s.status = this.status;
        s.end_date = this.end_date;
        return this;
      },
    });

    const instance = createSubInstance(sub);
    const p = Promise.resolve(instance);
    p.populate = async (field) => {
      if (field === 'plan_id') {
        const plan = this.plans.find(pl => String(pl._id) === String(sub.plan_id)) || null;
        instance.plan_id = plan;
      }
      return instance;
    };
    return p;
  }

  async updateManySubscriptions(filter = {}, update = {}) {
    let count = 0;
    for (const sub of this.subscriptions) {
      let matches = true;
      if (filter.user_id && String(sub.user_id) !== String(filter.user_id)) matches = false;
      if (filter.status && sub.status !== filter.status) matches = false;
      if (matches) {
        if (update.$set) {
          Object.assign(sub, update.$set);
        }
        count++;
      }
    }
    return { modifiedCount: count };
  }

  async createSubscription(data) {
    const newSub = {
      _id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      user_id: data.user_id,
      plan_id: data.plan_id,
      start_date: data.start_date || new Date(),
      status: data.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.subscriptions.push(newSub);
    return { ...newSub };
  }
}

const memoryStore = new MemoryStore();
module.exports = memoryStore;
