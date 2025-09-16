import { DocumentSnapshot, endBefore, getCountFromServer, getDocs, limit, limitToLast, orderBy, query, startAfter, where } from "firebase/firestore";
import Env from "../../../config/env";
import { IUser } from "../../auth/types";
import useDbService from "../../services/DbService";
import { UserFilterParameters } from "./types";

export const useUserServices = () => {
  const { usersRef } = useDbService();

  const getUsers = async (
    filters: UserFilterParameters = {},
    direction: "next" | "prev" | string | undefined = "next",
    startAfterDoc?: DocumentSnapshot,
    endBeforeDoc?: DocumentSnapshot,
    pageLimit: number = 10
  ) => {
    try {
      // Build base query constraints
      const baseConstraints = [];

      // Add isProduction filter - handle "both" option
      if (filters.isProduction === "both") {
        // Don't add isProduction filter to get both production and non-production
      } else if (filters.isProduction !== undefined) {
        baseConstraints.push(where("isProduction", "==", filters.isProduction));
      } else {
        // Default behavior: use environment setting
        baseConstraints.push(where("isProduction", "==", Env.isProduction));
      }

      // Add other filter constraints
      if (filters.role) {
        baseConstraints.push(where("role", "==", filters.role));
      }
      if (filters.isVerified === "both") {
        // Don't add isVerified filter to get both verified and unverified users
      } else if (filters.isVerified !== undefined) {
        baseConstraints.push(where("isVerified", "==", filters.isVerified));
      }
      if (filters.status) {
        baseConstraints.push(where("status", "==", filters.status));
      }
      if (filters.country) {
        baseConstraints.push(where("country.name", "==", filters.country));
      }
      if (filters.userType) {
        baseConstraints.push(where("userType", "==", filters.userType));
      }

      // Add date range filters
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        fromDate.setHours(0, 0, 0, 0); // Start of day
        baseConstraints.push(where("dateAdded", ">=", fromDate.toISOString()));
      }

      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        baseConstraints.push(where("dateAdded", "<=", toDate.toISOString()));
      }

      // Get total count with filters
      const totalQuery = query(usersRef, ...baseConstraints);
      const totalSnapshot = await getCountFromServer(totalQuery);
      const totalCount = totalSnapshot.data().count;

      // Build query constraints for data fetch
      const dataConstraints = [
        ...baseConstraints,
        orderBy("dateAdded", "desc"),
      ];

      let usersQuery = query(usersRef, ...dataConstraints, limit(pageLimit));

      if (direction === "next" && startAfterDoc) {
        usersQuery = query(usersQuery, startAfter(startAfterDoc));
      } else if (direction === "prev" && endBeforeDoc) {
        usersQuery = query(
          usersRef,
          ...dataConstraints,
          endBefore(endBeforeDoc),
          limitToLast(pageLimit)
        );
      }

      const querySnapshot = await getDocs(usersQuery);
      let usersList = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as IUser[];

      // Apply client-side filters for search term only
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        usersList = usersList.filter(user =>
          user.fullName?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower)
        );
      }

      return {
        data: usersList,
        totalCount,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
        firstDoc: querySnapshot.docs[0],
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  };

  const getUserById = async (userId: string) => {
    try {
      const userQuery = query(
        usersRef,
        where("uid", "==", userId),
        where("isProduction", "==", Env.isProduction),
        limit(1)
      );

      const querySnapshot = await getDocs(userQuery);

      if (querySnapshot.empty) {
        return null;
      }

      const userDoc = querySnapshot.docs[0];
      return {
        ...userDoc.data(),
        id: userDoc.id,
      } as IUser;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  };

  const getFilterOptions = async () => {
    try {
      // Get from both production and non-production to populate all filter options
      const usersQuery = query(
        usersRef,
        limit(1000) // Get a reasonable sample for filter options
      );

      const querySnapshot = await getDocs(usersQuery);
      const users = querySnapshot.docs.map((doc) => doc.data()) as IUser[];

      // Extract unique values for filters
      const roles = [...new Set(users.map(user => user.role).filter(Boolean))];
      const statuses = [...new Set(users.map(user => user.status || 'active').filter(Boolean))];
      const countries = [...new Set(users.map(user => user.country?.name).filter(Boolean))]
        .map(name => ({ name: name as string, code: name as string }));
      const userTypes = [...new Set(users.map(user => user.userType).filter(Boolean))];

      return {
        roles,
        statuses,
        countries,
        userTypes,
      };
    } catch (error) {
      console.error("Error fetching filter options:", error);
      return {
        roles: ['admin', 'user'],
        statuses: ['active', 'inactive'],
        countries: [],
        userTypes: [],
      };
    }
  };

  return {
    getUsers,
    getUserById,
    getFilterOptions,
  };
};