import LegalMarkdownPage from "@/components/shared/LegalMarkdownPage";
import termsAndConditions from "@/content/legal/terms-and-conditions.md?raw";

const TermsOfService = () => (
  <LegalMarkdownPage
    title="Terms of Service"
    description="Terms and conditions for using the AlphaTrack Digital website and services."
    canonicalUrl="/terms-of-service"
    markdown={termsAndConditions}
  />
);

export default TermsOfService;
