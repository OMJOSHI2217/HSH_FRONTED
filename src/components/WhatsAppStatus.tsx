import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { WhatsAppService } from '@/lib/whatsapp';
import { Loader2, Smartphone, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface WhatsAppStatusProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    hideTrigger?: boolean;
}

export const WhatsAppStatus = ({ open, onOpenChange, hideTrigger = false }: WhatsAppStatusProps = {}) => {
    const [status, setStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading');
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [isOpenInternal, setIsOpenInternal] = useState(false);

    const isEffectiveOpen = open !== undefined ? open : isOpenInternal;
    const handleOpenChange = onOpenChange || setIsOpenInternal;

    // We also need to sync internal state if external open changes (optional, but handled by isEffectiveOpen logic)
    const [userInfo, setUserInfo] = useState<{ phone?: string, userName?: string } | null>(null);

    const checkStatus = async () => {
        try {
            const data = await WhatsAppService.getStatus();
            if (data.connected) {
                setStatus('connected');
                setUserInfo({ phone: data.phone, userName: data.userName });
                setQrCode(null);
            } else {
                setStatus('disconnected');
            }
        } catch (error) {
            console.error(error);
            setStatus('disconnected');
        }
    };

    const handleConnect = async () => {
        try {
            setStatus('loading');
            const res = await WhatsAppService.connect();

            if (res.status === 'connected') {
                setStatus('connected');
                setQrCode(null);
                toast.success("WhatsApp already connected");
            } else if (res.status === 'qr' && res.qrCode) {
                setQrCode(res.qrCode);
                setStatus('disconnected'); // Waiting for scan
            } else if (res.status === 'loading') {
                toast.info("Generating QR Code...");
                // Poll again shortly
                setTimeout(handleConnect, 2000);
            }
        } catch (error) {
            toast.error("Failed to connect to WhatsApp Server");
            setStatus('disconnected');
        }
    };

    const [timeLeft, setTimeLeft] = useState(120);

    // Timer logic
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isEffectiveOpen && qrCode && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && qrCode) {
            // Time expired, regenerate
            handleRegenerate();
        }
        return () => clearInterval(timer);
    }, [isEffectiveOpen, qrCode, timeLeft]);

    const handleRegenerate = async () => {
        setQrCode(null);
        setStatus('loading');
        setTimeLeft(120);
        try {
            await WhatsAppService.restart();
            // Poll will pick up new QR
        } catch (e) {
            console.error("Failed to regenerate", e);
        }
    };

    // Poll for status when QR is shown
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isEffectiveOpen && qrCode) {
            interval = setInterval(checkStatus, 3000);
        } else if (isEffectiveOpen) {
            checkStatus();
        }
        return () => clearInterval(interval);
    }, [isEffectiveOpen, qrCode]);

    return (
        <Dialog open={isEffectiveOpen} onOpenChange={handleOpenChange}>
            {!hideTrigger && (
                <DialogTrigger asChild>
                    <Button variant={status === 'connected' ? "outline" : "default"}
                        className={status === 'connected' ? "border-green-500 text-green-600 hover:bg-green-50" : "bg-green-600 hover:bg-green-700 data-[state=open]:bg-green-700"}>
                        <Smartphone className="w-4 h-4 mr-2" />
                        {status === 'connected' ? 'WA Connected' : 'Connect WhatsApp'}
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>WhatsApp Connection</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-6 space-y-4">
                    {status === 'loading' && (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p>Connecting to server...</p>
                        </div>
                    )}

                    {status === 'connected' ? (
                        <div className="flex flex-col items-center gap-4 text-center animate-in fade-in zoom-in">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Connected!</h3>
                                {userInfo?.userName && <p className="text-muted-foreground">Logged in as {userInfo.userName}</p>}
                                {userInfo?.phone && <p className="text-sm text-muted-foreground">{userInfo.phone}</p>}
                            </div>
                            <Button variant="outline" onClick={() => handleOpenChange(false)}>Close</Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4 w-full">
                            {!qrCode ? (
                                <div className="text-center space-y-4">
                                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                                        <AlertCircle className="w-8 h-8 text-orange-600" />
                                    </div>
                                    <p>WhatsApp is disconnected.</p>
                                    <Button onClick={handleConnect}>Generate QR Code</Button>
                                </div>
                            ) : (
                                <div className="space-y-4 text-center">
                                    <div className="p-4 bg-white border rounded-xl shadow-sm inline-block relative">
                                        {qrCode?.startsWith('data:image') ? (
                                            <img src={qrCode} alt="WhatsApp QR Code" className="w-[200px] h-[200px]" />
                                        ) : (
                                            <QRCode value={qrCode || ''} size={200} />
                                        )}
                                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full border shadow-sm text-sm font-mono font-bold text-primary">
                                            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}s
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Open WhatsApp &gt; Settings &gt; Linked Devices &gt; Link a Device</p>
                                    <p className="text-xs text-muted-foreground/50">Code expires in {timeLeft} seconds</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
