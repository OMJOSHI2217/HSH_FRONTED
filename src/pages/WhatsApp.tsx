import { useNavigate } from 'react-router-dom';
import { Smartphone } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { WhatsAppStatus } from '@/components/WhatsAppStatus';

const WhatsApp = () => {
    return (
        <div className="min-h-screen bg-background pb-20 relative animate-fade-in">
            <AppHeader title="Hostel Hub" />

            <main className="p-4 md:p-6 space-y-8 max-w-5xl mx-auto">
                <div className="space-y-1">
                    <h2 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                        <Smartphone className="w-8 h-8 text-primary" />
                        WhatsApp Verification
                    </h2>
                    <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Manage Connection and QR Code</p>
                </div>

                <div className="flex flex-col items-center justify-center p-8 bg-white border border-border/50 rounded-3xl shadow-soft min-h-[400px]">
                    <div className="max-w-md w-full text-center space-y-8">
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold">Connection Status</h3>
                            <p className="text-muted-foreground">Scan the QR code to connect the automation bot.</p>
                        </div>

                        {/* We pass open={true} to force the content to be visible, 
                            but wait, WhatsAppStatus acts as a Dialog. 
                            We want it embedded or just the button?
                            The user said "give the section", maybe they want the UI exposed?
                            
                            Re-reading WhatsAppStatus.tsx: It uses a Dialog.
                            If I want it embedded, I need to refactor WhatsAppStatus to export the internal UI
                            or just trigger the dialog automatically or show the button.
                            
                            For now, showing the button is safest, or auto-opening the dialog.
                            Let's show the big button.
                        */}
                        <div className="flex justify-center">
                            <WhatsAppStatus hideTrigger={false} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default WhatsApp;
