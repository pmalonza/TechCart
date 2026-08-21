import { HELP_TOPICS } from '../data/helpTopics'

export default function HelpView({ onBack, onViewContact, onViewReturns, onViewWarranty }) {
  return (
    <section className="help-view" aria-label="Help">
      <button type="button" className="text-button" onClick={onBack}>
        &larr; Back
      </button>
      <h2>Help</h2>
      <dl className="help-topics">
        {HELP_TOPICS.map((topic) => (
          <div key={topic.question} className="help-topic">
            <dt>{topic.question}</dt>
            <dd>{topic.answer}</dd>
          </div>
        ))}
      </dl>
      <p className="help-view-more">
        Still need help?{' '}
        <button type="button" className="text-button" onClick={onViewContact}>
          Contact us
        </button>
      </p>
      <p className="help-view-more">
        <button type="button" className="text-button" onClick={onViewReturns}>
          Return policy
        </button>
        {' · '}
        <button type="button" className="text-button" onClick={onViewWarranty}>
          Warranty
        </button>
      </p>
    </section>
  )
}
