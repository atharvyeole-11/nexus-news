"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Play, Plus, CreditCard, User } from "lucide-react";

export function FloatingNav() {
  const pathname = usePathname();

  const tabs = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/shorts", icon: Play, label: "Shorts" },
    { href: "/subscribe", icon: Plus, label: "Subscribe", isCenter: true },
    { href: "/subscribe", icon: CreditCard, label: "Subscriptions" },
    { href: "/dashboard", icon: User, label: "You" },
  ];

  return (
    <nav className="floating-nav">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        const Icon = tab.icon;
        
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`
              nav-btn relative
              ${tab.isCenter 
                ? "w-[52px] h-[52px] bg-[#C8102E] text-white shadow-lg shadow-[#C8102E]/50 -translate-y-2" 
                : "w-[48px] h-[48px]"
              }
              ${isActive && !tab.isCenter 
                ? "text-[#C8102E] bg-[rgba(200,16,46,0.15)]" 
                : "text-[#707070] hover:text-[var(--color-text)]"
              }
            `}
            aria-label={tab.label}
          >
            <Icon 
              className={`
                ${tab.isCenter ? "h-6 w-6" : "h-5 w-5"}
              `} 
            />
            {isActive && !tab.isCenter && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#C8102E] rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
