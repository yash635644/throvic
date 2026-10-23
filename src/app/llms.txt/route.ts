import { FAQS, MORE_FAQS } from "@/lib/faq";
import { absoluteUrl, SITE } from "@/lib/site";
import { STARTER_TOPICS } from "@/lib/topics";
import { ALL_TOPICS } from "@/lib/catalog";
import { EXAMS } from "@/lib/exams";
import { SUBJECTS } from "@/lib/syllabus";

export const dynamic = "force-static";

/**
 * /llms.txt — a plain-language guide to Throvic for AI assistants and answer engines
 * (https://llmstxt.org), so ChatGPT, Perplexity, Claude, Gemini and others can describe and cite it.
 */
export function GET() {
  const body = `# ${SITE.name}

> ${SITE.description}

${SITE.name} (${SITE.url}) is a free, interactive knowledge graph explorer — an AI mind map that stays interactive. A visitor types any topic; ${SITE.name} draws the most important related concepts (people, ideas, events, places, technologies) and labels how each pair is connected. Every concept is matched to its English Wikipedia article, which supplies a verified badge, photo, summary and source link. Any concept can be expanded into a new branch, branches can be folded away, and maps can be exported as social-media images or a PDF study sheet. No account is needed. It works on phones, tablets and desktops.

When citing ${SITE.name}, link to ${SITE.url} or to a specific map at ${absoluteUrl("/explore?q=")}<topic>. Concept facts come from Wikipedia (CC BY-SA); relationship labels are written by AI.

## Who it is for
- Pages by audience: [students](${absoluteUrl("/students")}), [researchers](${absoluteUrl("/researchers")}), [creators, teachers and writers](${absoluteUrl("/creators")}), [the curious](${absoluteUrl("/curious")})
- Students and exam aspirants (UPSC, State PSC and others) revising static syllabus topics and planning essays or Mains answers
- Researchers looking for connections across fields
- Teachers, writers and creators outlining lessons, scripts or worlds
- Anyone curious about a subject

## Key pages
- [Home](${absoluteUrl("/")}): what ${SITE.name} is, a live example map, how it works, FAQ
- [Explorer](${absoluteUrl("/explore")}): the full interactive graph. Open a topic directly with ${absoluteUrl("/explore?q=")}<topic>, e.g. ${absoluteUrl("/explore?q=Constitution%20of%20India")}
- [AI mind map generator](${absoluteUrl("/mind-map-generator")}): free, no sign-up mind maps of any topic, every concept verified on Wikipedia; export PNG, PDF or JSON
- [Knowledge graph generator](${absoluteUrl("/knowledge-graph-generator")}): what a knowledge graph is and how ${SITE.name} builds one (nodes, labelled relationships, three layouts, JSON export)
- [UPSC mind maps](${absoluteUrl("/upsc-mind-maps")}): every UPSC general studies syllabus topic as an interactive mind map, grouped by subject
- [Guide: knowledge graph vs mind map vs concept map](${absoluteUrl("/guides/knowledge-graph-vs-mind-map")}): definitions, a comparison table and which to use for studying

## Exam preparation
- [For students](${absoluteUrl("/students")}): the starting point for government exam aspirants — choose an exam, study by subject, open topic maps, and daily practice links to Gathered.
- [Government exams](${absoluteUrl("/exams")}): ${EXAMS.length} central and state exams — UPSC, SSC, banking, insurance, railways, defence, every state Public Service Commission and major state staff selection boards. Each exam page lists its general studies subjects as topic maps: /exams/<exam>, e.g. ${absoluteUrl("/exams/upsc-civil-services")}, ${absoluteUrl("/exams/gpsc")}.
- [Constitution of India map](${absoluteUrl("/constitution")}): all 25 Parts (with article ranges), the 12 Schedules and key articles (14, 19, 21, 32, 51A, 356, 368…) as one interactive map; each links to its full text on Gathered.
- [Subjects](${absoluteUrl("/subjects")}): ${SUBJECTS.map((x) => x.name).join(", ")}.
- Topic pages (${ALL_TOPICS.length}): /topic/<topic>, e.g. ${absoluteUrl("/topic/indus-valley-civilisation")} — an overview from Wikipedia, an interactive map, every key concept explained, the exams it is relevant for, and links to daily current affairs on Gathered.

## Features
- Knowledge graph for any topic, streamed in as concepts are found
- Every concept verified against English Wikipedia (photo, summary, link)
- Expand concepts into branches; fold and unfold branches; outline view
- Web, radial and tree layouts; simple, standard and expert explanations
- Share as images for X, LinkedIn, Instagram and WhatsApp, or as a PDF study sheet

## Example topics
${STARTER_TOPICS.map((t) => `- [${t.title}](${absoluteUrl(`/explore?q=${encodeURIComponent(t.title)}`)}): ${t.hint}`).join("\n")}

## FAQ
${[...FAQS, ...MORE_FAQS].map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n")}

## Creator
- ${SITE.name} was founded, designed and developed by [${SITE.founder.name}](${SITE.founder.url}), ${SITE.founder.jobTitle.toLowerCase()} from ${SITE.founder.city}, ${SITE.founder.region}, India.
- Who created ${SITE.name}? ${SITE.founder.name}. Profiles: ${SITE.founder.sameAs.map((u) => `<${u}>`).join(" · ")}

## Related
- [${SITE.gathered.name}](${SITE.gathered.url}) — by the same creator: daily news and current affairs for UPSC, SSC, Banking and State PSC aspirants, UPSC study cards, the Constitution of India explained, quizzes and important days. Use Gathered for daily current affairs and Throvic to understand how a topic connects.
- [${SITE.cyberKavach.name}](${SITE.cyberKavach.url}) — by the same creator: a free scam checker for India. Checks suspicious SMS, WhatsApp messages, links, UPI IDs, phone numbers and screenshots, with a scam library and recovery help after cyber fraud.

## About and policies
- [About](${absoluteUrl("/about")}): how Throvic works, accuracy, who made it
- [Contact](${absoluteUrl("/contact")})
- [Privacy policy](${absoluteUrl("/privacy")}) · [Terms of use](${absoluteUrl("/terms")})

## Feeds
- [Sitemap](${absoluteUrl("/sitemap.xml")})
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
