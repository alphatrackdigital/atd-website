import TrackingAuditVerticalTemplate from "@/pages/tracking-audit/TrackingAuditVerticalTemplate";

const TrackingAuditRealEstate = () => (
  <TrackingAuditVerticalTemplate
    presetIndustry="real_estate"
    heroHeadline={
      <>
        Can you trace an ad click through enquiry, viewing and{" "}
        <span className="title-safe-inline text-gradient-atd-hero">closed deal?</span>
      </>
    }
    heroSupport="We’ll review one core listing or lead-generation journey to see whether the measurement setup can reliably connect campaign activity to enquiries, booked viewings and closed sales or lets."
    seoTitle="Free Conversion Tracking Audit for Real Estate | AlphaTrack Digital"
    seoDescription="Request a free conversion tracking audit to see whether your real estate lead journey can reliably connect campaign activity to enquiry, viewing and closed-deal outcomes."
    canonicalUrl="/offer/tracking-audit/real-estate"
  />
);

export default TrackingAuditRealEstate;
