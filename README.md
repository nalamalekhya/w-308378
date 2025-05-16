# 🌊 EchoVerse: Your Time Capsule for Voice Memories

![EchoVerse Banner](https://via.placeholder.com/1200x300/4F46E5/FFFFFF?text=EchoVerse)

EchoVerse is a modern web application that allows users to record audio messages, store them as time capsules, and unlock them at a future date. It's a digital way to capture moments, thoughts, and feelings that you can revisit later.

## 🚀 Features

- **Voice Recording**: Easily record audio messages with a simple interface
- **Time Capsules**: Set a future date when your recording will be unlocked
- **Mood Tracking**: Tag your recordings with different moods to capture your emotional state
- **Timeline View**: Browse your recordings in a calendar or list view
- **Reflections**: Add written reflections to your unlocked recordings
- **User Profiles**: Personalize your account with profile information
- **Dark/Light Mode**: Toggle between dark and light themes for comfortable viewing
- **Responsive Design**: Works seamlessly on both desktop and mobile devices

## 💻 Tech Stack

### Frontend
- **React**: UI library for building the user interface
- **TypeScript**: For type-safe code
- **Vite**: Fast build tool and development server
- **React Router**: For application routing
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Shadcn UI**: Component library built on Radix UI
- **Lucide Icons**: Beautiful, consistent icon set
- **React Hook Form**: For form handling and validation
- **Zod**: Schema validation library
- **React Query**: For data fetching and state management

### Backend
- **Supabase**: Backend-as-a-Service platform providing:
  - **Authentication**: User sign-up, login, and session management
  - **PostgreSQL Database**: For storing user data, recordings, and reflections
  - **Storage**: For storing audio files
  - **Row Level Security**: For data protection and privacy

## 🏗️ Project Structure

```
voice11/
├── src/                    # Source code
│   ├── components/         # Reusable UI components
│   │   ├── auth/           # Authentication components
│   │   ├── onboarding/     # User onboarding components
│   │   └── ui/             # UI component library
│   ├── hooks/              # Custom React hooks
│   ├── integrations/       # External service integrations
│   │   └── supabase/       # Supabase client and utilities
│   ├── lib/                # Utility libraries
│   ├── pages/              # Application pages
│   └── utils/              # Helper functions
├── supabase/               # Supabase configuration
│   ├── migrations/         # Database migrations
│   └── storage_setup.sql   # Storage bucket setup
└── public/                 # Static assets
```

## 📊 Database Schema

### Tables

1. **profiles**
   - User profile information
   - Fields: id, email, first_name, last_name, bio, last_login, created_at

2. **echoes**
   - Voice recordings (time capsules)
   - Fields: id, user_id, title, audio_url, duration, mood, unlock_date, unlocked, created_at

3. **reflections**
   - User reflections on unlocked recordings
   - Fields: id, user_id, echo_id, content, created_at

## 🔒 Security

EchoVerse implements robust security measures:

- **Row Level Security (RLS)**: Ensures users can only access their own data
- **Secure Authentication**: Powered by Supabase Auth
- **Storage Policies**: Controls who can upload and access audio files

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or bun package manager
- Supabase account (for backend services)

### Installation

```bash

# Install dependencies
npm install
# or with bun
bun install

# Set up environment variables
# Create a .env file based on .env.example

# Start the development server
npm run dev
# or with bun
bun run dev
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📱 Application Pages

### 🏠 Landing Page
Introduces new users to EchoVerse and its features.

### 🔐 Auth Page
Handles user authentication (login, signup, password reset).

### 👋 Welcome Page
Onboards new users after registration.

### 📊 Dashboard
Displays user statistics and recently recorded echoes.

### 📅 Timeline Page
Browse recordings in a calendar or list view with filtering options.

### 🎙️ Record Page
Interface for creating new voice recordings with metadata.

### 👤 Profile Page
Manage user profile information.

### ⚙️ Settings Page
Adjust application settings and preferences.

### 🔊 Audio Player Page
Listen to unlocked recordings and add reflections.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

For any questions or feedback, please reach out to [your-email@example.com](mailto:your-email@example.com).


## What technologies are used for this project?

# Voice11 - Voice Journaling App

A modern voice journaling application built with React, TypeScript, Vite, and Supabase.

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/e953f31b-5af2-4620-942a-c581547a62df) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
