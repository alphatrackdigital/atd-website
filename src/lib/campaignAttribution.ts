import type { To } from "react-router-dom";

const campaignParamNames = new Set([
  "gad_source",
  "gbraid",
  "gclid",
  "wbraid",
  "fbclid",
  "msclkid",
  "ttclid",
  "li_fat_id",
]);

const campaignConversionPaths = new Set(["/book-a-call", "/offer/tracking-audit", "/contact-us"]);

export const getCampaignSearch = (search: string) => {
  if (!search) return "";

  const sourceParams = new URLSearchParams(search);
  const campaignParams = new URLSearchParams();

  sourceParams.forEach((value, key) => {
    const normalizedKey = key.toLowerCase();

    if (normalizedKey.startsWith("utm_") || campaignParamNames.has(normalizedKey)) {
      campaignParams.append(key, value);
    }
  });

  const serializedParams = campaignParams.toString();

  return serializedParams ? `?${serializedParams}` : "";
};

export const withCampaignSearch = (to: string, currentSearch: string): To => {
  if (!to.startsWith("/")) return to;

  const [pathAndSearch, hash = ""] = to.split("#");
  const [pathname, existingSearch = ""] = pathAndSearch.split("?");

  if (!campaignConversionPaths.has(pathname)) return to;

  const campaignSearch = getCampaignSearch(currentSearch);
  if (!campaignSearch) return to;

  const params = new URLSearchParams(existingSearch);
  const campaignParams = new URLSearchParams(campaignSearch);

  campaignParams.forEach((value, key) => {
    if (!params.has(key)) {
      params.append(key, value);
    }
  });

  const serializedParams = params.toString();

  return {
    pathname,
    search: serializedParams ? `?${serializedParams}` : undefined,
    hash: hash ? `#${hash}` : undefined,
  };
};
