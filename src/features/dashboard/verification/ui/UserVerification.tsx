import { Group, Stack, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { DocumentSnapshot } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import VerificationDetailsModal from "../components/VerificationDetailsModal";
import VerificationFilters from "../components/VerificationFilters";
import VerificationTable from "../components/VerificationTable";
import { useUserVerificationServices } from "../services";
import { IUserVerificationProfile, IVerificationFilters } from "../types";

export default function UserVerification() {
  const { getVerificationRequests } = useUserVerificationServices();
  const [verifications, setVerifications] = useState<IUserVerificationProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] =
    useState<IUserVerificationProfile | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [filters, setFilters] = useState<IVerificationFilters>({});
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | undefined>();
  const [firstDoc, setFirstDoc] = useState<DocumentSnapshot | undefined>();
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  // Store complete page information for reliable backward navigation
  type PageInfo = {
    firstDoc: DocumentSnapshot;
    lastDoc: DocumentSnapshot;
    startPosition: number;
  };
  const [pageStack, setPageStack] = useState<PageInfo[]>([]);
  const [currentPageStart, setCurrentPageStart] = useState(1);

  const fetchVerifications = useCallback(
    async (
      direction: "next" | "prev" | string | undefined = "next",
      startAfterDoc?: DocumentSnapshot
    ) => {
      try {
        setLoading(true);

        const response = await getVerificationRequests(
          filters,
          direction === "next" ? startAfterDoc : undefined,
          pageSize
        );

        if (response.data.length > 0) {
          setVerifications(response.data);
          setLastDoc(response.lastDoc);
          setFirstDoc(response.firstDoc);
          setTotalCount(response.totalCount || 0);
        } else {
          console.warn("No data found for this page");
        }
      } catch (error) {
        console.error("Error fetching verifications:", error);
        notifications.show({
          color: "red",
          title: "Error",
          message: "Failed to fetch verification requests",
        });
      } finally {
        setLoading(false);
      }
    },
    [getVerificationRequests, filters, pageSize]
  );

  useEffect(() => {
    fetchVerifications();
  }, [filters]);

  const handleNextPage = useCallback(() => {
    if (lastDoc && firstDoc) {
      // Save current page info to stack before moving forward
      setPageStack(prev => [...prev, {
        firstDoc,
        lastDoc,
        startPosition: currentPageStart
      }]);
      setCurrentPageStart(prev => prev + verifications.length);
      fetchVerifications("next", lastDoc);
    }
  }, [lastDoc, firstDoc, verifications.length, currentPageStart, fetchVerifications]);

  const handlePreviousPage = useCallback(async () => {
    if (pageStack.length > 0) {
      const newStack = [...pageStack];
      const previousPage = newStack.pop();

      if (!previousPage) return;

      setPageStack(newStack);
      setCurrentPageStart(previousPage.startPosition);

      try {
        setLoading(true);
        const response = await getVerificationRequests(
          filters,
          newStack.length > 0 ? newStack[newStack.length - 1].lastDoc : undefined,
          pageSize
        );

        if (response.data.length > 0) {
          setVerifications(response.data);
          setLastDoc(response.lastDoc);
          setFirstDoc(response.firstDoc);
          setTotalCount(response.totalCount || 0);
        }
      } catch (error) {
        console.error("Error fetching verifications:", error);
      } finally {
        setLoading(false);
      }
    }
  }, [pageStack, pageSize, filters, getVerificationRequests]);

  const handlePageSizeChange = useCallback(
    async (newSize: number) => {
      setPageSize(newSize);
      setLastDoc(undefined);
      setFirstDoc(undefined);
      setPageStack([]);
      setCurrentPageStart(1);

      setLoading(true);
      try {
        const response = await getVerificationRequests(filters, undefined, newSize);
        setVerifications(response.data);
        setLastDoc(response.lastDoc);
        setFirstDoc(response.firstDoc);
        setTotalCount(response.totalCount || 0);
      } catch (error) {
        console.error("Error fetching verifications:", error);
        notifications.show({
          color: "red",
          title: "Error",
          message: "Failed to fetch verification requests",
        });
      } finally {
        setLoading(false);
      }
    },
    [filters, getVerificationRequests]
  );

  const handleFilterChange = (newFilters: IVerificationFilters) => {
    setFilters(newFilters);
    setLastDoc(undefined);
    setFirstDoc(undefined);
    setPageStack([]);
    setCurrentPageStart(1);
  };

  const handleResetFilters = () => {
    setFilters({});
    setLastDoc(undefined);
    setFirstDoc(undefined);
    setPageStack([]);
    setCurrentPageStart(1);
  };

  const handleViewDetails = (verification: IUserVerificationProfile) => {
    setSelectedVerification(verification);
    setModalOpened(true);
  };

  const handleModalClose = () => {
    setModalOpened(false);
    setSelectedVerification(null);
  };

  const handleStatusUpdate = () => {
    // Refresh the current page
    fetchVerifications();
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={3}>User Verification Requests</Title>
      </Group>

      <VerificationFilters
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      <VerificationTable
        verifications={verifications}
        onViewDetails={handleViewDetails}
        isLoading={loading}
        totalData={totalCount}
        showPagination={true}
        onNextPage={handleNextPage}
        onPreviousPage={handlePreviousPage}
        onPageSizeChange={handlePageSizeChange}
        currentPageSize={pageSize}
        hasNextPage={totalCount > currentPageStart + verifications.length - 1}
        hasPreviousPage={pageStack.length > 0}
        currentRange={{
          start: currentPageStart,
          end: currentPageStart + verifications.length - 1,
        }}
      />

      <VerificationDetailsModal
        opened={modalOpened}
        onClose={handleModalClose}
        verification={selectedVerification}
        onStatusUpdate={handleStatusUpdate}
      />
    </Stack>
  );
}
