/**
 * One-shot migration: consolidate per-user verification docs.
 *
 * Before:  userVerification/{autoId_1}, userVerification/{autoId_2}, ... all
 *          with the same `uid` field (one per rejection retry).
 * After:   userVerification/{uid} holding the newest attempt, plus
 *          userVerification/{uid}/attempts/{dateAddedMs} for each older one.
 *
 * Run ONCE, from the Admin SDK (this bypasses firestore.rules), after the
 * Flutter code change deploys the UID-as-doc-ID write path. Idempotent — safe
 * to re-run (users already consolidated will be skipped).
 *
 * Setup (Node 18+):
 *   npm init -y
 *   npm i firebase-admin ts-node typescript
 *   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
 *
 * Dry run (default — prints plan, writes nothing):
 *   npx ts-node backfill.ts
 *
 * Apply:
 *   DRY_RUN=0 npx ts-node backfill.ts
 */

import * as admin from 'firebase-admin';

const projectId = process.env.FIREBASE_PROJECT_ID;
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  ...(projectId ? { projectId } : {}),
});

const db = admin.firestore();
const DRY_RUN = (process.env.DRY_RUN ?? '1') !== '0';
const BATCH_LIMIT = 450; // Firestore caps batches at 500; leave headroom.

interface VerificationDoc {
  docId: string;
  data: FirebaseFirestore.DocumentData;
  dateAddedMs: number;
}

async function main() {
  console.log(`Backfill starting. DRY_RUN=${DRY_RUN}`);

  const snap = await db.collection('userVerification').get();
  console.log(`Scanned ${snap.size} top-level documents`);

  // Group by uid.
  const byUid = new Map<string, VerificationDoc[]>();
  let skippedNoUid = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    const uid = data.uid as string | undefined;
    if (!uid) {
      skippedNoUid++;
      continue;
    }
    const ts = data.dateAdded;
    const dateAddedMs =
      ts instanceof admin.firestore.Timestamp
        ? ts.toMillis()
        : typeof ts === 'number'
          ? ts
          : 0;
    const arr = byUid.get(uid) ?? [];
    arr.push({ docId: doc.id, data, dateAddedMs });
    byUid.set(uid, arr);
  }

  if (skippedNoUid > 0) {
    console.warn(`Skipped ${skippedNoUid} docs with no uid field`);
  }

  // Per-user consolidation plan.
  let usersAlreadyOk = 0;
  let usersConsolidated = 0;
  let docsArchived = 0;
  let docsDeleted = 0;
  let docsRelocated = 0;

  // Shared batching — one batch spanning multiple users for efficiency.
  let batch = db.batch();
  let ops = 0;

  async function flush() {
    if (ops === 0) return;
    if (!DRY_RUN) {
      await batch.commit();
    }
    batch = db.batch();
    ops = 0;
  }

  async function enqueue(fn: (b: FirebaseFirestore.WriteBatch) => void) {
    fn(batch);
    ops++;
    if (ops >= BATCH_LIMIT) await flush();
  }

  for (const [uid, docs] of byUid) {
    // Newest first.
    docs.sort((a, b) => b.dateAddedMs - a.dateAddedMs);

    const canonical = docs[0];
    const older = docs.slice(1);
    const alreadyAtUid = canonical.docId === uid;
    const needsWork = !alreadyAtUid || older.length > 0;

    if (!needsWork) {
      usersAlreadyOk++;
      continue;
    }

    console.log(
      `uid=${uid}: ${docs.length} doc(s), canonical=${canonical.docId}, ` +
        `alreadyAtUid=${alreadyAtUid}, archive=${older.length}`
    );

    const attemptsRef = db
      .collection('userVerification')
      .doc(uid)
      .collection('attempts');

    // Archive older attempts + delete their original top-level docs.
    for (const old of older) {
      const attemptKey =
        old.dateAddedMs > 0 ? old.dateAddedMs.toString() : old.docId;
      await enqueue((b) => b.set(attemptsRef.doc(attemptKey), old.data));
      docsArchived++;
      await enqueue((b) =>
        b.delete(db.collection('userVerification').doc(old.docId))
      );
      docsDeleted++;
    }

    // If canonical lives at a random ID, relocate it to /userVerification/{uid}.
    if (!alreadyAtUid) {
      await enqueue((b) =>
        b.set(db.collection('userVerification').doc(uid), canonical.data, {
          merge: true,
        })
      );
      await enqueue((b) =>
        b.delete(db.collection('userVerification').doc(canonical.docId))
      );
      docsRelocated++;
    }

    usersConsolidated++;
  }

  await flush();

  console.log('\n=== Summary ===');
  console.log(`Users already consolidated (no-op):     ${usersAlreadyOk}`);
  console.log(`Users consolidated this run:             ${usersConsolidated}`);
  console.log(`Canonicals relocated to /userVerification/{uid}: ${docsRelocated}`);
  console.log(`Older attempts archived into attempts/: ${docsArchived}`);
  console.log(`Legacy auto-ID docs deleted:            ${docsDeleted}`);
  console.log(
    DRY_RUN
      ? '\nDRY RUN — no writes performed. Re-run with DRY_RUN=0 to apply.'
      : '\nBackfill complete.'
  );
}

main().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
