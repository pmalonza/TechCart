import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import BackButton from '../components/BackButton'
import ContactForm from '../components/ContactForm'
import { FAQS } from '../data/faq'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { FAQ_TOPICS, filterFaqs } from '../lib/help'

export default function HelpPage() {
  const searchId = useId()
  const [query, setQuery] = useState('')
  useDocumentTitle('Help')

  const matches = filterFaqs(FAQS, query)
  const searching = query.trim() !== ''

  return (
    <div className="container page help-page">
      <div className="page-top">
        <BackButton fallback="/" />
      </div>
      <header className="page-header">
        <h1>Help</h1>
        <p>Answers to common questions, and a way to get in touch.</p>
      </header>

      <section aria-labelledby="faq-heading" className="card card-pad">
        <h2 id="faq-heading">Frequently asked questions</h2>

        <div className="field help-search">
          <label htmlFor={searchId}>Search the questions</label>
          <input
            id={searchId}
            type="search"
            autoComplete="off"
            placeholder="e.g. delivery, password, photo"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-describedby={`${searchId}-count`}
          />
          <span id={`${searchId}-count`} className="hint" role="status">
            {searching ? (matches.length === 0 ? 'No questions match.' : `${matches.length} ${matches.length === 1 ? 'question matches' : 'questions match'}.`) : `${FAQS.length} questions.`}
          </span>
        </div>

        {matches.length === 0 && (
          <p>
            Nothing matched &ldquo;{query.trim()}&rdquo;. Try fewer words, or <a href="#contact">contact us</a>.
          </p>
        )}

        {FAQ_TOPICS.map((topic) => {
          const inTopic = matches.filter((faq) => faq.topic === topic.id)
          if (inTopic.length === 0) return null
          return (
            <section key={topic.id} aria-labelledby={`faq-${topic.id}`} className="faq-group">
              <h3 id={`faq-${topic.id}`}>{topic.name}</h3>
              {inTopic.map((faq) => (
                <details key={faq.id} className="faq" open={searching && matches.length <= 3 ? true : undefined}>
                  <summary>{faq.question}</summary>
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                    {faq.link && (
                      <p>
                        <Link to={faq.link.to}>{faq.link.label}</Link>
                      </p>
                    )}
                  </div>
                </details>
              ))}
            </section>
          )
        })}
      </section>

      <ContactForm />
    </div>
  )
}
