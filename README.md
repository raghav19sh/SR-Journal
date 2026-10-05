# SR Journal

Private, video-first journaling for Android and iOS.

## Stage 1

Stage 1 is local-first by design:
- Monthly calendar journal
- Record video with camera + microphone
- Store journal metadata in local SQLite
- Store recorded video locally on the device
- Review and play entries
- Delete entries and their local video files
- No account
- No cloud upload
- No analytics or advertising

Cloud backup is intentionally deferred to a later stage.

## Development

Requires the Node.js version supported by the selected Expo SDK.

    npm install
    npx expo start

## Security direction

The application is being designed with a local-first threat model. Never commit secrets, credentials, signing keys, or user journal data.

Future stages will add encrypted local key management, biometric app lock, optional private cloud backup, strict authorization/RLS, signed URLs, and security testing.
