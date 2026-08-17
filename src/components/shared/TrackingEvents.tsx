import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

import {
  hasConversionFired,
  hasConversionIntent,
  getConversionEventId,
  markConversionFired,
} from "@/lib/conversionSession";
import { getConversionEventsForPath, pushBookingClickEvent, pushDataLayerEvent } from "@/lib/tracking";
// The admin console is a private internal surface. It must not emit marketing
// route views or conversion events into GA4/GTM.
import { isAdminPath } from "@/lib/adminRoutes";

const TrackingEvents = () => {
  const location = useLocation();
  const firedConversions = useRef(new Set<string>());

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const anchor = target?.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;

      pushBookingClickEvent(anchor);
    };

    document.addEventListener("click", handleDocumentClick, { capture: true });

    return () => {
      document.removeEventListener("click", handleDocumentClick, { capture: true });
    };
  }, []);

  useEffect(() => {
    if (isAdminPath(location.pathname)) return;

    const pagePath = `${location.pathname}${location.search}${location.hash}`;
    const pageLocation = `${window.location.origin}${pagePath}`;

    pushDataLayerEvent("atd_route_view", {
      page_path: location.pathname,
      page_location: pageLocation,
      page_search: location.search || undefined,
      page_hash: location.hash || undefined,
    });

    const conversionEvents = getConversionEventsForPath(location.pathname);
    if (conversionEvents.length === 0) return;

    conversionEvents.forEach((conversionEvent) => {
      const conversionKey = `${conversionEvent}:${location.pathname}`;
      if (firedConversions.current.has(conversionKey)) return;
      if (hasConversionFired(conversionEvent, location.pathname)) return;
      if (
        conversionEvent === "contact_form_submit" &&
        !hasConversionIntent(conversionEvent, location.pathname)
      ) {
        return;
      }

      firedConversions.current.add(conversionKey);
      markConversionFired(conversionEvent, location.pathname);
      const eventId = getConversionEventId(conversionEvent, location.pathname);
      pushDataLayerEvent(conversionEvent, {
        event_id: eventId,
        eventID: eventId,
        page_path: location.pathname,
        page_location: pageLocation,
      });
    });
  }, [location.hash, location.pathname, location.search]);

  return null;
};

export default TrackingEvents;
