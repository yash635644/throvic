import { AudiencePage, audienceMetadata } from "@/components/site/AudiencePage";

export const metadata = audienceMetadata("creators");

export default function Page() {
  return <AudiencePage slug="creators" />;
}
