"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { OrderDetailModal } from "@/components/OrderDetailModal";
import { useLanguage } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

type OrderStatus = "yangi_mijoz" | "tolov_otkazildi" | "yetkazib_berishda" | "yetkazib_berildi";

interface Order {
  _id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerLat?: number;
  customerLng?: number;
  customerType: "individual" | "shop";
  products: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod?: "cash" | "card" | "online";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrdersKanbanPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const STAGES = [
    { id: "yangi_mijoz", label: t("status_new"), icon: "🆕", color: "#3b82f6" },
    { id: "tolov_otkazildi", label: t("status_paid"), icon: "💰", color: "#22c55e" },
    { id: "yetkazib_berishda", label: t("status_delivering"), icon: "🚚", color: "#f59e0b" },
    { id: "yetkazib_berildi", label: t("status_delivered"), icon: "✅", color: "#10b981" },
  ];
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedOrder, setDraggedOrder] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const u = localStorage.getItem("musa_admin");
    if (!u) {
      router.push("/login");
      return;
    }
    const admin = JSON.parse(u);
    if (admin.type !== "admin" && !admin.isAdmin) {
      router.push("/login");
      return;
    }
    fetchOrders();
  }, [router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
      }
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  const handleDragStart = (orderId: string) => {
    setDraggedOrder(orderId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: OrderStatus) => {
    e.preventDefault();
    if (draggedOrder) {
      updateOrderStatus(draggedOrder, newStatus);
      setDraggedOrder(null);
    }
  };

  const getOrdersByStatus = (status: OrderStatus) => {
    return orders.filter((order) => order.status === status);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("uz-UZ").format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("uz-UZ", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "var(--bg)",
        }}
      >
        <div style={{ color: "var(--muted)", fontSize: 16 }}>{t("loading")}</div>
      </div>
    );
  }

  return (
    <div className="kanban-page" style={{ minHeight: "100vh", background: "var(--bg)", padding: "28px 32px" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => router.push("/")}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "var(--surface)",
                color: "var(--muted)",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              ← {t("back")}
            </button>
            <h1
              style={{
                fontFamily: "var(--font-jakarta)",
                fontSize: 24,
                fontWeight: 800,
                color: "var(--fg)",
              }}
            >
              {t("orders_title")}
            </h1>
          </div>
          <LanguageSwitcher />
        </div>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>
          {t("orders_subtitle")}
        </p>
      </div>

      {/* Kanban Board */}
      <div
        className="kanban-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 20,
        }}
      >
        {STAGES.map((stage) => {
          const stageOrders = getOrdersByStatus(stage.id as OrderStatus);
          return (
            <div
              key={stage.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id as OrderStatus)}
              style={{
                background: "var(--surface)",
                border: "2px solid var(--border)",
                borderRadius: 16,
                padding: "16px",
                minHeight: "calc(100vh - 200px)",
              }}
            >
              {/* Stage Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                  paddingBottom: 12,
                  borderBottom: `2px solid ${stage.color}30`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{stage.icon}</span>
                  <span
                    style={{
                      fontFamily: "var(--font-jakarta)",
                      fontSize: 15,
                      fontWeight: 700,
                      color: "var(--fg)",
                    }}
                  >
                    {stage.label}
                  </span>
                </div>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: 12,
                    background: `${stage.color}20`,
                    color: stage.color,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {stageOrders.length}
                </span>
              </div>

              {/* Orders */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {stageOrders.map((order) => (
                  <div
                    key={order._id}
                    draggable
                    onDragStart={() => handleDragStart(order._id)}
                    onClick={() => setSelectedOrder(order)}
                    style={{
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      padding: "14px",
                      cursor: "grab",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = `0 4px 12px ${stage.color}30`;
                      e.currentTarget.style.borderColor = stage.color;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.borderColor = "var(--border)";
                    }}
                  >
                    {/* Customer Info */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "var(--fg)",
                            marginBottom: 4,
                          }}
                        >
                          {order.customerName}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>
                          📞 {order.customerPhone}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: 8,
                            fontSize: 10,
                            fontWeight: 700,
                            background: order.customerType === "shop" ? "#f59e0b20" : "#3b82f620",
                            color: order.customerType === "shop" ? "#f59e0b" : "#3b82f6",
                          }}
                        >
                          {order.customerType === "shop" ? `🏪 ${t("badge_shop")}` : `👤 ${t("badge_customer")}`}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(t("confirm_delete_order"))) deleteOrder(order._id);
                          }}
                          style={{
                            width: 22, height: 22, borderRadius: 6, border: "1px solid var(--border)",
                            background: "var(--surface-2)", color: "var(--red)", fontSize: 12,
                            cursor: "pointer", display: "grid", placeItems: "center", flexShrink: 0,
                          }}
                          title={t("action_delete")}
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Address */}
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--muted)",
                        marginBottom: 12,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      📍 {order.customerAddress}
                    </div>

                    {/* Products */}
                    <div
                      style={{
                        background: "var(--surface-2)",
                        borderRadius: 8,
                        padding: "8px",
                        marginBottom: 12,
                      }}
                    >
                      {order.products.slice(0, 2).map((product, idx) => (
                        <div
                          key={idx}
                          style={{
                            fontSize: 12,
                            color: "var(--fg)",
                            marginBottom: idx < order.products.length - 1 ? 4 : 0,
                          }}
                        >
                          • {product.productName} × {product.quantity}
                        </div>
                      ))}
                      {order.products.length > 2 && (
                        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
                          +{order.products.length - 2} ta yana...
                        </div>
                      )}
                    </div>

                    {/* Total & Date */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingTop: 12,
                        borderTop: "1px solid var(--border)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 800,
                          color: stage.color,
                          fontFamily: "var(--font-jakarta)",
                        }}
                      >
                        {formatCurrency(order.totalAmount)} so&apos;m
                      </div>
                      <div style={{ fontSize: 11, color: "var(--muted-2)" }}>
                        {formatDate(order.createdAt)}
                      </div>
                    </div>

                    {/* Payment Method */}
                    {order.paymentMethod && (
                      <div style={{ marginTop: 8 }}>
                        <span
                          style={{
                            fontSize: 10,
                            padding: "3px 8px",
                            borderRadius: 6,
                            background: "var(--surface-2)",
                            color: "var(--muted)",
                          }}
                        >
                          {order.paymentMethod === "cash"
                            ? t("pay_cash")
                            : order.paymentMethod === "card"
                            ? t("pay_card")
                            : t("pay_online")}
                        </span>
                      </div>
                    )}
                  </div>
                ))}

                {stageOrders.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px 20px",
                      color: "var(--muted)",
                      fontSize: 13,
                    }}
                  >
                    {t("empty_column")}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={(id, status) => {
            updateOrderStatus(id, status);
            setSelectedOrder(null);
          }}
          onDelete={(id) => {
            deleteOrder(id);
            setSelectedOrder(null);
          }}
        />
      )}

      <style>{`
        @media (max-width: 700px) {
          .kanban-page { padding: 16px !important; }
          .kanban-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
