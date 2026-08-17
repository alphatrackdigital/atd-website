import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { BOOK_A_FREE_STRATEGY_CALL_CTA } from "@/config/cta";
import Index from "@/pages/Index";
import { supportingServices } from "@/data/services";
import { renderWithPageProviders } from "@/test/renderWithPageProviders";

describe("Homepage proof and stack sections", () => {
  it("renders the stat-strip proof section with real campaign metrics and keeps the stack before blog", () => {
    renderWithPageProviders(<Index />);

    const proofSection = screen.getByTestId("proof-strip-section");
    const stackHeading = screen.getByRole("heading", { name: "Tools We Use" });
    const testimonialSection = screen.getByTestId("testimonial-section");
    const blogHeading = screen.getByRole("heading", { name: "From Our Blog" });

    expect(proofSection.compareDocumentPosition(stackHeading)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(stackHeading.compareDocumentPosition(testimonialSection)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(testimonialSection.compareDocumentPosition(blogHeading)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(stackHeading.compareDocumentPosition(blogHeading)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);

    expect(within(proofSection).getAllByTestId("proof-metric")).toHaveLength(3);
    expect(within(proofSection).getByText("RESULTS FROM SELECTED CAMPAIGNS")).toBeInTheDocument();
    expect(within(proofSection).getByText("4.9M")).toBeInTheDocument();
    expect(within(proofSection).getByText("3,151")).toBeInTheDocument();
    expect(within(proofSection).getByText("129,862")).toBeInTheDocument();
    expect(within(proofSection).getByText("Education impressions")).toBeInTheDocument();
    expect(within(proofSection).getByText("Hospitality visits")).toBeInTheDocument();
    expect(within(proofSection).getByText("Consumer teaser views")).toBeInTheDocument();
    expect(within(proofSection).getByText("Education campaign impressions")).toBeInTheDocument();
    expect(within(proofSection).getByText("Hospitality campaign website visits")).toBeInTheDocument();
    expect(within(proofSection).getByText("Consumer brand teaser views")).toBeInTheDocument();
    expect(screen.queryByText("Proof")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Recent campaign signals" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Growth should never/i })).toBeInTheDocument();
    expect(
      screen.getByText((_, element) =>
        element?.textContent ===
        "We build the measurement, automation, and paid media systems that turn your marketing budget into measurable revenue. So you can see what's working, fix what isn't, and scale with confidence."
      )
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: BOOK_A_FREE_STRATEGY_CALL_CTA.label }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /Explore Services/i }).length).toBeGreaterThan(0);
    expect(screen.queryByText("Strategy-led execution")).not.toBeInTheDocument();
    expect(screen.queryByText("Measurement-first delivery")).not.toBeInTheDocument();
    expect(screen.queryByText("Clear reporting and next steps")).not.toBeInTheDocument();
    expect(screen.queryByTestId("hero-system-board")).not.toBeInTheDocument();
    expect(screen.queryByText("How the system connects")).not.toBeInTheDocument();
    expect(screen.queryByText("Connected delivery map")).not.toBeInTheDocument();
    expect(screen.queryByText("Qualified demand with clearer visibility")).not.toBeInTheDocument();
    expect(screen.queryByText("2.1M+")).not.toBeInTheDocument();
    expect(screen.queryByText("55%")).not.toBeInTheDocument();
    expect(screen.queryByText("25.14%")).not.toBeInTheDocument();
    expect(screen.queryByText("Reach")).not.toBeInTheDocument();
    expect(screen.queryByText("Viewer-to-Site Rate")).not.toBeInTheDocument();
    expect(screen.queryByText("Completion Rate")).not.toBeInTheDocument();
    expect(screen.queryByText(/^Website Visits$/)).not.toBeInTheDocument();
    expect(screen.queryByText("4.2x")).not.toBeInTheDocument();
    expect(screen.queryByText("+68%")).not.toBeInTheDocument();
    expect(screen.queryByText("99.4%")).not.toBeInTheDocument();
    expect(screen.queryByText("âˆ’25%")).not.toBeInTheDocument();
    expect(screen.queryByText("A Client Perspective")).not.toBeInTheDocument();
    expect(screen.queryByText("Recent Client Outcomes")).not.toBeInTheDocument();

    const industriesSection = screen.getByTestId("industries-section");

    expect(within(industriesSection).getByText("Expertise")).toBeInTheDocument();
    expect(within(industriesSection).getByRole("heading", { name: "Who We Work With" })).toBeInTheDocument();
    expect(within(industriesSection).getAllByTestId("industry-card")).toHaveLength(8);
    expect(within(industriesSection).getByRole("link", { name: /Ecommerce & Retail/i })).toHaveAttribute(
      "href",
      "/expertise/ecommerce-retail"
    );
    expect(within(industriesSection).getByRole("link", { name: /SaaS/i })).toHaveAttribute(
      "href",
      "/expertise/saas"
    );
    expect(
      within(industriesSection).getByRole("link", { name: /Entertainment & Hospitality/i })
    ).toHaveAttribute("href", "/expertise/entertainment-hospitality");
    expect(within(industriesSection).getByRole("link", { name: /Real Estate/i })).toHaveAttribute(
      "href",
      "/expertise/real-estate"
    );
    expect(within(industriesSection).getByRole("link", { name: /Fashion/i })).toHaveAttribute(
      "href",
      "/expertise/fashion"
    );
    expect(within(industriesSection).getByRole("link", { name: /Gaming/i })).toHaveAttribute(
      "href",
      "/expertise/gaming"
    );
    expect(screen.queryByText("Retail + E-commerce")).not.toBeInTheDocument();
    expect(screen.queryByText("Travel + Hospitality")).not.toBeInTheDocument();

    expect(within(testimonialSection).getByRole("heading", { name: "What Our Clients Say" })).toBeInTheDocument();
    expect(within(testimonialSection).getByText("Courtney Quist-Therson")).toBeInTheDocument();
    expect(within(testimonialSection).getByText("CEO & Founder, Pearl House Ghana")).toBeInTheDocument();
    expect(
      within(testimonialSection).getByText(/Working with AlphaTrack Digital Limited was an excellent experience\./i)
    ).toBeInTheDocument();

    const stackSection = screen.getByTestId("growth-stack-section");

    expect(within(stackSection).getAllByTestId("growth-stack-card")).toHaveLength(3);
    expect(within(stackSection).getAllByText("Measurement").length).toBeGreaterThan(0);
    expect(within(stackSection).getAllByText("Paid Media").length).toBeGreaterThan(0);
    expect(within(stackSection).getAllByText("Automation").length).toBeGreaterThan(0);
    expect(
      screen.getByText(
        "A few tools we use for tracking, ads, and automation."
      )
    ).toBeInTheDocument();
    expect(within(stackSection).getAllByText("Microsoft Clarity").length).toBeGreaterThan(0);
    expect(screen.queryByText("Measure first. Acquire with intent. Nurture for retention.")).not.toBeInTheDocument();
    expect(screen.queryByText(/\+\d+\s+additional/i)).not.toBeInTheDocument();
    expect(screen.getByText("More Services")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Other Ways We Help" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Website, content, email, and search services that help your marketing work better."
      )
    ).toBeInTheDocument();
    const supportingItems = screen.getAllByTestId("supporting-service-item");

    expect(supportingItems).toHaveLength(4);
    expect(within(supportingItems[0]).getByText("Website Development")).toBeInTheDocument();
    expect(within(supportingItems[1]).getByText("Content & Media Strategy")).toBeInTheDocument();
    expect(within(supportingItems[2]).getByText("Email Marketing")).toBeInTheDocument();
    expect(within(supportingItems[3]).getByText("SEO")).toBeInTheDocument();
    expect(screen.queryByText("Lead nurture and re-engagement")).not.toBeInTheDocument();
    expect(screen.queryByText("Launches and landing paths")).not.toBeInTheDocument();
    expect(screen.queryByText("Longer-term demand capture")).not.toBeInTheDocument();
    expect(screen.queryByText("Creative direction and planning")).not.toBeInTheDocument();
    supportingServices.forEach((service) => {
      expect(screen.getByText(service.description)).toBeInTheDocument();
    });
    expect(screen.queryAllByText("Learn more").length).toBeGreaterThanOrEqual(3);
    expect(screen.getAllByTestId("process-step")).toHaveLength(8);
    expect(screen.queryByText("Output")).not.toBeInTheDocument();
    expect(screen.queryByText("Clear fit and next steps")).not.toBeInTheDocument();
    expect(screen.queryByText("Simple action plan")).not.toBeInTheDocument();
    expect(screen.queryByText("Live campaigns and systems")).not.toBeInTheDocument();
    expect(screen.queryByText("Reports and next steps")).not.toBeInTheDocument();
    expect(screen.getByText("We keep the work clear from the first call to reporting.")).toBeInTheDocument();
    expect(screen.getAllByText("The first call covers your goals and current setup.").length).toBeGreaterThan(0);
    expect(screen.getAllByText("An audit shows what is working and what needs to change.").length).toBeGreaterThan(0);
    expect(screen.getAllByText("The agreed fixes, campaigns, and systems go live.").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Results are tracked, reviewed, and improved over time.").length).toBeGreaterThan(0);
    expect(
      screen.getByText("Can you work with our existing setup, or do we need to rebuild everything?")
    ).toBeInTheDocument();
    const firstFaqTrigger = screen.getByRole("button", {
      name: "Can you work with our existing setup, or do we need to rebuild everything?",
    });

    expect(firstFaqTrigger).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByText(
        "Usually we start with what you already have. We audit your tracking, campaigns, and follow-up systems first, then recommend only the fixes or rebuilds that are actually necessary."
      )
    ).toBeInTheDocument();
    fireEvent.click(firstFaqTrigger);
    expect(firstFaqTrigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("A few practical answers before you request an audit.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /View Services/i })).not.toBeInTheDocument();
    expect(
      screen.queryByText("What platforms do you support across tracking, paid media, and automation?")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("What sets AlphaTrack Digital apart from other agencies?")).not.toBeInTheDocument();
  });

  it("keeps campaign attribution on primary booking CTAs and publishes homepage schema", async () => {
    renderWithPageProviders(<Index />, {
      route: "/?utm_source=google&utm_campaign=spring-search&gclid=test-click-id&preview=1",
    });

    const primaryCta = screen.getAllByRole("link", {
      name: BOOK_A_FREE_STRATEGY_CALL_CTA.label,
    })[0];

    expect(primaryCta).toHaveAttribute(
      "href",
      "/book-a-call?utm_source=google&utm_campaign=spring-search&gclid=test-click-id",
    );

    await waitFor(() => {
      const schema = document.head.querySelector("script[type='application/ld+json']");

      expect(schema?.textContent).toContain('"@type":"WebPage"');
      expect(schema?.textContent).toContain('"@type":"FAQPage"');
      expect(schema?.textContent).toContain('"name":"Book A Free Strategy Call"');
      expect(schema?.textContent).not.toContain("preview=1");
    });
  });
});
