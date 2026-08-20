import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return (
    <div className="home-page">
      <h1>Manage your subscriptions, effortlessly.</h1>
      <p>Sign up, pick a plan, and get access to the features that fit you — upgrade or cancel any time.</p>
      <div className="home-cta">
        <Link to="/signup" className="btn-primary">Get Started</Link>
        <Link to="/plans" className="btn-secondary">View Plans</Link>
      </div>
    </div>
  );
}
