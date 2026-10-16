import { AudiencePage, audienceMetadata } from "@/components/site/AudiencePage";

export const metadata = audienceMetadata("curious");

export default function Page() {
  return <AudiencePage slug="curious" />;
}
