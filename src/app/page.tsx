import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { MoonIcon, SunIcon } from "@/components/Icons";
import { getEvent } from "@/lib/event";
import { fmtTime, istDateKey } from "@/lib/time";

export default function HomePage() {
  const ev = getEvent();
  return (
    <>
      <header className="hero">
        <svg
          className="contours"
          aria-hidden="true"
          viewBox="0 0 390 340"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.13"
          strokeWidth="1.5"
        >
          <path d="M-10 190C40 150 90 210 170 175S300 110 400 150" />
          <path d="M-10 220C50 180 100 240 180 205S310 140 400 180" />
          <path d="M-10 250C60 210 110 270 190 235S320 170 400 210" />
          <path d="M-10 280C70 240 120 300 200 265S330 200 400 240" />
          <path d="M-10 310C80 270 130 330 210 295S340 230 400 270" />
        </svg>
        <div className="inner">
          <span className="hero-tag">Unofficial · made by participants</span>
          <h1>
            {ev.shortName}
            <br />
            2026 rides
          </h1>
          <p className="date">Sat 28 Nov · {ev.town}</p>
          <p>
            Find a seat, or share yours, for the trip to the start line. Then
            continue on WhatsApp.
          </p>
          <div className="hero-actions">
            <Link href="/find" className="btn btn-light grow">
              Find a ride
            </Link>
            <Link href="/offer" className="btn btn-ghost-light grow">
              Offer a ride
            </Link>
          </div>
        </div>
      </header>

      <main className="page" style={{ gap: 22, paddingTop: 24 }}>
        <section>
          <h2 className="section">Races and start times</h2>
          <div className="list">
            {ev.categories.map((c) => (
              <div className="row" key={c.id}>
                <span className={c.isNight ? "icon-tile night" : "icon-tile"}>
                  {c.isNight ? <MoonIcon size={22} /> : <SunIcon size={22} />}
                </span>
                <div className="grow">
                  <div className="strong">{c.name}</div>
                  <div className="small">
                    Finish by {fmtTime(c.cutoffAt)}
                    {istDateKey(c.cutoffAt) !== istDateKey(c.startAt) ? ", Sun" : ""}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="strong">{fmtTime(c.startAt)}</div>
                  <div className="small" style={{ fontSize: 12 }}>
                    start
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="section">Plan your trip</h2>
          <div className="list">
            {ev.days.map((d, i) => {
              const wd = d.short.slice(0, 3);
              const dd = d.short.split(" ")[1];
              return (
                <div className="row" key={d.id} style={{ alignItems: "flex-start" }}>
                  <div className={i === 1 ? "datebox dark" : "datebox"}>
                    <span>{wd.toUpperCase()}</span>
                    <span>{dd}</span>
                  </div>
                  <div className="grow">
                    <div className="strong" style={{ fontSize: 15 }}>
                      {d.title}
                    </div>
                    <div className="small" style={{ lineHeight: 1.4 }}>
                      {d.detail}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <p className="fine">
          Rides only. Crew and pacers are not permitted by the race. We only
          connect people; travel is at your own risk. {ev.sourceNote}{" "}
          <Link href="/privacy" style={{ textDecoration: "underline" }}>
            Privacy
          </Link>
        </p>
      </main>
      <BottomNav />
    </>
  );
}
