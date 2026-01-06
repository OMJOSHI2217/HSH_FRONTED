# WhatsApp Integration Walkthrough

## Completed Changes

### Backend Migration
- Created `server/` directory with ES Module support.
- Implemented `server.js` (Express), `client.js` (WhatsApp Web), `routes.js`, and `controllers.js`.
- Added `node-cron` for birthday automation.
- Added `/api/whatsapp/verify` endpoint to check if numbers are registered.
- **[NEW] Added `/api/whatsapp/restart` endpoint to regenerate QR codes.**

### Frontend Integration
- Configured Vite proxy to forward `/api` requests to port 3000.
- Created `WhatsAppService` utility.
- added `WhatsAppStatus` component in `Students` page to manage connection and show QR code.
- Added "Verify" button (Shield Icon) to `StudentListItem` to verify individual students.
- **[NEW] Updated Dropdown Menu**:
    - "Connection Status": View current status.
    - "Generate QR Code": Force a new session.
- **[NEW] QR Timer**: QR Code automatically expires and regenerates after 120 seconds.

## Verification Steps

1.  **Start the Backend**:
    Run `node server/server.js` in a terminal.
    *Output should show "Server running on port 3000" and "Initializing WhatsApp Client..."*

2.  **Start the Frontend**:
    Run `npm run dev` (if not already running).

3.  **Connect WhatsApp**:
    - Go to **Students** page.
    - Click the **Filter Dropdown** ("WhatsApp & Filters").
    - Select **Generate QR Code** to start a fresh session.
    - Watch the countdown timer below the QR code.
    - If it reaches 0, verify that it says "Connecting..." and generates a new code.

4.  **Verify Students**:
    - Find a student with a pending/unverified status.
    - Click the **Orange Shield Icon** next to the phone button.
    - If valid, it turns into a verified checkmark.

## Notes
- The server creates a `.wwebjs_auth` folder to store session data.
- Daily birthday checks run at 9:00 AM.
