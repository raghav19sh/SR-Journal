# SR Journal — Stages 2–5

## Stage 2 — Security
- SQLCipher-backed local SQLite database.
- Per-install 256-bit database key stored in SecureStore.
- Biometric app lock with device fallback.
- Cryptographically random 128-bit entry identifiers.
- SQLite WAL + secure_delete.
- SecureStore Android backup configuration.
- No secrets committed to source control.

SQLCipher requires a development/release native build; Expo Go does not support SQLCipher.

## Stage 3 — Journal
- Rich entry metadata: title, notes, tags, mood, favorites.
- Local search over titles, notes, tags and transcripts.
- Editable entry details.
- Multiple entries per day.
- Yearly recap statistics.

## Stage 4 — Optional cloud
- Supabase Auth integration.
- Private journal_entries table.
- RLS keyed strictly to auth.uid().
- Private Storage bucket with per-user object paths.
- Signed URLs instead of public video URLs.
- Opt-in backup architecture.

Never put a Supabase service-role key in the mobile app. The app uses only the publishable/anon key.

## Stage 5 — Premium
- Premium surface and entitlement-ready product architecture.
- Private cloud backup.
- Yearly recap.
- Server-side transcription with a Supabase Edge Function and OpenAI transcription model.
- Server-side AI summaries through a Supabase Edge Function.
- Planned semantic search and subscription storage tiers.
- Store subscription wiring is intentionally release-stage because product IDs, Play/App Store billing, and server-side entitlement verification require the store accounts.

## Release gate
1. Native development build.
2. Real Android + iPhone SQLCipher and biometric testing.
3. Supabase migration and RLS testing with two accounts.
4. Upload/download/delete and offline testing.
5. Configure billing product IDs and server-side entitlement verification.
6. Set Supabase Edge Function secrets for the AI functions (OPENAI_API_KEY and Supabase service-role configuration).
6. Privacy policy, account/data deletion, backup disclosure and store metadata.
7. Security and dependency audits.
