// src/pages/help/HelpHome.jsx — trang chủ trợ giúp (các section theo thứ tự trong video)
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HELP_CATEGORIES, SCHEMATIC_STEPS, HELP_COPY, HELP_LINKS, HELP_IMAGES, imgUrl } from "../../lib/helpData";
import { Chev, Stripes, ArtSlot, Schematic } from "./HelpParts";
import { PixelFlower } from "./HelpPixel";

export function HelpHero({ q, setQ, onSearch }) {
  return (
    <section className="gic-hero">
      <ArtSlot slot="hero" kind="dawn" seed={3} alt="" />
      <div className="gic-identity">{HELP_COPY.identity}</div>
      <div className="gic-glass">
        <h1 className="gic-serif">{HELP_COPY.promise}</h1>
        <p className="gic-p">{HELP_COPY.support}</p>
        <form className="gic-search" onSubmit={(e) => { e.preventDefault(); onSearch(q); }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm câu trả lời" aria-label="Tìm câu trả lời" />
          <button type="submit" aria-label="Tìm"><Chev /></button>
        </form>
      </div>
    </section>
  );
}

export function HelpVision() {
  const img = imgUrl(HELP_IMAGES.specimen.src);
  return (
    <section className="gic-sec">
      <div className="gic-pair">
        <div className="gic-spec">{img ? <img src={img} alt="" /> : <PixelFlower />}</div>
        <div className="gic-vision-text">
          <p className="gic-p">{HELP_COPY.visionP}</p>
          <h2 className="gic-serif gic-h">{HELP_COPY.vision}</h2>
        </div>
      </div>
    </section>
  );
}

export function HelpChapter() {
  const [step, setStep] = useState(0);
  const [hold, setHold] = useState(false);
  useEffect(() => {
    if (hold) return undefined;
    const t = setInterval(() => setStep((s) => (s + 1) % SCHEMATIC_STEPS.length), 4200);
    return () => clearInterval(t);
  }, [hold]);
  const s = SCHEMATIC_STEPS[step];
  return (
    <section style={{ paddingBottom: 200 }}>
      <div className="gic-thesis">
        <h2 className="gic-serif gic-h">{HELP_COPY.thesis}: <span className="pale">{HELP_COPY.thesisPale}</span>.</h2>
        <p className="gic-serif after">{HELP_COPY.thesis2}</p>
      </div>
      <div className="gic-chapter" onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)}>
        <div>
          <div className="gic-bars">
            {SCHEMATIC_STEPS.map((x, i) => (
              <button key={x.title} type="button" aria-label={x.title} aria-current={i === step} onClick={() => { setHold(true); setStep(i); }} />
            ))}
          </div>
          <div className="gic-step"><h3>{s.title}</h3><p>{s.text}</p></div>
        </div>
        <div>
          <div className="gic-frame"><div className="gic-sheet"><Schematic step={step} /></div></div>
          <div className="gic-cap gic-fig">Hình {step + 1}. {s.title}</div>
        </div>
      </div>
    </section>
  );
}

export function HelpInvite() {
  return (
    <section style={{ paddingBottom: 200 }}>
      <div className="gic-invite">
        <ArtSlot slot="invitation" kind="flowers" seed={11} />
        <div className="gic-invite-in">
          <h2>{HELP_COPY.invite}</h2>
          <p className="gic-p">{HELP_COPY.inviteP}</p>
          <Link className="gic-btn glass" to={HELP_LINKS.support}>Gửi yêu cầu hỗ trợ</Link>
        </div>
        <div className="gic-aside">Cần gấp? Viết thẳng cho {HELP_LINKS.email}</div>
      </div>
    </section>
  );
}

export function HelpTopics({ counts, onOpen }) {
  return (
    <section id="gic-topics" style={{ paddingBottom: 200 }}>
      <div className="gic-head">
        <h2 className="gic-serif gic-h">Chọn một chủ đề</h2>
        <button type="button" className="gic-link" onClick={() => onOpen("all")} style={{ background: "none", border: 0 }}>
          <u>Xem tất cả câu hỏi</u><Chev dk />
        </button>
      </div>
      <div className="gic-grid">
        {HELP_CATEGORIES.map((c, i) => (
          <button key={c.id} type="button" className="gic-card" onClick={() => onOpen(c.id)}>
            <ArtSlot slot={"cat_" + c.id} kind="cover" seed={20 + i} />
            <div className="gic-caption"><b>{c.title}</b><span>{counts[c.id] || 0} bài · {c.blurb}</span></div>
          </button>
        ))}
      </div>
    </section>
  );
}

export const HomeStripes = () => <Stripes />;

