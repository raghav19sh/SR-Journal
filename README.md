# SR Journal

Private, video-first journaling for Android and iOS.

## Implemented

### Stage 1 — Local-first
- Monthly calendar
- Camera + microphone video journaling
- Local playback
- Day view
- Delete entries and local media

### Stage 2 — Security
- SQLCipher local database
- SecureStore-managed database key
- Biometric app lock
- Cryptographic entry IDs
- Secure SQLite deletion settings

### Stage 3 — Journal
- Titles, notes, tags and mood
- Favorites
- Local journal search
- Multiple entries per day
- Yearly recap statistics

### Stage 4 — Optional cloud
- Supabase email authentication
- Private PostgreSQL metadata
- Row Level Security
- Private Storage bucket
- Signed URLs
- Opt-in upload/download sync

### Stage 5 — Premium foundation
- Premium feature surface
- Private backup
- Yearly recap
- Architecture for transcription, AI summaries/search and storage tiers

## Development

Expo SDK 57 targets React Native 0.86 and requires Node.js 22.13.x or newer within the supported SDK line.

Install:

    npm install

Because Stage 2 enables SQLCipher, use a native development build rather than Expo Go:

    npx expo prebuild
    npx expo run:android

For iOS:

    npx expo prebuild
    npx expo run:ios

## Optional Supabase setup

Copy .env.example to .env and add only the Supabase project URL and publishable/anon key.

Run supabase/schema.sql in the Supabase SQL editor before enabling cloud backup.

Never place a Supabase service-role key, database password, signing key or other server secret in the mobile app.

## Security boundary

The app is designed as local-first and privacy-oriented. SQLCipher protects the local SQLite database and SecureStore protects the database key. Video files remain inside the app private sandbox; media-at-rest encryption is a separate hardening item and must not be represented as E2EE until implemented and independently tested.

Before store release, test native builds, RLS isolation, cloud sync, offline behavior, account deletion, billing entitlements and security controls on real devices.
