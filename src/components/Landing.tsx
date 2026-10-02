// ─────────────────────────────────────────────────────────────
// Landing.tsx — marketing landing page
// Updated to match Claude design:
//   · cleaner hero with floating pills
//   · "What Enkel is — and isn't" two-column section
//   · footer with Legal column + © year
// ─────────────────────────────────────────────────────────────
import { Button, Icon, Logo } from "./ui";

export default function Landing({ enterApp }: { enterApp: () => void }) {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="landing">
      {/* ── Sticky nav ── */}
      <header className="landing-nav">
        <Logo />
        <nav>
          <button className="landing-link active" onClick={() => scrollTo("home")}>Home</button>
          <button className="landing-link" onClick={() => scrollTo("how")}>How It Works</button>
          <button className="landing-link" onClick={() => scrollTo("solutions")}>Solutions</button>
          <button className="landing-link" onClick={() => scrollTo("pricing")}>Pricing</button>
        </nav>
        <div className="landing-actions">
          <Button variant="ghost" onClick={enterApp}>Sign in</Button>
          <Button onClick={enterApp}>Get Started</Button>
        </div>
      </header>

      <main className="landing-main">

        {/* ── Hero ── */}
        <section className="hero" id="home">
          <div className="hero-copy">
            <p className="eyebrow teal-copy">FOR SMALL BUSINESS OWNERS</p>
            <h1>Run your business<br />without keeping<br />everything in your<br />head.</h1>
            <p>Enkel keeps the context on every client and job in one place — so you always know what matters, and what to do next.</p>
            <div className="hero-actions">
              <Button onClick={enterApp}>Get Started</Button>
              <button className="see-how" onClick={() => scrollTo("how")}>
                See how Enkel works <Icon name="arrow" size={15} />
              </button>
            </div>
            <small>No setup required to start seeing what matters.</small>
          </div>

          {/* Client context mock card */}
          <div className="hero-visual">
            <span className="float-chip chip-sales"><i /> Sales · Inv #114</span>
            <span className="float-chip chip-catalogue"><i /> Catalogue · SEO</span>
            <div className="client-context">
              <div className="context-head">
                <span className="avatar avatar-teal">ML</span>
                <div>
                  <strong>Meridian Labs</strong>
                  <small>Client since Feb 2025 · Owner: Priya S.</small>
                </div>
                <span className="status status-good">ACTIVE</span>
              </div>
              <div className="context-rule" />
              <p className="eyebrow orange-copy">TODAY · 3 THINGS NEED ATTENTION</p>
              <div className="timeline-line">
                <i /><div><small>CONTEXT</small><p>Prefers email over calls. Renewal discussion underway. Pricing sensitivity noted.</p></div>
              </div>
              <div className="timeline-line teal-line">
                <i /><div><small>RECENT ACTIVITY</small><p>Invoice #114 sent — 5 days ago.</p></div>
              </div>
              <div className="attention-callout">
                <small>NEEDS YOUR ATTENTION</small>
                <strong>Follow up on pricing</strong>
                <b>DUE FRI</b>
              </div>
            </div>
            <span className="float-chip chip-files"><i /> Files · Contract</span>
            <span className="float-chip chip-activity"><i /> Activity</span>
            <p className="visual-caption">One business relationship — everything around it connected.</p>
          </div>
        </section>

        {/* ── Problem ── */}
        <section className="problem-section" id="how">
          <div className="center-title">
            <p className="eyebrow">THE PROBLEM</p>
            <h2>From scattered to seen</h2>
          </div>
          <div className="compare">
            <div>
              <p className="eyebrow">SCATTERED</p>
              <div className="scatter-card">
                {["WhatsApp","Email","Calendar","Spreadsheet","Drive","Notes"].map((x, i) => (
                  <span key={x} className={`scatter-pill scatter-${i}`}><i />{x}</span>
                ))}
              </div>
            </div>
            <Icon name="arrow" size={23} />
            <div>
              <p className="eyebrow teal-copy">ENKEL</p>
              <div className="enkel-card">
                <div><span className="avatar avatar-teal">ML</span><strong>Meridian Labs</strong></div>
                <div className="context-tags">
                  {["Context","Activity","Follow-up","Files","Sales"].map((x) => (
                    <span key={x}><i />{x}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="problem-copy">
            <h2>Your business is already connected. Your tools aren't.</h2>
            <p>Everything about Meridian Labs is real and true — it's just scattered across six places that don't talk to each other. Enkel gives it all one home, so nothing gets missed.</p>
          </div>
        </section>

        {/* ── What you stop tracking ── */}
        <section className="context-section" id="solutions">
          <div>
            <h2>What you stop keeping track of.</h2>
            {[
              "Did I follow up with them?",
              "Where did I save that file?",
              "What did we agree on?",
              "Which invoice is still unpaid?",
              "What did I promise to send?",
            ].map((x) => <p key={x}>"{x}"</p>)}
            <p style={{ fontWeight:600, marginTop:16 }}>Enkel keeps the context close.</p>
          </div>
          <div className="orbit">
            <span className="orbit-center">Enkel</span>
            {["WhatsApp","Email","Calendar","Notes","Spreadsheet","Drive"].map((x, i) => (
              <span key={x} className={`orbit-item orbit-${i}`}>{x}</span>
            ))}
          </div>
        </section>

        {/* ── What Enkel is — and isn't ── */}
        <section style={{ padding:"72px max(10vw, 34px)", borderTop:"1px solid var(--line)" }}>
          <div className="center-title" style={{ marginBottom:32 }}>
            <p className="eyebrow">SAID PLAINLY</p>
            <h2>What Enkel is — and isn't.</h2>
          </div>
          <div className="enkel-is-section">
            <div className="enkel-is-card">
              <h3 className="is-label">ENKEL IS</h3>
              {[
                "A connected place for business context",
                "A way to keep clients, work, activity and follow-ups together",
                "A simple tool for owner-operators and small teams",
                "A place that helps surface what needs attention",
              ].map((t) => (
                <div key={t} className="enkel-is-row">
                  <span className="enkel-is-check">✓</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
            <div className="enkel-is-card">
              <h3 className="not-label">ENKEL IS NOT</h3>
              {[
                "An accounting or tax-filing system",
                "An enterprise CRM",
                "A large-team project-management platform",
              ].map((t) => (
                <div key={t} className="enkel-is-row">
                  <span className="enkel-is-x">×</span>
                  <span style={{ color:"var(--muted)" }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust signals */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginTop:24 }}>
            {[
              { title:"Early access", body:"Enkel is being built openly with small businesses and real workflows in mind." },
              { title:"Your data, your business", body:"Nothing about your business is shared to make the product look more impressive than it is." },
            ].map((c) => (
              <div key={c.title} style={{ padding:"20px 24px", border:"1px solid var(--line)", borderRadius:12 }}>
                <p style={{ fontWeight:600, margin:"0 0 6px" }}>{c.title}</p>
                <p style={{ color:"var(--muted)", fontSize:13, margin:0 }}>{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Principles ── */}
        <section className="principles">
          <div className="center-title">
            <p className="eyebrow orange-copy">WHY ENKEL</p>
            <h2>Four principles, not fifty features.</h2>
            <p>Everything above comes down to this.</p>
          </div>
          {[
            ["01","Simple by design",      "Useful before setup."],
            ["02","Connected by default",   "Clients, work, files and money stay together."],
            ["03","Built around real work",  "Designed for owner-operators and small teams."],
            ["04","Attention that helps",    "See what needs action without hunting for it."],
          ].map(([n, t, d]) => (
            <details key={n} open={n === "01"}>
              <summary><span>{n}</span><strong>{t}</strong><b>⌄</b></summary>
              <p>{d}</p>
            </details>
          ))}
        </section>

        {/* ── CTA ── */}
        <section className="landing-cta" id="pricing">
          <h2>Run your business. Not your software.</h2>
          <p>
            Less to remember. Less to search for. Less to chase.<br />
            <strong>More context. More clarity. More time for the actual work.</strong>
          </p>
          <Button onClick={enterApp}>Get Started</Button>
          <small>Start with your name and email. Everything else can wait.</small>
          <p style={{ color:"var(--faint)", fontSize:12, margin:"8px 0 0" }}>Built with small businesses. Designed around real work.</p>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div>
          <Logo />
          <p>One place to see what your small business<br />needs, today.</p>
          <p style={{ marginTop:16, fontSize:11 }}>© 2026 Enkel.</p>
        </div>
        <div className="footer-links">
          <div>
            <span>PRODUCT</span>
            <button onClick={() => scrollTo("home")}>Home</button>
            <button onClick={() => scrollTo("how")}>How Enkel Works</button>
            <button onClick={() => scrollTo("solutions")}>Solutions</button>
            <button onClick={() => scrollTo("pricing")}>Pricing</button>
          </div>
          <div>
            <span>COMPANY</span>
            <button>About</button>
            <button>Contact</button>
          </div>
          <div>
            <span>LEGAL</span>
            <button>Privacy</button>
            <button>Terms</button>
          </div>
          <div>
            <span>ACCOUNT</span>
            <button onClick={enterApp}>Log in</button>
            <button className="orange-copy" onClick={enterApp}>Start using Enkel</button>
          </div>
        </div>
      </footer>    </div>
  );
}
