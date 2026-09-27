// ─────────────────────────────────────────────────────────────
// AskEnkel.tsx — floating "Ask Enkel" assistant button + modal
// Currently returns a static hardcoded answer as a placeholder.
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { Button, Icon } from "./ui";

// ── Modal backdrop + box ──────────────────────────────────────
function Modal({
  title,
  children,
  close,
}: React.PropsWithChildren<{ title: string; close: () => void }>) {
  return (
    // Clicking the backdrop closes the modal
    <div className="modal-backdrop" onMouseDown={close}>
      {/* Prevent clicks inside the box from closing it */}
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={close}>
          <Icon name="x" />
        </button>
        <p className="eyebrow">ASK ENKEL</p>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}

// ── AskEnkel floating button + modal ─────────────────────────
export default function AskEnkel() {
  const [open,     setOpen]     = useState(false);
  const [question, setQuestion] = useState("");
  const [answer,   setAnswer]   = useState("");

  // Placeholder: returns a static response regardless of the question
  const submit = () => {
    if (!question.trim()) return;
    setAnswer("You have 3 overdue invoices worth ₹99,800. Meridian Labs is the highest-value follow-up due today.");
  };

  return (
    <>
      {/* Floating pill button — fixed bottom right */}
      <button className="ask-pill" onClick={() => setOpen(true)}>
        <Icon name="spark" size={16} /> Ask Enkel <span>⌘ K</span>
      </button>

      {open && (
        <Modal title="What can I help with?" close={() => setOpen(false)}>
          <p className="subtle">Ask across clients, sales, expenses, files and your team's work.</p>

          {/* Question input */}
          <div className="ask-input">
            <input
              autoFocus
              placeholder="What's outstanding this week?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
            <Button onClick={submit}><Icon name="arrow" /></Button>
          </div>

          {/* Answer box */}
          {answer && (
            <div className="answer">
              <Icon name="spark" />
              <p>{answer}</p>
            </div>
          )}

          {/* Suggestion chips */}
          <div className="suggestions">
            <button onClick={() => setQuestion("Which invoices are overdue?")}>
              Which invoices are overdue?
            </button>
            <button onClick={() => setQuestion("Who needs a follow-up?")}>
              Who needs a follow-up?
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
