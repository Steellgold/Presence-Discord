import { getMessage } from "../../lib/i18n";
import { Tooltip } from "./common";
import { UserIcon } from "./Icons";

export const Header = ({ companionStatus }: { readonly companionStatus: "ok" | "offline" | "error" }) => (
  <div className="header">
    <div className="header-left">
      <div className="discord-avatar-wrap">
        <div className="discord-avatar"><UserIcon /></div>
        <span className="discord-status-dot offline" />
      </div>
      <span className="header-title">{getMessage("app.title")}</span>
    </div>
    <div className="header-right">
      <span className="version-badge">{getMessage("app.version")}</span>
      <Tooltip text={getMessage(`companion.${companionStatus}`)}>
        <div className={`companion-indicator ${companionStatus}`} />
      </Tooltip>
    </div>
  </div>
);
