// src/pages/Support/HelpView.jsx
import React, { useEffect, useState } from "react";
import { ListView, ArticleView } from "../help/HelpViews.jsx";

export default function HelpView({ category, onBack, onStartChat }) {
  const [articleId, setArticleId] = useState(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    setArticleId(null);
    setQ("");
  }, [category]);

  const handleBack = () => {
    if (articleId) {
      setArticleId(null);
    } else {
      onBack?.();
    }
  };

  const handleOpen = (id) => {
    setArticleId(id);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (articleId) {
    return (
      <ArticleView
        id={articleId}
        onOpen={handleOpen}
        onBack={handleBack}
        onCat={() => {
          setArticleId(null);
          setQ("");
        }}
      />
    );
  }

  return (
    <ListView
      cat={category || "all"}
      q={q}
      onOpen={handleOpen}
      onBack={handleBack}
      onSearch={setQ}
    />
  );
}