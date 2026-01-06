
interface WhatsAppStatus {
    connected: boolean;
    phone?: string;
    userName?: string;
}

interface ConnectResponse {
    status: 'qr' | 'connected' | 'loading';
    qrCode?: string;
    message?: string;
    user?: WhatsAppStatus;
}

export const WhatsAppService = {
    async getStatus(): Promise<WhatsAppStatus> {
        const res = await fetch('/api/whatsapp/status');
        return res.json();
    },

    async connect(): Promise<ConnectResponse> {
        const res = await fetch('/api/whatsapp/connect');
        return res.json();
    },

    async verifyNumber(number: string): Promise<{ registered: boolean; jid?: string }> {
        const res = await fetch('/api/whatsapp/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ number })
        });
        if (!res.ok) throw new Error('Verification failed');
        return res.json();
    },

    async sendMessage(to: string | string[], message: string) {
        const res = await fetch('/api/whatsapp/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to, message })
        });
        return res.json();
    },

    async restart() {
        const res = await fetch('/api/whatsapp/regenerate', { method: 'POST' });
        return res.json();
    }
};
