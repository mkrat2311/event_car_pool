import BottomNav from "@/components/BottomNav";
import ListingForm from "@/components/ListingForm";
import { getEvent } from "@/lib/event";

export default function OfferPage() {
  const ev = getEvent();
  return (
    <>
      <main className="page">
        <div>
          <h1 className="title">Post a ride</h1>
          <p className="sub">{ev.name}</p>
        </div>
        <ListingForm />
      </main>
      <BottomNav />
    </>
  );
}
