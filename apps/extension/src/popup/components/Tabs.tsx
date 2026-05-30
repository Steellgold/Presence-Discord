import { getMessage } from "../../lib/i18n";
import { GridIcon, SettingsIcon } from "./Icons";

export type ViewId = "default" | "settings";

export const Tabs = ({ activeView, onSelect }: { readonly activeView: ViewId; readonly onSelect: (view: ViewId) => void }) => (
  <div className="tabs">
    <button className={`tab ${activeView === "default" ? "active" : ""}`} onClick={() => onSelect("default")} type="button">
      <GridIcon />{getMessage("tabs.default")}
    </button>
    <button className={`tab ${activeView === "settings" ? "active" : ""}`} onClick={() => onSelect("settings")} type="button">
      <SettingsIcon />{getMessage("tabs.settings")}
    </button>
  </div>
);
