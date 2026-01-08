import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// const API_BASE = "https://whatsapp-api.onrender.com";
const API_BASE = "http://localhost:4000"; // Keep local for debugging per user flow

export default function Whatsapp() {
    const [connected, setConnected] = useState(false);
    const [qr, setQr] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [number, setNumber] = useState("");
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                // 1. Check if connected
                const statusRes = await fetch(`${API_BASE}/api/status`);
                const statusData = await statusRes.json();

                if (statusData.connected) {
                    setConnected(true);
                    setQr(null);
                    setLoading(false);
                } else {
                    setConnected(false);
                    // 2. If not connected, poll for QR
                    const qrRes = await fetch(`${API_BASE}/api/qr`);
                    const qrData = await qrRes.json();

                    if (qrData.status === "qr") {
                        setQr(qrData.qr);
                    } else if (qrData.status === "connected") {
                        setConnected(true);
                    }
                    setLoading(false);
                }
            } catch (error) {
                console.error("Connection Error:", error);
                setLoading(false);
            }
        };

        const interval = setInterval(checkStatus, 1000); // 1s polling
        return () => clearInterval(interval);
    }, []);

    const handleSendMessage = async () => {
        if (!number || !message) {
            toast.error("Please enter number and message");
            return;
        }
        setSending(true);
        try {
            const res = await fetch(`${API_BASE}/api/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ number, message })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Message Sent! 🚀");
                setMessage("");
            } else {
                toast.error("Failed to send: " + data.error);
            }
        } catch (error) {
            toast.error("Network Error");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center animate-fade-in">
            <div className="w-full max-w-md p-8 glass-card rounded-3xl shadow-soft-lg border-white/40 space-y-8">

                <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    WhatsApp Automation
                </h2>

                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    </div>
                ) : connected ? (
                    <div className="space-y-6 animate-scale-in">
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-center gap-2 text-green-600 font-bold">
                            <CheckCircle2 className="w-6 h-6" />
                            <span>Connected & Ready</span>
                        </div>

                        <div className="space-y-4 text-left">
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground uppercase">Phone Number</label>
                                <input
                                    className="w-full p-3 rounded-xl border bg-white/50 focus:ring-2 ring-primary/20 outline-none"
                                    placeholder="e.g. 919876543210"
                                    value={number}
                                    onChange={e => setNumber(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-muted-foreground uppercase">Message</label>
                                <textarea
                                    className="w-full p-3 rounded-xl border bg-white/50 focus:ring-2 ring-primary/20 outline-none min-h-[100px]"
                                    placeholder="Type your message..."
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={handleSendMessage}
                                disabled={sending}
                                className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-soft hover:shadow-soft-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                Send Message
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 animate-slide-in">
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-600 font-medium text-sm">
                            Scan QR with WhatsApp to Link
                        </div>
                        {qr ? (
                            <img src={qr} alt="QR Code" className="w-64 h-64 mx-auto object-contain rounded-xl border-4 border-white shadow-md" />
                        ) : (
                            <div className="w-64 h-64 mx-auto flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                                <Loader2 className="w-8 h-8 animate-spin text-slate-400 mb-2" />
                                <span className="text-xs text-slate-400">Waiting for QR...</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
