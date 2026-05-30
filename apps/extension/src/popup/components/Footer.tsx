import { getMessage } from "../../lib/i18n";
import { Tooltip } from "./common";
import { GithubLineIcon, GlobeIcon } from "./Icons";

export const Footer = () => (
  <div className="footer">
    <Tooltip text={getMessage("footer.siteTooltip")}>
      <a className="footer-link" href="https://presences.app" target="_blank" title={getMessage("footer.siteTitle")}><GlobeIcon /></a>
    </Tooltip>
    <Tooltip text={getMessage("footer.githubTooltip")}>
      <a className="footer-link" href="https://github.com/presences-app/presences" target="_blank"><GithubLineIcon /></a>
    </Tooltip>
  </div>
);
