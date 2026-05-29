import type { JSX } from "react";

export const App = (): JSX.Element => (
  <main className="grid min-h-screen place-items-center bg-[linear-gradient(135deg,rgba(35,165,90,0.18),transparent_46%),#10131b] p-10 text-[#eef2ff]">
    <section className="w-full max-w-[720px] rounded-lg border border-[#eef2ff1f] bg-white/6 p-8">
      <p className="mb-3 mt-0 text-[13px] font-extrabold uppercase text-[#23a55a]">
        Tray companion
      </p>
      <h1 className="m-0 text-[38px] tracking-normal">Discord Presence Companion</h1>
      <p className="max-w-[620px] text-[17px] leading-[1.7] text-[#b9c3d8]">
        This companion runs in the Windows notification area. Open it from the
        tray icon when you need to check status or quit the bridge.
      </p>
      <dl className="mt-7 grid gap-2.5">
        <div className="flex justify-between gap-5 rounded-lg bg-white/7 px-4 py-3.5">
          <dt className="m-0 text-[#9da8bd]">Status</dt>
          <dd className="m-0 font-extrabold">Running in background</dd>
        </div>
        <div className="flex justify-between gap-5 rounded-lg bg-white/7 px-4 py-3.5">
          <dt className="m-0 text-[#9da8bd]">Platform</dt>
          <dd className="m-0 font-extrabold">{window.companion.platform}</dd>
        </div>
      </dl>
    </section>
  </main>
);
