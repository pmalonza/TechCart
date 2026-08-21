export default function PolicyView({ policy, onBack }) {
  return (
    <section className="policy-view" aria-label={policy.title}>
      <button type="button" className="text-button" onClick={onBack}>
        &larr; Back
      </button>
      <h2>{policy.title}</h2>
      {policy.sections.map((section) => (
        <div key={section.heading} className="policy-section">
          <h3>{section.heading}</h3>
          <p>{section.body}</p>
        </div>
      ))}
    </section>
  )
}
