// src/pages/CosmeticsShop.jsx — trình chỉnh khung avatar + hiệu ứng hồ sơ: /cosmetics (?tab=effect để mở thẳng tab Hiệu ứng)
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CosmeticEditor from "../components/cosmetics/CosmeticEditor.jsx";

export default function CosmeticsShop() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const back = () => (window.history.length > 1 ? navigate(-1) : navigate("/profile"));
  return <CosmeticEditor initialKind={sp.get("tab")} onBack={back} />;
}
