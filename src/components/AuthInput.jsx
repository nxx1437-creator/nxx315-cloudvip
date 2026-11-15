// src/components/AuthInput.jsx
import React from "react";

export default function AuthInput({
  id,
  label,
  labelRight,
  icon,
  variant,
  uppercase,
  ...rest
}) {
  return (
    <div>
      {(label || labelRight) && (
        <label className="au-lab" htmlFor={id}>
          <span>{label}</span>
          {labelRight}
        </label>
      )}
      <div className="au-inwrap">
        {icon ? <span className="au-ic">{icon}</span> : null}
        <input
          id={id}
          className={"au-in" + (uppercase ? " up" : "") + (variant === "gift" ? " gift" : "")}
          {...rest}
        />
      </div>
    </div>
  );
}
