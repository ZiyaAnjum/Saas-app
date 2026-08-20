export default function PlanCard({ plan, onSubscribe, isCurrent }) {
  return (
    <div className={`plan-card ${isCurrent ? 'current' : ''}`}>
      <h3>{plan.name}</h3>
      <p className="price">${plan.price}<span>/mo</span></p>
      <ul>
        {plan.features.map((f, i) => <li key={i}>{f}</li>)}
      </ul>
      <button onClick={() => onSubscribe(plan)} disabled={isCurrent}>
        {isCurrent ? 'Current Plan' : 'Choose Plan'}
      </button>
    </div>
  );
}
