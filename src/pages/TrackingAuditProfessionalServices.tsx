import TrackingAuditVerticalTemplate from "@/pages/tracking-audit/TrackingAuditVerticalTemplate";

const TrackingAuditProfessionalServices = () => (
  <TrackingAuditVerticalTemplate
    presetIndustry="professional_services"
    heroHeadline={
      <>
        Can you prove which campaigns generate your valuable{" "}
        <span className="title-safe-inline text-gradient-atd-hero">enquiries?</span>
      </>
    }
    heroSupport="We’ll review how one core enquiry journey is measured—from acquisition source through the website and into your lead destination—so you can see where attribution or lead visibility may be failing."
    seoTitle="Free Conversion Tracking Audit for Professional Services | AlphaTrack Digital"
    seoDescription="Request a free conversion tracking audit to see whether your professional services enquiry journey can be traced from acquisition source through to your lead destination."
    canonicalUrl="/offer/tracking-audit/professional-services"
  />
);

export default TrackingAuditProfessionalServices;
