/**
 * Home-page FAQ: only the questions most visitors have. Keep answers short and factual.
 * Also used in FAQPage structured data and llms.txt.
 */
export const FAQS: { q: string; a: string }[] = [
  {
    q: "What is Throvic?",
    a: "Throvic is a free interactive knowledge graph explorer. Type a topic and it maps the most important related concepts — people, ideas, events and places — and how they connect. Tap any concept to read about it, then expand it to go deeper.",
  },
  {
    q: "How accurate are the maps?",
    a: "AI suggests the concepts and how they relate; Throvic then checks every concept against its English Wikipedia article and shows its summary, photo and source link. Relationship labels are written by AI, so follow the source links when you need detail or citations.",
  },
  {
    q: "Is Throvic free? Do I need an account?",
    a: "Yes, it's free, and there is no sign-up. Your recent topics are saved only in your own browser.",
  },
  {
    q: "Can I use it on my phone and share maps?",
    a: "Yes. It works on phones, tablets and desktops with touch gestures. You can share a link, download a designed image for social media, or save a PDF with every concept and its source.",
  },
  {
    q: "Can Throvic help with exam preparation?",
    a: "Yes. The For students section maps the syllabus of UPSC, SSC, banking, railways, defence and state PSC exams topic by topic, with flashcards and quizzes. For daily current affairs, use Gathered, our sister site.",
  },
];

/** Further questions, answered on the About page (still useful for search engines and AI assistants). */
export const MORE_FAQS: { q: string; a: string }[] = [
  {
    q: "What is a knowledge graph?",
    a: "A knowledge graph is a network of concepts (nodes) joined by labelled relationships (links), such as “Albert Einstein — developed — General relativity”. Seeing a topic this way shows its context at a glance: causes, people, places and consequences, not just a definition.",
  },
  {
    q: "Is Throvic an AI mind map generator?",
    a: "It works like one, with two differences: every concept is matched to a real Wikipedia article, and the map stays interactive, so you can expand any concept into a new branch instead of starting over.",
  },
  {
    q: "Who is Throvic for?",
    a: "Students and exam aspirants revising syllabus topics, researchers looking for connections across fields, teachers, writers and creators outlining their work, and anyone who enjoys following their curiosity.",
  },
  {
    q: "Who made Throvic?",
    a: "Throvic is designed and developed by Yash Trivedi, who also created Gathered, a daily news and current-affairs site.",
  },
];
