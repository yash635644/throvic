import { AudiencePage, audienceMetadata } from "@/components/site/AudiencePage";

export const metadata = audienceMetadata("researchers");

export default function Page() {
  return <AudiencePage slug="researchers" />;
}
