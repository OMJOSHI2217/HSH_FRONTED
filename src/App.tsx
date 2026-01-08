import { useEffect, useState } from "react";

const API = "https://whatsapp-api.onrender.com";

export default function App() {
  const [userId, setUserId] = useState("");
  const [qr, setQr] = useState(null);
  const [status, setStatus] = useState("");
  const [number, setNumber] = useState("");
  const [message, setMessage] = useState("");

  const startSession = async () => {
    await fetch(`${API}/api/session/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    });
  };

  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(async () => {
      const res = await fetch(`${API}/api/qr/${userId}`);
      const data = await res.json();
      setStatus(data.status);
      if (data.qr) setQr(data.qr);
    }, 3000);

    return () => clearInterval(interval);
  }, [userId]);

  const sendMessage = async () => {
    await fetch(`${API}/api/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, number, message })
    });
    alert("Message sent!");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>WhatsApp Automation</h2>

      <input
        placeholder="Enter User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <button onClick={startSession}>Start Session</button>

      <h3>Status: {status}</h3>

      {qr && <img src={qr} alt="QR Code" width={250} />}

      <hr />

      <input
        placeholder="Phone Number"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
      />
      <input
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send Message</button>
    </div>
  );
}
