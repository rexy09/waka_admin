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

export const migrateSavedJobsDates = async () => {
  console.log("Migrating savedJobs dateAdded & dateUpdated → Firestore Timestamp...");

  const savedJobsRef = collection(db, "savedJobs");
  const snapshot = await getDocs(
    query(savedJobsRef)
  );

  let batch = writeBatch(db);
  let ops = 0;
  let updated = 0;
  let skipped = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const dateAdded = data.dateAdded;
    const dateUpdated = data.dateUpdated;

    // Check if both are already Timestamps
    const dateAddedIsTimestamp = dateAdded instanceof Timestamp;
    const dateUpdatedIsTimestamp = dateUpdated instanceof Timestamp;

    if (dateAddedIsTimestamp && dateUpdatedIsTimestamp) {
      skipped++;
      continue;
    }

    const updates: any = {};
    let needsUpdate = false;

    // Handle dateAdded
    if (dateAdded && !dateAddedIsTimestamp) {
      let parsed: Date | null = null;

      if (typeof dateAdded === "string") {
        parsed = new Date(dateAdded);
      } else if (dateAdded instanceof Date) {
        parsed = dateAdded;
      }

      if (parsed && !isNaN(parsed.getTime())) {
        updates.dateAdded = Timestamp.fromDate(parsed);
        needsUpdate = true;
      } else {
        console.warn(`Invalid dateAdded in doc ${doc.id}:`, dateAdded);
      }
    }

    // Handle dateUpdated
    if (dateUpdated && !dateUpdatedIsTimestamp) {
      let parsed: Date | null = null;

      if (typeof dateUpdated === "string") {
        parsed = new Date(dateUpdated);
      } else if (dateUpdated instanceof Date) {
        parsed = dateUpdated;
      }

      if (parsed && !isNaN(parsed.getTime())) {
        updates.dateUpdated = Timestamp.fromDate(parsed);
        needsUpdate = true;
      } else {
        console.warn(`Invalid dateUpdated in doc ${doc.id}:`, dateUpdated);
      }
    }

    if (needsUpdate) {
      batch.update(doc.ref, updates);
      updated++;
      ops++;

      // Firestore batch limit = 500 writes
      if (ops === 499) {
        console.log(`Committing batch. Updated so far: ${updated}`);
        await batch.commit();
        batch = writeBatch(db);
        ops = 0;
      }
    } else {
      skipped++;
    }
  }

  // Commit remaining
  if (ops > 0) {
    console.log(`Committing final batch of ${ops} updates...`);
    await batch.commit();
  }

  console.log("Migration complete!");
  console.log(`Updated: ${updated} documents`);
  console.log(`Skipped: ${skipped} documents (already correct or invalid)`);
};