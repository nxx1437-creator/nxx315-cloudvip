// src/components/AuthNotice.jsx
import React from "react";

// tone: "info" | "warn" | "bad" | "error"
export default function AuthNotice({ tone = "info", icon, title, children, action, pre }) {
  return (
    <div className={`au-note ${tone}`} role={tone === "info" ? undefined : "alert"}>
      {icon ? <span className="au-note-ic">{icon}</span> : null}
      <div className="au-note-bd">
        {title ? <p className="au-note-t">{title}</p> : null}
        {children ? <p className={"au-note-p" + (pre ? " au-pre" : "")}>{children}</p> : null}
        {action}
      </div>
    </div>
  );
}
