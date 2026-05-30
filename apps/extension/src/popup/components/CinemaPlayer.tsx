import { useEffect, useState } from "react";
import { getMessage } from "../../lib/i18n";

const duration = 166;
const thumb = "https://i.ytimg.com/vi/HeQX2HjkcNo/hqdefault.jpg";
const fmt = (seconds: number): string => `${Math.floor(seconds / 60)}:${String(Math.round(seconds) % 60).padStart(2, "0")}`;

export const CinemaPlayer = ({ blur }: { readonly blur: number }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const timer = window.setInterval(() => {
      setProgress((value) => {
        const next = Math.min(value + 1, duration);
        if (next >= duration) setIsPlaying(false);
        return next;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  return (
    <div className="cinema-player">
      <div className="cinema-bg" style={{ backgroundImage: `url('${thumb}')`, filter: `blur(${blur}px) brightness(var(--cinema-brightness, .35)) saturate(1.6)` }} />
      <div className="cinema-overlay" />
      <div className="cinema-content">
        <div className="cinema-thumb" style={{ backgroundImage: `url('${thumb}')` }} />
        <div className="cinema-info">
          <div className="cinema-source">
            <svg viewBox="0 0 24 24" fill="#FF0000" width="12" height="12"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8z"/><polygon fill="white" points="9.7,15.5 15.8,12 9.7,8.5"/></svg>
            <span className="cinema-source-badge">{getMessage("player.source")}</span>
          </div>
          <div className="cinema-title">{getMessage("player.title")}</div>
          <div className="cinema-author">{getMessage("player.author")}<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div>
          <div className="cinema-progress-wrap" onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            setProgress(Math.round(Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)) * duration));
          }}>
            <div className="cinema-progress-fill" style={{ width: `${(progress / duration) * 100}%` }} />
          </div>
          <div className="cinema-times"><span>{fmt(progress)}</span><span>{getMessage("player.duration")}</span></div>
        </div>
      </div>
      <div className="cinema-controls">
        <button className="ctrl-btn" onClick={() => setProgress(0)} type="button"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg></button>
        <button className="ctrl-btn play-btn" onClick={() => setIsPlaying((value) => !value)} type="button"><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d={isPlaying ? "M6 19h4V5H6v14zm8-14v14h4V5h-4z" : "M8 5v14l11-7z"}/></svg></button>
        <button className="ctrl-btn" onClick={() => setProgress(duration)} type="button"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z"/></svg></button>
      </div>
    </div>
  );
};
