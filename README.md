# UniSync - Find Your University Duo

A full-stack web application for university students to find their perfect duo (study partner, friend, or connection) based on their qualities and niche.

## Features

- **Landing Page** - Beautiful hero section with app features and partnership information
- **Partnership Box** - Displayed on landing page for users interested in purchasing website shares
- **Student Registration** - Sign up with personal details, university info, profile image, and reason to join
- **Fake Details Warning** - Prominent warning on signup to maintain community trust
- **Email OTP Verification** - Secure signup and login with 6-digit email OTP
- **Left Sidebar Dashboard** - Desktop-optimized navigation with Dashboard, Find Matches, and Profile links
- **Find Matches** - Browse and search students by university, department, and qualities
- **Request System** - Send connection requests; chat unlocks only after acceptance
- **In-App Chat** - Real-time messaging via Socket.io between accepted matches
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS + Lucide React Icons + Socket.io Client
- **Backend**: Node.js + Express + Socket.io
- **Database**: SQLite
- **Auth**: JWT + Email OTP (Nodemailer)
- **Real-time Chat**: Socket.io

## Project Structure

```
unisync/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Navbar, LeftSidebar, PartnershipBox, WarningNote
│   │   ├── context/        # AuthContext
│   │   ├── pages/          # Landing, Signup, VerifyEmail, Login, Dashboard, Profile, Matches, Chat
│   │   ├── App.jsx         # Main routing
│   │   └── main.jsx        # Entry point
│   └── package.json
│
├── server/                 # Node.js Backend
│   ├── routes/             # auth, profile, match, chat APIs
│   ├── middleware/         # JWT auth middleware
│   ├── database.js         # SQLite schema
│   ├── server.js           # Express + Socket.io entry
│   ├── .env                # Environment variables
│   └── package.json
│
└── README.md
```

## Setup Instructions

### 1. Install Backend Dependencies

```bash
cd unisync/server
npm install
```

### 2. Install Frontend Dependencies

Open a new terminal:
```bash
cd unisync/client
npm install
```

### 3. Configure Email (Optional)

The app works without email configuration - OTPs will be logged to the console.

To enable real email OTP, edit `server/.env` with your Gmail credentials:
```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 4. Start the Backend

```bash
cd unisync/server
npm run dev
```
Server runs at `http://localhost:3001`

### 5. Start the Frontend

Open a new terminal:
```bash
cd unisync/client
npm run dev
```
Frontend runs at `http://localhost:5173`

## How It Works

1. **Sign Up** - Create your account with university details and profile picture
2. **Verify Email** - Enter the 6-digit OTP sent to your email (mock mode shows OTP in server console)
3. **Login** - Enter email/password, then verify with OTP
4. **Find Matches** - Browse students and send connection requests
5. **Accept Requests** - Review and accept incoming requests
6. **Chat** - Once accepted, start real-time messaging with your matches

## API Endpoints

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/send-otp` | POST | Send email OTP |
| `/api/auth/verify-otp` | POST | Verify email OTP |
| `/api/auth/login-request` | POST | Login step 1 - send OTP |
| `/api/auth/verify-login-otp` | POST | Login step 2 - verify OTP |
| `/api/auth/me` | GET | Get current user |
| `/api/profile/me` | GET/PUT | Get/update profile |
| `/api/profile/users` | GET | Get all users for matching |
| `/api/match/request` | POST | Send connection request |
| `/api/match/accept/:id` | POST | Accept request |
| `/api/match/reject/:id` | POST | Reject request |
| `/api/match/my-requests` | GET | Get sent requests |
| `/api/match/requests-for-me` | GET | Get received requests |
| `/api/match/my-matches` | GET | Get accepted matches |
| `/api/messages/:requestId` | GET/POST | Get/send messages |

## License

MIT
