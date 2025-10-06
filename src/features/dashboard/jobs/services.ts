import {
  addDoc,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  DocumentSnapshot,
  endBefore,
  getCountFromServer,
  getDocs,
  limit,
  limitToLast,
  orderBy,
  query,
  startAfter,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { v4 as uuidv4 } from "uuid";
import { db } from "../../../config/firebase";
import { IAuthUser } from "../../auth/types";
import {
  ICommitmentType,
  IHiredApplication,
  IJobApplication,
  IJobBid,
  IJobCategory,
  IJobForm,
  IJobPost,
  ISavedJob,
  IUrgencyLevels,
  IWorkLocations,
} from "./types";
import { JobFilterParameters } from "./stores";
import Env from "../../../config/env";
import useDbService from "../../services/DbService";
import axios from "axios";
import { useUtilities } from "../../hooks/utils";

export const useJobServices = () => {
  const authUser = useAuthUser<IAuthUser>();
  const { hiredJobsRef, jobPostsRef, savedJobsRef } = useDbService();
  const { getISODateTimeString } = useUtilities();


  const getJobs = async (
    p: JobFilterParameters,
    direction: "next" | "prev" | string | undefined,
    startAfterDoc?: DocumentSnapshot,
    endBeforeDoc?: DocumentSnapshot
  ) => {
    const pageLimit: number = 6;
    const jobPostsCollection = collection(db, "jobPosts");
    const totalQueryConstraints = [
      where("isActive", "==", true),
      where("isProduction", "==", Env.isProduction),
      orderBy("datePosted", "desc"),
    ];

    if (p.category !== undefined && p.category !== null && p.category !== "") {
      totalQueryConstraints.push(where("category", "==", p.category));
    }
    if (p.urgency !== undefined && p.urgency !== null && p.urgency !== "") {
      totalQueryConstraints.push(where("urgency", "==", p.urgency));
    }
    if (
      p.commitment !== undefined &&
      p.commitment !== null &&
      p.commitment !== ""
    ) {
      totalQueryConstraints.push(where("commitment", "==", p.commitment));
    }
    const totalQuerySnapshot = query(
      jobPostsCollection,
      ...totalQueryConstraints
    );
    const count = await getCountFromServer(totalQuerySnapshot);

    const dataCollection = collection(db, "jobPosts");

    const dataQueryConstraints = [
      where("isActive", "==", true),
      where("isProduction", "==", Env.isProduction),
      orderBy("datePosted", "desc"),
    ];
    if (p.category !== undefined && p.category !== null && p.category !== "") {
      dataQueryConstraints.push(where("category", "==", p.category));
    }
    if (p.urgency !== undefined && p.urgency !== null && p.urgency !== "") {
      dataQueryConstraints.push(where("urgency", "==", p.urgency));
    }
    if (
      p.commitment !== undefined &&
      p.commitment !== null &&
      p.commitment !== ""
    ) {
      dataQueryConstraints.push(where("commitment", "==", p.commitment));
    }

    let dataQuery = query(
      dataCollection,
      ...dataQueryConstraints,
      limit(pageLimit)
    );
    if (direction === "next" && startAfterDoc) {
      // For next direction, start after the provided document
      dataQuery = query(dataQuery, startAfter(startAfterDoc));
    } else if (direction === "prev" && endBeforeDoc) {
      // For previous direction, end before the provided document and limit to last
      dataQuery = query(
        dataCollection,
        endBefore(endBeforeDoc),
        orderBy("datePosted", "desc"),
        limitToLast(pageLimit)
      );
    }

    // Get snapshot of documents based on the final query
    const documentSnapshots = await getDocs(dataQuery);
    const dataList = documentSnapshots.docs.map((doc) => {
      const data = doc.data();
      return {
        ...(data as IJobPost),
        // id: doc.id,
        // datePosted: data.datePosted.toDate().toString(),
      };
    });

    return {
      count: count.data().count,
      data: dataList,
      lastDoc: documentSnapshots.docs[documentSnapshots.docs.length - 1],
      firstDoc: documentSnapshots.docs[0],
    };
  };

  const getUserJobPostCount = async () => {
    const jobPostsCollection = jobPostsRef;
    const totalQueryConstraints = [
      where("isProduction", "==", Env.isProduction),
      where("postedByUserId", "==", authUser?.uid),
    ];

    const totalQuerySnapshot = query(
      jobPostsCollection,
      ...totalQueryConstraints
    );
    const count = await getCountFromServer(totalQuerySnapshot);
    return count.data().count;
  };

  const getRelatedJobs = async (
    category: string,
    excludeId: string,
    direction: "next" | "prev" | string | undefined,
    startAfterDoc?: DocumentSnapshot,
    endBeforeDoc?: DocumentSnapshot
  ) => {
    const pageLimit: number = 10;

    const dataCollection = jobPostsRef;

    let dataQuery = query(
      dataCollection,
      where("isActive", "==", true),
      where("category", "==", category),
      where("isProduction", "==", Env.isProduction),
      orderBy("datePosted", "desc"),
      limit(pageLimit)
    );
    if (direction === "next" && startAfterDoc) {
      // For next direction, start after the provided document
      dataQuery = query(dataQuery, startAfter(startAfterDoc));
    } else if (direction === "prev" && endBeforeDoc) {
      // For previous direction, end before the provided document and limit to last
      dataQuery = query(
        dataCollection,
        where("isProduction", "==", Env.isProduction),
        endBefore(endBeforeDoc),
        orderBy("datePosted", "desc"),
        limitToLast(pageLimit)
      );
    }

    // Get snapshot of documents based on the final query
    const documentSnapshots = await getDocs(dataQuery);
    const dataList = documentSnapshots.docs
      .filter((doc) => doc.id !== excludeId) // Exclude the document with the specified ID
      .map((doc) => {
        const data = doc.data();
        return {
          ...(data as IJobPost),
          // datePosted: data.datePosted.toDate().toString(),
        };
      });

    return {
      count: dataList.length,
      data: dataList,
      lastDoc: documentSnapshots.docs[documentSnapshots.docs.length - 1],
      firstDoc: documentSnapshots.docs[0],
    };
  };
  const getExploreJobs = async (
    direction: "next" | "prev" | string | undefined,
    startAfterDoc?: DocumentSnapshot,
    endBeforeDoc?: DocumentSnapshot
  ) => {
    const pageLimit: number = 3;

    const dataCollection = jobPostsRef;

    let dataQuery = query(
      dataCollection,
      orderBy("datePosted", "desc"),
      where("isActive", "==", true),
      where("isProduction", "==", Env.isProduction),
      limit(pageLimit)
    );
    if (direction === "next" && startAfterDoc) {
      // For next direction, start after the provided document
      dataQuery = query(dataQuery, startAfter(startAfterDoc));
    } else if (direction === "prev" && endBeforeDoc) {
      // For previous direction, end before the provided document and limit to last
      dataQuery = query(
        dataCollection,
        orderBy("datePosted", "desc"),
        where("isProduction", "==", Env.isProduction),
        endBefore(endBeforeDoc),
        limitToLast(pageLimit)
      );
    }

    // Get snapshot of documents based on the final query
    const documentSnapshots = await getDocs(dataQuery);
    const dataList = documentSnapshots.docs.map((doc) => {
      const data = doc.data();
      return {
        ...(data as IJobPost),
        // datePosted: data.datePosted.toDate().toString(),
      };
    });

    return {
      count: dataList.length,
      data: dataList,
      lastDoc: documentSnapshots.docs[documentSnapshots.docs.length - 1],
      firstDoc: documentSnapshots.docs[0],
    };
  };

  const getJob = async (id: string) => {
    const dataCollection = jobPostsRef;

    let dataQuery = query(
      dataCollection,
      where("id", "==", id),
      where("isProduction", "==", Env.isProduction),
      limit(1)
    );
    const querySnapshot = await getDocs(dataQuery);

    if (querySnapshot.docs.length > 0) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();

      return {
        ...data,
        // datePosted: data.datePosted.toDate().toString(),
      } as IJobPost;
    }
    return undefined;
  };
  const getCatgories = async () => {
    const dataCollection = collection(db, "categories");

    let dataQuery = query(dataCollection);

    const documentSnapshots = await getDocs(dataQuery);
    const dataList = documentSnapshots.docs.map((doc) => {
      const data = doc.data();
      return {
        ...(data as IJobCategory),
      };
    });
    return dataList;
  };
  const getTranslatedCatgories = async () => {
    return axios.get(Env.baseURL + "/jobs/categories");
  };
  const getCommitmentTypes = async () => {
    const dataCollection = collection(db, "commitmentTypes");

    let dataQuery = query(dataCollection);

    const documentSnapshots = await getDocs(dataQuery);
    const dataList = documentSnapshots.docs.map((doc) => {
      const data = doc.data();
      return {
        ...(data as ICommitmentType),
      };
    });
    return dataList;
  };
  const getWorkLocations = async () => {
    const dataCollection = collection(db, "workLocations");

    let dataQuery = query(dataCollection);

    const documentSnapshots = await getDocs(dataQuery);
    const dataList = documentSnapshots.docs.map((doc) => {
      const data = doc.data();
      return {
        ...(data as IWorkLocations),
      };
    });
    return dataList;
  };

  const getUrgencyLevels = async () => {
    const dataCollection = collection(db, "urgencyLevels");

    let dataQuery = query(dataCollection);

    const documentSnapshots = await getDocs(dataQuery);
    const dataList = documentSnapshots.docs.map((doc) => {
      const data = doc.data();
      return {
        ...(data as IUrgencyLevels),
      };
    });
    return dataList;
  };

  const postJob = async (data: IJobForm, numberOfPostedJobsByUser: number) => {
    if (!authUser?.uid) {
      throw new Error("User is not authenticated");
    }
    console.log("Posting job for user:", authUser.dateAdded);
    
    const dataCollection = jobPostsRef;
    const uuid = uuidv4();
    const jobData = {
      id: uuid,
      ...data,
      avatarUrl: authUser?.avatarURL || null,
      fullName: authUser?.fullName || "",
      country: authUser?.country || null,
      postedByUserId: authUser?.uid,
      numberOfPostedJobsByUser: numberOfPostedJobsByUser,
      isActive: true,
      isUserVerified: authUser?.isVerified || false,
      userDateJoined: authUser.dateAdded,
      isProduction: Env.isProduction,
      datePosted: getISODateTimeString(),
    };
    const jobpostRef = await addDoc(dataCollection, jobData);

    return jobpostRef.id;
  };

  const postJobApplication = async (jobId: string, coverLetter: string) => {
    const jobRef = doc(db, "jobPosts", jobId);
    const dataCollection = collection(jobRef, "applications");
    if (!authUser?.uid) {
      throw new Error("User is not authenticated");
    }
    const jobApplicationData = {
      id: `${jobId}_${authUser?.uid}_${Timestamp.fromDate(
        new Date()
      ).toMillis()}`,
      jobId: jobId,
      applicantName: authUser?.fullName,
      attachments: [],
      avatarURL: authUser?.avatarURL,
      coverLetter: coverLetter,
      feedback: null,
      dateApplied: getISODateTimeString(),
      lastUpdated: getISODateTimeString(),
      dateAdded: getISODateTimeString(),
      dateUpdated: getISODateTimeString(),
      isProduction: Env.isProduction,
      resumeUrl: null,
      status: "pending",
      uid: authUser?.uid,
    } as unknown as IJobApplication;
    const applicationRef = await addDoc(dataCollection, jobApplicationData);
    return applicationRef.id;
  };

  const userAppliedForJob = async (
    jobId: string,
    userId: string
  ): Promise<boolean> => {
    const jobRef = doc(db, "jobPosts", jobId);
    const applicationsCollection = collection(jobRef, "applications");
    const queryConstraints = [
      where("uid", "==", userId),
      where("jobId", "==", jobId),
      // where("status", "==", "pending"),
    ];
    const querySnapshot = await getDocs(
      query(applicationsCollection, ...queryConstraints)
    );
    return querySnapshot.docs.length > 0;
  };

  const getSavedJobs = async (
    userId: string,
    direction: "next" | "prev" | string | undefined,
    startAfterDoc?: DocumentSnapshot,
    endBeforeDoc?: DocumentSnapshot
  ) => {
    const pageLimit: number = 6;
    if (!userId) {
      throw new Error("User ID is required");
    }

    const savedJobsCollection = savedJobsRef;

    // Get total count

    const totalQueryConstraints = [
      where("userId", "==", userId),
      where("isProduction", "==", Env.isProduction),
    ];
    const totalQuerySnapshot = query(
      savedJobsCollection,
      ...totalQueryConstraints
    );
    const count = await getCountFromServer(totalQuerySnapshot);

    // Build query for paginated data
    const dataQueryConstraints = [
      orderBy("dateAdded", "desc"),
      where("userId", "==", userId),
      where("isProduction", "==", Env.isProduction),
    ];

    let dataQuery = query(
      savedJobsCollection,
      ...dataQueryConstraints,
      limit(pageLimit)
    );

    if (direction === "next" && startAfterDoc) {
      dataQuery = query(dataQuery, startAfter(startAfterDoc));
    } else if (direction === "prev" && endBeforeDoc) {
      dataQuery = query(
        savedJobsCollection,
        orderBy("dateAdded", "desc"),
        where("userId", "==", userId),
        where("isProduction", "==", Env.isProduction),
        endBefore(endBeforeDoc),
        limitToLast(pageLimit)
      );
    }

    const querySnapshot = await getDocs(dataQuery);

    // Extract job details directly from saved jobs documents
    const jobsWithDetails: IJobPost[] = querySnapshot.docs.map((doc) => {
      const data = doc.data() as ISavedJob;
      return data.jobDetails;
    });

    return {
      count: count.data().count,
      data: jobsWithDetails,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
      firstDoc: querySnapshot.docs[0],
    };
  };

  const saveJob = async (jobId: string) => {
    if (!authUser?.uid) {
      throw new Error("User is not authenticated");
    }

    const savedJobsCollection = savedJobsRef;
    const date = new Date().toISOString();
    const savedJobId = `${authUser.uid}_${jobId}`;

    // Check if job is already saved
    const existingQuery = query(
      savedJobsCollection,
      where("userId", "==", authUser.uid),
      where("jobId", "==", jobId),
      where("isProduction", "==", Env.isProduction)
    );
    const existingDocs = await getDocs(existingQuery);

    if (existingDocs.docs.length > 0) {
      throw new Error("Job is already saved");
    }

    // Get the full job details to include in the saved job document
    const jobDetails = await getJob(jobId);
    if (!jobDetails) {
      throw new Error("Job not found");
    }

    const savedJobData = {
      id: savedJobId,
      jobId: jobId,
      userId: authUser.uid,
      jobDetails: jobDetails,
      dateAdded: date,
      dateUpdated: date,
      isProduction: Env.isProduction,
    };

    const savedJobRef = await addDoc(savedJobsCollection, savedJobData);
    return savedJobRef.id;
  };

  const unsaveJob = async (jobId: string) => {
    if (!authUser?.uid) {
      throw new Error("User is not authenticated");
    }

    const savedJobsCollection = savedJobsRef;
    const queryConstraints = [
      where("userId", "==", authUser.uid),
      where("jobId", "==", jobId),
      where("isProduction", "==", Env.isProduction),
    ];

    const querySnapshot = await getDocs(
      query(savedJobsCollection, ...queryConstraints)
    );

    if (querySnapshot.docs.length === 0) {
      throw new Error("Saved job not found");
    }

    // Delete all matching saved job documents (should be only one)
    const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    return true;
  };

  const isJobSaved = async (jobId: string): Promise<boolean> => {
    if (!authUser?.uid) {
      return false;
    }

    const savedJobsCollection = collection(db, "savedJobs");
    const queryConstraints = [
      where("userId", "==", authUser.uid),
      where("jobId", "==", jobId),
      where("isProduction", "==", Env.isProduction),
    ];

    const querySnapshot = await getDocs(
      query(savedJobsCollection, ...queryConstraints)
    );

    return querySnapshot.docs.length > 0;
  };

  const getPostedJobs = async (
    userId: string,
    direction: "next" | "prev" | string | undefined = "next",
    startAfterDoc?: DocumentSnapshot,
    endBeforeDoc?: DocumentSnapshot
  ) => {
    const pageLimit: number = 6;
    if (!userId) {
      throw new Error("User ID is required");
    }
    const jobPostsCollection = jobPostsRef;
    let dataQuery = query(
      jobPostsCollection,
      where("postedByUserId", "==", userId),
      where("isProduction", "==", Env.isProduction),
      orderBy("datePosted", "desc"),
      limit(pageLimit)
    );
    if (direction === "next" && startAfterDoc) {
      dataQuery = query(
        jobPostsCollection,
        where("postedByUserId", "==", userId),
        where("isProduction", "==", Env.isProduction),
        orderBy("datePosted", "desc"),
        startAfter(startAfterDoc),
        limit(pageLimit)
      );
    } else if (direction === "prev" && endBeforeDoc) {
      dataQuery = query(
        jobPostsCollection,
        where("postedByUserId", "==", userId),
        where("isProduction", "==", Env.isProduction),
        orderBy("datePosted", "desc"),
        endBefore(endBeforeDoc),
        limitToLast(pageLimit)
      );
    }
    const querySnapshot = await getDocs(dataQuery);
    const dataList = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...(data as IJobPost),
      };
    });
    return {
      data: dataList,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
      firstDoc: querySnapshot.docs[0],
    };
  };

  const getAppliedJobs = async (
    userId: string,
    direction: "next" | "prev" | string | undefined = "next",
    startAfterDoc?: DocumentSnapshot,
    endBeforeDoc?: DocumentSnapshot
  ) => {
    const pageLimit: number = 6;
    if (!userId) {
      throw new Error("User ID is required");
    }

    // 1. Get all applications for this user (using collectionGroup)
    let applicationsQuery = query(
      collectionGroup(db, "applications"),
      where("uid", "==", userId),
      where("isProduction", "==", Env.isProduction),
      orderBy("dateApplied", "desc"),
      limit(pageLimit)
    );
    if (direction === "next" && startAfterDoc) {
      applicationsQuery = query(
        collectionGroup(db, "applications"),
        where("uid", "==", userId),
        where("isProduction", "==", Env.isProduction),
        orderBy("dateApplied", "desc"),
        startAfter(startAfterDoc),
        limit(pageLimit)
      );
    } else if (direction === "prev" && endBeforeDoc) {
      applicationsQuery = query(
        collectionGroup(db, "applications"),
        where("uid", "==", userId),
        where("isProduction", "==", Env.isProduction),
        orderBy("dateApplied", "desc"),
        endBefore(endBeforeDoc),
        limitToLast(pageLimit)
      );
    }

    const applicationsSnapshot = await getDocs(applicationsQuery);
    const applications = applicationsSnapshot.docs.map((doc) => ({
      application: doc.data() as IJobApplication,
      jobId: (doc.data() as IJobApplication).jobId,
    }));

    // 2. Get the job post IDs from the applications
    const jobIds = applications.map((app) => app.jobId);

    // 3. Fetch the job posts in parallel and pair with applications
    let jobMap: Record<string, IJobPost> = {};
    if (jobIds.length > 0) {
      const jobPostsCollection = jobPostsRef;
      const batchSize = 10;
      for (let i = 0; i < jobIds.length; i += batchSize) {
        const batchIds = jobIds.slice(i, i + batchSize);
        const jobsQuery = query(
          jobPostsCollection,
          where("id", "in", batchIds),
          where("isProduction", "==", Env.isProduction)
        );
        const jobsSnapshot = await getDocs(jobsQuery);
        jobsSnapshot.docs.forEach((doc) => {
          jobMap[doc.id] = doc.data() as IJobPost;
        });
      }
    }

    // 4. Pair each application with its job post
    const data = applications.map(({ application, jobId }) => ({
      job: jobMap[jobId],
      application,
    }));

    return {
      data,
      lastDoc: applicationsSnapshot.docs[applicationsSnapshot.docs.length - 1],
      firstDoc: applicationsSnapshot.docs[0],
    };
  };
  const getAppliedJob = async (userId: string, jobId: string) => {
    const jobRef = doc(db, "jobPosts", jobId);
    const applicationsCollection = collection(jobRef, "applications");
    const queryConstraints = [
      where("uid", "==", userId),
      where("jobId", "==", jobId),
      where("isProduction", "==", Env.isProduction),
    ];
    const querySnapshot = await getDocs(
      query(applicationsCollection, ...queryConstraints)
    );

    if (querySnapshot.empty) {
      return undefined;
    }

    const applicationDoc = querySnapshot.docs[0];
    const application = applicationDoc.data() as IJobApplication;
    return application;
  };
  const getJobApplications = async ({ jobId }: { jobId: string }) => {
    const jobRef = doc(db, "jobPosts", jobId);
    const applicationsCollection = collection(jobRef, "applications");
    const queryConstraints = [
      where("jobId", "==", jobId),
      where("isProduction", "==", Env.isProduction),
    ];
    const querySnapshot = await getDocs(
      query(applicationsCollection, ...queryConstraints)
    );

    if (querySnapshot.empty) {
      return [];
    }

    const applicationDocs = querySnapshot.docs;
    const applications = applicationDocs.map(
      (doc) => doc.data() as IJobApplication
    );
    return applications;
  };
  const getJobBids = async ({ jobId }: { jobId: string }) => {
    const jobRef = doc(db, "jobPosts", jobId);
    const applicationsCollection = collection(jobRef, "bids");
    const queryConstraints = [
      where("jobId", "==", jobId),
      where("isProduction", "==", Env.isProduction),
      orderBy("dateAdded", "desc"),
    ];
    const querySnapshot = await getDocs(
      query(applicationsCollection, ...queryConstraints)
    );

    if (querySnapshot.empty) {
      return [];
    }

    const applicationDocs = querySnapshot.docs;
    const applications = applicationDocs.map((doc) => doc.data() as IJobBid);
    return applications;
  };

  const getAllHiredJobApplications = async ({ jobId }: { jobId: string }) => {
    // 1. Query hiredJobsRef for documents with jobId
    const hiredJobsQuery = query(
      hiredJobsRef,
      where("jobId", "==", jobId),
      where("isProduction", "==", Env.isProduction)
    );
    const hiredJobsSnapshot = await getDocs(hiredJobsQuery);

    let allApplications: IHiredApplication[] = [];
    if (!hiredJobsSnapshot.empty) {
      // Get the first hired job document
      const hiredJobDoc = hiredJobsSnapshot.docs[0];
      // Get its applications subcollection
      const applicationsCollection = collection(hiredJobDoc.ref, "applicants");
      const applicationsSnapshot = await getDocs(applicationsCollection);

      // Add all applications to the result array
      const applications = applicationsSnapshot.docs.map(
        (doc) => doc.data() as IHiredApplication
      );
      allApplications = applications;
    }

    return allApplications;
  };

  const unemployApplicantFromJob = async (
    jobId: string,
    applicantUid: string
  ) => {
    const hiredJobsQuery = query(
      hiredJobsRef,
      where("jobId", "==", jobId),
      where("postedByUserId", "==", authUser?.uid),
      where("isProduction", "==", Env.isProduction)
    );
    const hiredJobsSnapshot = await getDocs(hiredJobsQuery);

    if (hiredJobsSnapshot.empty) {
      throw new Error("Hired job not found");
    }
    const hiredJobDoc = hiredJobsSnapshot.docs[0];
    const applicationsCollection = collection(hiredJobDoc.ref, "applicants");
    const applicationQuery = query(
      applicationsCollection,
      where("applicantUid", "==", applicantUid)
    );
    const applicationSnapshot = await getDocs(applicationQuery);
    if (applicationSnapshot.empty) {
      throw new Error("Applicant not found");
    }
    const applicationDoc = applicationSnapshot.docs[0];
    await deleteDoc(applicationDoc.ref);

    const applicationJobsQuery = query(jobPostsRef, where("id", "==", jobId));
    const applicationJobsSnapshot = await getDocs(applicationJobsQuery);
    if (applicationJobsSnapshot.empty) {
      throw new Error("Job not found");
    }
    const jobDoc = applicationJobsSnapshot.docs[0];
    const applicationsSubCollection = collection(jobDoc.ref, "applications");
    const applicantQuery = query(
      applicationsSubCollection,
      where("uid", "==", applicantUid)
    );
    const applicantSnapshot = await getDocs(applicantQuery);
    const applicantDoc = applicantSnapshot.docs[0];

    await updateDoc(applicantDoc.ref, { status: "pending" });

    return true;
  };
  const employApplicantFromJob = async (
    jobId: string,
    applicantUid: string
  ) => {
    // First, check if the job exists and belongs to the authenticated user
    const applicationJobsQuery = query(jobPostsRef, where("id", "==", jobId));
    const applicationJobsSnapshot = await getDocs(applicationJobsQuery);

    if (applicationJobsSnapshot.empty) {
      throw new Error("Job not found");
    }

    const jobDoc = applicationJobsSnapshot.docs[0];
    const applicationsSubCollection = collection(jobDoc.ref, "applications");

    // Find the specific applicant in the job's applications
    const applicantQuery = query(
      applicationsSubCollection,
      where("uid", "==", applicantUid)
    );
    const applicantSnapshot = await getDocs(applicantQuery);

    if (applicantSnapshot.empty) {
      throw new Error("Applicant not found in job applications");
    }

    const applicantDoc = applicantSnapshot.docs[0];

    // Update the applicant's status to "hired"
    await updateDoc(applicantDoc.ref, {
      status: "accepted",
    });

    // Create or update entry in hiredJobs collection
    const hiredJobsQuery = query(
      hiredJobsRef,
      where("jobId", "==", jobId),
      where("postedByUserId", "==", authUser?.uid)
    );
    const hiredJobsSnapshot = await getDocs(hiredJobsQuery);

    let hiredJobDocRef;
    if (hiredJobsSnapshot.empty) {
      // Create new hired job document if it doesn't exist
      const newDocRef = await addDoc(hiredJobsRef, {
        jobTitle: jobDoc.data().title
          ? jobDoc.data().title
          : jobDoc.data().category,
        jobId: jobId,
        postedByUserId: authUser?.uid,
        dateHired: new Date(),
      });
      hiredJobDocRef = newDocRef;
    } else {
      hiredJobDocRef = hiredJobsSnapshot.docs[0].ref;
    }

    // Add the applicant to the hired job's applicants subcollection
    const applicantsCollection = collection(hiredJobDocRef, "applicants");

    // Check if applicant is already in hired applicants (to avoid duplicates)
    const existingApplicantQuery = query(
      applicantsCollection,
      where("applicantUid", "==", applicantUid)
    );
    const existingApplicantSnapshot = await getDocs(existingApplicantQuery);

    if (!existingApplicantSnapshot.empty) {
      throw new Error("Applicant is already hired for this job");
    }

    // Add applicant to hired job's applicants subcollection with proper structure
    const applicantData = applicantDoc.data();
    await addDoc(applicantsCollection, {
      amount: applicantData.amount || null,
      applicantName: applicantData.applicantName || "",
      applicantUid: applicantUid,
      applicationId: applicantDoc.id,
      approvalNotes: null,
      approvedAt: null,
      approvedBy: null,
      bidId: null,
      completedAt: null,
      completedBy: null,
      completionNotes: null,
      coverLetter: null,
      dateHired: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      message: null,
      rating: null,
      resumeUrl: null,
      status: "pending",
      isProduction: Env.isProduction,
    });

    return true;
  };

  return {
    getJobs,
    getJob,
    getRelatedJobs,
    getCatgories,
    getTranslatedCatgories,
    getCommitmentTypes,
    getUrgencyLevels,
    postJob,
    getExploreJobs,
    postJobApplication,
    userAppliedForJob,
    getSavedJobs,
    saveJob,
    unsaveJob,
    isJobSaved,
    getPostedJobs,
    getAppliedJobs,
    getAppliedJob,
    getJobApplications,
    getAllHiredJobApplications,
    getJobBids,
    unemployApplicantFromJob,
    employApplicantFromJob,
    getUserJobPostCount,
    getWorkLocations,
  };
};
