import { Toaster as Sonner } from "@/components/ui/sonner";
import { Suspense, lazy, useEffect, useState, type ComponentType, type LazyExoticComponent, type ReactNode } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ScrollToTop from "@/components/shared/ScrollToTop";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import WhatsAppWidget from "@/components/shared/WhatsAppWidget";
import TrackingEvents from "@/components/shared/TrackingEvents";
import { routeImporters } from "@/lib/routePrefetch";
import Index from "./pages/Index";

const AboutUs = lazy(routeImporters.aboutUs);
const Expertise = lazy(routeImporters.expertise);
const ExpertiseDetail = lazy(routeImporters.expertiseDetail);
const Services = lazy(routeImporters.services);
const ContactUs = lazy(routeImporters.contactUs);
const ContactUsThankYou = lazy(routeImporters.contactUsThankYou);
const NewsletterConfirmed = lazy(routeImporters.newsletterConfirmed);
const ConversionTracking = lazy(routeImporters.conversionTracking);
const MarketingAutomation = lazy(routeImporters.marketingAutomation);
const PaidMedia = lazy(routeImporters.paidMedia);
const ServiceDetail = lazy(routeImporters.serviceDetail);
const Results = lazy(routeImporters.results);
const Blog = lazy(routeImporters.blog);
const BlogPost = lazy(routeImporters.blogPost);
const BookACall = lazy(routeImporters.bookACall);
const ThankYou = lazy(routeImporters.thankYou);
const TrackingLandingPage = lazy(routeImporters.trackingLandingPage);
const PrivacyPolicy = lazy(routeImporters.privacyPolicy);
const CookiePolicy = lazy(routeImporters.cookiePolicy);
const TermsOfService = lazy(routeImporters.termsOfService);
const NotFound = lazy(routeImporters.notFound);

const RouteContentFallback = () => (
  <div className="min-h-[50vh]" aria-hidden="true">
    <span className="sr-only">Loading page</span>
  </div>
);

const withRouteSuspense = (Component: LazyExoticComponent<ComponentType>) => (
  <Suspense fallback={<RouteContentFallback />}>
    <Component />
  </Suspense>
);

const ClientOnlySonner = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return mounted ? <Sonner /> : null;
};

export const AppShell = ({ children }: { children: ReactNode }) => (
  <>
    <ClientOnlySonner />
    <WhatsAppWidget />
    {children}
  </>
);

export const AppRouter = () => (
  <ErrorBoundary>
    <ScrollToTop />
    <TrackingEvents />
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Index />} />
        <Route path="/about-us" element={withRouteSuspense(AboutUs)} />
        <Route path="/expertise" element={withRouteSuspense(Expertise)} />
        <Route path="/expertise/:slug" element={withRouteSuspense(ExpertiseDetail)} />
        <Route path="/service" element={withRouteSuspense(Services)} />
        <Route path="/service/conversion-tracking" element={withRouteSuspense(ConversionTracking)} />
        <Route path="/service/marketing-automation" element={withRouteSuspense(MarketingAutomation)} />
        <Route path="/service/paid-media" element={withRouteSuspense(PaidMedia)} />
        <Route path="/service/:slug" element={withRouteSuspense(ServiceDetail)} />
        <Route path="/results" element={withRouteSuspense(Results)} />
        <Route path="/blog" element={withRouteSuspense(Blog)} />
        <Route path="/blog/:slug" element={withRouteSuspense(BlogPost)} />
        <Route path="/contact-us" element={withRouteSuspense(ContactUs)} />
        <Route path="/contact-us/thank-you" element={withRouteSuspense(ContactUsThankYou)} />
        <Route path="/newsletter/confirmed" element={withRouteSuspense(NewsletterConfirmed)} />
        <Route path="/book-a-call" element={withRouteSuspense(BookACall)} />
        <Route path="/book-a-call/thank-you" element={withRouteSuspense(ThankYou)} />
        <Route path="/privacy-policy" element={withRouteSuspense(PrivacyPolicy)} />
        <Route path="/cookie-policy" element={withRouteSuspense(CookiePolicy)} />
        <Route path="/terms-of-service" element={withRouteSuspense(TermsOfService)} />
        <Route path="/offer/tracking-audit" element={withRouteSuspense(TrackingLandingPage)} />
        <Route path="*" element={withRouteSuspense(NotFound)} />
      </Route>
    </Routes>
  </ErrorBoundary>
);

const App = () => (
  <AppShell>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppRouter />
    </BrowserRouter>
  </AppShell>
);

export default App;
