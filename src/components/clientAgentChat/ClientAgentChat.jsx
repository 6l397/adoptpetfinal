"use client";

import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import styles from "./clientAgentChat.module.css";

const ClientAgentChat = () => {
  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Привіт! Я AI-помічник AdoptPet. Опишіть, яку тваринку шукаєте, і я пораджу варіанти з каталогу.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setLoading(true);

    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setMessages((prev) => [...prev, { role: "assistant", text: data.answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Вибачте, зараз не вдалося отримати рекомендацію. Спробуйте ще раз.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.header}>
            <div>
              <h3>AI-помічник</h3>
              <p>Допоможу обрати тваринку</p>
            </div>

            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          <div className={styles.messages}>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={
                  msg.role === "user"
                    ? styles.userMessage
                    : styles.assistantMessage
                }
              >
                <ReactMarkdown
                  components={{
                    a: ({ href, children }) => {
                      if (href?.startsWith("/")) {
                        return (
                          <Link href={href} className={styles.chatLink}>
                            {children}
                          </Link>
                        );
                      }

                      return (
                        <a href={href} target="_blank" rel="noreferrer" className={styles.chatLink}>
                          {children}
                        </a>
                      );
                    },
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
            ))}

            {loading && (
              <div className={styles.assistantMessage}>
                Думаю над рекомендацією...
              </div>
            )}
          </div>

          <div className={styles.inputRow}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Наприклад: хочу маленького котика"
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />

            <button type="button" onClick={sendMessage} disabled={loading}>
              ➤
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        className={styles.floatingButton}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {isOpen ? "×" : "💬"}
      </button>
    </>
  );
};

export default ClientAgentChat;