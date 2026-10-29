import { getEvent } from "@/lib/event";
import { initial, listedAgo } from "@/lib/format";
import { bibChatUrl } from "@/lib/bibStore";
import type { BibListing } from "@/lib/types";
import { ChatIcon, MoonIcon, SunIcon } from "./Icons";

interface Props {
  bib: BibListing;
  /** Hide the chat button, for example on your own listing or after the deadline */
  canChat: boolean;
}

export default function BibCard({ bib, canChat }: Props) {
  const ev = getEvent();
  const cat = ev.categories.find((c) => c.id === bib.categoryId);
  const message = `Hi ${bib.displayName}, I saw your ${ev.shortName} bib transfer listing for ${cat?.name ?? "your race"}. Is it still available?`;
  return (
    <div className="card pad">
      <div className="chips" style={{ marginBottom: 8, alignItems: "center" }}>
        {cat ? (
          <span className={cat.isNight ? "chip sm night" : "chip sm green"}>
            {cat.isNight ? <MoonIcon size={14} /> : <SunIcon size={14} />}
            &nbsp;{cat.name}
          </span>
        ) : null}
        <span className="small">{listedAgo(bib.createdAt)}</span>
      </div>
      <div className="row" style={{ padding: 0 }}>
        <span className="avatar">{initial(bib.displayName)}</span>
        <div className="grow">
          <div className="strong">{bib.displayName}</div>
          {bib.note ? <div className="small" style={{ lineHeight: 1.4 }}>{bib.note}</div> : null}
        </div>
      </div>
      {canChat ? (
        <a
          href={bibChatUrl(bib, message)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary block"
          style={{ marginTop: 12 }}
        >
          <ChatIcon size={20} />
          Chat on WhatsApp
        </a>
      ) : null}
    </div>
  );
}
