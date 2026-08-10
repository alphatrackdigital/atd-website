import LegalMarkdownPage from "@/components/shared/LegalMarkdownPage";
import privacyPolicy from "@/content/legal/privacy-policy.md?raw";

const PrivacyPolicy = () => (
  <LegalMarkdownPage
    title="Privacy Policy"
    description="How AlphaTrack Digital collects, uses, shares, stores, and protects personal information."
    canonicalUrl="/privacy-policy"
    markdown={privacyPolicy}
  />
);

export default PrivacyPolicy;
