import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import SEO from "@/components/shared/SEO";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <SEO
        title="Page Not Found | AlphaTrack Digital"
        description="The page you're looking for doesn't exist."
        canonicalUrl={location.pathname}
        noindex
        omitCanonical
      />
      <section className="relative flex min-h-[70vh] items-center justify-center py-24">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(0,175,239,0.06)_0%,rgba(0,51,153,0.08)_34%,transparent_70%)] pointer-events-none" />
        <div className="container relative mx-auto px-4 text-center lg:px-8">
          <p className="text-8xl font-black text-gradient">404</p>
          <h1 className="mt-4 text-3xl font-bold md:text-4xl">Page Not Found</h1>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="gap-2 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90">
              <Link to="/">Back to Home</Link>
            </Button>
            <Button asChild variant="outline" className="gap-2 rounded-lg border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20">
              <Link to="/contact-us">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default NotFound;
