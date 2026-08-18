import { HELP_TOPICS } from '../data/helpTopics'

export default function HelpView({ onBack }) {
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
    </section>
  )
}
