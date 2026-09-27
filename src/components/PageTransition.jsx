import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";

/**
 * Context cho phép page con báo "đã render xong".
 * Page không fetch data → không cần gọi, PageTransition tự fade sau timeout.
 * Page có fetch data → gọi markReady() sau khi data về.
 */
const PageReadyContext = createContext(() => {});

export function usePageReady() {
  const markReady = useContext(PageReadyContext);
  useEffect(() => {
    // Đợi 1 frame cho React paint xong
    const id = requestAnimationFrame(() => markReady());
    return () => cancelAnimationFrame(id);
  }, [markReady]);
}

const FADE_MS = 200;
const MAX_WAIT_MS = 1500; // nếu page không báo ready trong 1.5s → tự fade

export default function PageTransition({ children }) {
  const location = useLocation();

  const [current, setCurrent] = useState({
    node: children,
    key: location.pathname,
  });
  const [previous, setPrevious] = useState(null);
  const [phase, setPhase] = useState("idle"); // idle | waiting | crossfade
  const readyRef = useRef(false);

  // Khi route đổi → giữ trang cũ, chờ trang mới ready
  useEffect(() => {
    if (location.pathname === current.key) return;

    readyRef.current = false;
    setPrevious(current);
    setPhase("waiting");

    // Timeout an toàn: nếu page mới không tự báo ready
    const fallback = setTimeout(() => {
      if (!readyRef.current) markReady();
    }, MAX_WAIT_MS);

    return () => clearTimeout(fallback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const markReady = () => {
    if (readyRef.current) return;
    readyRef.current = true;

    setCurrent({ node: children, key: location.pathname });
    setPhase("crossfade");

    setTimeout(() => {
      setPrevious(null);
      setPhase("idle");
    }, FADE_MS);
  };

  // Nếu children đổi mà không phải do route (state trong page) → cập nhật luôn
  useEffect(() => {
    if (phase === "idle") {
      setCurrent((c) =>
        c.key === location.pathname ? { node: children, key: c.key } : c
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  return (
    <PageReadyContext.Provider value={markReady}>
      <div className="page-transition">
        {/* Trang cũ — chỉ hiện khi đang chờ trang mới */}
        {previous && (
          <div
            className={
              "page-transition__layer page-transition__layer--previous" +
              (phase === "crossfade" ? " page-transition__layer--hidden" : "")
            }
          >
            {previous.node}
          </div>
        )}

        {/* Trang hiện tại — ẩn khi đang chờ, hiện khi crossfade */}
        <div
          className={
            "page-transition__layer" +
            (previous && phase === "waiting"
              ? " page-transition__layer--waiting"
              : "")
          }
        >
          {current.node}
        </div>
      </div>
    </PageReadyContext.Provider>
  );
}
