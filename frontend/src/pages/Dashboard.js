import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    api.get('/user/dashboard').then(({ data }) => setDashboard(data));
    api.get('/subscriptions/me').then(({ data }) => setSubscription(data.subscription));
  }, []);

  const handleCancel = async () => {
    if (!window.confirm('Cancel your current subscription?')) return;
    await api.post('/subscriptions/cancel-subscription');
    setSubscription(null);
  };

  return (
    <div className="dashboard-page">
      <h1>{dashboard?.message || 'Loading...'}</h1>
      <div className="dashboard-card">
        <h3>Current Plan</h3>
        <p className="plan-name">{dashboard?.plan || '—'}</p>
        {subscription ? (
          <>
            <p>Status: <strong>{subscription.status}</strong></p>
            <p>Since: {new Date(subscription.start_date).toLocaleDateString()}</p>
            <button className="danger" onClick={handleCancel}>Cancel Subscription</button>
          </>
        ) : (
          <p>You don't have an active subscription yet.</p>
        )}
        <Link to="/plans" className="link-cta">View / change plans →</Link>
      </div>
    </div>
  );
}
