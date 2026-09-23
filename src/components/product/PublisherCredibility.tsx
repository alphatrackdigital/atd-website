import { companyProfile } from "@/data/companyProfile";

const PublisherCredibility = () => (
  <section className="border-t border-white/10 bg-[#070a10] py-8 lg:py-16">
    <div className="container mx-auto px-6 md:px-4 lg:px-8">
      <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary">
        The Publisher
      </span>
      <h2 className="mt-2 max-w-lg text-2xl font-bold leading-tight lg:mt-3 md:text-4xl">AlphaTrack Digital</h2>
      <p className="mt-4 max-w-2xl text-sm leading-[1.75] text-muted-foreground lg:text-[15px]">
        {companyProfile.shortDescription} The playbooks document the same methods we run for clients.
      </p>
    </div>
  </section>
);

export default PublisherCredibility;
