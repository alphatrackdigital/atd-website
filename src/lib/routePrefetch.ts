import { expertisePages } from "@/data/expertise";
import { supportingServices } from "@/data/services";

type RouteImporter = () => Promise<unknown>;

const routeImporters = {
  aboutUs: () => import("../pages/AboutUs"),
  expertise: () => import("../pages/Expertise"),
  expertiseDetail: () => import("../pages/ExpertiseDetail"),
  services: () => import("../pages/Services"),
  contactUs: () => import("../pages/ContactUs"),
  contactUsThankYou: () => import("../pages/ContactUsThankYou"),
  newsletterConfirmed: () => import("../pages/NewsletterConfirmed"),
  conversionTracking: () => import("../pages/ConversionTracking"),
  marketingAutomation: () => import("../pages/MarketingAutomation"),
  paidMedia: () => import("../pages/PaidMedia"),
  serviceDetail: () => import("../pages/ServiceDetail"),
  results: () => import("../pages/Results"),
  blog: () => import("../pages/Blog"),
  blogPost: () => import("../pages/BlogPost"),
  bookACall: () => import("../pages/BookACall"),
  thankYou: () => import("../pages/ThankYou"),
  trackingLandingPage: () => import("../pages/TrackingLandingPage"),
  privacyPolicy: () => import("../pages/PrivacyPolicy"),
  cookiePolicy: () => import("../pages/CookiePolicy"),
  termsOfService: () => import("../pages/TermsOfService"),
  notFound: () => import("../pages/NotFound"),
  // Admin console. Intentionally absent from routePrefetchMap below — these
  // chunks must never be prefetched for public marketing visitors.
  adminLayout: () => import("../components/admin/AdminLayout"),
  adminLogin: () => import("../pages/admin/AdminLogin"),
  adminContacts: () => import("../pages/admin/AdminContacts"),
  adminBlog: () => import("../pages/admin/AdminBlog"),
  adminBlogEditor: () => import("../pages/admin/AdminBlogEditor"),
} as const;

const prefetchedRoutes = new Set<string>();

const routePrefetchMap: Record<string, RouteImporter[]> = {
  "/about-us": [routeImporters.aboutUs],
  "/expertise": [routeImporters.expertise],
  "/service": [routeImporters.services],
  "/service/conversion-tracking": [routeImporters.conversionTracking],
  "/service/marketing-automation": [routeImporters.marketingAutomation],
  "/service/paid-media": [routeImporters.paidMedia],
  "/results": [routeImporters.results],
  "/blog": [routeImporters.blog],
  "/contact-us": [routeImporters.contactUs],
  "/newsletter/confirmed": [routeImporters.newsletterConfirmed],
  "/book-a-call": [routeImporters.bookACall],
  "/offer/tracking-audit": [routeImporters.trackingLandingPage],
  "/privacy-policy": [routeImporters.privacyPolicy],
  "/privacy-policy/": [routeImporters.privacyPolicy],
  "/cookie-policy": [routeImporters.cookiePolicy],
  "/cookie-policy/": [routeImporters.cookiePolicy],
  "/terms-of-service": [routeImporters.termsOfService],
  "/terms-of-service/": [routeImporters.termsOfService],
};

expertisePages.forEach((item) => {
  routePrefetchMap[`/expertise/${item.slug}`] = [routeImporters.expertiseDetail];
});

supportingServices.forEach((service) => {
  routePrefetchMap[service.path] = [routeImporters.serviceDetail];
});

export { routeImporters };

export const prefetchRoute = (path: string) => {
  if (prefetchedRoutes.has(path)) return;

  const importers = routePrefetchMap[path];
  if (!importers) return;

  prefetchedRoutes.add(path);
  void Promise.all(importers.map((importRoute) => importRoute())).catch(() => {
    prefetchedRoutes.delete(path);
  });
};
