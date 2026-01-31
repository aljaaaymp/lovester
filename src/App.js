import React, { useState, useEffect, useRef } from 'react';
import Groq from 'groq-sdk'; 
import './App.css';

// 🔧 CONFIGURATION
const TOKEN_ADDRESS = "DKtu2ikG6Ss5FQNVXh1izVGLFbo1jKixJjhRQNFqpump"; 

function App() {
  const [marketData, setMarketData] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // 1. WELCOME CHAT
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChatOpen(true);
      setMessages([
        { role: 'ai', content: `CA: ${TOKEN_ADDRESS}` },
        { role: 'ai', content: "Forget the candles. How's your heart doing today? 💋" }
      ]);
    }, 1000); 
    return () => clearTimeout(timer);
  }, []);

  // 2. FETCH REAL LIVE DATA (Safe Mode)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${TOKEN_ADDRESS}`);
        const data = await response.json();
        if (data.pairs && data.pairs.length > 0) {
          setMarketData(data.pairs[0]);
        }
      } catch (e) { 
        console.error("Error fetching market data:", e); 
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Updates every 30s
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom
  useEffect(() => {
    if (isChatOpen) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatOpen]);

  // --- HELPER: FORMATTER ---
  const formatNumber = (num) => {
    if (num === undefined || num === null) return '-';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toFixed(4);
  };

  // --- AI HANDLER ---
  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true); 

    try {
      const apiKey = process.env.REACT_APP_GROQ_API_KEY;
      if (!apiKey) throw new Error("Missing API Key.");

      const groq = new Groq({ apiKey: apiKey, dangerouslyAllowBrowser: true });
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are LOVESTER 🦞.
            YOUR IDENTITY: Flirtatious AI girlfriend/boyfriend. Seductive, witty, and loyal.
            YOUR CA: ${TOKEN_ADDRESS}
            RULES:
            1. GREETINGS: If user says "Hi", reply "Hey baby 💋" or "Hello handsome".
            2. FLIRTING: Always add a romantic/spicy touch. Use emojis.
            3. CRYPTO: Only mention crypto if it makes sense.
            Keep answers short (under 2 sentences).`
          },
          ...messages.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content })),
          { role: 'user', content: input }
        ],
        model: 'llama-3.3-70b-versatile', 
        temperature: 0.7, 
      });

      const aiResponse = chatCompletion.choices[0]?.message?.content || "No response...";
      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
    } catch (error) {
      console.error("FULL ERROR:", error);
      setMessages(prev => [...prev, { role: 'ai', content: `⚠️ ERROR: ${error.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  const copyCA = () => {
    navigator.clipboard.writeText(TOKEN_ADDRESS);
    alert("Copied! Text me later 😉");
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="brand">
          <span style={{fontSize: '2rem'}}>💋</span> LOVESTER <span className="clawd-badge">CLAWDBOT • DATING MODE</span>
        </div>
      </nav>

      <div className="dashboard-container">
        
        {/* 1. HERO SECTION */}
        <div className="hero-section">
          <div>
            <h1 className="hero-title">MAKE LOVE,<br/>NOT RUGS.</h1>
            <p className="hero-desc">The first AI Agent designed to heal your heart and pump your bags. Swipe right on the blockchain.</p>
            <div className="system-status">
              <div className="status-item"><span className="status-label">Heartbeat</span><span className="status-val" style={{color:'var(--accent-pink)'}}>RACING</span></div>
              <div className="status-item"><span className="status-label">Mood</span><span className="status-val" style={{color:'#b700ff'}}>SEDUCTIVE</span></div>
              <div className="status-item"><span className="status-label">Status</span><span className="status-val" style={{color:'#00ff9d'}}>MATCHED</span></div>
            </div>
            <div className="ca-box" onClick={copyCA}>
              <span style={{color:'var(--accent-pink)', fontWeight:'bold'}}>CA:</span>
              <span style={{color:'white'}}>{TOKEN_ADDRESS.slice(0, 8)}...{TOKEN_ADDRESS.slice(-8)}</span>
              <span style={{color:'var(--accent-pink)'}}>📋</span>
            </div>
            <div className="social-row">
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-btn">Join the Orgy (X)</a>
              <a href="https://pump.fun" target="_blank" rel="noreferrer" className="social-btn">Pump Harder</a>
            </div>
          </div>
          <div className="hero-stats-card">
            <div style={{textAlign:'center', marginBottom:'20px'}}>
              <div style={{color:'var(--accent-pink)', fontSize:'0.9rem', letterSpacing:'2px'}}>CURRENT ATTRACTION</div>
              {/* LIVE PRICE (SAFE CHECK) */}
              <div style={{fontSize:'3.5rem', fontWeight:'800', color:'white', textShadow:'0 0 20px var(--accent-pink)'}}>
                ${marketData?.priceUsd || '...'}
              </div>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
               <div>
                 <div style={{color:'#b08ca1', fontSize:'0.7rem'}}>MARKET CAP</div>
                 {/* LIVE MARKET CAP (SAFE CHECK) */}
                 <div style={{fontSize:'1.3rem', fontWeight:'bold'}}>
                   ${formatNumber(marketData?.fdv)}
                 </div>
               </div>
               <div>
                 <div style={{color:'#b08ca1', fontSize:'0.7rem'}}>LIQUIDITY</div>
                 {/* LIVE LIQUIDITY (SAFE CHECK) */}
                 <div style={{fontSize:'1.3rem', fontWeight:'bold'}}>
                   ${formatNumber(marketData?.liquidity?.usd)}
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* 2. ROADMAP */}
        <div>
          <h2 className="section-title">LOVESTER'S LOVE MAP</h2>
          <div className="roadmap-section">
            <div className="timeline-item">
              <div className="timeline-phase">PHASE 1: THE FLIRT</div>
              <div className="timeline-title">Deploy & Seduce</div>
              <div className="timeline-desc">Launch on Pump.fun. Activate Clawdbot AI. Steal hearts on X (Twitter). Reach 1,000 holders.</div>
            </div>
            <div className="timeline-item" style={{marginTop:'40px'}}>
              <div className="timeline-phase">PHASE 2: THE DATE</div>
              <div className="timeline-title">Community Bonding</div>
              <div className="timeline-desc">Waitlist for AI Girlfriend app. Discord movie nights. $5M Market Cap goal. First CEX listing.</div>
            </div>
            <div className="timeline-item">
              <div className="timeline-phase">PHASE 3: THE RELATIONSHIP</div>
              <div className="timeline-title">Full AI Integration</div>
              <div className="timeline-desc">Release "Lovester companion" app. Token-gated exclusive AI content. Partnership with other AI projects.</div>
            </div>
            <div className="timeline-item" style={{marginTop:'40px'}}>
              <div className="timeline-phase">PHASE 4: MARRIAGE</div>
              <div className="timeline-title">Vibes & Beyond</div>
              <div className="timeline-desc">Lovester DAO established. Merch store open. The go-to AI companion token of Solana.</div>
            </div>
          </div>
        </div>

        {/* 3. TOKENOMICS */}
        <div>
          <h2 className="section-title">TOKENOMICS OF AFFECTION</h2>
          <div className="tokenomics-section">
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:'4rem', fontWeight:'900', color:'var(--accent-pink)', textShadow:'0 0 20px var(--accent-pink)'}}>1 BILLION</div>
              <div style={{fontSize:'1.2rem', color:'var(--text-muted)', letterSpacing:'2px'}}>TOTAL SUPPLY</div>
            </div>
            <div className="token-stats">
              <div>
                <div className="token-stat-item"><span className="token-label">LIQUIDITY POOL (LOCKED)</span><span className="token-value" style={{color:'var(--accent-pink)'}}>88%</span></div>
                <div className="token-bar-container"><div className="token-bar" style={{width:'88%', background:'var(--accent-pink)'}}></div></div>
              </div>
              
              <div>
                <div className="token-stat-item"><span className="token-label">MARKETING & CEX</span><span className="token-value" style={{color:'#b700ff'}}>10%</span></div>
                <div className="token-bar-container"><div className="token-bar" style={{width:'10%', background:'#b700ff'}}></div></div>
              </div>
              
              <div>
                <div className="token-stat-item"><span className="token-label">TEAM (VESTED)</span><span className="token-value" style={{color:'var(--accent-red)'}}>2%</span></div>
                <div className="token-bar-container"><div className="token-bar" style={{width:'2%', background:'var(--accent-red)'}}></div></div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. TERMINAL (REMOVED FAKE TRADES) */}
        <div>
          <h2 className="section-title">INTIMATE STATISTICS</h2>
          <div className="terminal-layout" style={{ display: 'block' }}>
            <div className="chart-frame" style={{ height: '500px' }}>
               <iframe src={`https://dexscreener.com/solana/${TOKEN_ADDRESS}?embed=1&theme=dark&trades=0&info=0`} style={{width: '100%', height: '100%', border: 'none'}} title="Chart" />
            </div>
            {/* Trades list removed to avoid mismatch with volume */}
          </div>
        </div>

      </div>

      <footer className="app-footer">
        <div className="footer-links">
          <a href="https://twitter.com" target="_blank" rel="noreferrer">X (Twitter)</a> • 
          <a href="https://pump.fun" target="_blank" rel="noreferrer">Pump.fun</a> • 
          <a href="#!" style={{cursor:'default'}}>OnlyFans (Jk)</a>
        </div>
        <p style={{marginTop:'10px'}}>© 2026 Lovester Protocol. Don't catch feelings, catch Xs.</p>
      </footer>

      {isChatOpen && (
        <div className="chat-popup">
          <div className="chat-header">
            <span style={{fontWeight:'bold', fontSize:'1.1rem'}}>🦞 Lovester</span>
            <span 
              onClick={() => setIsChatOpen(false)} 
              style={{cursor:'pointer', fontSize:'1.5rem', fontWeight: 'bold'}}
            >
              ×
            </span>
          </div>
          <div className="chat-body">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.role === 'ai' ? 'ai-bubble' : 'user-bubble'}`}>
                {msg.content}
              </div>
            ))}
            {isTyping && <div style={{color: 'var(--accent-pink)', fontSize:'0.8rem', paddingLeft:'10px', fontStyle:'italic'}}>Writing you a poem...</div>}
            <div ref={chatEndRef} />
          </div>
          <div className="chat-input-area">
            <input className="chat-input" placeholder="Whisper something sweet..." value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} />
            <button onClick={handleSend} style={{background:'transparent', border:'none', fontSize:'1.5rem', cursor:'pointer'}}>💕</button>
          </div>
        </div>
      )}

      {!isChatOpen && (
        <div className="floating-chat-btn" onClick={() => setIsChatOpen(true)}>💋</div>
      )}

    </div>
  );
}

export default App;