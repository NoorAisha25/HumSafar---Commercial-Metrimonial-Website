import { useEffect, useRef, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import AppNavbar from "../components/AppNavbar";
import EmptyState from "../components/EmptyState";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

function fallbackAvatar(name = "U") {
  return `https://ui-avatars.com/api/?background=241717&color=e15a63&name=${encodeURIComponent(name)}`;
}

export default function Messages() {
  const { user } = useAuth();
  const { socket, connected } = useSocket();

  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef(null);

  // Load real chat contacts (people you have a mutual/accepted interest with)
  useEffect(() => {
    api
      .matches()
      .then((list) => {
        setContacts(list);
        if (list.length > 0) setActive(list[0]._id);
      })
      .catch(() => {})
      .finally(() => setLoadingContacts(false));
  }, []);

  // Load message history whenever the active conversation changes
  useEffect(() => {
    if (!active) return;
    setLoadingThread(true);
    api
      .messageHistory(active)
      .then(setMessages)
      .catch(() => setMessages([]))
      .finally(() => setLoadingThread(false));
  }, [active]);

  // Listen for real-time incoming messages
  useEffect(() => {
    if (!socket) return;
    function onNew(message) {
      const otherId = message.from === user?._id ? message.to : message.from;
      if (otherId === active) {
        setMessages((prev) => [...prev, message]);
      }
    }
    socket.on("message:new", onNew);
    return () => socket.off("message:new", onNew);
  }, [socket, active, user?._id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function send() {
    if (!draft.trim() || !active || !socket) return;
    // Don't append here — the server broadcasts "message:new" to the
    // sender's own room too (so other tabs/devices stay in sync), and the
    // listener below already appends it. Appending in both places is what
    // caused messages to show up twice on the sender's side.
    socket.emit("message:send", { to: active, text: draft });
    setDraft("");
  }

  const activeContact = contacts.find((c) => c._id === active);

  return (
    <div>
      <AppNavbar />
      <div className="wrap grid grid-cols-1 gap-6 py-10 md:grid-cols-[300px_1fr]">
        <aside className="space-y-2">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="font-display text-2xl font-semibold">Messages</h1>
            <span
              className={`h-2 w-2 rounded-full ${connected ? "bg-emerald-400" : "bg-border"}`}
              title={connected ? "Live" : "Connecting..."}
            />
          </div>

          {loadingContacts && (
            <div className="flex items-center gap-2 py-8 text-sm text-muted">
              <Loader2 className="animate-spin" size={16} /> Loading conversations...
            </div>
          )}

          {!loadingContacts && contacts.length === 0 && (
            <EmptyState
              compact
              title="No conversations yet"
              desc="Once an interest is mutually accepted, you can chat here in real time."
            />
          )}

          {contacts.map((c) => (
            <button
              key={c._id}
              onClick={() => setActive(c._id)}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
                active === c._id ? "border-rose bg-surface-2" : "border-border/60 hover:border-rose/40"
              }`}
            >
              <img
                src={c.photos?.[0]?.url || fallbackAvatar(c.firstName)}
                alt={c.firstName}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {c.firstName} {c.lastName}
                </p>
                <p className="truncate text-xs text-muted">{c.isOnline ? "Online" : "Offline"}</p>
              </div>
            </button>
          ))}
        </aside>

        <section className="flex h-[70vh] flex-col rounded-2xl border border-border/60 bg-surface">
          {!activeContact ? (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState
                title="Select a conversation"
                desc="Real-time chat unlocks once you and another member accept each other's interest."
              />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b border-border/60 p-4">
                <img
                  src={activeContact.photos?.[0]?.url || fallbackAvatar(activeContact.firstName)}
                  alt={activeContact.firstName}
                  className="h-9 w-9 rounded-full object-cover"
                />
                <div>
                  <p className="font-display font-semibold">
                    {activeContact.firstName} {activeContact.lastName}
                  </p>
                  <p className="text-xs text-muted">{activeContact.isOnline ? "Online now" : "Offline"}</p>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                {loadingThread && (
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <Loader2 className="animate-spin" size={16} /> Loading messages...
                  </div>
                )}
                {!loadingThread && messages.length === 0 && (
                  <p className="text-center text-sm text-muted">
                    Say a respectful hello to start the conversation.
                  </p>
                )}
                {messages.map((m, i) => (
                  <div
                    key={m._id || i}
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                      m.from === user?._id ? "ml-auto bg-rose text-white" : "bg-surface-2 text-cream"
                    }`}
                  >
                    {m.text}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 border-t border-border/60 p-4">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Type a respectful message..."
                  className="input"
                />
                <button
                  onClick={send}
                  disabled={!connected}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose text-white hover:bg-rose-dark disabled:opacity-50"
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
