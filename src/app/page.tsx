import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { FlagIcon, HomeIcon, ReturnIcon } from "@/components/Icons";
import { getEvent } from "@/lib/event";
import { LEG_LABEL } from "@/lib/types";

const TRIPS = [
  { Icon: HomeIcon, title: LEG_LABEL.TO_EVENT, text: "From your city to the event town" },
  { Icon: FlagIcon, title: LEG_LABEL.LOCAL_TO_START, text: "From where you are staying to the start area" },
  { Icon: ReturnIcon, title: LEG_LABEL.RETURN, text: "From the event back home" },
];

const STEPS = [
  {
    title: "Find or post a ride",
    text: "Pick a trip. Search rides near you, or post the seats you have or the seat you need.",
  },
  {
    title: "Sign in with Google",
    text: "Needed to post a ride or open a chat. Browsing is open to everyone.",
  },
  {
    title: "Chat on WhatsApp",
    text: "Tap Chat on a ride. WhatsApp opens with a message ready to send.",
  },
];

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
          <p>Share a ride, or find one. Then continue on WhatsApp.</p>
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

      <main className="page" style={{ gap: 24, paddingTop: 24 }}>
        <section>
          <h2 className="section">Three trips you can share</h2>
          <div className="list">
            {TRIPS.map(({ Icon, title, text }) => (
              <div className="row" key={title}>
                <span className="icon-tile">
                  <Icon size={22} />
                </span>
                <div className="grow">
                  <div className="strong">{title}</div>
                  <div className="small">{text}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="section">How it works</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {STEPS.map((step, i) => (
              <div key={step.title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span className="step-num">{i + 1}</span>
                <div>
                  <div className="strong" style={{ fontSize: 15 }}>
                    {step.title}
                  </div>
                  <div className="small" style={{ lineHeight: 1.4 }}>
                    {step.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <p className="fine">
          Rides only. We only connect people; travel is at your own risk.{" "}
          <Link href="/privacy" style={{ textDecoration: "underline" }}>
            Privacy
          </Link>
        </p>
      </main>
      <BottomNav />
    </>
  );
}
