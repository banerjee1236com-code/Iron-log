import { useState, useEffect } from "react";

const PROGRAM = {
  Tuesday: {
    label: "PUSH",
    gradient: "linear-gradient(135deg, #F97316, #EF4444)",
    accent: "#F97316",
    glow: "rgba(249,115,22,0.3)",
    exercises: [
      { name: "Barbell Bench Press", sets: "4x8" },
      { name: "Overhead Press", sets: "3x10" },
      { name: "Pec Deck Fly", sets: "3x12" },
      { name: "Incline Dumbbell Press", sets: "3x10" },
      { name: "Lateral Raises", sets: "3x15" },
      { name: "Tricep Pushdown", sets: "3x12" },
      { name: "Overhead Tricep Extension", sets: "3x12" },
    ],
  },
  Wednesday: {
    label: "PULL",
    gradient: "linear-gradient(135deg, #6366F1, #8B5CF6)",
    accent: "#818CF8",
    glow: "rgba(129,140,248,0.3)",
    exercises: [
      { name: "Deadlift", sets: "4x5" },
      { name: "Lat Pulldown", sets: "3x10" },
      { name: "Cable Row", sets: "3x12" },
      { name: "Face Pulls", sets: "3x15" },
      { name: "Shrugs", sets: "3x12" },
      { name: "Chest Supported T-Bar Row", sets: "3x10" },
      { name: "Preacher Curl", sets: "3x12" },
      { name: "Dumbbell Curl", sets: "3x12" },
      { name: "Hammer Curl", sets: "3x12" },
    ],
  },
  Thursday: {
    label: "LEGS",
    gradient: "linear-gradient(135deg, #10B981, #06B6D4)",
    accent: "#10B981",
    glow: "rgba(16,185,129,0.3)",
    exercises: [
      { name: "Barbell Squat", sets: "4x8" },
      { name: "Leg Curl", sets: "3x12" },
      { name: "Leg Press", sets: "3x12" },
      { name: "Walking Lunges", sets: "3x10 each" },
      { name: "Calf Raises", sets: "4x15" },
    ],
  },
  Saturday: {
    label: "PUSH",
    gradient: "linear-gradient(135deg, #F97316, #EF4444)",
    accent: "#F97316",
    glow: "rgba(249,115,22,0.3)",
    exercises: [
      { name: "Incline Barbell Press", sets: "3x8" },
      { name: "Pec Deck Fly", sets: "3x12" },
      { name: "Barbell Bench Press", sets: "4x6" },
      { name: "Dumbbell Shoulder Press", sets: "3x10" },
      { name: "Cable Lateral Raises", sets: "3x15" },
      { name: "Skull Crushers", sets: "3x12" },
      { name: "Tricep Dips", sets: "3x12" },
    ],
  },
  Sunday: {
    label: "PULL/LEGS",
    gradient: "linear-gradient(135deg, #EC4899, #F43F5E)",
    accent: "#EC4899",
    glow: "rgba(236,72,153,0.3)",
    exercises: [
      { name: "Weighted Pull-ups / Lat Pulldown", sets: "4x8" },
      { name: "Chest Supported T-Bar Row", sets: "3x10" },
      { name: "Cable Row", sets: "3x12" },
      { name: "Reverse Flies", sets: "3x15" },
      { name: "Hammer Curls", sets: "3x12" },
      { name: "Incline Dumbbell Curl", sets: "3x12" },
    ],
  },
};

const DAYS_ORDER = ["Tuesday", "Wednesday", "Thursday", "Saturday", "Sunday"];
const TOTAL_WEEKS = 12;

const STORAGE_KEY = "ironlog_v4";

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { setsDone: {}, weights: {}, notes: {}, sessions: {} };
}

function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0D0D12; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: #1a1a2e; }
  ::-webkit-scrollbar-thumb { background: #3a3a5c; border-radius: 2px; }
  .ex-card { transition: all 0.25s cubic-bezier(0.4,0,0.2,1); }
  .day-btn { transition: all 0.2s ease; }
  .day-btn:hover { transform: translateY(-2px); }
  .week-row { transition: all 0.2s ease; }
  .week-row:hover { transform: translateX(6px); background: #16162a !important; }
  .set-check { transition: all 0.2s cubic-bezier(0.4,0,0.2,1); }
  .set-check:hover { transform: scale(1.1); }
  .view-btn { transition: all 0.2s ease; }
  .view-btn:hover { opacity: 0.85; }
  .end-btn { transition: all 0.2s ease; }
  .end-btn:hover { transform: translateY(-2px); filter: brightness(1.1); }
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
  input:focus, textarea:focus { outline: none; }
  textarea { resize: none; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  .fade-in { animation: fadeIn 0.3s ease forwards; }
  @keyframes sessionPop { 0% { transform:scale(0.9); opacity:0; } 60% { transform:scale(1.05); } 100% { transform:scale(1); opacity:1; } }
  .session-pop { animation: sessionPop 0.4s ease forwards; }
`;

export default function WorkoutTracker() {
  const [data, setData] = useState(() => loadData());
  const [currentWeek, setCurrentWeek] = useState(0);
  const [activeDay, setActiveDay] = useState("Tuesday");
  const [view, setView] = useState("tracker");
  const [showConfirm, setShowConfirm] = useState(false);

  const { setsDone, weights, notes, sessions } = data;

  useEffect(() => { saveData(data); }, [data]);

  // --- Helpers ---
  const getNumSets = (ex) => parseInt(ex.sets.split("x")[0]) || 3;

  const getTotalSets = (day) =>
    PROGRAM[day].exercises.reduce((acc, ex) => acc + getNumSets(ex), 0);

  const getDoneSets = (week, day) => {
    let count = 0;
    PROGRAM[day].exercises.forEach((ex, i) => {
      const n = getNumSets(ex);
      for (let s = 0; s < n; s++) {
        if (setsDone[`${week}_${day}_${i}_s${s}`]) count++;
      }
    });
    return count;
  };

  const getDayPct = (week, day) => {
    const total = getTotalSets(day);
    if (!total) return 0;
    return Math.round((getDoneSets(week, day) / total) * 100);
  };

  const isSessionDone = (week, day) => !!sessions[`${week}_${day}`];

  const getWeekProgress = (week) => {
    let done = 0, total = 0;
    DAYS_ORDER.forEach(day => {
      done += getDoneSets(week, day);
      total += getTotalSets(day);
    });
    return total ? Math.round((done / total) * 100) : 0;
  };

  const totalSessionsDone = () => {
    let count = 0;
    for (let w = 0; w < TOTAL_WEEKS; w++)
      DAYS_ORDER.forEach(day => { if (isSessionDone(w, day)) count++; });
    return count;
  };

  // --- Mutators ---
  const toggleSet = (week, day, exIdx, setIdx) => {
    const key = `${week}_${day}_${exIdx}_s${setIdx}`;
    setData(prev => {
      const next = { ...prev, setsDone: { ...prev.setsDone, [key]: !prev.setsDone[key] } };
      saveData(next); return next;
    });
  };

  const updateWeight = (week, day, exIdx, setIdx, val) => {
    const key = `${week}_${day}_${exIdx}_s${setIdx}`;
    setData(prev => {
      const next = { ...prev, weights: { ...prev.weights, [key]: val } };
      saveData(next); return next;
    });
  };

  const updateNote = (week, day, exIdx, val) => {
    const key = `${week}_${day}_${exIdx}`;
    setData(prev => {
      const next = { ...prev, notes: { ...prev.notes, [key]: val } };
      saveData(next); return next;
    });
  };

  const endSession = (week, day) => {
    const key = `${week}_${day}`;
    setData(prev => {
      const next = { ...prev, sessions: { ...prev.sessions, [key]: true } };
      saveData(next); return next;
    });
    setShowConfirm(false);
  };

  const dayData = PROGRAM[activeDay];
  const weekPct = getWeekProgress(currentWeek);
  const dayPct = getDayPct(currentWeek, activeDay);
  const sessionDone = isSessionDone(currentWeek, activeDay);

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", background: "#0D0D12", color: "#E8E8F0", fontFamily: "'DM Sans', sans-serif", paddingBottom: "40px" }}>

        {/* Header */}
        <div style={{
          background: "linear-gradient(180deg, #13131f 0%, #0D0D12 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "18px 20px 16px", position: "sticky", top: 0, zIndex: 100,
          backdropFilter: "blur(20px)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "10px", letterSpacing: "3px", color: "#5a5a7a", marginBottom: "2px", fontWeight: 500 }}>SAYAK · 12-WEEK PPL</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px", letterSpacing: "3px", lineHeight: 1, background: "linear-gradient(90deg, #fff 0%, #a0a0c0 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                IRON LOG
              </div>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              {["tracker", "overview"].map(v => (
                <button key={v} className="view-btn" onClick={() => setView(v)} style={{
                  background: view === v ? "rgba(255,255,255,0.1)" : "transparent",
                  border: `1px solid ${view === v ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.07)"}`,
                  color: view === v ? "#fff" : "#4a4a6a",
                  padding: "7px 16px", fontSize: "10px", letterSpacing: "2px",
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  textTransform: "uppercase", borderRadius: "6px", fontWeight: 500
                }}>{v}</button>
              ))}
            </div>
          </div>
        </div>

        {view === "tracker" ? (
          <div style={{ padding: "20px" }} className="fade-in">

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", marginBottom: "20px" }}>
              {[
                { label: "WEEK", value: `${currentWeek + 1}`, sub: "of 12" },
                { label: "SESSIONS", value: `${totalSessionsDone()}`, sub: "of 60" },
                { label: "THIS WEEK", value: `${weekPct}%`, sub: "sets done" },
              ].map(s => (
                <div key={s.label} style={{
                  background: "linear-gradient(135deg, #13131f, #1a1a2e)",
                  border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px",
                  padding: "14px 10px", textAlign: "center"
                }}>
                  <div style={{ fontSize: "8px", color: "#4a4a6a", letterSpacing: "2px", marginBottom: "6px", fontWeight: 600 }}>{s.label}</div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "26px", letterSpacing: "2px", color: "#fff", lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: "9px", color: "#3a3a5a", marginTop: "3px" }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Week nav */}
            <div style={{
              display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px",
              background: "linear-gradient(135deg, #13131f, #1a1a2e)",
              border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "10px 14px"
            }}>
              <button onClick={() => setCurrentWeek(w => Math.max(0, w - 1))} style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                color: "#8888aa", width: "30px", height: "30px", borderRadius: "8px",
                cursor: "pointer", fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center"
              }}>‹</button>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "11px", color: "#8888aa", letterSpacing: "2px", textAlign: "center", marginBottom: "6px" }}>
                  WEEK {currentWeek + 1} OF 12
                </div>
                <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${weekPct}%`, borderRadius: "2px",
                    background: weekPct === 100 ? "linear-gradient(90deg,#10B981,#06B6D4)" : "linear-gradient(90deg,#6366F1,#8B5CF6)",
                    transition: "width 0.5s ease"
                  }} />
                </div>
              </div>
              <button onClick={() => setCurrentWeek(w => Math.min(TOTAL_WEEKS - 1, w + 1))} style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                color: "#8888aa", width: "30px", height: "30px", borderRadius: "8px",
                cursor: "pointer", fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center"
              }}>›</button>
            </div>

            {/* Day tabs */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "18px", overflowX: "auto", paddingBottom: "4px" }}>
              {DAYS_ORDER.map(day => {
                const done = isSessionDone(currentWeek, day);
                const isActive = activeDay === day;
                const d = PROGRAM[day];
                return (
                  <button key={day} className="day-btn" onClick={() => setActiveDay(day)} style={{
                    background: isActive ? d.gradient : done ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${isActive ? "transparent" : done ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.07)"}`,
                    color: isActive ? "#fff" : done ? "#10B981" : "#4a4a6a",
                    padding: "8px 14px", fontSize: "9px", letterSpacing: "2px",
                    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                    borderRadius: "8px", flexShrink: 0, fontWeight: 600,
                    boxShadow: isActive ? `0 4px 20px ${d.glow}` : "none"
                  }}>
                    {day.slice(0, 3).toUpperCase()}{done && !isActive ? " ✓" : ""}
                  </button>
                );
              })}
            </div>

            {/* Day header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "3px", height: "20px", background: dayData.gradient, borderRadius: "2px" }} />
                <div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px", letterSpacing: "2px", lineHeight: 1 }}>{activeDay}</div>
                  <div style={{ fontSize: "9px", letterSpacing: "3px", color: dayData.accent, fontWeight: 600 }}>{dayData.label}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{
                  background: dayData.glow, border: `1px solid ${dayData.accent}33`,
                  borderRadius: "20px", padding: "4px 12px",
                  fontSize: "11px", color: dayData.accent, fontWeight: 600
                }}>
                  {dayPct}% · {getDoneSets(currentWeek, activeDay)}/{getTotalSets(activeDay)} sets
                </div>
              </div>
            </div>

            {/* Session done banner */}
            {sessionDone && (
              <div className="session-pop" style={{
                marginBottom: "16px", padding: "12px 16px", borderRadius: "10px",
                background: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,182,212,0.08))",
                border: "1px solid rgba(16,185,129,0.3)",
                display: "flex", alignItems: "center", gap: "10px"
              }}>
                <span style={{ fontSize: "18px" }}>🏆</span>
                <div>
                  <div style={{ fontSize: "12px", color: "#10B981", fontWeight: 700, letterSpacing: "1px" }}>SESSION COMPLETE</div>
                  <div style={{ fontSize: "10px", color: "#3a6a5a", marginTop: "2px" }}>{activeDay} · Week {currentWeek + 1} · {dayPct}% sets done</div>
                </div>
              </div>
            )}

            {/* Exercises */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {dayData.exercises.map((ex, i) => {
                const numSets = getNumSets(ex);
                const noteKey = `${currentWeek}_${activeDay}_${i}`;
                const noteVal = notes[noteKey] || "";
                const setsCompleted = Array.from({ length: numSets }, (_, s) => !!setsDone[`${currentWeek}_${activeDay}_${i}_s${s}`]);
                const allSets = setsCompleted.every(Boolean);

                return (
                  <div key={i} className="ex-card" style={{
                    background: allSets
                      ? "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(6,182,212,0.05))"
                      : "linear-gradient(135deg, #13131f, #16162a)",
                    border: `1px solid ${allSets ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.06)"}`,
                    borderRadius: "12px", padding: "14px 16px",
                  }}>
                    {/* Exercise name */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <div>
                        <div style={{
                          fontSize: "13px", fontWeight: 600,
                          color: allSets ? "#3a8a6a" : "#c8c8e0",
                          textDecoration: allSets ? "line-through" : "none",
                          marginBottom: "3px"
                        }}>{ex.name}</div>
                        <div style={{ fontSize: "10px", color: allSets ? "#2a5a4a" : dayData.accent, letterSpacing: "1px", fontWeight: 600 }}>
                          {ex.sets}
                        </div>
                      </div>
                      <div style={{
                        fontSize: "10px", color: allSets ? "#10B981" : "#3a3a5a",
                        fontWeight: 700, letterSpacing: "1px"
                      }}>
                        {setsCompleted.filter(Boolean).length}/{numSets}
                      </div>
                    </div>

                    {/* Sets */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "12px" }}>
                      {Array.from({ length: numSets }, (_, s) => {
                        const setKey = `${currentWeek}_${activeDay}_${i}_s${s}`;
                        const isDone = !!setsDone[setKey];
                        const w = weights[setKey] || "";
                        return (
                          <div key={s} style={{
                            display: "flex", alignItems: "center", gap: "10px",
                            background: isDone ? "rgba(16,185,129,0.06)" : "rgba(255,255,255,0.03)",
                            border: `1px solid ${isDone ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)"}`,
                            borderRadius: "8px", padding: "8px 10px"
                          }}>
                            {/* Set label */}
                            <div style={{ fontSize: "9px", color: isDone ? "#10B981" : "#4a4a6a", fontWeight: 700, letterSpacing: "1px", width: "20px", flexShrink: 0 }}>
                              S{s + 1}
                            </div>
                            {/* Weight input */}
                            <input
                              type="number"
                              placeholder="— kg"
                              value={w}
                              onChange={e => updateWeight(currentWeek, activeDay, i, s, e.target.value)}
                              style={{
                                flex: 1, background: "transparent",
                                border: "none", borderBottom: `1px solid ${w ? dayData.accent + "66" : "rgba(255,255,255,0.1)"}`,
                                color: isDone ? "#3a6a5a" : dayData.accent,
                                padding: "2px 4px", fontSize: "13px",
                                fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                                textDecoration: isDone ? "line-through" : "none"
                              }}
                            />
                            <span style={{ fontSize: "9px", color: "#2a2a4a", fontWeight: 600, flexShrink: 0 }}>KG</span>
                            {/* Set checkbox */}
                            <button className="set-check" onClick={() => toggleSet(currentWeek, activeDay, i, s)} style={{
                              width: "22px", height: "22px", flexShrink: 0, borderRadius: "5px",
                              background: isDone ? "linear-gradient(135deg,#10B981,#06B6D4)" : "rgba(255,255,255,0.05)",
                              border: `1px solid ${isDone ? "transparent" : "rgba(255,255,255,0.1)"}`,
                              color: "#fff", cursor: "pointer", fontSize: "11px",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              boxShadow: isDone ? "0 2px 8px rgba(16,185,129,0.4)" : "none"
                            }}>
                              {isDone ? "✓" : ""}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Notes */}
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "10px" }}>
                      <div style={{ fontSize: "8px", color: "#3a3a5a", letterSpacing: "2px", fontWeight: 600, marginBottom: "6px" }}>
                        📝 NOTES
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Form cues, weight goals, how it felt..."
                        value={noteVal}
                        onChange={e => updateNote(currentWeek, activeDay, i, e.target.value)}
                        style={{
                          width: "100%", background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.07)", borderRadius: "6px",
                          color: "#8888aa", padding: "8px 10px", fontSize: "11px",
                          fontFamily: "'DM Sans', sans-serif", lineHeight: "1.5",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Overload rule */}
            <div style={{
              marginTop: "16px", padding: "12px 16px", borderRadius: "10px",
              background: "linear-gradient(135deg, rgba(249,115,22,0.08), rgba(239,68,68,0.05))",
              border: "1px solid rgba(249,115,22,0.2)",
              fontSize: "11px", color: "#f97316", letterSpacing: "0.5px", lineHeight: "1.6", fontWeight: 500
            }}>
              ⚡ Add 2.5kg when all reps are clean. No exceptions. No excuses.
            </div>

            {/* End Session Button */}
            {!sessionDone ? (
              !showConfirm ? (
                <button className="end-btn" onClick={() => setShowConfirm(true)} style={{
                  marginTop: "16px", width: "100%", padding: "16px",
                  background: "linear-gradient(135deg, #1a1a2e, #13131f)",
                  border: `1px solid ${dayData.accent}44`,
                  borderRadius: "12px", color: dayData.accent,
                  fontSize: "12px", letterSpacing: "3px", fontWeight: 700,
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  textTransform: "uppercase"
                }}>
                  END SESSION
                </button>
              ) : (
                <div style={{
                  marginTop: "16px", padding: "16px", borderRadius: "12px",
                  background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.06))",
                  border: "1px solid rgba(99,102,241,0.3)", textAlign: "center"
                }}>
                  <div style={{ fontSize: "12px", color: "#c8c8e0", marginBottom: "4px", fontWeight: 600 }}>
                    End session with {dayPct}% completion?
                  </div>
                  <div style={{ fontSize: "10px", color: "#5a5a7a", marginBottom: "14px" }}>
                    {getDoneSets(currentWeek, activeDay)} of {getTotalSets(activeDay)} sets done
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={() => setShowConfirm(false)} style={{
                      flex: 1, padding: "10px", background: "transparent",
                      border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px",
                      color: "#5a5a7a", fontSize: "11px", letterSpacing: "2px",
                      cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600
                    }}>CANCEL</button>
                    <button onClick={() => endSession(currentWeek, activeDay)} style={{
                      flex: 2, padding: "10px",
                      background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
                      border: "none", borderRadius: "8px",
                      color: "#fff", fontSize: "11px", letterSpacing: "2px",
                      cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 700
                    }}>CONFIRM END SESSION</button>
                  </div>
                </div>
              )
            ) : (
              <div style={{
                marginTop: "16px", width: "100%", padding: "14px",
                background: "rgba(16,185,129,0.06)",
                border: "1px solid rgba(16,185,129,0.2)",
                borderRadius: "12px", color: "#10B981",
                fontSize: "11px", letterSpacing: "3px", fontWeight: 700,
                textAlign: "center", fontFamily: "'DM Sans', sans-serif"
              }}>
                ✓ SESSION LOGGED
              </div>
            )}
          </div>

        ) : (
          /* Overview */
          <div style={{ padding: "20px" }} className="fade-in">
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "22px", letterSpacing: "3px", color: "#888", marginBottom: "18px" }}>
              12-WEEK OVERVIEW
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              {Array.from({ length: TOTAL_WEEKS }, (_, w) => {
                const pct = getWeekProgress(w);
                const isCurrent = w === currentWeek;
                return (
                  <div key={w} className="week-row" onClick={() => { setCurrentWeek(w); setView("tracker"); }}
                    style={{
                      background: isCurrent ? "linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.06))" : "#111118",
                      border: `1px solid ${isCurrent ? "rgba(99,102,241,0.35)" : "rgba(255,255,255,0.05)"}`,
                      borderRadius: "10px", padding: "12px 14px", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "14px",
                      boxShadow: isCurrent ? "0 2px 20px rgba(99,102,241,0.15)" : "none"
                    }}>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "16px", letterSpacing: "2px", color: isCurrent ? "#818CF8" : "#333344", width: "48px", flexShrink: 0 }}>
                      W{String(w + 1).padStart(2, "0")}
                    </div>
                    <div style={{ flex: 1, height: "5px", background: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${pct}%`, borderRadius: "3px",
                        background: pct === 100 ? "linear-gradient(90deg,#10B981,#06B6D4)" : isCurrent ? "linear-gradient(90deg,#6366F1,#8B5CF6)" : "linear-gradient(90deg,#2a2a4a,#3a3a5a)",
                        transition: "width 0.5s ease"
                      }} />
                    </div>
                    <div style={{ fontSize: "11px", fontWeight: 600, color: pct === 100 ? "#10B981" : isCurrent ? "#818CF8" : "#2a2a4a", width: "34px", textAlign: "right", flexShrink: 0 }}>
                      {pct > 0 ? `${pct}%` : "—"}
                    </div>
                    <div style={{ display: "flex", gap: "3px" }}>
                      {DAYS_ORDER.map(day => {
                        const done = isSessionDone(w, day);
                        const pctDay = getDayPct(w, day);
                        return (
                          <div key={day} title={`${day}: ${pctDay}%`} style={{
                            width: "7px", height: "7px", borderRadius: "2px",
                            background: done ? PROGRAM[day].accent : pctDay > 0 ? PROGRAM[day].accent + "44" : "rgba(255,255,255,0.06)",
                            boxShadow: done ? `0 0 6px ${PROGRAM[day].glow}` : "none"
                          }} />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: "20px", padding: "14px 16px", borderRadius: "10px", background: "#111118", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: "9px", color: "#3a3a5a", letterSpacing: "3px", marginBottom: "10px", fontWeight: 600 }}>LEGEND</div>
              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                {DAYS_ORDER.map(day => (
                  <div key={day} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: PROGRAM[day].gradient }} />
                    <span style={{ fontSize: "9px", color: "#3a3a5a", letterSpacing: "2px", fontWeight: 600 }}>
                      {day.slice(0, 3).toUpperCase()} · {PROGRAM[day].label}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "10px", fontSize: "9px", color: "#2a2a4a", lineHeight: "1.8" }}>
                Bright dot = session ended · Dim dot = partial progress · Empty = not started
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
