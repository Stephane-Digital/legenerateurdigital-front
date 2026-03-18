"use client";

import * as React from "react";

type Msg = { id: string; role: "user" | "assistant"; content: string };

export default function CoachChat({
  messages,
  sending,
  onSend,
}: {
  messages: Msg[];
  sending: boolean;
  onSend: (text: string) => void;
}) {
  const [text, setText] = React.useState("");
  const listRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, sending]);

  return (
    <div className="mt-3 flex h-[520px] flex-col rounded-2xl border border-[#2a2416] bg-black/20">
      <div ref={listRef} className="flex-1 space-y-3 overflow-auto p-4">
        {messages.length === 0 ? (
          <div className="text-sm text-white/40">Pose ta question à Alex, Stéphane…</div>
        ) : null}

        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={
                m.role === "user"
                  ? "max-w-[85%] rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/85"
                  : "max-w-[85%] rounded-2xl border border-[#2a2416] bg-[#14100a]/60 px-4 py-3 text-sm text-white/85"
              }
            >
              {m.content}
            </div>
          </div>
        ))}

        {sending ? (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl border border-[#2a2416] bg-[#14100a]/60 px-4 py-3 text-sm text-white/60">
              Alex réfléchit…
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-2 border-t border-[#2a2416] p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Pose ta question à Alex, Stéphane…"
          className="h-10 flex-1 rounded-xl border border-[#2a2416] bg-black/30 px-3 text-sm text-white/85 outline-none placeholder:text-white/35"
        />
        <button
          disabled={sending || !text.trim()}
          onClick={() => {
            const v = text.trim();
            if (!v) return;
            setText("");
            onSend(v);
          }}
          className="h-10 rounded-xl bg-yellow-400 px-4 text-sm font-semibold text-black disabled:opacity-50"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}
