import LegalMarkdownPage from "@/components/shared/LegalMarkdownPage";
import cookiePolicy from "@/content/legal/cookie-policy.md?raw";

const CookiePolicy = () => (
  <LegalMarkdownPage
    title="Cookie Policy"
    description="How AlphaTrack Digital uses cookies and similar technologies."
    canonicalUrl="/cookie-policy"
    markdown={cookiePolicy}
  />
);

export default CookiePolicy;
