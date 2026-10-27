"use client";

import { useEffect, useRef, useState } from "react";
import type { Place } from "@/lib/types";
import {
  autocomplete,
  placeDetails,
  placesEnabled,
  searchLocal,
  type Suggestion,
} from "@/lib/places";
import { PinIcon } from "./Icons";

interface Props {
  id: string;
  label: string;
  value: Place | null;
  onChange: (place: Place | null) => void;
  hint?: string;
  placeholder?: string;
}

function newToken(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return String(Math.random()).slice(2);
}

/**
 * Place search. Uses Google Places when NEXT_PUBLIC_GOOGLE_MAPS_KEY is set,
 * otherwise a small built-in list of Karnataka places. Pass a changing `key`
 * from the parent to reset it.
 */
export default function PlaceInput({
  id,
  label,
  value,
  onChange,
  hint,
  placeholder,
}: Props) {
  const [text, setText] = useState(value?.label ?? "");
  const [options, setOptions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const token = useRef("");

  useEffect(() => {
    token.current = newToken();
  }, []);

  useEffect(() => {
    if (!open) return;
    const q = text.trim();
    if (q.length < 2) {
      setOptions(searchLocal(q));
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const found = await autocomplete(q, token.current);
        if (!cancelled) {
          setOptions(found);
          setNote("");
        }
      } catch {
        if (!cancelled) {
          setOptions(searchLocal(q));
          setNote("Google search is unavailable, showing common places.");
        }
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [text, open]);

  async function pick(s: Suggestion) {
    setOpen(false);
    setText(s.label);
    try {
      const place = await placeDetails(s, token.current);
      token.current = newToken();
      setNote("");
      onChange(place);
    } catch {
      setNote("Could not load that place. Please pick another.");
      onChange(null);
    }
  }

  return (
    <div
      className="field"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <label htmlFor={id}>{label}</label>
      <div className="with-icon">
        <PinIcon size={20} color="#1e5a3c" />
        <input
          id={id}
          className="input"
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder={placeholder ?? "Search a place"}
          value={text}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
            if (value) onChange(null);
          }}
        />
        {open && options.length > 0 && (
          <ul
            id={`${id}-list`}
            className="suggest"
            onMouseDown={(e) => e.preventDefault()}
          >
            {options.map((o) => (
              <li key={o.placeId ?? o.label}>
                <button type="button" onClick={() => pick(o)}>
                  {o.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {note ? (
        <div className="hint">{note}</div>
      ) : hint ? (
        <div className="hint">{hint}</div>
      ) : !placesEnabled ? (
        <div className="hint">Showing common places. Add a Google key to search anywhere.</div>
      ) : null}
    </div>
  );
}
