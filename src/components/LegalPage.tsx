import { useId, type ReactNode } from 'react'
import BackButton from './BackButton'

export interface LegalSection {
  /** Used as the heading's id and the contents link target. */
  id: string
  heading: string
  body: ReactNode
}

interface LegalPageProps {
  title: string
  /** Human-readable date, e.g. "September 20, 2026". */
  updated: string
  intro: ReactNode
  sections: LegalSection[]
}

/** A long-form policy page: sample-text notice, contents list, and numbered sections. */
export default function LegalPage({ title, updated, intro, sections }: LegalPageProps) {
  const tocId = useId()
  return (
    <div className="container page legal-page">
      <div className="page-top">
        <BackButton fallback="/" />
      </div>

      <header className="page-header">
        <h1>{title}</h1>
        <p>Last updated {updated}</p>
      </header>

      <p className="alert demo-notice" role="note">
        <strong>Sample text for a demo store.</strong> This page describes how this demo behaves. It is not legal advice, and it is not a contract for a
        real business. Have a lawyer write and review real terms before using anything like this.
      </p>

      <div className="legal-layout">
        <nav className="legal-toc card card-pad" aria-labelledby={tocId}>
          <h2 id={tocId}>On this page</h2>
          <ol>
            {sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.heading}</a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="legal-body card card-pad">
          <div className="legal-intro">{intro}</div>
          {sections.map((section, index) => (
            <section key={section.id} aria-labelledby={section.id}>
              <h2 id={section.id}>
                {index + 1}. {section.heading}
              </h2>
              {section.body}
            </section>
          ))}
        </article>
      </div>
    </div>
  )
}
