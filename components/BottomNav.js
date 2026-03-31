"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Play, Plus, CreditCard, User } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/shorts", icon: Play, label: "Shorts" },
    { href: "/subscribe", icon: Plus, label: "Subscribe", isCenter: true },
    { href: "/subscribe", icon: CreditCard, label: "Subscriptions" },
    { href: "/dashboard", icon: User, label: "You" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="flex items-center justify-around bg-[#0F0F0F] border-t border-[#2A2A2A]">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`
                flex flex-col items-center justify-center py-2 px-3 min-w-0 transition-colors
                ${tab.isCenter 
                  ? "relative -top-2 bg-[#C8102E] rounded-full p-3 mx-2" 
                  : isActive 
                    ? "text-[#C8102E]" 
                    : "text-[#707070] hover:text-[#FFFFFF]"
                }
              `}
            >
              <Icon 
                className={`
                  ${tab.isCenter ? "h-6 w-6 text-white" : "h-5 w-5"}
                  ${isActive && !tab.isCenter ? "bottom-nav-icon active" : ""}
                `} 
              />
              {!tab.isCenter && (
                <span className="text-xs mt-1 truncate">
                  {tab.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
