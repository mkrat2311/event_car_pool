"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { BackIcon } from "@/components/Icons";
import ListingForm from "@/components/ListingForm";
import { useListings } from "@/lib/store";

export default function EditListingPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { mine, ready } = useListings();
  const listing = mine.find((l) => l.id === id);

  return (
    <>
      <header className="topbar">
        <Link href="/my" className="back" aria-label="Back to my listings">
          <BackIcon />
        </Link>
        <h1>Edit listing</h1>
      </header>
      <main className="page" style={{ paddingTop: 8 }}>
        {!ready ? (
          <p className="sub">Loading…</p>
        ) : listing ? (
          <ListingForm initial={listing} />
        ) : (
          <>
            <p className="sub">We could not find that listing. It may have been deleted.</p>
            <Link href="/my" className="btn btn-primary">
              Back to my listings
            </Link>
          </>
        )}
      </main>
    </>
  );
}
