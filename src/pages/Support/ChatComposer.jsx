// src/pages/Support/ChatComposer.jsx — gợi ý nhanh + ô nhập kiểu Cofounder + menu đính kèm + emoji
import React from "react";
import { ArrowUp, Camera, CornerDownRight, Image as ImageIcon, Plus, Smile, X } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import GlowFrame from "./GlowFrame.jsx";

export default function ChatComposer({
  input, setInput, inputRef, isHero, busy, hasInput, sending, onSend,
  pendingImage, clearPending, replyTo, clearReply,
  chipItems, chipKey, onPickChip,
  showFileMenu, setShowFileMenu, showEmoji, setShowEmoji,
  fileInputRef, cameraInputRef, onFile,
}) {
  return (
    <div className="relative shrink-0 bg-[#fbfbf8]">
      {!busy && chipItems.length > 0 && (
        <div key={chipKey} className="nxx-noscrollbar nxx-rise mx-auto flex w-full max-w-2xl gap-2 overflow-x-auto px-3.5 pb-2.5 pt-1">
          {chipItems.map((item) => (
            <button key={item.label} type="button" onClick={() => onPickChip(item)} disabled={sending} className="nxx-chip">
              {item.suggestion ? <CornerDownRight size={16} className="shrink-0 text-[#a2a29b]" /> : <span className="text-[15px]">{item.emoji}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="mx-auto w-full max-w-2xl px-3.5 pb-[max(12px,env(safe-area-inset-bottom))] pt-1">
        {pendingImage && (
          <div className="nxx-rise mb-2 flex items-center gap-3 rounded-[22px] border border-[#e6e6df] bg-[#f2f2ee] p-2">
            <img src={pendingImage.previewUrl} alt="Xem trước" className="h-14 w-14 rounded-2xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium text-[#2b2b2b]">Ảnh đã chọn</p>
              <p className="text-[12px] text-[#8b8b84]">Nhập mô tả và bấm gửi</p>
            </div>
            <button type="button" onClick={clearPending} aria-label="Bỏ ảnh" className="nxx-iconbtn h-8 w-8 bg-white text-[#8b8b84]"><X size={16} /></button>
          </div>
        )}

        {replyTo && (
          <div className="nxx-rise nxx-replychip">
            <span className="nxx-replybar" />
            <span className="min-w-0 flex-1 truncate">{replyTo.text}</span>
            <button type="button" onClick={clearReply} aria-label="Bỏ trích dẫn" className="nxx-iconbtn h-7 w-7 text-[#8b8b84]"><X size={17} /></button>
          </div>
        )}

        <GlowFrame active={busy}>
          <div className={`nxx-composer ${busy ? "is-busy" : ""}`}>
            <button type="button" onClick={() => setShowFileMenu(true)} aria-label="Đính kèm" className="nxx-iconbtn nxx-plus h-10 w-10"><Plus size={20} strokeWidth={2} /></button>
            <textarea
              ref={inputRef} rows={1} value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); onSend(); } }}
              enterKeyHint="send" aria-label="Nhập tin nhắn"
              placeholder={busy ? "Đang trả lời…" : isHero ? "Bạn cần hỗ trợ gì nè?" : "Nhắn cho NXX…"}
              className="max-h-[120px] min-h-[40px] min-w-0 flex-1 resize-none bg-transparent py-2.5 text-[16px] leading-5 text-[#2b2b2b] outline-none placeholder:text-[#a2a29b]"
            />
            <button type="button" onClick={() => onSend()} disabled={busy || !hasInput} aria-label={busy ? "Đang trả lời" : "Gửi"}
              className={`nxx-iconbtn h-10 w-10 text-white ${busy || hasInput ? "bg-[#2b2b2b]" : "bg-[#cfcfc8]"} ${busy ? "cursor-default" : ""}`}>
              {busy ? <span className="h-3 w-3 rounded-[3px] bg-white" /> : <ArrowUp size={20} strokeWidth={2.4} />}
            </button>
          </div>
        </GlowFrame>

        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
      </div>

      {showFileMenu && (
        <>
          <div className="nxx-fade fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setShowFileMenu(false)} />
          <div className="nxx-sheet-in fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-2xl rounded-t-[28px] border border-[#e6e6df] bg-[#fbfbf8] pb-[max(20px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_40px_rgba(0,0,0,0.12)]">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#e3e3dc]" />
            <div className="px-6">
              <h3 className="text-[19px] font-medium tracking-[-0.01em] text-[#2b2b2b]">Đính kèm</h3>
              <div className="mt-5 grid grid-cols-3 gap-4">
                {[
                  { l: "Chụp ảnh", i: <Camera size={30} strokeWidth={1.7} />, f: () => cameraInputRef.current?.click() },
                  { l: "Album", i: <ImageIcon size={30} strokeWidth={1.7} />, f: () => fileInputRef.current?.click() },
                  { l: "Emoji", i: <Smile size={30} strokeWidth={1.7} />, f: () => setShowEmoji(true) },
                ].map((a) => (
                  <button key={a.l} type="button" onClick={() => { setShowFileMenu(false); a.f(); }} className="flex flex-col items-center gap-3">
                    <div className="flex h-20 w-20 items-center justify-center rounded-[22px] bg-[#f2f2ee] text-[#2b2b2b]">{a.i}</div>
                    <span className="text-[13px] font-medium text-[#55554f]">{a.l}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {showEmoji && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowEmoji(false)} />
          <div className="absolute bottom-[78px] right-4 z-50 overflow-hidden rounded-2xl border border-[#e6e6df] shadow-2xl">
            <EmojiPicker onEmojiClick={(e) => setInput((prev) => prev + e.emoji)} theme="light" height={350} width={300} />
          </div>
        </>
      )}
    </div>
  );
}
