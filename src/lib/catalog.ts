import { EXAMS, STATES, type Exam } from "./exams";
import { slugify } from "./keys";
import { SUBJECTS, topicRegistry, type Subject, type TopicEntry } from "./syllabus";

/** Exams × subjects × topics, joined once. */
export const TOPICS = topicRegistry(STATES);
export const ALL_TOPICS: TopicEntry[] = [...TOPICS.values()];

export const topicBySlug = (slug: string) => TOPICS.get(slug);
export const isTopic = (title: string) => TOPICS.has(slugify(title));

/** Subjects a topic belongs to (a topic like "Reserve Bank of India" sits in two). */
export function subjectsForTopic(t: TopicEntry): Subject[] {
  return SUBJECTS.filter((s) => s.slug === t.subject || s.topics.includes(t.title));
}

/** Exams whose syllabus includes the topic's subjects (state topics: only that state's exams). */
export function examsForTopic(t: TopicEntry): Exam[] {
  const subjects = new Set(subjectsForTopic(t).map((s) => s.slug));
  return EXAMS.filter((e) => e.subjects.some((s) => subjects.has(s)) && (!t.state || e.state === t.state));
}

/** Other topics in the same subject, for "related topics". */
export function siblings(t: TopicEntry, limit = 8): TopicEntry[] {
  return ALL_TOPICS.filter((o) => o.subject === t.subject && o.slug !== t.slug && (!t.state || o.state === t.state)).slice(0, limit);
}

export const topicsOfState = (state: string) => ALL_TOPICS.filter((t) => t.state === state);
