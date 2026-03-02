import { useState, useEffect, useRef } from "react";

// ─── Constants ───
const TABS = { HOME: 0, FACE: 1, PET: 2, FENGSHUI: 3, OUTFIT: 4 };

// ─── Animated Background ───
function MysticBg() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 30% 20%, rgba(120,90,40,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(80,60,120,0.06) 0%, transparent 50%), #08080f",
      }} />
      {Array.from({ length: 15 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          width: `${2 + Math.random() * 3}px`, height: `${2 + Math.random() * 3}px`,
          borderRadius: "50%",
          background: `rgba(${200 + Math.random() * 55},${170 + Math.random() * 60},${80 + Math.random() * 60},${0.15 + Math.random() * 0.25})`,
          left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
          animation: `drift ${10 + Math.random() * 15}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 8}s`,
        }} />
      ))}
    </div>
  );
}

// ─── Spirit Pet Component ───
function SpiritPet({ mood = "happy", level = 12, name = "小玄", element = "水" }) {
  const [bounce, setBounce] = useState(false);
  const petEmoji = { "水": "🐉", "火": "🦊", "木": "🦌", "金": "🦅", "土": "🐢" }[element] || "🐉";

  return (
    <div
      onClick={() => { setBounce(true); setTimeout(() => setBounce(false), 600); }}
      style={{
        cursor: "pointer",
        textAlign: "center",
        animation: bounce ? "petBounce 0.6s ease" : "petFloat 4s ease-in-out infinite",
        position: "relative",
      }}
    >
      <div style={{
        fontSize: "64px",
        filter: "drop-shadow(0 0 20px rgba(100,180,255,0.3))",
        transition: "transform 0.3s",
      }}>
        {petEmoji}
      </div>
      <div style={{
        position: "absolute", bottom: "-8px", left: "50%", transform: "translateX(-50%)",
        width: "50px", height: "6px", borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(100,180,255,0.2), transparent)",
      }} />
    </div>
  );
}

// ─── Score Bar ───
function ScoreBar({ label, score, color = "#e8c547", delay = 0 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      let c = 0;
      const iv = setInterval(() => { c += 3; if (c >= score) { setVal(score); clearInterval(iv); } else setVal(c); }, 20);
    }, delay);
    return () => clearTimeout(t);
  }, [score, delay]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
      <span style={{ fontSize: "12px", color: "#8b7d5e", width: "36px", textAlign: "right", fontFamily: "var(--font-serif)" }}>{label}</span>
      <div style={{ flex: 1, height: "5px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{
          width: `${val}%`, height: "100%", borderRadius: "3px",
          background: `linear-gradient(90deg, ${color}44, ${color})`,
          boxShadow: `0 0 8px ${color}40`,
          transition: "width 0.2s",
        }} />
      </div>
      <span style={{ fontSize: "12px", color, width: "24px", fontFamily: "var(--font-serif)" }}>{val}</span>
    </div>
  );
}

// ─── Qimen Grid ───
function QimenGrid() {
  const palaces = [
    { pos: "巽四", gate: "傷門", star: "天蓬", dir: "東南", active: false },
    { pos: "離九", gate: "景門", star: "天任", dir: "正南", active: true },
    { pos: "坤二", gate: "死門", star: "天芮", dir: "西南", active: false },
    { pos: "震三", gate: "杜門", star: "天衝", dir: "正東", active: false },
    { pos: "中五", gate: "—", star: "天禽", dir: "中宮", active: false },
    { pos: "兌七", gate: "驚門", star: "天柱", dir: "正西", active: false },
    { pos: "艮八", gate: "生門", star: "天心", dir: "東北", active: true },
    { pos: "坎一", gate: "休門", star: "天輔", dir: "正北", active: false },
    { pos: "乾六", gate: "開門", star: "天英", dir: "西北", active: true },
  ];
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px",
      background: "rgba(232,197,71,0.03)", borderRadius: "14px", padding: "8px",
      border: "1px solid rgba(232,197,71,0.1)",
    }}>
      {palaces.map((p, i) => (
        <div key={i} style={{
          padding: "8px 4px", borderRadius: "8px", textAlign: "center",
          background: p.active ? "rgba(232,197,71,0.08)" : "rgba(255,255,255,0.01)",
          border: p.active ? "1px solid rgba(232,197,71,0.25)" : "1px solid rgba(255,255,255,0.03)",
          position: "relative",
        }}>
          {p.active && <div style={{
            position: "absolute", top: "4px", right: "4px",
            width: "5px", height: "5px", borderRadius: "50%",
            background: "#e8c547", boxShadow: "0 0 6px #e8c547",
            animation: "pulse 2s ease-in-out infinite",
          }} />}
          <div style={{ fontSize: "10px", color: p.active ? "#e8c547" : "#5a5040", fontWeight: "600" }}>{p.dir}</div>
          <div style={{ fontSize: "13px", color: p.active ? "#e8c547" : "#8b7d5e", fontWeight: "700", margin: "2px 0" }}>{p.gate}</div>
          <div style={{ fontSize: "9px", color: "#5a5040" }}>{p.star}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Compass Component ───
function Compass({ direction = 165, luckyDir = "東南" }) {
  return (
    <div style={{ position: "relative", width: "180px", height: "180px", margin: "0 auto" }}>
      {/* Outer ring */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        border: "2px solid rgba(232,197,71,0.2)",
        background: "radial-gradient(circle, rgba(232,197,71,0.04) 0%, transparent 70%)",
      }} />
      {/* Cardinal directions */}
      {[
        { label: "北", angle: 0 }, { label: "東", angle: 90 },
        { label: "南", angle: 180 }, { label: "西", angle: 270 },
        { label: "東北", angle: 45 }, { label: "東南", angle: 135 },
        { label: "西南", angle: 225 }, { label: "西北", angle: 315 },
      ].map((d, i) => {
        const rad = ((d.angle - 90) * Math.PI) / 180;
        const r = 76;
        const isLucky = d.label === luckyDir;
        return (
          <div key={i} style={{
            position: "absolute",
            left: `${90 + r * Math.cos(rad)}px`,
            top: `${90 + r * Math.sin(rad)}px`,
            transform: "translate(-50%, -50%)",
            fontSize: isLucky ? "13px" : "10px",
            color: isLucky ? "#e8c547" : "#6b6350",
            fontWeight: isLucky ? "700" : "400",
            fontFamily: "var(--font-serif)",
            textShadow: isLucky ? "0 0 10px rgba(232,197,71,0.5)" : "none",
          }}>{d.label}</div>
        );
      })}
      {/* Needle */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        width: "3px", height: "55px",
        background: "linear-gradient(to top, #e8c547, #c44040)",
        transformOrigin: "bottom center",
        transform: `translate(-50%, -100%) rotate(${direction}deg)`,
        borderRadius: "2px",
        boxShadow: "0 0 10px rgba(232,197,71,0.3)",
        transition: "transform 1s ease",
      }} />
      {/* Center dot */}
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: "10px", height: "10px", borderRadius: "50%",
        background: "#e8c547", boxShadow: "0 0 10px rgba(232,197,71,0.5)",
      }} />
    </div>
  );
}

// ─── Outfit Card ───
function OutfitCard({ item, index }) {
  return (
    <div style={{
      display: "flex", gap: "12px", padding: "14px",
      background: "rgba(232,197,71,0.03)",
      border: "1px solid rgba(232,197,71,0.08)",
      borderRadius: "14px", marginBottom: "8px",
      animation: "slideUp 0.5s ease forwards",
      animationDelay: `${index * 0.12}s`, opacity: 0,
    }}>
      <div style={{
        width: "50px", height: "50px", borderRadius: "12px",
        background: `linear-gradient(135deg, ${item.color}20, ${item.color}08)`,
        border: `1px solid ${item.color}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "24px", flexShrink: 0,
      }}>{item.icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "14px", color: "#c4b07a", fontWeight: "600" }}>{item.name}</div>
        <div style={{ fontSize: "11px", color: "#6b6350", marginTop: "3px" }}>{item.reason}</div>
      </div>
    </div>
  );
}

// ─── Chat Bubble from Pet ───
function PetMessage({ message, time, petName = "小玄" }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(100,180,255,0.08), rgba(100,180,255,0.03))",
      border: "1px solid rgba(100,180,255,0.12)",
      borderRadius: "16px", borderTopLeft: "4px",
      padding: "12px 14px", marginBottom: "10px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
        <span style={{ fontSize: "14px" }}>🐉</span>
        <span style={{ fontSize: "11px", color: "#64b4ff", fontWeight: "600" }}>{petName}</span>
        <span style={{ fontSize: "10px", color: "#4a4a5a", marginLeft: "auto" }}>{time}</span>
      </div>
      <p style={{ fontSize: "13px", color: "#a0b8d0", lineHeight: 1.7, margin: 0 }}>{message}</p>
    </div>
  );
}

// ═══════════════════════════════════════
// ─── MAIN APP ───
// ═══════════════════════════════════════
export default function LingXiApp() {
  const [tab, setTab] = useState(TABS.HOME);
  const [showOnboard, setShowOnboard] = useState(true);
  const [petTapped, setPetTapped] = useState(false);
  const [fengShuiLoading, setFengShuiLoading] = useState(false);
  const [fengShuiResult, setFengShuiResult] = useState(false);
  const [cameraMode, setCameraMode] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [faceResult, setFaceResult] = useState(false);

  const startFaceAnalysis = () => {
    setCameraMode(false);
    setAnalyzing(true);
    setAnalyzeProgress(0);
    setFaceResult(false);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 6 + 3;
      if (p >= 100) { p = 100; clearInterval(iv); setTimeout(() => { setAnalyzing(false); setFaceResult(true); }, 600); }
      setAnalyzeProgress(Math.min(100, Math.floor(p)));
    }, 180);
  };

  const startFengShui = () => {
    setFengShuiLoading(true);
    setFengShuiResult(false);
    setTimeout(() => { setFengShuiLoading(false); setFengShuiResult(true); }, 2500);
  };

  // ─── Onboarding Screen ───
  if (showOnboard) {
    return (
      <>
        <style>{globalStyles}</style>
        <div style={{ ...phoneFrame }}>
          <MysticBg />
          <div style={{
            position: "relative", zIndex: 1, height: "100%",
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "40px 30px", textAlign: "center",
          }}>
            <div style={{ fontSize: "72px", marginBottom: "16px", animation: "petFloat 3s ease-in-out infinite" }}>🐉</div>
            <h1 style={{
              fontFamily: "var(--font-brush)", fontSize: "48px", color: "#e8c547",
              margin: "0 0 4px", textShadow: "0 0 40px rgba(232,197,71,0.3)", letterSpacing: "8px",
            }}>靈犀</h1>
            <p style={{ fontSize: "12px", color: "rgba(232,197,71,0.5)", letterSpacing: "6px", margin: "0 0 32px" }}>
              LING XI
            </p>
            <p style={{
              fontSize: "14px", color: "#8b7d5e", lineHeight: 1.8, marginBottom: "40px",
              fontFamily: "var(--font-serif)",
            }}>
              AI 面相 · 八字命理 · 奇門遁甲<br />
              即時風水 · 靈寵陪伴 · 每日穿搭<br />
              <span style={{ color: "#c4b07a" }}>— 你的隨身玄學生活顧問 —</span>
            </p>

            {/* Birthdate input mockup */}
            <div style={{
              width: "100%", padding: "18px",
              background: "rgba(232,197,71,0.04)",
              border: "1px solid rgba(232,197,71,0.12)",
              borderRadius: "14px", marginBottom: "14px",
            }}>
              <div style={{ fontSize: "11px", color: "#6b6350", marginBottom: "10px", letterSpacing: "2px" }}>請輸入出生資訊以召喚專屬靈寵</div>
              <div style={{ display: "flex", gap: "8px" }}>
                {["1990", "03", "15"].map((v, i) => (
                  <div key={i} style={{
                    flex: 1, padding: "10px", borderRadius: "8px",
                    background: "rgba(232,197,71,0.06)",
                    border: "1px solid rgba(232,197,71,0.15)",
                    color: "#e8c547", fontSize: "16px", textAlign: "center",
                    fontFamily: "var(--font-serif)",
                  }}>{v}</div>
                ))}
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <div style={{
                  flex: 1, padding: "10px", borderRadius: "8px",
                  background: "rgba(232,197,71,0.06)", border: "1px solid rgba(232,197,71,0.15)",
                  color: "#e8c547", fontSize: "14px", textAlign: "center",
                }}>午時 (11-13)</div>
                <div style={{
                  flex: 1, padding: "10px", borderRadius: "8px",
                  background: "rgba(232,197,71,0.06)", border: "1px solid rgba(232,197,71,0.15)",
                  color: "#8b7d5e", fontSize: "14px", textAlign: "center",
                }}>♂ 男</div>
              </div>
            </div>

            <button onClick={() => setShowOnboard(false)} style={{
              width: "100%", padding: "16px",
              background: "linear-gradient(135deg, rgba(232,197,71,0.2), rgba(232,197,71,0.08))",
              border: "1px solid rgba(232,197,71,0.35)",
              borderRadius: "14px", color: "#e8c547", fontSize: "16px",
              fontFamily: "var(--font-serif)", fontWeight: "600",
              letterSpacing: "4px", cursor: "pointer",
              boxShadow: "0 0 30px rgba(232,197,71,0.1)",
            }}>
              召喚靈寵 ✦
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{globalStyles}</style>
      <div style={phoneFrame}>
        <MysticBg />

        {/* ─── Status Bar ─── */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "50px",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
          background: "linear-gradient(180deg, rgba(8,8,15,0.95), transparent)",
        }}>
          <div style={{ width: "120px", height: "28px", borderRadius: "14px", background: "#000", marginTop: "4px" }} />
        </div>

        {/* ─── Content Area ─── */}
        <div className="scroll-area" style={{
          position: "absolute", top: 0, bottom: 0, left: 0, right: 0,
          overflowY: "auto", overflowX: "hidden", zIndex: 1,
        }}>

          {/* ════════ HOME TAB ════════ */}
          {tab === TABS.HOME && (
            <div style={{ padding: "62px 20px 100px", position: "relative" }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                <div>
                  <h2 style={{ fontFamily: "var(--font-brush)", fontSize: "28px", color: "#e8c547", margin: 0 }}>靈犀</h2>
                  <p style={{ fontSize: "11px", color: "#5a5040", margin: "2px 0 0", letterSpacing: "1px" }}>乙巳年正月廿三 · 辰時</p>
                </div>
                <div style={{
                  padding: "6px 12px", borderRadius: "20px",
                  background: "rgba(232,197,71,0.08)", border: "1px solid rgba(232,197,71,0.15)",
                  fontSize: "11px", color: "#e8c547",
                }}>✦ 靈犀會員</div>
              </div>

              {/* Pet Card */}
              <div style={{
                background: "linear-gradient(135deg, rgba(100,180,255,0.06), rgba(100,140,200,0.02))",
                border: "1px solid rgba(100,180,255,0.12)",
                borderRadius: "20px", padding: "20px", marginBottom: "16px",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", top: "-20px", right: "-20px", width: "100px", height: "100px",
                  background: "radial-gradient(circle, rgba(100,180,255,0.08), transparent)", borderRadius: "50%",
                }} />
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <SpiritPet />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "18px", color: "#e8c547", fontWeight: "700", fontFamily: "var(--font-serif)" }}>小玄</span>
                      <span style={{
                        fontSize: "10px", padding: "2px 8px", borderRadius: "10px",
                        background: "rgba(100,180,255,0.15)", color: "#64b4ff",
                      }}>Lv.12 水龍</span>
                    </div>
                    <p style={{ fontSize: "12px", color: "#7a9ab8", margin: "6px 0 8px", lineHeight: 1.5 }}>
                      「主人早安～今天景門在南方，適合社交，記得穿亮色系！」
                    </p>
                    {/* Pet stats */}
                    <div style={{ display: "flex", gap: "12px" }}>
                      {[{ label: "靈力", val: 78, color: "#64b4ff" }, { label: "親密", val: 92, color: "#ff8ba0" }, { label: "悟性", val: 65, color: "#a78bfa" }].map((s, i) => (
                        <div key={i} style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                            <span style={{ fontSize: "9px", color: "#5a6a7a" }}>{s.label}</span>
                            <span style={{ fontSize: "9px", color: s.color }}>{s.val}</span>
                          </div>
                          <div style={{ height: "3px", background: "rgba(255,255,255,0.05)", borderRadius: "2px" }}>
                            <div style={{ width: `${s.val}%`, height: "100%", borderRadius: "2px", background: s.color, boxShadow: `0 0 4px ${s.color}40` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Today's Fortune Summary */}
              <div style={{
                background: "rgba(232,197,71,0.04)", border: "1px solid rgba(232,197,71,0.1)",
                borderRadius: "16px", padding: "16px", marginBottom: "16px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "12px", color: "#8b7d5e", letterSpacing: "2px", fontFamily: "var(--font-serif)" }}>今日綜合運勢</span>
                  <span style={{ fontSize: "22px", color: "#e8c547", fontFamily: "var(--font-brush)" }}>大吉</span>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  {[
                    { label: "財運", score: 85, icon: "💰" },
                    { label: "桃花", score: 72, icon: "🌸" },
                    { label: "事業", score: 91, icon: "📈" },
                    { label: "健康", score: 68, icon: "💚" },
                  ].map((f, i) => (
                    <div key={i} style={{
                      flex: 1, textAlign: "center", padding: "10px 4px",
                      background: "rgba(232,197,71,0.04)", borderRadius: "10px",
                    }}>
                      <div style={{ fontSize: "20px", marginBottom: "4px" }}>{f.icon}</div>
                      <div style={{ fontSize: "10px", color: "#6b6350" }}>{f.label}</div>
                      <div style={{ fontSize: "16px", color: "#e8c547", fontWeight: "700", fontFamily: "var(--font-serif)" }}>{f.score}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Qimen Dunjia Mini */}
              <div style={{
                background: "rgba(232,197,71,0.03)", border: "1px solid rgba(232,197,71,0.08)",
                borderRadius: "16px", padding: "14px", marginBottom: "16px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontSize: "12px", color: "#8b7d5e", letterSpacing: "2px", fontFamily: "var(--font-serif)" }}>🔮 辰時奇門盤</span>
                  <span style={{ fontSize: "10px", color: "#5a5040" }}>07:00-09:00</span>
                </div>
                <QimenGrid />
                <div style={{
                  marginTop: "10px", padding: "10px",
                  background: "rgba(232,197,71,0.05)", borderRadius: "8px",
                  fontSize: "12px", color: "#a0956a", lineHeight: 1.6,
                }}>
                  ✦ 開門落西北，適合出行談判<br />
                  ✦ 生門落東北，利於理財投資<br />
                  ✦ 景門落正南，社交運旺盛
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                {[
                  { icon: "📷", label: "面相分析", sub: "AI 即時解讀", color: "#e8c547", tab: TABS.FACE },
                  { icon: "🧭", label: "即時風水", sub: "GPS 方位導航", color: "#64b4ff", tab: TABS.FENGSHUI },
                  { icon: "👔", label: "今日穿搭", sub: "五行色彩搭配", color: "#a78bfa", tab: TABS.OUTFIT },
                  { icon: "🐉", label: "靈寵互動", sub: "餵養 & 進化", color: "#ff8ba0", tab: TABS.PET },
                ].map((a, i) => (
                  <button key={i} onClick={() => setTab(a.tab)} style={{
                    padding: "16px 12px", borderRadius: "14px",
                    background: `linear-gradient(135deg, ${a.color}0a, ${a.color}04)`,
                    border: `1px solid ${a.color}18`,
                    cursor: "pointer", textAlign: "left",
                    transition: "all 0.2s",
                  }}>
                    <div style={{ fontSize: "24px", marginBottom: "6px" }}>{a.icon}</div>
                    <div style={{ fontSize: "14px", color: a.color, fontWeight: "600", fontFamily: "var(--font-serif)" }}>{a.label}</div>
                    <div style={{ fontSize: "10px", color: "#5a5040", marginTop: "2px" }}>{a.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ════════ FACE TAB ════════ */}
          {tab === TABS.FACE && !cameraMode && !analyzing && !faceResult && (
            <div style={{ padding: "62px 20px 100px" }}>
              <h3 style={{ fontFamily: "var(--font-brush)", fontSize: "26px", color: "#e8c547", margin: "0 0 16px" }}>面相分析</h3>

              <button onClick={() => setCameraMode(true)} style={{
                width: "100%", height: "200px", borderRadius: "20px",
                background: "linear-gradient(135deg, rgba(232,197,71,0.06), rgba(232,197,71,0.02))",
                border: "2px dashed rgba(232,197,71,0.2)",
                cursor: "pointer", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: "12px",
                marginBottom: "20px",
              }}>
                <span style={{ fontSize: "48px" }}>📷</span>
                <span style={{ fontSize: "16px", color: "#e8c547", fontFamily: "var(--font-serif)", letterSpacing: "2px" }}>點擊拍照分析</span>
                <span style={{ fontSize: "11px", color: "#5a5040" }}>或從相簿選取照片</span>
              </button>

              <div style={{ fontSize: "12px", color: "#6b6350", marginBottom: "12px", letterSpacing: "2px" }}>最近分析</div>
              {[
                { date: "02/19", fortune: "大吉", item: "翡翠耳環", score: 88 },
                { date: "02/18", fortune: "中吉", item: "紅瑪瑙手鍊", score: 75 },
                { date: "02/17", fortune: "小吉", item: "金色胸針", score: 62 },
              ].map((r, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", padding: "12px",
                  background: "rgba(232,197,71,0.03)", borderRadius: "12px",
                  marginBottom: "6px", gap: "12px",
                }}>
                  <span style={{ fontSize: "12px", color: "#5a5040", width: "40px" }}>{r.date}</span>
                  <span style={{ fontSize: "14px", color: r.fortune === "大吉" ? "#e8c547" : "#8b7d5e", fontWeight: "600", width: "36px" }}>{r.fortune}</span>
                  <div style={{ flex: 1, height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px" }}>
                    <div style={{ width: `${r.score}%`, height: "100%", borderRadius: "2px", background: "linear-gradient(90deg, #8b6914, #e8c547)" }} />
                  </div>
                  <span style={{ fontSize: "11px", color: "#6b6350" }}>🔮 {r.item}</span>
                </div>
              ))}
            </div>
          )}

          {/* Camera Mode */}
          {tab === TABS.FACE && cameraMode && (
            <div style={{ height: "100%", position: "relative", background: "#0a0a12" }}>
              <div style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%, -55%)",
                width: "200px", height: "260px",
                border: "2px dashed rgba(232,197,71,0.3)",
                borderRadius: "50%", animation: "pulse 3s ease-in-out infinite",
              }}>
                <div style={{ position: "absolute", inset: "20%", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(180,160,130,0.08), transparent)" }} />
              </div>
              <div style={{ position: "absolute", bottom: "170px", left: 0, right: 0, textAlign: "center", fontSize: "14px", color: "#8b7d5e", letterSpacing: "2px" }}>
                請將面部對準框內
              </div>
              <div style={{ position: "absolute", bottom: "60px", left: 0, right: 0, display: "flex", justifyContent: "center" }}>
                <button onClick={startFaceAnalysis} style={{
                  width: "68px", height: "68px", borderRadius: "50%",
                  border: "3px solid #e8c547", background: "transparent", cursor: "pointer", position: "relative",
                }}>
                  <div style={{ position: "absolute", inset: "6px", borderRadius: "50%", background: "linear-gradient(135deg, #e8c547, #c4a030)" }} />
                </button>
              </div>
              <button onClick={() => setCameraMode(false)} style={{
                position: "absolute", top: "60px", left: "20px",
                background: "rgba(0,0,0,0.4)", border: "none", color: "#e8c547",
                fontSize: "20px", cursor: "pointer", width: "36px", height: "36px",
                borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              }}>←</button>
            </div>
          )}

          {/* Analyzing */}
          {tab === TABS.FACE && analyzing && (
            <div style={{
              height: "100%", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", padding: "30px",
            }}>
              <div style={{
                width: "200px", height: "240px", borderRadius: "50%",
                border: "1px solid rgba(232,197,71,0.15)",
                position: "relative", marginBottom: "30px",
                background: "radial-gradient(ellipse, rgba(180,160,130,0.06), transparent)",
              }}>
                {/* Scanning line */}
                <div style={{
                  position: "absolute", left: 0, right: 0, height: "2px",
                  background: "linear-gradient(90deg, transparent, #e8c547, transparent)",
                  boxShadow: "0 0 20px #e8c547", animation: "scanDown 2s ease-in-out infinite",
                }} />
                {/* Feature points */}
                {analyzeProgress > 40 && [
                  { x: 50, y: 28 }, { x: 36, y: 45 }, { x: 64, y: 45 },
                  { x: 50, y: 55 }, { x: 50, y: 65 }, { x: 42, y: 75 }, { x: 58, y: 75 },
                ].map((p, i) => (
                  <div key={i} style={{
                    position: "absolute", left: `${p.x}%`, top: `${p.y}%`,
                    width: "6px", height: "6px", borderRadius: "50%",
                    background: "#e8c547", boxShadow: "0 0 8px #e8c547",
                    animation: "fadeIn 0.4s ease forwards",
                    animationDelay: `${i * 0.1}s`, opacity: 0,
                    transform: "translate(-50%, -50%)",
                  }} />
                ))}
              </div>
              <div style={{ fontSize: "28px", color: "#e8c547", fontWeight: "700", marginBottom: "8px" }}>
                {analyzeProgress}%
              </div>
              <p style={{ fontSize: "14px", color: "#8b7d5e", letterSpacing: "3px", animation: "pulse 2s infinite" }}>
                {analyzeProgress < 30 ? "面部掃描中..." : analyzeProgress < 60 ? "五官特徵擷取..." : analyzeProgress < 85 ? "面相推算中..." : "生成結果..."}
              </p>
            </div>
          )}

          {/* Face Result */}
          {tab === TABS.FACE && faceResult && (
            <div style={{ padding: "62px 20px 100px" }}>
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <p style={{ fontSize: "11px", color: "#5a5040", letterSpacing: "3px", margin: "0 0 6px" }}>今日面相運勢</p>
                <h2 style={{ fontFamily: "var(--font-brush)", fontSize: "46px", color: "#e8c547", margin: 0, textShadow: "0 0 30px rgba(232,197,71,0.4)" }}>大 吉</h2>
                <div style={{ display: "flex", gap: "3px", justifyContent: "center", marginTop: "6px" }}>
                  {[1,2,3,4,5].map(i => <span key={i} style={{ fontSize: "14px", filter: i <= 4 ? "none" : "grayscale(1) opacity(0.3)" }}>⭐</span>)}
                </div>
              </div>

              <div style={{ background: "rgba(232,197,71,0.04)", border: "1px solid rgba(232,197,71,0.1)", borderRadius: "16px", padding: "16px", marginBottom: "14px" }}>
                <div style={{ fontSize: "11px", color: "#6b6350", marginBottom: "12px", letterSpacing: "2px" }}>五官運勢分析</div>
                <ScoreBar label="天庭" score={88} delay={200} />
                <ScoreBar label="眉運" score={72} delay={400} />
                <ScoreBar label="眼運" score={91} delay={600} />
                <ScoreBar label="鼻運" score={65} delay={800} color="#c49a47" />
                <ScoreBar label="口運" score={80} delay={1000} />
              </div>

              <div style={{ background: "rgba(232,197,71,0.04)", border: "1px solid rgba(232,197,71,0.1)", borderRadius: "16px", padding: "16px", marginBottom: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                  <span>🤖</span><span style={{ fontSize: "11px", color: "#e8c547", letterSpacing: "2px" }}>AI 大師解讀</span>
                </div>
                <p style={{ fontSize: "13px", color: "#a0956a", lineHeight: 1.8, margin: 0 }}>
                  觀君面相，天庭飽滿光潤，主近期智慧通達、貴人運旺。雙眉清秀有勢，事業將有突破。眼神明亮有神，桃花運正佳。鼻準略顯氣色不足，財務宜守不宜攻。整體運勢極佳，適合談判、社交等重要場合。
                </p>
              </div>

              {/* Lucky item */}
              <div style={{ background: "linear-gradient(135deg, rgba(232,197,71,0.08), rgba(232,197,71,0.02))", border: "1px solid rgba(232,197,71,0.2)", borderRadius: "16px", padding: "16px" }}>
                <div style={{ fontSize: "11px", color: "#e8c547", letterSpacing: "2px", marginBottom: "12px" }}>✨ 今日推薦幸運物</div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "rgba(232,197,71,0.06)", borderRadius: "12px" }}>
                  <div style={{ width: "50px", height: "50px", borderRadius: "12px", background: "rgba(232,197,71,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px" }}>🧿</div>
                  <div>
                    <div style={{ fontSize: "15px", color: "#e8c547", fontWeight: "600" }}>青金石吊飾</div>
                    <div style={{ fontSize: "11px", color: "#6b6350", marginTop: "2px" }}>五行屬水 · 補足鼻運 · 增強直覺力</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
                  {[{ l: "幸運色", v: "🔵 靛藍" }, { l: "方位", v: "🧭 正北" }, { l: "數字", v: "🔢 3、7" }].map((x, i) => (
                    <div key={i} style={{ flex: 1, background: "rgba(232,197,71,0.04)", borderRadius: "8px", padding: "8px 4px", textAlign: "center" }}>
                      <div style={{ fontSize: "9px", color: "#5a5040", marginBottom: "3px" }}>{x.l}</div>
                      <div style={{ fontSize: "11px", color: "#c4b07a" }}>{x.v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => { setFaceResult(false); setCameraMode(false); setAnalyzing(false); }} style={{
                width: "100%", marginTop: "14px", padding: "14px",
                background: "transparent", border: "1px solid rgba(232,197,71,0.15)",
                borderRadius: "12px", color: "#8b7d5e", fontSize: "14px",
                fontFamily: "var(--font-serif)", cursor: "pointer",
              }}>← 重新分析</button>
            </div>
          )}

          {/* ════════ PET TAB ════════ */}
          {tab === TABS.PET && (
            <div style={{ padding: "62px 20px 100px" }}>
              <h3 style={{ fontFamily: "var(--font-brush)", fontSize: "26px", color: "#64b4ff", margin: "0 0 16px" }}>靈寵小玄</h3>

              {/* Pet display card */}
              <div style={{
                background: "linear-gradient(180deg, rgba(100,180,255,0.06), rgba(100,140,200,0.02))",
                border: "1px solid rgba(100,180,255,0.12)", borderRadius: "20px",
                padding: "30px 20px", textAlign: "center", marginBottom: "16px",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", inset: 0,
                  background: "radial-gradient(circle at 50% 40%, rgba(100,180,255,0.06), transparent 60%)",
                }} />
                <SpiritPet />
                <h4 style={{ fontFamily: "var(--font-brush)", fontSize: "24px", color: "#e8c547", margin: "12px 0 4px" }}>小玄 · 水龍</h4>
                <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "10px", padding: "3px 10px", borderRadius: "10px", background: "rgba(100,180,255,0.12)", color: "#64b4ff" }}>Lv.12</span>
                  <span style={{ fontSize: "10px", padding: "3px 10px", borderRadius: "10px", background: "rgba(232,197,71,0.12)", color: "#e8c547" }}>水屬性</span>
                  <span style={{ fontSize: "10px", padding: "3px 10px", borderRadius: "10px", background: "rgba(160,100,255,0.12)", color: "#a78bfa" }}>進化 2/5</span>
                </div>
                {/* EXP bar */}
                <div style={{ width: "70%", margin: "0 auto" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "9px", color: "#5a6a7a" }}>經驗值</span>
                    <span style={{ fontSize: "9px", color: "#64b4ff" }}>2,450 / 3,000</span>
                  </div>
                  <div style={{ height: "6px", background: "rgba(100,180,255,0.1)", borderRadius: "3px" }}>
                    <div style={{ width: "82%", height: "100%", borderRadius: "3px", background: "linear-gradient(90deg, #2060a0, #64b4ff)", boxShadow: "0 0 8px rgba(100,180,255,0.3)" }} />
                  </div>
                </div>
              </div>

              {/* Interaction buttons */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                {[
                  { icon: "🍖", label: "餵食", sub: "+50 EXP" },
                  { icon: "🎮", label: "玩耍", sub: "+30 親密" },
                  { icon: "📿", label: "修煉", sub: "+20 靈力" },
                ].map((a, i) => (
                  <button key={i} style={{
                    flex: 1, padding: "14px 8px", borderRadius: "14px",
                    background: "rgba(100,180,255,0.04)", border: "1px solid rgba(100,180,255,0.1)",
                    cursor: "pointer", textAlign: "center",
                  }}>
                    <div style={{ fontSize: "24px", marginBottom: "4px" }}>{a.icon}</div>
                    <div style={{ fontSize: "12px", color: "#64b4ff", fontWeight: "600" }}>{a.label}</div>
                    <div style={{ fontSize: "9px", color: "#4a5a6a", marginTop: "2px" }}>{a.sub}</div>
                  </button>
                ))}
              </div>

              {/* Pet messages */}
              <div style={{ fontSize: "12px", color: "#5a6a7a", marginBottom: "10px", letterSpacing: "2px" }}>💬 小玄的訊息</div>
              <PetMessage time="08:00" message="主人早安！今天辰時開門在西北方，出門往公司西北邊走會順利喔～記得穿深藍色補水氣 💧" />
              <PetMessage time="12:30" message="午時到了～景門轉到正南，下午適合社交和開會。我幫你算了一下，坐在會議室面朝南方的位子最旺你！🌟" />
              <PetMessage time="18:00" message="主人辛苦了！今天的靈力充滿了呢～晚上酉時生門在正東，散步的話往東邊走對健康有益。早點休息喔 🌙" />
            </div>
          )}

          {/* ════════ FENG SHUI TAB ════════ */}
          {tab === TABS.FENGSHUI && (
            <div style={{ padding: "62px 20px 100px" }}>
              <h3 style={{ fontFamily: "var(--font-brush)", fontSize: "26px", color: "#64b4ff", margin: "0 0 16px" }}>即時風水</h3>

              {/* GPS status */}
              <div style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "10px 14px", borderRadius: "12px",
                background: "rgba(100,200,120,0.06)", border: "1px solid rgba(100,200,120,0.15)",
                marginBottom: "16px",
              }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#64c880", boxShadow: "0 0 6px #64c880", animation: "pulse 2s infinite" }} />
                <span style={{ fontSize: "12px", color: "#64c880" }}>GPS 定位中 · 台北市信義區</span>
                <span style={{ fontSize: "10px", color: "#4a5a4a", marginLeft: "auto" }}>25.033°N 121.564°E</span>
              </div>

              {/* Compass */}
              <div style={{
                background: "rgba(232,197,71,0.03)", border: "1px solid rgba(232,197,71,0.1)",
                borderRadius: "20px", padding: "20px", marginBottom: "16px", textAlign: "center",
              }}>
                <div style={{ fontSize: "11px", color: "#6b6350", letterSpacing: "2px", marginBottom: "14px" }}>當前方位 · 面朝南偏東</div>
                <Compass direction={165} luckyDir="東南" />
                <div style={{
                  marginTop: "14px", padding: "10px",
                  background: "rgba(232,197,71,0.06)", borderRadius: "10px",
                  fontSize: "13px", color: "#c4b07a", lineHeight: 1.6,
                }}>
                  ✦ 今日吉方：<span style={{ color: "#e8c547", fontWeight: "700" }}>東南、西北</span><br />
                  ✦ 今日凶方：<span style={{ color: "#c44040" }}>正西</span>（五黃煞）
                </div>
              </div>

              {/* Feng Shui analysis button */}
              {!fengShuiResult && (
                <button onClick={startFengShui} disabled={fengShuiLoading} style={{
                  width: "100%", padding: "16px", borderRadius: "14px",
                  background: fengShuiLoading ? "rgba(100,180,255,0.05)" : "linear-gradient(135deg, rgba(100,180,255,0.12), rgba(100,180,255,0.04))",
                  border: "1px solid rgba(100,180,255,0.2)",
                  color: "#64b4ff", fontSize: "15px", fontFamily: "var(--font-serif)",
                  cursor: fengShuiLoading ? "wait" : "pointer", letterSpacing: "2px",
                }}>
                  {fengShuiLoading ? "🔄 分析當前位置風水中..." : "🧭 分析當前位置風水"}
                </button>
              )}

              {/* Feng Shui Result */}
              {fengShuiResult && (
                <div style={{ animation: "slideUp 0.6s ease" }}>
                  <div style={{
                    background: "rgba(100,180,255,0.04)", border: "1px solid rgba(100,180,255,0.1)",
                    borderRadius: "16px", padding: "16px", marginBottom: "12px",
                  }}>
                    <div style={{ fontSize: "11px", color: "#64b4ff", letterSpacing: "2px", marginBottom: "10px" }}>📍 當前位置風水分析</div>
                    <p style={{ fontSize: "13px", color: "#8ba0b8", lineHeight: 1.8, margin: 0 }}>
                      此處位於信義區商業核心，坐北朝南格局。結合您的八字（丙火日主），當前位置水氣充沛，有利於補充命格中不足的水元素。
                    </p>
                  </div>
                  <div style={{
                    background: "rgba(232,197,71,0.04)", border: "1px solid rgba(232,197,71,0.1)",
                    borderRadius: "16px", padding: "16px",
                  }}>
                    <div style={{ fontSize: "11px", color: "#e8c547", letterSpacing: "2px", marginBottom: "10px" }}>💡 即時建議</div>
                    {[
                      { icon: "🪑", text: "開會建議坐在面朝東南方的位子" },
                      { icon: "☕", text: "附近東南方 200m 有咖啡廳，氣場較旺" },
                      { icon: "⚠️", text: "避免長時間待在正西方區域" },
                    ].map((tip, i) => (
                      <div key={i} style={{
                        display: "flex", gap: "10px", alignItems: "center",
                        padding: "8px 0",
                        borderBottom: i < 2 ? "1px solid rgba(232,197,71,0.06)" : "none",
                      }}>
                        <span style={{ fontSize: "18px" }}>{tip.icon}</span>
                        <span style={{ fontSize: "13px", color: "#a0956a" }}>{tip.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════ OUTFIT TAB ════════ */}
          {tab === TABS.OUTFIT && (
            <div style={{ padding: "62px 20px 100px" }}>
              <h3 style={{ fontFamily: "var(--font-brush)", fontSize: "26px", color: "#a78bfa", margin: "0 0 4px" }}>今日穿搭</h3>
              <p style={{ fontSize: "11px", color: "#5a5040", margin: "0 0 16px" }}>根據八字五行 × 奇門遁甲 × 面相氣色 × 天氣</p>

              {/* Five elements balance */}
              <div style={{
                background: "rgba(160,100,255,0.04)", border: "1px solid rgba(160,100,255,0.1)",
                borderRadius: "16px", padding: "16px", marginBottom: "14px",
              }}>
                <div style={{ fontSize: "11px", color: "#7a6a9a", letterSpacing: "2px", marginBottom: "10px" }}>今日五行能量</div>
                <div style={{ display: "flex", gap: "6px" }}>
                  {[
                    { label: "金", val: 60, color: "#e8e0c0", bg: "#e8e0c020" },
                    { label: "木", val: 75, color: "#80c880", bg: "#80c88020" },
                    { label: "水", val: 35, color: "#64b4ff", bg: "#64b4ff20", low: true },
                    { label: "火", val: 90, color: "#ff6b6b", bg: "#ff6b6b20", high: true },
                    { label: "土", val: 55, color: "#c8a060", bg: "#c8a06020" },
                  ].map((e, i) => (
                    <div key={i} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{
                        height: "60px", borderRadius: "8px", background: e.bg,
                        border: (e.low || e.high) ? `1px solid ${e.color}40` : "1px solid transparent",
                        display: "flex", flexDirection: "column", justifyContent: "flex-end",
                        padding: "4px", position: "relative", overflow: "hidden",
                      }}>
                        <div style={{ height: `${e.val}%`, background: `${e.color}30`, borderRadius: "4px", transition: "height 1s ease" }} />
                        {e.low && <div style={{ position: "absolute", top: "2px", right: "2px", fontSize: "8px" }}>⚠️</div>}
                        {e.high && <div style={{ position: "absolute", top: "2px", right: "2px", fontSize: "8px" }}>🔥</div>}
                      </div>
                      <div style={{ fontSize: "12px", color: e.color, marginTop: "4px", fontWeight: "600" }}>{e.label}</div>
                      <div style={{ fontSize: "9px", color: "#5a5040" }}>{e.val}%</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: "10px", padding: "8px", background: "rgba(100,180,255,0.06)", borderRadius: "8px", fontSize: "11px", color: "#7a9ab8", textAlign: "center" }}>
                  今日火氣偏旺、水氣不足 → 穿搭以<span style={{ color: "#64b4ff", fontWeight: "600" }}>藍黑色系</span>為主，補水洩火
                </div>
              </div>

              {/* Outfit recommendations */}
              <div style={{ fontSize: "12px", color: "#7a6a9a", letterSpacing: "2px", marginBottom: "10px" }}>👔 推薦穿搭</div>
              {[
                { icon: "🧥", name: "深藍色西裝外套", reason: "補水氣，提升事業運。景門在南方加持社交能量", color: "#64b4ff" },
                { icon: "👔", name: "白色襯衫", reason: "金生水，輔助補足水元素，保持清爽氣場", color: "#e8e0c0" },
                { icon: "👞", name: "黑色皮鞋", reason: "黑屬水，從腳底穩固水氣根基", color: "#8090a0" },
                { icon: "⌚", name: "銀色手錶 / 飾品", reason: "金屬性飾品，金生水，持續補充水氣", color: "#c0c8d0" },
              ].map((item, i) => <OutfitCard key={i} item={item} index={i} />)}

              {/* Today's color palette */}
              <div style={{
                background: "rgba(160,100,255,0.04)", border: "1px solid rgba(160,100,255,0.1)",
                borderRadius: "16px", padding: "16px", marginTop: "6px",
              }}>
                <div style={{ fontSize: "11px", color: "#7a6a9a", letterSpacing: "2px", marginBottom: "10px" }}>🎨 今日色彩指南</div>
                <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
                  {[
                    { color: "#1a3a5a", label: "深藍" },
                    { color: "#0a0a14", label: "黑" },
                    { color: "#f0f0f0", label: "白" },
                    { color: "#c0c8d0", label: "銀灰" },
                  ].map((c, i) => (
                    <div key={i} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{
                        height: "36px", borderRadius: "8px", background: c.color,
                        border: "1px solid rgba(255,255,255,0.1)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                      }} />
                      <div style={{ fontSize: "10px", color: "#6b6350", marginTop: "4px" }}>{c.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <div style={{ flex: 1, padding: "6px", borderRadius: "8px", background: "rgba(200,60,60,0.08)", border: "1px solid rgba(200,60,60,0.15)", textAlign: "center" }}>
                    <div style={{ fontSize: "9px", color: "#c44040", marginBottom: "2px" }}>⛔ 避免</div>
                    <div style={{ fontSize: "11px", color: "#a04040" }}>紅色、橙色</div>
                  </div>
                  <div style={{ flex: 1, padding: "6px", borderRadius: "8px", background: "rgba(232,197,71,0.06)", border: "1px solid rgba(232,197,71,0.12)", textAlign: "center" }}>
                    <div style={{ fontSize: "9px", color: "#e8c547", marginBottom: "2px" }}>✦ 靈寵加持</div>
                    <div style={{ fontSize: "11px", color: "#c4b07a" }}>穿藍色小玄更有精神</div>
                  </div>
                </div>
              </div>

              {/* Weather integration */}
              <div style={{
                display: "flex", gap: "10px", marginTop: "12px",
                padding: "12px", borderRadius: "14px",
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
              }}>
                <div style={{ fontSize: "32px" }}>🌤</div>
                <div>
                  <div style={{ fontSize: "13px", color: "#8b7d5e" }}>台北 18°C · 多雲</div>
                  <div style={{ fontSize: "11px", color: "#5a5040", marginTop: "2px" }}>建議攜帶薄外套，下午可能轉陰</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── Bottom Tab Bar ─── */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          display: "flex", justifyContent: "space-around",
          padding: "8px 0 22px",
          background: "linear-gradient(0deg, rgba(8,8,15,0.98) 60%, transparent)",
          zIndex: 40,
        }}>
          {[
            { icon: "🏠", label: "首頁", t: TABS.HOME },
            { icon: "📷", label: "面相", t: TABS.FACE },
            { icon: "🐉", label: "靈寵", t: TABS.PET },
            { icon: "🧭", label: "風水", t: TABS.FENGSHUI },
            { icon: "👔", label: "穿搭", t: TABS.OUTFIT },
          ].map((item, i) => (
            <button key={i} onClick={() => {
              setTab(item.t);
              if (item.t === TABS.FACE) { setFaceResult(false); setCameraMode(false); setAnalyzing(false); }
              if (item.t === TABS.FENGSHUI) { setFengShuiResult(false); setFengShuiLoading(false); }
            }} style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: "2px",
              opacity: tab === item.t ? 1 : 0.35, transition: "opacity 0.2s",
              position: "relative",
            }}>
              {tab === item.t && <div style={{
                position: "absolute", top: "-8px",
                width: "4px", height: "4px", borderRadius: "50%",
                background: "#e8c547", boxShadow: "0 0 6px #e8c547",
              }} />}
              <span style={{ fontSize: "20px" }}>{item.icon}</span>
              <span style={{
                fontSize: "9px",
                color: tab === item.t ? "#e8c547" : "#5a5040",
                fontFamily: "var(--font-serif)",
              }}>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Home indicator */}
        <div style={{
          position: "absolute", bottom: "6px", left: "50%",
          transform: "translateX(-50%)", width: "134px", height: "4px",
          borderRadius: "2px", background: "rgba(255,255,255,0.08)", zIndex: 50,
        }} />
      </div>
    </>
  );
}

// ─── Shared Styles ───
const phoneFrame = {
  width: "375px", height: "812px", borderRadius: "40px",
  background: "#08080f",
  border: "1px solid rgba(232,197,71,0.1)",
  boxShadow: "0 0 80px rgba(232,197,71,0.06), 0 30px 80px rgba(0,0,0,0.5)",
  position: "relative", overflow: "hidden",
  margin: "20px auto",
  fontFamily: "var(--font-serif)",
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600;700;900&family=Ma+Shan+Zheng&display=swap');
  :root {
    --font-serif: 'Noto Serif TC', serif;
    --font-brush: 'Ma Shan Zheng', cursive;
  }
  @keyframes drift {
    0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
    33% { transform: translateY(-25px) translateX(12px); opacity: 0.5; }
    66% { transform: translateY(-12px) translateX(-8px); opacity: 0.15; }
  }
  @keyframes petFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
  @keyframes petBounce {
    0% { transform: scale(1); }
    30% { transform: scale(1.2) rotate(5deg); }
    60% { transform: scale(0.95); }
    100% { transform: scale(1); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.5; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.05); }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes scanDown {
    0% { top: 10%; opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { top: 80%; opacity: 0; }
  }
  .scroll-area::-webkit-scrollbar { display: none; }
  body { background: #050508; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
`;
