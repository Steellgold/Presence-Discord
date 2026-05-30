import type { PropsWithChildren } from "react";

export const Toggle = ({ checked = false, onChange }: { readonly checked?: boolean; readonly onChange?: (checked: boolean) => void }) => (
  <label className="toggle">
    <input type="checkbox" checked={checked} onChange={(event) => onChange?.(event.currentTarget.checked)} />
    <div className="toggle-track" />
    <div className="toggle-thumb" />
  </label>
);

export const Tooltip = ({ children, text }: PropsWithChildren<{ readonly text: string }>) => (
  <div className="tooltip-wrap">
    {children}
    <div className="tooltip">{text}</div>
  </div>
);

export const SettingsGroup = ({ label, children }: PropsWithChildren<{ readonly label: string }>) => (
  <div className="settings-group">
    <div className="settings-group-label">{label}</div>
    {children}
  </div>
);

export const SettingsCard = ({ children }: PropsWithChildren) => <div className="settings-card">{children}</div>;
