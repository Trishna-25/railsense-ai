import { useState, useEffect, useRef } from "react";
import "./App.css";

function Toast({ toasts }) {
  return (
    <div className="toast-wrap">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{t.type === "error" ? "❌" : t.type === "success" ? "✅" : "⚠️"}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

function TrainScene() {
  useEffect(() => {
    const row = document.getElementById("sleepers-row");
    if (!row) return;
    for (let i = 0; i < 40; i++) {
      const d = document.createElement("div");
      d.className = "sleeper";
      row.appendChild(d);
    }
  }, []);

  return (
    <div className="train-scene">
      <div className="moving-train">
        <div className="engine">
          <div className="smoke">
            <div className="puff"></div>
            <div className="puff"></div>
            <div className="puff"></div>
          </div>
          <div className="engine-window"></div>
          <div className="engine-stripe"></div>
          <div className="engine-nose"></div>
          <div className="ewheel ew1"></div>
          <div className="ewheel ew2"></div>
          <div className="ewheel ew3"></div>
        </div>
        {["S1","S2","A1","A2"].map((n) => (
          <div className="coach" key={n}>
            <div className="coach-wins">
              <div className="cwin"></div>
              <div className="cwin off"></div>
              <div className="cwin"></div>
              <div className="cwin"></div>
            </div>
            <div className="coach-stripe"></div>
            <div className="cwheel cw1"></div>
            <div className="cwheel cw2"></div>
          </div>
        ))}
      </div>
      <div className="track-ground">
        <div className="sleepers-track">
          <div className="sleepers-row" id="sleepers-row"></div>
        </div>
        <div className="rail top"></div>
        <div className="rail bot"></div>
      </div>
    </div>
  );
}

function WaitlistPredictor({ showToast }) {
  const [form, setForm] = useState({
    waitlist_position: "",
    class_of_travel: "Sleeper",
    travel_distance: "",
    holiday_or_peak: "No",
    train_type: "Express",
    seat_availability: "",
    number_of_passengers: "1",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const predict = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:9999/predict-waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          waitlist_position: parseInt(form.waitlist_position),
          class_of_travel: form.class_of_travel,
          travel_distance: parseInt(form.travel_distance),
          holiday_or_peak: form.holiday_or_peak,
          train_type: form.train_type,
          seat_availability: parseInt(form.seat_availability),
          number_of_passengers: parseInt(form.number_of_passengers),
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      showToast( "Backend didnot connect. Check FASTAPI running." ,"error");
    }
    setLoading(false);
  };

  return (
    <div className="card">
      <div className="card-title">🎫 WAITLIST PREDICTOR</div>
      <div className="form-grid">
        <div className="form-group">
          <label>Waitlist Position</label>
          <input name="waitlist_position" type="number" placeholder="e.g. 14" value={form.waitlist_position} onChange={handle} />
        </div>
        <div className="form-group">
          <label>Class of Travel</label>
          <select name="class_of_travel" value={form.class_of_travel} onChange={handle}>
            <option>Sleeper</option>
            <option>3A</option>
            <option>2A</option>
            <option>1A</option>
            <option>CC</option>
          </select>
        </div>
        <div className="form-group">
          <label>Travel Distance (km)</label>
          <input name="travel_distance" type="number" placeholder="e.g. 450" value={form.travel_distance} onChange={handle} />
        </div>
        <div className="form-group">
          <label>Holiday / Peak Season</label>
          <select name="holiday_or_peak" value={form.holiday_or_peak} onChange={handle}>
            <option>No</option>
            <option>Yes</option>
          </select>
        </div>
        <div className="form-group">
          <label>Train Type</label>
          <select name="train_type" value={form.train_type} onChange={handle}>
            <option>Express</option>
            <option>Superfast</option>
            <option>Rajdhani</option>
            <option>Shatabdi</option>
            <option>Passenger</option>
          </select>
        </div>
        <div className="form-group">
          <label>Seat Availability</label>
          <input name="seat_availability" type="number" placeholder="e.g. 5" value={form.seat_availability} onChange={handle} />
        </div>
        <div className="form-group">
          <label>Number of Passengers</label>
          <input name="number_of_passengers" type="number" placeholder="e.g. 1" value={form.number_of_passengers} onChange={handle} />
        </div>
      </div>
      <button className="btn-primary" onClick={predict} disabled={loading}>
        {loading ? "Predicting..." : "Predict Confirmation"}
      </button>
      {result && (
        <div className="result-box">
          {result.error ? (
            <div className="result-confidence" style={{color:"#D0021B"}}>{result.error}</div>
          ) : (
            <>
              <div className={`result-status ${result.status === "Confirmed" ? "result-confirmed" : "result-not-confirmed"}`}>
                {result.status === "Confirmed" ? "✅" : "❌"} {result.status}
              </div>
              <div className="result-confidence">{result.message}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function CrowdDashboard({ showToast }) {
  const stations = ["NDLS","CSTM","HWH","MAS","SBC","CBE"];
  const [selected, setSelected] = useState("MAS");
  const [hour, setHour] = useState(new Date().getHours());
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const check = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/crowd-status?station=${selected}&hour=${hour}`);
      const data = await res.json();
      setResult(data);
    } catch {
      showToast("Backend did not connect.Check FastAPI running", "error");
    }
    setLoading(false);
  };

  const barWidth = { SAFE: "28%", WARNING: "62%", DANGER: "88%" };

  return (
    <div className="card">
      <div className="card-title">📊 CROWD DASHBOARD</div>
      <div className="form-grid">
        <div className="form-group">
          <label>Select Station</label>
          <select value={selected} onChange={(e) => setSelected(e.target.value)}>
            {stations.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Hour (0–23)</label>
          <input type="number" min="0" max="23" value={hour} onChange={(e) => setHour(e.target.value)} />
        </div>
      </div>
      <button className="btn-primary" onClick={check} disabled={loading}>
        {loading ? "Checking..." : "Check Crowd Status"}
      </button>
      {result && (
        <div className="result-box">
          {result.error ? (
            <div className="result-confidence" style={{color:"#D0021B"}}>{result.error}</div>
          ) : (
            <>
              <div className={`result-status level-${result.crowd_level}`}>
                {result.crowd_level === "SAFE" ? "🟢" : result.crowd_level === "WARNING" ? "🟡" : "🔴"} {result.crowd_level}
              </div>
              <div className="crowd-bar-bg" style={{marginTop:"10px"}}>
                <div className={`crowd-bar-fill bar-${result.crowd_level}`} style={{width: barWidth[result.crowd_level]}}></div>
              </div>
              <div className="result-confidence">{result.message}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function TrainSearch({ showToast }) {
  const [trainNo, setTrainNo] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!trainNo.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/train-search?train_no=${trainNo}`);
      const data = await res.json();
      setResult(data);
    } catch {
      showToast("Backend did not connect.Check FastAPI running", "error");
    }
    setLoading(false);
  };

  return (
    <div className="card">
      <div className="card-title">🚂 TRAIN SEARCH</div>
      <div className="form-grid">
        <div className="form-group">
          <label>Train Number</label>
          <input
            type="text"
            placeholder="e.g. 12622"
            value={trainNo}
            onChange={(e) => setTrainNo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
          />
        </div>
      </div>
      <button className="btn-primary" onClick={search} disabled={loading}>
        {loading ? "Searching..." : "Search Train"}
      </button>

      {result && (
        <div className="result-box">
          {!result.found ? (
            <div className="result-confidence" style={{color:"#D0021B"}}>
              ❌ {result.message}
            </div>
          ) : (
            <div>
              <div className="result-status result-confirmed">
                🚆 {result.train.name}
              </div>
              <div style={{marginTop:"12px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px"}}>
                <div className="crowd-card">
                  <div className="crowd-station-name">🔢 Train No</div>
                  <div style={{fontSize:"14px", color:"#1565C0", fontWeight:"600"}}>{result.train.train_no}</div>
                </div>
                <div className="crowd-card">
                  <div className="crowd-station-name">⏱ Duration</div>
                  <div style={{fontSize:"14px", color:"#1565C0", fontWeight:"600"}}>{result.train.duration}</div>
                </div>
                <div className="crowd-card">
                  <div className="crowd-station-name">🟢 Departure</div>
                  <div style={{fontSize:"14px", color:"#2E7D32", fontWeight:"600"}}>{result.train.from}</div>
                  <div style={{fontSize:"13px", color:"#1565C0"}}>{result.train.departure}</div>
                </div>
                <div className="crowd-card">
                  <div className="crowd-station-name">🔴 Arrival</div>
                  <div style={{fontSize:"14px", color:"#D0021B", fontWeight:"600"}}>{result.train.to}</div>
                  <div style={{fontSize:"13px", color:"#1565C0"}}>{result.train.arrival}</div>
                </div>
              </div>
              <div className="crowd-card" style={{marginTop:"10px"}}>
                <div className="crowd-station-name">🎫 Classes Available</div>
                <div style={{display:"flex", gap:"8px", flexWrap:"wrap", marginTop:"6px"}}>
                  {result.train.classes.map((c) => (
                    <span key={c} style={{
                      background:"#E3F2FD", color:"#1565C0",
                      padding:"4px 10px", borderRadius:"4px",
                      fontSize:"12px", fontWeight:"600"
                    }}>{c}</span>
                  ))}
                </div>
              </div>
              <div className="crowd-card" style={{marginTop:"10px"}}>
                <div className="crowd-station-name">📡 Live Status</div>
                <div style={{
                  fontSize:"13px", fontWeight:"600",
                  color: result.train.status.includes("Delayed") ? "#E65100" : "#2E7D32"
                }}>{result.train.status}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PNRStatus({ showToast }) {
  const [pnr, setPnr] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const check = async () => {
    if (!pnr.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/pnr-status?pnr=${pnr}`);
      const data = await res.json();
      setResult(data);
     } catch {
      showToast("Backend did not connect.Check FastAPI running", "error");
    }
    setLoading(false);
  };

  return (
    <div className="card">
      <div className="card-title">🎟️ PNR STATUS</div>
      <div className="form-grid">
        <div className="form-group">
          <label>PNR Number (10 digits)</label>
          <input
            type="text"
            placeholder="e.g. 1234567890"
            value={pnr}
            onChange={(e) => setPnr(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && check()}
            maxLength={10}
          />
        </div>
      </div>
      <button className="btn-primary" onClick={check} disabled={loading}>
        {loading ? "Checking..." : "Check PNR Status"}
      </button>

      {result && (
        <div className="result-box">
          {!result.found ? (
            <div className="result-confidence" style={{color:"#D0021B"}}>
              ❌ {result.message}
            </div>
          ) : (
            <div>
              <div className="result-status result-confirmed">
                🎟️ {result.pnr_data.train_name}
              </div>
              <div style={{marginTop:"12px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px"}}>
                <div className="crowd-card">
                  <div className="crowd-station-name">🚆 Train No</div>
                  <div style={{fontSize:"14px", color:"#1565C0", fontWeight:"600"}}>{result.pnr_data.train_no}</div>
                </div>
                <div className="crowd-card">
                  <div className="crowd-station-name">📅 Date</div>
                  <div style={{fontSize:"14px", color:"#1565C0", fontWeight:"600"}}>{result.pnr_data.date}</div>
                </div>
                <div className="crowd-card">
                  <div className="crowd-station-name">🟢 From</div>
                  <div style={{fontSize:"13px", color:"#2E7D32", fontWeight:"600"}}>{result.pnr_data.from}</div>
                </div>
                <div className="crowd-card">
                  <div className="crowd-station-name">🔴 To</div>
                  <div style={{fontSize:"13px", color:"#D0021B", fontWeight:"600"}}>{result.pnr_data.to}</div>
                </div>
              </div>

              <div className="crowd-card" style={{marginTop:"10px"}}>
                <div className="crowd-station-name">🎫 Class — {result.pnr_data.class}</div>
              </div>

              <div className="crowd-card" style={{marginTop:"10px"}}>
                <div className="crowd-station-name">👥 Passengers</div>
                <div style={{marginTop:"8px", display:"flex", flexDirection:"column", gap:"8px"}}>
                  {result.pnr_data.passengers.map((p, i) => (
                    <div key={i} style={{
                      display:"flex", justifyContent:"space-between",
                      alignItems:"center", padding:"8px 12px",
                      background: p.status === "Confirmed" ? "#E8F5E9" : "#FFF3E0",
                      borderRadius:"6px",
                      border: `1px solid ${p.status === "Confirmed" ? "#A5D6A7" : "#FFCC80"}`
                    }}>
                      <div>
                        <div style={{fontSize:"13px", fontWeight:"600", color:"#1a2a4a"}}>{p.name}</div>
                        <div style={{fontSize:"12px", color:"#5C7A9E"}}>Seat: {p.seat}</div>
                      </div>
                      <div style={{
                        fontSize:"12px", fontWeight:"700",
                        color: p.status === "Confirmed" ? "#2E7D32" : "#E65100",
                        padding:"4px 10px", borderRadius:"4px",
                        background: p.status === "Confirmed" ? "#C8E6C9" : "#FFE0B2"
                      }}>
                        {p.status === "Confirmed" ? "✅" : "⏳"} {p.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ChatBot({ showToast }) {
  const [msgs, setMsgs] = useState([
    { role: "bot", text: "HELLO! I am RailSense AI. Ask me anything about Indian Railways — waitlist, crowd, trains!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMsgs((p) => [...p, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setMsgs((p) => [...p, { role: "bot", text: data.reply }]);
    } catch {
      showToast("Backend did not connect check FastAPI running.", "error");
    }
    setLoading(false);
  };

  return (
    <div className="card">
      <div className="card-title">🤖 AI ASSISTANT</div>
      <div className="chat-window">
        {msgs.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>{m.text}</div>
        ))}
        {loading && <div className="msg bot">Typing...</div>}
        <div ref={bottomRef}></div>
      </div>
      <div className="chat-input-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask about trains, waitlist, crowd..."
        />
        <button className="btn-send" onClick={send}>Send</button>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("waitlist");
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "error") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
  };

  return (
    <div className="app">
      <Toast toasts={toasts} />
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">🚆</span>
            <div>
              <div className="logo-title">RAILSENSE AI</div>
              <div className="logo-sub">Smart Indian Railways Assistant</div>
            </div>
          </div>
          <div className="header-badge">FAR AWAY 2026</div>
        </div>
      </header>
      <TrainScene />
      <nav className="tabs">
       {[["waitlist","🎫 Waitlist"],["crowd","📊 Crowd"],["search","🚂 Train Search"],["pnr","🎟️ PNR Status"],["chat","🤖 AI Chat"]].map(([id,label]) => (
          <button key={id} className={`tab-btn ${tab===id?"active":""}`} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </nav>
      <main className="main">
        {tab === "waitlist" && <WaitlistPredictor showToast={showToast} />}
        {tab === "crowd"    && <CrowdDashboard showToast={showToast} />}
        {tab === "search"   && <TrainSearch showToast={showToast} />}
        {tab === "pnr"      && <PNRStatus showToast={showToast} />}
        {tab === "chat"     && <ChatBot showToast={showToast} />}
      </main>
      <footer className="footer">
       RailSense
      </footer>
    </div>
  );
}
