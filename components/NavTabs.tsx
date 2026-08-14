"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [{ href: "/", label: "Photography" }];

export default function NavTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between border-b border-white/10 px-6">
      <div className="flex gap-6">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`-mb-px border-b-2 pb-3 pt-8 text-sm font-medium tracking-widest uppercase transition-colors ${
                isActive
                  ? "border-white text-white/90"
                  : "border-transparent text-white/50 hover:text-white/80"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
      <span className="pb-3 pt-8 text-sm font-medium tracking-widest uppercase text-white/50">
        Apoorv Kwatra
      </span>
    </nav>
  );
}
