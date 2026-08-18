import { describe, expect, it } from 'vitest'
import { HELP_TOPICS } from './helpTopics'

describe('HELP_TOPICS', () => {
  it('has at least one topic', () => {
    expect(HELP_TOPICS.length).toBeGreaterThan(0)
  })

  it('has a non-empty question and answer for every topic', () => {
    for (const topic of HELP_TOPICS) {
      expect(topic.question.length).toBeGreaterThan(0)
      expect(topic.answer.length).toBeGreaterThan(0)
    }
  })

  it('has unique questions', () => {
    const questions = HELP_TOPICS.map((topic) => topic.question)
    expect(new Set(questions).size).toBe(questions.length)
  })
})
