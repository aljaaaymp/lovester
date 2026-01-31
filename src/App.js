import React, { useState, useEffect, useRef } from 'react';
import Groq from 'groq-sdk'; 
import './App.css';

const TOKEN_ADDRESS = "5AdiM2M2E8tGj24D3xTjGpswaxvYNnXmYfqqkZyqPh3a"; 

function App() {
  const [marketData, setMarketData] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [trades, setTrades] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // 1. WELCOME CHAT
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChatOpen(true);
      setMessages([
        { role: 'ai', content: "🦞 Hey handsome. I noticed you checking the charts." },
        { role: 'ai', content: "Forget the candles. How's your heart doing today? 💋" }
      ]);
    }, 1000); 
    return () => clearTimeout(timer);
  }, []);

  // 2. FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${TOKEN_ADDRESS}`);
        const data = await response.json();
        // SAFE CHECK: Only set data if pairs exist
        if (data.pairs && data.pairs.length > 0) {
          setMarketData(data.pairs[0]);
        }
      } catch (e) { console.error(e); }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // 3. FAKE TRADES
  useEffect(() => {
    const generateTrade = () => ({
      type: Math.random() > 0.4 ? 'buy' : 'sell',
      amount: (Math.random() * 50).toFixed(2),
      price: marketData ? marketData.priceUsd : '0.000079',
      id: Math.random()
    });
    setTrades(Array(15).fill(0).map(generateTrade)); 
    
    const interval = setInterval(() => {
      setTrades(prev => [generateTrade(), ...prev.slice(0, 19)]);
    }, 2000);
    return () => clearInterval(interval);
  }, [marketData]);

  // Scroll to bottom
  useEffect(() => {
    if (isChatOpen) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatOpen]);

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
              <a href="https://x.com/i/communities/2017622450402476384" className="social-btn">Join the Orgy (X)</a>
              <a href="https://pump.fun/coin/DKtu2ikG6Ss5FQNVXh1izVGLFbo1jKixJjhRQNFqpump" className="social-btn">Pump Harder</a>
            </div>
          </div>
          <div className="hero-stats-card">
            <div style={{textAlign:'center', marginBottom:'20px'}}>
              <div style={{color:'var(--accent-pink)', fontSize:'0.9rem', letterSpacing:'2px'}}>CURRENT ATTRACTION</div>
              <div style={{fontSize:'3.5rem', fontWeight:'800', color:'white', textShadow:'0 0 20px var(--accent-pink)'}}>
                ${marketData?.priceUsd || '0.0000'}
              </div>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
               {/* FIXED SECTION: SAFE CHECK FOR FDV AND LIQUIDITY */}
               <div>
                 <div style={{color:'#b08ca1', fontSize:'0.7rem'}}>MARKET CAP</div>
                 <div style={{fontSize:'1.3rem', fontWeight:'bold'}}>
                   ${marketData?.fdv ? (marketData.fdv/1000).toFixed(1)+'K' : '-'}
                 </div>
               </div>
               <div>
                 <div style={{color:'#b08ca1', fontSize:'0.7rem'}}>LIQUIDITY</div>
                 <div style={{fontSize:'1.3rem', fontWeight:'bold'}}>
                   ${marketData?.liquidity?.usd ? (marketData.liquidity.usd/1000).toFixed(1)+'K' : '-'}
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

        {/* 4. TERMINAL */}
        <div>
          <h2 className="section-title">INTIMATE STATISTICS</h2>
          <div className="terminal-layout">
            <div className="chart-frame">
               <iframe src={`https://dexscreener.com/solana/${TOKEN_ADDRESS}?embed=1&theme=dark&trades=0&info=0`} style={{width: '100%', height: '100%', border: 'none'}} title="Chart" />
            </div>
            <div className="trades-frame">
              <div className="trades-header">LATEST FLINGS <span style={{color:'var(--accent-pink)'}}>♥</span></div>
              <div className="trades-list">
                {trades.map(t => (
                  <div key={t.id} className={`trade-row ${t.type}`}>
                    <span>{t.type === 'buy' ? 'BOUGHT LOVE' : 'SOLD HEART'}</span>
                    <span>{t.amount} SOL</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      <footer className="app-footer">
        <div className="footer-links">
          <a href="https://x.com/i/communities/2017622450402476384" target="_blank" rel="noreferrer">X (Twitter)</a> • 
          <a href="https://pump.fun/coin/DKtu2ikG6Ss5FQNVXh1izVGLFbo1jKixJjhRQNFqpump" target="_blank" rel="noreferrer">Pump.fun</a> • 
          <a href="#!" style={{cursor:'default'}}>OnlyFans (Jk)</a>X
        </div>
        <p style={{marginTop:'10px'}}>© 2026 Lovester Protocol. Don't catch feelings, catch Xs.</p>
      </footer>

      {isChatOpen && (
        <div className="chat-popup">
          <div className="chat-header">
            <span style={{fontWeight:'bold', fontSize:'1.1rem'}}>🦞 Lovester</span>
            {/* CLOSE BUTTON ADDED HERE */}
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