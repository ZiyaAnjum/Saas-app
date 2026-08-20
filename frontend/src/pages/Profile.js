import { useEffect, useState } from 'react';
import api from '../api/axios';
import './Dashboard.css';

export default function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get('/user/profile')
      .then(({ data }) => setProfile(data.user))
      .catch((err) => console.warn('Profile fetch notice:', err?.message));
  }, []);

  if (!profile) return <p className="dashboard-page">Loading...</p>;

  return (
    <div className="dashboard-page">
      <h1>My Profile</h1>
      <div className="dashboard-card">
        <p><strong>Name:</strong> {profile.name}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Role:</strong> {profile.role}</p>
      </div>
    </div>
  );
}
