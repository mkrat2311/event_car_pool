import Link from "next/link";
import { BackIcon } from "@/components/Icons";

export const metadata = { title: "Privacy · Event Car Pool" };

export default function PrivacyPage() {
  return (
    <>
      <header className="topbar">
        <Link href="/" className="back" aria-label="Back to home">
          <BackIcon />
        </Link>
        <h1>Privacy</h1>
      </header>
      <main className="page" style={{ paddingTop: 8, gap: 14 }}>
        <div className="callout warn">
          <p className="fine" style={{ color: "#4a3300" }}>
            Draft. Review this page before sharing the app publicly.
          </p>
        </div>

        <section>
          <h2 className="section">What this app is</h2>
          <p style={{ margin: 0, lineHeight: 1.55, fontSize: 15 }}>
            Event Car Pool helps people going to the same event share rides. It
            only connects people. It does not take payments, book rides or
            check anyone. It is not run by the event organisers.
          </p>
        </section>

        <section>
          <h2 className="section">What we collect</h2>
          <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.6, fontSize: 15 }}>
            <li>Your first name, shown on your rides.</li>
            <li>Your WhatsApp number, used only to open a WhatsApp chat when someone taps Chat on WhatsApp. It is not shown on your listing.</li>
            <li>Ride details you enter: places, date, time, seats, cost note and notes.</li>
            <li>When you sign in with Google: your Google name and email. We do not ask for anything else from your Google account. Your email is used only to link rides to you and is never shown to others.</li>
          </ul>
        </section>

        <section>
          <h2 className="section">Your choices</h2>
          <p style={{ margin: 0, lineHeight: 1.55, fontSize: 15 }}>
            You can edit or delete your rides at any time from My listings.
            Rides are hidden after the event. Account and data deletion will be
            available with sign-in.
          </p>
        </section>

        <section>
          <h2 className="section">Staying safe</h2>
          <p style={{ margin: 0, lineHeight: 1.55, fontSize: 15 }}>
            Travel arrangements are between you and the other person, at your
            own risk. Share your trip details with someone you trust. Use the
            Report button on any listing that looks wrong.
          </p>
        </section>

        <p className="fine">
          Contact:{" "}
          <a href="mailto:mkrat2311@gmail.com" style={{ textDecoration: "underline" }}>
            mkrat2311@gmail.com
          </a>
        </p>
      </main>
    </>
  );
}
