# backfill_user_verification

One-shot migration that consolidates the `userVerification` collection so
each user owns exactly one top-level doc at `userVerification/{uid}`, with
prior attempts archived under `userVerification/{uid}/attempts/{dateAddedMs}`.

This script uses the Firebase Admin SDK and **bypasses Firestore security
rules**, so you do not need the new rules deployed to run it. But you should
run the sequence in this order:

1. Deploy the rule change in `firestore.rules` (owner self-update + `attempts`
   subcollection).
2. Run this backfill (dry run first, then apply).
3. Release the Flutter build that now writes to `userVerification/{uid}`
   directly and archives into `attempts/`.

Flipping 1 and 3 would mean end users write to `attempts/` before the rule
allows it — app-side writes would fail. The Admin SDK migration is unaffected
either way.

## Run

```bash
cd scripts/backfill_user_verification
npm install

# Service account for the target Firebase project.
export GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json

# Dry run (default — prints plan, writes nothing).
npm run dry

# When the dry run output looks correct:
npm run apply
```

## What it does

For every top-level doc in `userVerification`:

1. Group docs by their `uid` field.
2. Sort each group newest-first by `dateAdded`.
3. Keep the newest doc as canonical at `userVerification/{uid}`. If the
   canonical currently lives at a random auto-ID, copy it to the UID path and
   delete the original.
4. Each older doc in the group → `userVerification/{uid}/attempts/{dateAddedMs}`,
   then delete the original.

Idempotent — users already in the target shape are skipped.

## Notes

- Docs without a `uid` field are skipped and logged.
- If two attempts share the same `dateAdded` millisecond (unlikely), the
  second archive write would collide. The script uses the legacy doc ID as a
  fallback key only when `dateAdded` is missing entirely; otherwise the
  millisecond timestamp is the key. Re-runs are safe because archived docs
  live under `attempts/` and the script only reads top-level docs.
- Batches are capped at 450 writes to stay under Firestore's 500-op batch
  limit. Very large projects may trigger many commits; the script logs
  progress per user.
- After the migration completes successfully, this entire `scripts/`
  directory can be deleted or moved into `waka_admin`.
