import { useState, useEffect, useRef } from "react";
import { Link, useLocation, type To } from "react-router-dom";
import { Menu, X, ChevronDown, ArrowRight, BriefcaseBusiness, GraduationCap, ShoppingCart, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOK_A_FREE_STRATEGY_CALL_CTA } from "@/config/cta";
import { withCampaignSearch } from "@/lib/campaignAttribution";
import { cn } from "@/lib/utils";
import { prefetchRoute } from "@/lib/routePrefetch";
import { motion, AnimatePresence } from "framer-motion";
import { primaryServices } from "@/data/services";
import { expertisePages } from "@/data/expertise";

const navLinks: Array<{
  label: string;
  path: string;
  menuType: string | undefined;
  hash: string | undefined;
  disabled?: boolean;
}> = [
  { label: "Services", path: "/service", menuType: "services", hash: undefined },
  { label: "Expertise", path: "/expertise", menuType: "expertise", hash: undefined },
  { label: "Results", path: "/results", menuType: undefined, hash: undefined },
  { label: "About Us", path: "/about-us", menuType: undefined, hash: undefined },
  { label: "Blog", path: "/blog", menuType: undefined, hash: undefined },
];

const featuredExpertiseSlugs = ["saas", "ecommerce-retail", "education", "real-estate"];
const expertiseMenuIcons = {
  saas: BriefcaseBusiness,
  "ecommerce-retail": ShoppingCart,
  education: GraduationCap,
  "real-estate": Building2,
};

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileExpertiseOpen, setMobileExpertiseOpen] = useState(false);
  const [desktopServicesOpen, setDesktopServicesOpen] = useState(false);
  const [desktopExpertiseOpen, setDesktopExpertiseOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const desktopNavRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMobileOpen(false);
    setMobileServicesOpen(false);
    setMobileExpertiseOpen(false);
    setDesktopServicesOpen(false);
    setDesktopExpertiseOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!desktopServicesOpen && !desktopExpertiseOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!desktopNavRef.current?.contains(event.target as Node)) {
        setDesktopServicesOpen(false);
        setDesktopExpertiseOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDesktopServicesOpen(false);
        setDesktopExpertiseOpen(false);
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [desktopServicesOpen, desktopExpertiseOpen]);

  const isActive = (path: string, hash?: string) => {
    if (hash) return location.pathname === path && location.hash === hash;
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const getPrefetchHandlers = (path: string) => ({
    onMouseEnter: () => prefetchRoute(path),
    onFocus: () => prefetchRoute(path),
    onTouchStart: () => prefetchRoute(path),
  });

  const closeMobileMenu = () => {
    setMobileOpen(false);
    setMobileServicesOpen(false);
    setMobileExpertiseOpen(false);
  };

  const getLinkTarget = (path: string, hash?: string): To =>
    hash ? { pathname: path, hash } : path;

  const headerElevated = scrolled || desktopServicesOpen || desktopExpertiseOpen || mobileOpen;
  const strategyCallTo = withCampaignSearch(BOOK_A_FREE_STRATEGY_CALL_CTA.to, location.search);
  const featuredExpertisePages = expertisePages.filter((item) => featuredExpertiseSlugs.includes(item.slug));
  const isTrackingAuditLanding = location.pathname === "/offer/tracking-audit";

  if (isTrackingAuditLanding) {
    return (
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/[0.06] bg-background/88 backdrop-blur-xl">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-[70px] items-center">
            <Link to="/" aria-label="AlphaTrack Digital Home" className="flex items-center">
              <img
                src="/logo-wordmark-240.webp"
                alt="AlphaTrack Digital"
                className="h-6 w-auto sm:h-[26px]"
                width={240}
                height={56}
              />
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 transition-all duration-300">
      <div
        className={cn(
          "transition-all duration-300",
          headerElevated
            ? "bg-background/78 shadow-[0_10px_28px_rgba(0,10,28,0.22)] backdrop-blur-xl"
            : "bg-[linear-gradient(180deg,rgba(7,10,16,0.82)_0%,rgba(7,10,16,0.46)_54%,rgba(7,10,16,0)_100%)]",
        )}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div
            className={cn(
              "grid h-[70px] grid-cols-[1fr_auto] items-center md:grid-cols-[1fr_auto_1fr]",
              headerElevated && "border-b border-white/[0.08]",
            )}
          >
            <Link to="/" aria-label="AlphaTrack Digital Home" className="flex items-center justify-self-start">
            <img
              src="/logo-wordmark-240.webp"
              alt="AlphaTrack Digital"
              className="h-6 w-auto sm:h-[26px]"
              width={240}
              height={56}
            />
          </Link>

            <nav
              ref={desktopNavRef}
              className="relative hidden items-center justify-self-center md:flex md:gap-10"
              onMouseLeave={() => {
                setDesktopServicesOpen(false);
                setDesktopExpertiseOpen(false);
              }}
            >
              {navLinks.map((link) => {
                if (link.disabled) {
                  return (
                    <span
                      key={link.label}
                      className="relative py-2 text-sm font-medium text-muted-foreground/90"
                    >
                      {link.label}
                    </span>
                  );
                }

                if (link.menuType) {
                  const isServicesMenu = link.menuType === "services";
                  const menuOpen = isServicesMenu ? desktopServicesOpen : desktopExpertiseOpen;

                  return (
                    <div key={link.path} className="relative">
                      <button
                        type="button"
                        data-testid={`desktop-${link.menuType}-trigger`}
                        aria-expanded={menuOpen}
                        aria-controls={`desktop-${link.menuType}-menu`}
                        aria-haspopup="true"
                        className={cn(
                          "relative flex items-center gap-1.5 py-2 text-sm font-medium transition-colors duration-200 hover:text-foreground",
                          isActive(link.path, link.hash) || menuOpen
                            ? "text-primary after:absolute after:-bottom-0.5 after:left-0 after:right-0 after:h-px after:bg-primary"
                            : "text-muted-foreground/90",
                        )}
                        onMouseEnter={() => {
                          prefetchRoute(link.path);
                          setDesktopServicesOpen(isServicesMenu);
                          setDesktopExpertiseOpen(!isServicesMenu);
                        }}
                        onClick={() => {
                          prefetchRoute(link.path);
                          if (isServicesMenu) {
                            setDesktopServicesOpen((prev) => !prev);
                            setDesktopExpertiseOpen(false);
                          } else {
                            setDesktopExpertiseOpen((prev) => !prev);
                            setDesktopServicesOpen(false);
                          }
                        }}
                        onFocus={() => {
                          prefetchRoute(link.path);
                          setDesktopServicesOpen(isServicesMenu);
                          setDesktopExpertiseOpen(!isServicesMenu);
                        }}
                      >
                        {link.label}
                        <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", menuOpen && "rotate-180")} />
                      </button>

                      <AnimatePresence>
                        {isServicesMenu && desktopServicesOpen && (
                          <div className="absolute left-1/2 top-full z-50 w-[min(360px,calc(100vw-3rem))] -translate-x-1/2 pt-3">
                            <motion.div
                              id="desktop-services-menu"
                              data-testid="desktop-services-menu"
                              initial={{ opacity: 0, y: 8, scale: 0.99 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 8, scale: 0.99 }}
                              transition={{ duration: 0.18, ease: "easeOut" }}
                              className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#070a10] p-4 shadow-[0_12px_28px_rgba(0,8,22,0.28)]"
                            >
                              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
                              <section className="relative">
                                <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/80">
                                  Core Services
                                </p>
                                <div className="space-y-1">
                                  {primaryServices.map((service) => (
                                    <Link
                                      key={service.path}
                                      to={service.path}
                                      {...getPrefetchHandlers(service.path)}
                                      className="group flex min-h-11 items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.045]"
                                    >
                                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/[0.07] bg-white/[0.025]">
                                        <service.icon className="h-3.5 w-3.5 text-primary" />
                                      </span>
                                      <span className="min-w-0 flex-1 text-sm font-semibold leading-snug text-foreground">
                                        {service.title}
                                      </span>
                                    </Link>
                                  ))}
                                </div>
                              </section>
                              <div className="relative mt-3 border-t border-white/[0.07] pt-3">
                                <Link
                                  to="/service"
                                  {...getPrefetchHandlers("/service")}
                                  className="group flex min-h-11 items-center justify-between rounded-lg border border-primary/15 bg-primary/[0.08] px-3 text-sm font-bold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors hover:border-primary/25 hover:bg-primary/[0.12]"
                                >
                                  <span>View all services</span>
                                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                </Link>
                              </div>
                            </motion.div>
                          </div>
                        )}

                        {!isServicesMenu && desktopExpertiseOpen && (
                          <div className="absolute left-1/2 top-full z-50 w-[min(292px,calc(100vw-3rem))] -translate-x-1/2 pt-3">
                            <motion.div
                              id="desktop-expertise-menu"
                              data-testid="desktop-expertise-menu"
                              initial={{ opacity: 0, y: 8, scale: 0.99 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 8, scale: 0.99 }}
                              transition={{ duration: 0.18, ease: "easeOut" }}
                              className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#070a10] p-4 shadow-[0_12px_28px_rgba(0,8,22,0.28)]"
                            >
                              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
                              <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/80">
                                Expertise
                              </p>
                              <div className="grid gap-1">
                                {featuredExpertisePages.map((item) => {
                                  const ExpertiseIcon = expertiseMenuIcons[item.slug as keyof typeof expertiseMenuIcons] ?? BriefcaseBusiness;

                                  return (
                                    <Link
                                      key={item.slug}
                                      to={`/expertise/${item.slug}`}
                                      onMouseEnter={() => prefetchRoute(`/expertise/${item.slug}`)}
                                      onFocus={() => prefetchRoute(`/expertise/${item.slug}`)}
                                      className="group flex min-h-11 items-center gap-3 rounded-lg px-2 py-2 text-sm font-semibold leading-snug text-foreground transition-colors hover:bg-white/[0.045] hover:text-primary"
                                    >
                                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/[0.07] bg-white/[0.025]">
                                        <ExpertiseIcon className="h-3.5 w-3.5 text-primary" />
                                      </span>
                                      <span>{item.name}</span>
                                    </Link>
                                  );
                                })}
                              </div>
                              <div className="relative mt-3 border-t border-white/[0.07] pt-3">
                                <Link
                                  to="/expertise"
                                  {...getPrefetchHandlers("/expertise")}
                                  className="group flex min-h-11 items-center justify-between rounded-lg border border-primary/15 bg-primary/[0.08] px-3 text-sm font-bold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors hover:border-primary/25 hover:bg-primary/[0.12]"
                                >
                                  <span>View all expertise</span>
                                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                </Link>
                              </div>
                            </motion.div>
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.path}
                    to={getLinkTarget(link.path, link.hash)}
                    {...getPrefetchHandlers(link.path)}
                    className={cn(
                      "relative py-2 text-sm font-medium transition-colors duration-200 hover:text-foreground",
                      isActive(link.path, link.hash)
                        ? "text-primary after:absolute after:-bottom-0.5 after:left-0 after:right-0 after:h-px after:bg-primary"
                        : "text-muted-foreground/90",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden justify-self-end md:block">
              <Button asChild className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground shadow-[0_0_18px_rgba(51,204,153,0.12)] hover:bg-primary/90">
                <Link to={strategyCallTo} {...getPrefetchHandlers(BOOK_A_FREE_STRATEGY_CALL_CTA.to)}>
                  {BOOK_A_FREE_STRATEGY_CALL_CTA.label}
                </Link>
              </Button>
            </div>

            <button
              className={cn(
                "justify-self-end rounded-lg p-2 text-foreground transition-colors md:hidden",
                headerElevated ? "bg-white/[0.04] hover:bg-white/[0.07]" : "bg-black/20 hover:bg-black/35",
              )}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="border-b border-white/[0.08] bg-[linear-gradient(180deg,#070a10_0%,#090d14_100%)] shadow-[0_10px_24px_rgba(0,0,0,0.18)] md:hidden"
            id="mobile-nav"
          >
            <nav className="container mx-auto flex flex-col gap-1 px-4 py-4">
              {navLinks.map((link) =>
                link.disabled ? (
                  <div
                    key={link.label}
                    className="min-h-12 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground"
                  >
                    {link.label}
                  </div>
                ) : link.menuType ? (
                  <div key={link.path} className="border-b border-white/[0.055] pb-1">
                    <button
                      type="button"
                      data-testid={`mobile-${link.menuType}-trigger`}
                      aria-expanded={link.menuType === "services" ? mobileServicesOpen : mobileExpertiseOpen}
                      aria-controls={`mobile-${link.menuType}-links`}
                      onClick={() => {
                        prefetchRoute(link.path);
                        if (link.menuType === "services") {
                          setMobileServicesOpen((prev) => !prev);
                          setMobileExpertiseOpen(false);
                        } else {
                          setMobileExpertiseOpen((prev) => !prev);
                          setMobileServicesOpen(false);
                        }
                      }}
                      className={cn(
                        "flex min-h-12 w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-semibold transition-colors",
                        isActive(link.path, link.hash) ||
                          (link.menuType === "services" ? mobileServicesOpen : mobileExpertiseOpen)
                          ? "bg-primary/[0.07] text-primary"
                          : "text-muted-foreground hover:bg-white/[0.035] hover:text-foreground",
                      )}
                    >
                      <span>{link.label}</span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          (link.menuType === "services" ? mobileServicesOpen : mobileExpertiseOpen) &&
                            "rotate-180",
                        )}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {(link.menuType === "services" ? mobileServicesOpen : mobileExpertiseOpen) && (
                        <motion.div
                          id={`mobile-${link.menuType}-links`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-4 pb-4 pl-3 pr-1 pt-2">
                            {link.menuType === "services" ? (
                              <>
                                <Link
                                  to="/service"
                                  onClick={closeMobileMenu}
                                  onTouchStart={() => prefetchRoute("/service")}
                                  onFocus={() => prefetchRoute("/service")}
                                  className="mb-3 flex min-h-11 items-center justify-between rounded-lg border border-primary/15 bg-primary/[0.08] px-3 text-sm font-bold text-primary transition-colors hover:bg-primary/[0.12]"
                                >
                                  <span>View all services</span>
                                  <ArrowRight className="h-4 w-4" />
                                </Link>

                                <div>
                                  <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/75">
                                    Core Services
                                  </p>
                                  <div className="mt-2">
                                    {primaryServices.map((service) => (
                                      <Link
                                        key={service.path}
                                        to={service.path}
                                        onClick={closeMobileMenu}
                                        onTouchStart={() => prefetchRoute(service.path)}
                                        onFocus={() => prefetchRoute(service.path)}
                                        className="block rounded-md border-t border-white/[0.045] px-2 py-2.5 text-sm font-medium text-muted-foreground transition-colors first:border-t-0 hover:bg-white/[0.035] hover:text-foreground"
                                      >
                                        {service.title}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div>
                                <Link
                                  to="/expertise"
                                  onClick={closeMobileMenu}
                                  onTouchStart={() => prefetchRoute("/expertise")}
                                  onFocus={() => prefetchRoute("/expertise")}
                                  className="mb-3 flex min-h-11 items-center justify-between rounded-lg border border-primary/15 bg-primary/[0.08] px-3 text-sm font-bold text-primary transition-colors hover:bg-primary/[0.12]"
                                >
                                  <span>View all expertise</span>
                                  <ArrowRight className="h-4 w-4" />
                                </Link>
                                {featuredExpertisePages.map((item) => {
                                  const ExpertiseIcon = expertiseMenuIcons[item.slug as keyof typeof expertiseMenuIcons] ?? BriefcaseBusiness;

                                  return (
                                    <Link
                                      key={item.slug}
                                      to={`/expertise/${item.slug}`}
                                      onClick={closeMobileMenu}
                                      onTouchStart={() => prefetchRoute(`/expertise/${item.slug}`)}
                                      onFocus={() => prefetchRoute(`/expertise/${item.slug}`)}
                                      className="flex items-center gap-3 rounded-md border-t border-white/[0.045] px-2 py-2.5 text-sm font-medium text-muted-foreground transition-colors first:border-t-0 hover:bg-white/[0.035] hover:text-foreground"
                                    >
                                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/[0.07] bg-white/[0.025]">
                                        <ExpertiseIcon className="h-3.5 w-3.5 text-primary" />
                                      </span>
                                      <span>{item.name}</span>
                                    </Link>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    key={link.path}
                    to={getLinkTarget(link.path, link.hash)}
                    onClick={() => setMobileOpen(false)}
                    onTouchStart={() => prefetchRoute(link.path)}
                    onFocus={() => prefetchRoute(link.path)}
                    className={cn(
                      "min-h-12 rounded-lg px-3 py-3 text-sm font-semibold transition-colors",
                      isActive(link.path, link.hash)
                        ? "bg-primary/[0.07] text-primary"
                        : "text-muted-foreground hover:bg-white/[0.035] hover:text-foreground",
                    )}
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
