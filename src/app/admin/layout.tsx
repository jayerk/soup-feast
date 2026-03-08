"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/event", label: "Event Setup", icon: "🎪" },
  { href: "/admin/timeline", label: "Timeline", icon: "📅" },
  { href: "/admin/soups", label: "Soups", icon: "🍲" },
  { href: "/admin/guests", label: "Guests", icon: "👥" },
  { href: "/admin/campaigns", label: "Campaigns", icon: "📨" },
  { href: "/admin/budget", label: "Budget", icon: "💰" },
  { href: "/admin/checklist", label: "Checklist", icon: "✅" },
  { href: "/admin/reveal", label: "Reveal", icon: "🏆" },
  { href: "/admin/archive", label: "Archive", icon: "📚" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-stone-900 text-stone-100">
        <div className="border-b border-stone-700 p-4">
          <Link href="/" className="block">
            <h1 className="text-lg font-bold text-amber-400">Soup Feast</h1>
            <p className="text-xs text-stone-400">Admin Dashboard</p>
          </Link>
        </div>

        <nav className="p-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-stone-700 text-white"
                    : "text-stone-300 hover:bg-stone-800 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-stone-700 p-4">
          <button
            onClick={handleLogout}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-stone-400 hover:bg-stone-800 hover:text-white"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-stone-50 p-8">
        {children}
      </main>
    </div>
  );
}
