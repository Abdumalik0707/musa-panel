"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

interface UserRow {
  _id: string;
  name: string;
  phone: string;
  username?: string;
  type: "individual" | "shop" | "admin";
  shopName?: string;
  address?: string;
  createdAt: string;
}

export default function CustomersPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "individual" | "shop">("all");

  useEffect(() => {
    const u = localStorage.getItem("musa_admin");
    if (!u) { router.push("/login"); return; }
    const admin = JSON.parse(u);
    if (admin.type !== "admin" && !admin.isAdmin) { router.push("/login"); return; }
    fetchUsers();
  }, [router]);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = users
    .filter((u) => u.type !== "admin")
    .filter((u) => (filter === "all" ? true : u.type === filter));

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("uz-UZ", { day: "2-digit", month: "short", year: "numeric" });

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "var(--bg)" }}>
        <div style={{ color: "var(--muted)", fontSize: 16 }}>{t("loading")}</div>
      </div>
    );
  }

  return (
    <div className="customers-page" style={{ minHeight: "100vh", background: "var(--bg)", padding: "28px 32px" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => router.push("/")}
              style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--muted)", cursor: "pointer", fontSize: 14 }}
            >
              ← {t("back")}
            </button>
            <h1 style={{ fontFamily: "var(--font-jakarta)", fontSize: 24, fontWeight: 800, color: "var(--fg)" }}>
              {t("customers_title")}
            </h1>
          </div>
          <LanguageSwitcher />
        </div>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>{t("customers_subtitle")}</p>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {[["all", `${t("filter_all")} (${users.filter(u => u.type !== "admin").length})`], ["individual", t("stat_individual")], ["shop", t("badge_shop")]].map(([val, lbl]) => (
          <button
            key={val}
            onClick={() => setFilter(val as "all" | "individual" | "shop")}
            style={{
              padding: "7px 16px", borderRadius: 12,
              border: `1px solid ${filter === val ? "var(--accent)" : "var(--border)"}`,
              background: filter === val ? "var(--accent-bg)" : "var(--surface)",
              color: filter === val ? "var(--accent-text)" : "var(--muted)",
              fontWeight: 600, fontSize: 13, cursor: "pointer",
            }}
          >
            {lbl}
          </button>
        ))}
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "24px", overflowX: "auto" }}>
        {filtered.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 14, padding: "20px 0" }}>{t("customers_empty")}</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr>
                {[t("th_name"), t("th_phone"), t("th_type"), t("th_shopname"), t("th_address"), t("th_registered")].map((h) => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", color: "var(--muted)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid var(--border)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u._id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px 12px", color: "var(--fg)", fontWeight: 500 }}>{u.name}</td>
                  <td style={{ padding: "12px 12px", color: "var(--muted)" }}>{u.phone}</td>
                  <td style={{ padding: "12px 12px" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 10, background: u.type === "shop" ? "rgba(234,179,8,0.15)" : "rgba(59,130,246,0.15)", color: u.type === "shop" ? "var(--amber)" : "var(--blue)" }}>
                      {u.type === "shop" ? t("badge_shop") : t("badge_customer")}
                    </span>
                  </td>
                  <td style={{ padding: "12px 12px", color: "var(--fg)" }}>{u.shopName || "—"}</td>
                  <td style={{ padding: "12px 12px", color: "var(--muted)" }}>{u.address || "—"}</td>
                  <td style={{ padding: "12px 12px", color: "var(--muted)", fontSize: 12 }}>{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        @media (max-width: 700px) {
          .customers-page { padding: 16px !important; }
        }
      `}</style>
    </div>
  );
}
