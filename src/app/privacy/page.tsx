import type { Metadata } from "next";
import { withShare } from "@/lib/share-cards";
import Link from "@/components/ui/Link";
import { ProsePage } from "@/components/site/Prose";
import { SITE } from "@/lib/site";

export const metadata: Metadata = withShare(
  {
    title: "Privacy Policy",
    description: "What Throvic collects (very little), how topics you search are processed, and what stays on your own device.",
    alternates: { canonical: "/privacy" },
  },
  "privacy",
);

export default function PrivacyPage() {
  return (
    <ProsePage
      eyebrow="Legal"
      title="Privacy policy"
      intro="Throvic has no accounts and needs no personal details to use. This page explains the little data involved and where it goes."
      updated="15 October 2026"
      crumb={{ name: "Privacy", href: "/privacy" }}
    >
      <h2>Summary</h2>
      <ul>
        <li>No sign-up, no profile.</li>
        <li>Topics you search are processed to build maps; they are not linked to you.</li>
        <li>Your recent and revised topics are stored only in your own browser.</li>
        <li>{SITE.gaId ? "We use Google Analytics to understand how the site is used." : "Throvic does not currently use analytics, advertising or tracking cookies."}</li>
      </ul>

      <h2>Topics you search</h2>
      <p>
        When you search a topic or expand a concept, the topic name (and the names of concepts already on your map, for context) is sent to our server, which runs on Cloudflare. To build the map, the server sends
        those topic names to a third-party AI service and looks the concepts up on Wikipedia. Finished maps are cached by topic so that they open instantly for everyone; the cache stores the map, not who asked for
        it.
      </p>

      <h2>Requests your browser makes directly</h2>
      <p>
        Search suggestions and concept photos are loaded straight from Wikipedia and Wikimedia, so those requests are covered by the{" "}
        <a href="https://foundation.wikimedia.org/wiki/Policy:Privacy_policy" rel="noopener">
          Wikimedia privacy policy
        </a>
        . Fonts are served from Throvic itself.
      </p>

      <h2>Technical data</h2>
      <p>
        Like any website, our hosting provider Cloudflare processes your IP address and basic request details to deliver pages and protect the service. Throvic also keeps a short-lived, in-memory count of requests
        per IP address (for a few minutes) to stop automated abuse of the map service.
      </p>

      <h2>Feedback and contact form</h2>
      <p>
        If you send feedback, your name, email address and message are delivered to the developer through Formspree, a form service. They are used only to read and reply to your message.
      </p>

      <h2>Stored on your device</h2>
      <p>
        Your recent topics and the topics you mark as revised are kept in your browser&apos;s local storage. They never leave your device, and clearing your browser data removes them.
      </p>

      {SITE.gaId && (
        <>
          <h2>Analytics</h2>
          <p>We use Google Analytics to count visits and see which features are used. It sets cookies in your browser; you can block them with your browser settings or an extension.</p>
        </>
      )}

      <h2>Children</h2>
      <p>Throvic is a general educational tool and collects no personal information to use it. Younger students should use it with a parent or teacher, as with any website.</p>

      <h2>Changes and questions</h2>
      <p>
        If this policy changes, the date above will change too. Questions? Use the <Link href="/contact">contact page</Link>.
      </p>
    </ProsePage>
  );
}
