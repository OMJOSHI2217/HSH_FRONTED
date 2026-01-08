import { useEffect, useState } from "react";

const API_BASE = "https://whatsapp-api.onrender.com";

export default function Whatsapp() {
    const [userId, setUserId] = useState("harshil");
    const [qr, setQr] = useState(null);
    const [status, setStatus] = useState("");
    const [number, setNumber] = useState("");
    const [message, setMessage] = useState("");

    const startSession = async () => {
        await fetch(`${API_BASE}/api/session/start`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: "harshil" })
        });
    };

    useEffect(() => {
        const fetchQR = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/qr/harshil`);
                if (!res.ok) throw new Error(`Server Error: ${res.status}`);

                const data = await res.json();
                setStatus(data.status); // waiting, connected, or qr
                if (data.qr) setQr(data.qr);
            } catch (error) {
                console.error("Poll Error:", error);
                setStatus("Error: Server Offline or Unreachable");
            }
        };

        const interval = setInterval(fetchQR, 3000);
        return () => clearInterval(interval);
    }, []);

    const sendMessage = async () => {
        await fetch(`${API_BASE}/api/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: "harshil",
                number: "91XXXXXXXXXX",
                message: "Hello from my PWA 🚀"
            })
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
