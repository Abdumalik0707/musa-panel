"use client";

import { useState, useEffect, useMemo } from "react";
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
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);

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

  async function deleteUser(id: string) {
    if (!confirm(t("confirm_delete_customer"))) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u._id !== id));
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  }

  async function saveUser(updated: UserRow) {
    try {
      const res = await fetch(`/api/users/${updated._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: updated.name,
          phone: updated.phone,
          type: updated.type,
          shopName: updated.shopName,
          address: updated.address,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.map((u) => (u._id === updated._id ? data.user : u)));
        setEditingUser(null);
      }
    } catch (err) {
      console.error("Error updating user:", err);
    }
  }

  const filtered = useMemo(() => {
    return users
      .filter((u) => u.type !== "admin")
      .filter((u) => (filter === "all" ? true : u.type === filter))
      .filter((u) => {
        if (!search.trim()) return true;
        const q = search.trim().toLowerCase();
        return u.name.toLowerCase().includes(q) || u.phone.toLowerCase().includes(q);
      })
      .filter((u) => {
        if (!fromDate) return true;
        return new Date(u.createdAt) >= new Date(fromDate);
      })
      .filter((u) => {
        if (!toDate) return true;
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        return new Date(u.createdAt) <= end;
      });
  }, [users, filter, search, fromDate, toDate]);

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

      {/* Search + filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div style={{ flex: "1 1 220px", minWidth: 200 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search_placeholder")}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>{t("filter_from_date")}</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>{t("filter_to_date")}</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={inputStyle} />
        </div>
        {(search || fromDate || toDate) && (
          <button
            onClick={() => { setSearch(""); setFromDate(""); setToDate(""); }}
            style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--muted)", cursor: "pointer", fontSize: 13, fontWeight: 600, height: 42 }}
          >
            {t("filter_clear")}
          </button>
        )}
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
                {[t("th_name"), t("th_phone"), t("th_type"), t("th_shopname"), t("th_address"), t("th_registered"), t("th_actions")].map((h) => (
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
                  <td style={{ padding: "12px 12px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => setEditingUser(u)}
                        style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--fg)", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                      >
                        ✏️ {t("action_edit")}
                      </button>
                      <button
                        onClick={() => deleteUser(u._id)}
                        style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.1)", color: "var(--red)", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                      >
                        🗑️ {t("action_delete")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editingUser && (
        <EditCustomerModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={saveUser}
        />
      )}

      <style>{`
        @media (max-width: 700px) {
          .customers-page { padding: 16px !important; }
        }
      `}</style>
    </div>
  );
}

function EditCustomerModal({ user, onClose, onSave }: { user: UserRow; onClose: () => void; onSave: (u: UserRow) => void }) {
  const { t } = useLanguage();
  const [form, setForm] = useState<UserRow>({ ...user });

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "var(--surface)", borderRadius: 24, width: "100%", maxWidth: 440, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.35)" }}
      >
        <h2 style={{ fontFamily: "var(--font-jakarta)", fontSize: 18, fontWeight: 800, color: "var(--fg)", marginBottom: 20 }}>
          {t("edit_customer_title")}
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>{t("th_name")}</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>{t("th_phone")}</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>{t("th_type")}</label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["individual", "shop"] as const).map((val) => (
                <button
                  key={val}
                  onClick={() => setForm({ ...form, type: val })}
                  style={{
                    flex: 1, padding: "10px", borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 700,
                    border: `2px solid ${form.type === val ? "var(--accent)" : "var(--border)"}`,
                    background: form.type === val ? "var(--accent-bg)" : "var(--surface-2)",
                    color: form.type === val ? "var(--accent-text)" : "var(--muted)",
                  }}
                >
                  {val === "shop" ? t("badge_shop") : t("badge_customer")}
                </button>
              ))}
            </div>
          </div>
          {form.type === "shop" && (
            <div>
              <label style={labelStyle}>{t("th_shopname")}</label>
              <input value={form.shopName || ""} onChange={(e) => setForm({ ...form, shopName: e.target.value })} style={inputStyle} />
            </div>
          )}
          <div>
            <label style={labelStyle}>{t("th_address")}</label>
            <input value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} style={inputStyle} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: "12px", borderRadius: 14, border: "1px solid var(--border)", background: "var(--surface-2)", color: "var(--fg)", cursor: "pointer", fontSize: 14, fontWeight: 700 }}
          >
            {t("edit_cancel")}
          </button>
          <button
            onClick={() => onSave(form)}
            style={{ flex: 1, padding: "12px", borderRadius: 14, border: "none", background: "var(--accent)", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700 }}
          >
            {t("edit_save")}
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "var(--muted)",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 42,
  borderRadius: 10,
  border: "1px solid var(--border-strong)",
  background: "var(--surface-2)",
  padding: "0 14px",
  fontSize: 14,
  color: "var(--fg)",
  outline: "none",
  boxSizing: "border-box",
};
