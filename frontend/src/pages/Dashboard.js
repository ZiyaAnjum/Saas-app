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

  const recentActivity = [
    { id: 1, date: 'Aug 20, 2026', description: 'Monthly Subscription Renewal', amount: '$9.99', status: 'Paid' },
    { id: 2, date: 'Jul 20, 2026', description: 'Monthly Subscription Renewal', amount: '$9.99', status: 'Paid' },
    { id: 3, date: 'Jun 20, 2026', description: 'Plan Upgrade (Basic Tier)', amount: '$9.99', status: 'Paid' },
    { id: 4, date: 'May 20, 2026', description: 'Account Initial Setup (Free Tier)', amount: '$0.00', status: 'Completed' },
  ];

  return (
    <div className="dashboard-page" id="dashboard-page">
      <h1>{dashboard?.message || 'Loading...'}</h1>

      {/* Current Plan Card */}
      <div className="dashboard-card" id="current-plan-card">
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

      {/* Responsive Grid */}
      <div className="dashboard-grid" id="dashboard-grid">
        {/* 1. Usage / Quota Widget */}
        <div className="dashboard-card widget-card" id="usage-quota-card">
          <h3>Usage &amp; Quotas</h3>
          <div className="usage-item">
            <div className="usage-header">
              <span className="usage-label">Active Projects</span>
              <span className="usage-metric"><strong>3</strong> of 10 used</span>
            </div>
            <div className="progress-track" role="progressbar" aria-valuenow="30" aria-valuemin="0" aria-valuemax="100">
              <div className="progress-bar" style={{ width: '30%' }}></div>
            </div>
            <span className="usage-subtext">7 project slots available</span>
          </div>

          <div className="usage-item">
            <div className="usage-header">
              <span className="usage-label">Storage Capacity</span>
              <span className="usage-metric"><strong>2.4 GB</strong> of 10 GB</span>
            </div>
            <div className="progress-track" role="progressbar" aria-valuenow="24" aria-valuemin="0" aria-valuemax="100">
              <div className="progress-bar" style={{ width: '24%', backgroundColor: '#0284c7' }}></div>
            </div>
            <span className="usage-subtext">7.6 GB cloud storage available</span>
          </div>
        </div>

        {/* 2. Next Billing Widget */}
        <div className="dashboard-card widget-card" id="billing-widget-card">
          <h3>Next Billing</h3>
          <div className="billing-details">
            <div className="billing-amount-group">
              <span className="billing-amount-label">Upcoming Charge</span>
              <p className="billing-amount">$9.99 <span className="billing-frequency">/ month</span></p>
            </div>
            <div className="billing-meta">
              <div className="billing-meta-row">
                <span className="meta-label">Billing Date:</span>
                <span className="meta-value">September 20, 2026</span>
              </div>
              <div className="billing-meta-row">
                <span className="meta-label">Payment Method:</span>
                <span className="meta-value">Visa ending in •••• 4242</span>
              </div>
              <div className="billing-meta-row">
                <span className="meta-label">Auto-Renew:</span>
                <span className="badge-active">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Recent Activity Table */}
        <div className="dashboard-card activity-card" id="recent-activity-card">
          <div className="activity-header-wrap">
            <h3>Recent Activity</h3>
            <span className="activity-count">Showing last 4 transactions</span>
          </div>
          <div className="table-responsive">
            <table className="activity-table" id="activity-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((item) => (
                  <tr key={item.id}>
                    <td className="activity-date">{item.date}</td>
                    <td className="activity-desc">{item.description}</td>
                    <td className="activity-amount">{item.amount}</td>
                    <td>
                      <span className={`status-pill status-${item.status.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
