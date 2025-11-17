import { Group, Stack, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
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
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchVerifications();
  }, [page, filters]);

  const fetchVerifications = async (resetPage = false) => {
    try {
      setLoading(true);

      let lastDocument = resetPage ? undefined : lastDoc;
      if (page === 1) {
        lastDocument = undefined;
      }

      const response = await getVerificationRequests(
        filters,
        lastDocument,
        itemsPerPage
      );

      setVerifications(response.data);
      setLastDoc(response.lastDoc);

      // Estimate total pages
      if (response.hasMore) {
        setTotalPages(page + 1);
      } else {
        setTotalPages(page);
      }
    } catch (error) {
      console.error("Error fetching verifications:", error);
      setVerifications([]);
      notifications.show({
        color: "red",
        title: "Error",
        message: "Failed to fetch verification requests",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: IVerificationFilters) => {
    setFilters(newFilters);
    setPage(1);
    setLastDoc(null);
  };

  const handleResetFilters = () => {
    setFilters({});
    setPage(1);
    setLastDoc(null);
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
    fetchVerifications(true);
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
        totalData={totalPages * itemsPerPage}
        showPagination={true}
        fetchData={setPage}
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
