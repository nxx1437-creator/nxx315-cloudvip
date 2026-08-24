import React, { useEffect, useMemo, useState } from "react";
import { Coins, Gift, Loader2, Send, Gamepad2, Swords, Zap, ShieldCheck, Trophy, MessageCircle, Phone, Check } from "lucide-react";
import useSession from "../hooks/useSession.js";
import useProfile from "../hooks/useProfile.js";
import { useStoreData } from "../hooks/useStoreData.js";
import { supabase } from "../lib/supabaseClient.js";
import BottomNav from "../components/BottomNav.jsx";

const STATUS_LABEL = {
  pending: { text: "Đang xử lý", cls: "bg-amber-50 text-amber-600" },
  delivered: { text: "Đã giao", cls: "bg-emerald-50 text-emerald-600" },
  cancelled: { text: "Đã từ chối", cls: "bg-rose-50 text-rose-500" },
};

function fmtTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function Store() {
  const { session } = useSession();
  const { profile } = useProfile(session?.user?.id);
  const { packages, orders, loading, refetch } = useStoreData(session?.user?.id);

  const [mainTab, setMainTab] = useState("robux");
  const [subTab, setSubTab] = useState("VNG");
  const [selectedId, setSelectedId] = useState(null);
  const [robloxUsername, setRobloxUsername] = useState("");
  const [targetAccount, setTargetAccount] = useState("");
  const [receiveMethod, setReceiveMethod] = useState("");
  const [contactValue, setContactValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const robuxPackages = packages.filter((p) => (p.category ?? "robux") === "robux" && p.version === subTab);
  const quanHuyPackages = packages.filter((p) => p.category === "quanhuy");
  const visiblePackages = mainTab === "robux" ? robuxPackages : quanHuyPackages;

  const selectedPkg = useMemo(() => packages.find((p) => p.id === selectedId) ?? null, [packages, selectedId]);

  const handleSelect = (pkg) => {
    setSelectedId(pkg.id);
    setFeedback(null);
    setReceiveMethod("");
    setContactValue("");
    setRobloxUsername("");
    setTargetAccount("");
  };
