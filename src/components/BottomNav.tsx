"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, ListIcon, PlusIcon, SearchIcon } from "./Icons";

const ITEMS = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/find", label: "Find", Icon: SearchIcon },
  { href: "/offer", label: "Offer", Icon: PlusIcon },
  { href: "/my", label: "My listings", Icon: ListIcon },
];

export default function BottomNav() {
  const pathname = usePathname() ?? "";
  return (
    <nav className="nav" aria-label="Main">
      {ITEMS.map(({ href, label, Icon }) => {
        const active =
          href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined}>
            <Icon />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
