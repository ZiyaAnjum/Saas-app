import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import PlanCard from '../components/PlanCard';
import './Plans.css';

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    api.get('/plans')
      .then(({ data }) => setPlans(data.plans || []))
      .catch((err) => console.warn('Could not load plans:', err?.message));

    const token = localStorage.getItem('token');
    if (user && token) {
      api.get('/subscriptions/me')
        .then(({ data }) => {
          if (data && data.subscription && data.subscription.plan_id) {
            setCurrentPlanId(data.subscription.plan_id._id);
          }
        })
        .catch((err) => console.warn('Subscription fetch notice:', err?.message));
    }
  }, [user]);

  const handleSubscribe = async (plan) => {
    if (!user) {
      setMessage('Please log in to subscribe.');
      return;
    }
    try {
      if (currentPlanId) {
        await api.put('/subscriptions/upgrade-plan', { planId: plan._id });
      } else {
        await api.post('/subscriptions/subscribe', { planId: plan._id });
      }
      setCurrentPlanId(plan._id);
      setMessage(`You're now on the ${plan.name} plan.`);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong.');
    }
  };

  return (
    <div className="plans-page">
      <h1>Choose the plan that fits you</h1>
      {message && <p className="banner">{message}</p>}
      <div className="plans-grid">
        {plans.map((plan) => (
          <PlanCard key={plan._id} plan={plan} onSubscribe={handleSubscribe} isCurrent={plan._id === currentPlanId} />
        ))}
      </div>
    </div>
  );
}
