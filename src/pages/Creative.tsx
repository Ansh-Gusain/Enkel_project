// ─────────────────────────────────────────────────────────────
// Creative.tsx — Design & Creative campaign generator
//               Step form → generated visual preview
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { Button, Icon, PageHeader } from "../components/ui";

export default function Creative() {
  const [prompt,    setPrompt]    = useState("");
  const [generated, setGenerated] = useState(false);

  return (
    <div className="page creative-page">
      <PageHeader
        kicker="DESIGN & CREATIVE"
        title="Create without the creative bottleneck"
        description="Turn a product and a clear idea into campaign-ready visuals."
      />

      <div className="creative-layout">
        {/* ── Step form (left column) ── */}
        <div className="creative-form">
          {/* Step 1: choose service */}
          <div className="step">
            <span>1</span>
            <div>
              <strong>Choose what to feature</strong>
              <p className="subtle">UI/UX Design · Northline Studio</p>
            </div>
          </div>

          {/* Step 2: describe the creative intent */}
          <div className="step">
            <span>2</span>
            <div className="grow">
              <strong>Describe the creative intent</strong>
              <textarea
                placeholder="A clean launch visual for our product design service..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
          </div>

          {/* Step 3: select format */}
          <div className="step">
            <span>3</span>
            <div>
              <strong>Select format</strong>
              <div className="choice-row">
                <button className="choice active">Square post</button>
                <button className="choice">Story</button>
                <button className="choice">Landscape ad</button>
              </div>
            </div>
          </div>

          <Button disabled={!prompt.trim()} onClick={() => setGenerated(true)}>
            <Icon name="spark" size={16} /> Generate creative
          </Button>
        </div>

        {/* ── Preview (right column) ── */}
        <div className={`creative-preview ${generated ? "is-generated" : ""}`}>
          {generated ? (
            <>
              <span className="preview-brand">NORTHLINE</span>
              <div>
                <small>DESIGN THAT MOVES</small>
                <strong>Ideas into<br />products.</strong>
              </div>
              <span>UI/UX DESIGN</span>
            </>
          ) : (
            <>
              <Icon name="spark" size={30} />
              <strong>Your creative will appear here</strong>
              <small>Choose a service and describe your idea.</small>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
