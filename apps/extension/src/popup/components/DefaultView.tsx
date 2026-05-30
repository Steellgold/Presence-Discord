import { useMemo, useState } from "react";
import { getMessage } from "../../lib/i18n";
import type { PopupSite } from "../hooks/useSites";
import { CinemaPlayer } from "./CinemaPlayer";
import { Footer } from "./Footer";
import { HiddenServices, SearchBar, ServiceList } from "./ServiceList";

export const DefaultView = ({ active, sites, blur }: { readonly active: boolean; readonly sites: readonly PopupSite[]; readonly blur: number }) => {
  const [query, setQuery] = useState("");
  const [hiddenOpen, setHiddenOpen] = useState(false);
  const visibleSites = useMemo(() => sites.filter((site) => !site.hidden && site.id.includes(query.toLowerCase())), [query, sites]);
  const hiddenSites = useMemo(() => sites.filter((site) => site.hidden), [sites]);

  return (
    <div className={`view ${active ? "active" : ""}`} id="view-default">
      <CinemaPlayer blur={blur} />
      <SearchBar query={query} onQueryChange={setQuery} />
      <div className="section-label">{getMessage("library.title")}</div>
      <ServiceList sites={visibleSites} />
      <HiddenServices sites={hiddenSites} open={hiddenOpen} onToggle={() => setHiddenOpen((value) => !value)} />
      <Footer />
    </div>
  );
};
