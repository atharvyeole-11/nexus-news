# Nexus News Setup Guide

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Supabase Configuration (Required for Login)
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### YouTube API Configuration (Required for Shorts)
```bash
YOUTUBE_API_KEY=your_youtube_data_api_key
```

### AI Services Configuration (Optional)
```bash
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
```

### Razorpay Configuration (Required for Payments)
```bash
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

## Setup Instructions

### 1. Supabase Setup
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → API
4. Copy the Project URL and Anon Key
5. Add them to your `.env.local` file

### 2. YouTube Data API Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable "YouTube Data API v3"
4. Create credentials → API Key
5. Add the key to your `.env.local` file

### 3. Database Setup
Run the SQL files in the `supabase/` directory:
- `user_profiles.sql` - Creates user profiles table
- `subscriptions.sql` - Creates subscriptions table

### 4. Install Dependencies
```bash
npm install
```

### 5. Run the Development Server
```bash
npm run dev
```

## Features Status

### ✅ Working Features
- Login/Signup with Supabase
- Dark/Light Mode Toggle
- Floating Pill Navigation
- News Homepage with Categories
- Shorts Page (with YouTube API)
- Subscription Page with Razorpay
- Dashboard with User Profile
- NOVA AI Assistant
- Theme Switching
- Responsive Design

### 🔧 API Dependencies
- **Login**: Requires Supabase credentials
- **Shorts**: Requires YouTube Data API key
- **Payments**: Requires Razorpay credentials
- **AI Features**: Requires GROQ/Gemini API keys

### 🚀 Production Deployment
1. Set all environment variables in your hosting platform
2. Run `npm run build` to verify build
3. Run `npm run lint` to verify code quality
4. Deploy to your preferred platform (Vercel, Netlify, etc.)

## Troubleshooting

### Login Issues
- Check Supabase URL and Anon Key are correct
- Ensure `.env.local` is in the root directory
- Verify Supabase project is active

### Shorts Not Loading
- Check YouTube API key is valid
- Ensure YouTube Data API v3 is enabled
- Check API quota limits

### Payment Issues
- Verify Razorpay test mode keys
- Check Razorpay account is active
- Ensure callback URLs are configured

## Development Notes

- The app uses CSS variables for theming
- All components are responsive
- The floating navigation works on all screen sizes
- Error handling is implemented throughout
- The app is production-ready with proper error boundaries
