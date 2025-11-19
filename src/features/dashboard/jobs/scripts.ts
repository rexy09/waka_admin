import { collection } from "firebase/firestore";
import { db } from "../../../config/firebase";
import Env from "../../../config/env";
import { getDocs } from "firebase/firestore";
import { query } from "firebase/firestore";
import { where } from "firebase/firestore";
import { writeBatch } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";

export const migrateDateHiredToTimestamp = async () => {
  const hiredJobsRef = collection(db, "hiredJobs");
  console.log("Starting dateHired migration to Firestore Timestamp...");

  const snapshot = await getDocs(
    query(hiredJobsRef, where("isProduction", "==", Env.isProduction)) // optional filter
  );

  let batch = writeBatch(db);
  let operationCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const dateHired = data.dateHired;

    // Skip if already a Timestamp or null/undefined
    if (!dateHired || dateHired instanceof Timestamp) {
      skippedCount++;
      continue;
    }

    // Handle string dates (ISO, etc.)
    if (typeof dateHired === "string") {
      const parsedDate = new Date(dateHired);

      // Validate it's a real date
      if (isNaN(parsedDate.getTime())) {
        console.warn(`Invalid date string in doc ${doc.id}:`, dateHired);
        skippedCount++;
        continue;
      }

      batch.update(doc.ref, {
        dateHired: Timestamp.fromDate(parsedDate),
      });
      updatedCount++;
    }
    // Handle JavaScript Date objects (rare, but possible)
    else if (dateHired instanceof Date && !isNaN(dateHired.getTime())) {
      batch.update(doc.ref, {
        dateHired: Timestamp.fromDate(dateHired),
      });
      updatedCount++;
    } else {
      console.warn(
        `Unsupported dateHired type in doc ${doc.id}:`,
        typeof dateHired,
        dateHired
      );
      skippedCount++;
      continue;
    }

    operationCount++;

    // Firestore batch limit = 500 writes
    if (operationCount === 499) {
      console.log(`Committing batch of ${operationCount} updates...`);
      await batch.commit();
      console.log("Batch committed.");

      batch = writeBatch(db);
      operationCount = 0;
    }
  }

  // Commit remaining
  if (operationCount > 0) {
    console.log(`Committing final batch of ${operationCount} updates...`);
    await batch.commit();
    console.log("Final batch committed.");
  }

  console.log("Migration complete!");
  console.log(`Updated: ${updatedCount} documents`);
  console.log(
    `Skipped: ${skippedCount} documents (already correct or invalid)`
  );
};


export const migrateJobPostsDatePosted = async () => {
  console.log("Migrating jobPosts.datePosted → Firestore Timestamp...");

  const jobPostsRef = collection(db, "jobPosts");
  const snapshot = await getDocs(jobPostsRef);

  let batch = writeBatch(db);
  let ops = 0;
  let updated = 0;
  let skipped = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const datePosted = data.datePosted;

    if (!datePosted || datePosted instanceof Timestamp) {
      skipped++;
      continue;
    }

    let parsed: Date | null = null;

    if (typeof datePosted === "string") {
      parsed = new Date(datePosted);
    } else if (datePosted instanceof Date) {
      parsed = datePosted;
    }

    if (parsed && !isNaN(parsed.getTime())) {
      batch.update(doc.ref, {
        datePosted: Timestamp.fromDate(parsed),
      });
      updated++;
    } else {
      console.warn(`Invalid date in job ${doc.id}:`, datePosted);
      skipped++;
      continue;
    }

    ops++;
    if (ops === 499) {
      await batch.commit();
      console.log(`Committed batch. Updated so far: ${updated}`);
      batch = writeBatch(db);
      ops = 0;
    }
  }

  if (ops > 0) {
    await batch.commit();
    console.log("Final batch committed.");
  }

  console.log("Migration complete!");
  console.log(`Updated: ${updated}, Skipped: ${skipped}`);
};