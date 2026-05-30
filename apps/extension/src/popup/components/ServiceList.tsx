import { getMessage, type MessageKey } from "../../lib/i18n";
import type { PopupSite } from "../hooks/useSites";
import { getAssets, getSiteInitial } from "../utils/assets";
import { Toggle } from "./common";
import { ChevronIcon, RestoreIcon, SearchIcon } from "./Icons";

const ServiceIcon = ({ site }: { readonly site: PopupSite }) => {
  const assets = getAssets(site);
  return (
    <div className="service-icon fallback-service-icon">
      {assets.icon === null ? <span>{getSiteInitial(site)}</span> : <img alt="" src={assets.icon} />}
    </div>
  );
};

export const SearchBar = ({ query, onQueryChange }: { readonly query: string; readonly onQueryChange: (query: string) => void }) => (
  <div className="search-wrap">
    <SearchIcon />
    <input className="search-input" type="text" placeholder={getMessage("search.placeholder")} value={query} onChange={(event) => onQueryChange(event.currentTarget.value)} />
  </div>
);

export const ServiceRow = ({ site }: { readonly site: PopupSite }) => (
  <div className="service-row" data-name={site.id}>
    <ServiceIcon site={site} />
    <div className="service-info">
      <div className="service-name">{site.displayName}{!site.hidden && <span className={`dot-status ${site.active ? "active" : "inactive"}`} />}</div>
      <div className="service-sub">{site.activity ?? getMessage(site.subtitleKey as MessageKey)}</div>
    </div>
    {site.hidden ? <button className="icon-btn" type="button"><RestoreIcon /></button> : <Toggle checked={site.enabled} />}
  </div>
);

export const ServiceList = ({ sites }: { readonly sites: readonly PopupSite[] }) => (
  <div className="list-wrap" id="serviceList">
    {sites.map((site) => <ServiceRow key={site.id} site={site} />)}
  </div>
);

export const HiddenServices = ({ sites, open, onToggle }: { readonly sites: readonly PopupSite[]; readonly open: boolean; readonly onToggle: () => void }) => (
  <>
    <div className="divider" />
    {sites.length > 0 && (
      <>
        <div className={`collapse-toggle ${open ? "open" : ""}`} onClick={onToggle}>
          <span>{getMessage("hidden.title").replace("$count$", String(sites.length))}</span>
          <ChevronIcon />
        </div>
        <div className={`hidden-list ${open ? "open" : ""}`}>
          {sites.map((site) => <ServiceRow key={site.id} site={site} />)}
        </div>
      </>
    )}
  </>
);
