"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "uz" | "ru" | "en";

const dict = {
  uz: {
    // Sidebar
    sidebar_title: "Musa Admin",
    sidebar_subtitle: "Boshqaruv paneli",
    nav_dashboard: "Dashboard",
    nav_orders: "Buyurtmalar",
    nav_customers: "Mijozlar",
    theme_dark: "Qorong'i",
    theme_light: "Oq",
    theme_prefix: "Tema:",
    logout: "Chiqish",
    back: "Orqaga",
    loading: "Yuklanmoqda...",

    // Login
    login_title: "Musa Admin Panel",
    login_subtitle: "Faqat adminlar uchun",
    login_username: "Username",
    login_password: "Parol",
    login_submit: "Kirish →",
    login_checking: "Tekshirilmoqda...",
    login_not_admin: "Siz admin emassiz",
    login_generic_error: "Xatolik yuz berdi",
    login_server_error: "Server bilan bog'lanishda xatolik",

    // Dashboard
    dashboard_title: "Dashboard",
    dashboard_subtitle: "Buyurtmalar va savdo tahlili (real ma'lumotlar)",
    period_daily: "Bugun",
    period_weekly: "Hafta",
    period_monthly: "Oy",
    stat_orders: "Buyurtmalar",
    stat_revenue: "Tushum",
    stat_individual: "Oddiy mijoz",
    badge_individual: "Oddiy mijoz",
    stat_shop: "Do'kon",
    top_products_title: "🔥 Eng ko'p sotilgan mahsulotlar",
    top_products_empty: "Bu davrda buyurtma yo'q",
    recent_orders_title: "So'nggi buyurtmalar",
    recent_orders_empty: "Hali buyurtma yo'q",
    filter_all: "Barchasi",
    filter_individual: "Oddiy",
    filter_shop: "Do'kon",
    th_customer: "Mijoz",
    th_type: "Turi",
    th_product: "Mahsulot",
    th_amount: "Summa",
    th_date: "Sana",
    th_status: "Holat",
    badge_shop: "Do'kon",
    badge_customer: "Mijoz",

    // Orders / Kanban
    orders_title: "📦 Buyurtmalar (Kanban)",
    orders_subtitle: "Buyurtmalarni drag & drop bilan boshqaring",
    empty_column: "Bo'sh",
    pay_cash: "💵 Naqd",
    pay_card: "💳 Karta",
    pay_online: "🌐 Online",
    status_new: "Yangi mijoz",
    status_paid: "To'lov o'tkazildi",
    status_delivering: "Yetkazib berishda",
    status_delivered: "Yetkazib berildi",

    // Customers
    customers_title: "👥 Mijozlar",
    customers_subtitle: "Ro'yxatdan o'tgan barcha foydalanuvchilar",
    customers_empty: "Hali mijoz yo'q",
    th_name: "Ism",
    th_phone: "Telefon",
    th_shopname: "Do'kon nomi",
    th_address: "Manzil",
    th_registered: "Ro'yxatdan o'tgan sana",

    // Order detail modal
    detail_label: "Buyurtma tafsiloti",
    detail_address_title: "Yetkazib berish manzili",
    detail_no_coords: "Bu buyurtmada xarita koordinatalari saqlanmagan",
    detail_products: "Mahsulotlar",
    detail_total: "Jami summa",
    detail_change_status: "Holatni o'zgartirish",
    map_loading: "Xarita yuklanmoqda...",
    open_in_maps: "📍 Google Maps'da ochish",
  },
  ru: {
    sidebar_title: "Musa Admin",
    sidebar_subtitle: "Панель управления",
    nav_dashboard: "Дашборд",
    nav_orders: "Заказы",
    nav_customers: "Клиенты",
    theme_dark: "Тёмная",
    theme_light: "Светлая",
    theme_prefix: "Тема:",
    logout: "Выйти",
    back: "Назад",
    loading: "Загрузка...",

    login_title: "Musa Admin Panel",
    login_subtitle: "Только для администраторов",
    login_username: "Логин",
    login_password: "Пароль",
    login_submit: "Войти →",
    login_checking: "Проверка...",
    login_not_admin: "Вы не администратор",
    login_generic_error: "Произошла ошибка",
    login_server_error: "Ошибка соединения с сервером",

    dashboard_title: "Дашборд",
    dashboard_subtitle: "Анализ заказов и продаж (реальные данные)",
    period_daily: "Сегодня",
    period_weekly: "Неделя",
    period_monthly: "Месяц",
    stat_orders: "Заказы",
    stat_revenue: "Выручка",
    stat_individual: "Обычные клиенты",
    badge_individual: "Обычный клиент",
    stat_shop: "Магазины",
    top_products_title: "🔥 Самые продаваемые товары",
    top_products_empty: "За этот период заказов нет",
    recent_orders_title: "Последние заказы",
    recent_orders_empty: "Заказов пока нет",
    filter_all: "Все",
    filter_individual: "Обычные",
    filter_shop: "Магазины",
    th_customer: "Клиент",
    th_type: "Тип",
    th_product: "Товар",
    th_amount: "Сумма",
    th_date: "Дата",
    th_status: "Статус",
    badge_shop: "Магазин",
    badge_customer: "Клиент",

    orders_title: "📦 Заказы (Канбан)",
    orders_subtitle: "Управляйте заказами перетаскиванием",
    empty_column: "Пусто",
    pay_cash: "💵 Наличные",
    pay_card: "💳 Карта",
    pay_online: "🌐 Онлайн",
    status_new: "Новый клиент",
    status_paid: "Оплата произведена",
    status_delivering: "В доставке",
    status_delivered: "Доставлено",

    customers_title: "👥 Клиенты",
    customers_subtitle: "Все зарегистрированные пользователи",
    customers_empty: "Клиентов пока нет",
    th_name: "Имя",
    th_phone: "Телефон",
    th_shopname: "Название магазина",
    th_address: "Адрес",
    th_registered: "Дата регистрации",

    detail_label: "Детали заказа",
    detail_address_title: "Адрес доставки",
    detail_no_coords: "Координаты для этого заказа не сохранены",
    detail_products: "Товары",
    detail_total: "Итоговая сумма",
    detail_change_status: "Изменить статус",
    map_loading: "Карта загружается...",
    open_in_maps: "📍 Открыть в Google Maps",
  },
  en: {
    sidebar_title: "Musa Admin",
    sidebar_subtitle: "Admin panel",
    nav_dashboard: "Dashboard",
    nav_orders: "Orders",
    nav_customers: "Customers",
    theme_dark: "Dark",
    theme_light: "Light",
    theme_prefix: "Theme:",
    logout: "Log out",
    back: "Back",
    loading: "Loading...",

    login_title: "Musa Admin Panel",
    login_subtitle: "Admins only",
    login_username: "Username",
    login_password: "Password",
    login_submit: "Log in →",
    login_checking: "Checking...",
    login_not_admin: "You are not an admin",
    login_generic_error: "Something went wrong",
    login_server_error: "Could not reach the server",

    dashboard_title: "Dashboard",
    dashboard_subtitle: "Orders and sales overview (live data)",
    period_daily: "Today",
    period_weekly: "Week",
    period_monthly: "Month",
    stat_orders: "Orders",
    stat_revenue: "Revenue",
    stat_individual: "Individual customers",
    badge_individual: "Individual",
    stat_shop: "Shops",
    top_products_title: "🔥 Best-selling products",
    top_products_empty: "No orders in this period",
    recent_orders_title: "Recent orders",
    recent_orders_empty: "No orders yet",
    filter_all: "All",
    filter_individual: "Individual",
    filter_shop: "Shops",
    th_customer: "Customer",
    th_type: "Type",
    th_product: "Product",
    th_amount: "Amount",
    th_date: "Date",
    th_status: "Status",
    badge_shop: "Shop",
    badge_customer: "Customer",

    orders_title: "📦 Orders (Kanban)",
    orders_subtitle: "Manage orders with drag & drop",
    empty_column: "Empty",
    pay_cash: "💵 Cash",
    pay_card: "💳 Card",
    pay_online: "🌐 Online",
    status_new: "New customer",
    status_paid: "Payment made",
    status_delivering: "Out for delivery",
    status_delivered: "Delivered",

    customers_title: "👥 Customers",
    customers_subtitle: "All registered users",
    customers_empty: "No customers yet",
    th_name: "Name",
    th_phone: "Phone",
    th_shopname: "Shop name",
    th_address: "Address",
    th_registered: "Registered on",

    detail_label: "Order details",
    detail_address_title: "Delivery address",
    detail_no_coords: "No map coordinates saved for this order",
    detail_products: "Products",
    detail_total: "Total amount",
    detail_change_status: "Change status",
    map_loading: "Loading map...",
    open_in_maps: "📍 Open in Google Maps",
  },
} as const;

export type TranslationKey = keyof (typeof dict)["uz"];

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("uz");

  useEffect(() => {
    const saved = localStorage.getItem("musa_lang") as Lang | null;
    if (saved && (saved === "uz" || saved === "ru" || saved === "en")) {
      setLangState(saved);
    }
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("musa_lang", l);
  }

  function t(key: TranslationKey): string {
    return dict[lang][key] ?? dict.uz[key] ?? key;
  }

  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
