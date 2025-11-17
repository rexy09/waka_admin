import { Group, Stack, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import JobReportDetailsModal from "../components/JobReportDetailsModal";
import JobReportFilters from "../components/JobReportFilters";
import JobReportsTable from "../components/JobReportsTable";
import { useJobReportServices } from "../services";
import { IJobReport, IJobReportFilters } from "../types";

export default function JobReports() {
  const { getJobReports } = useJobReportServices();
  const [reports, setReports] = useState<IJobReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<IJobReport | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [filters, setFilters] = useState<IJobReportFilters>({});
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchReports();
  }, [page, filters]);

  const fetchReports = async (resetPage = false) => {
    try {
      setLoading(true);

      let lastDocument = resetPage ? undefined : lastDoc;
      if (page === 1) {
        lastDocument = undefined;
      }

      const response = await getJobReports(filters, lastDocument, itemsPerPage);

      setReports(response.data);
      setLastDoc(response.lastDoc);

      // Estimate total pages (this is approximate since we don't have total count)
      if (response.hasMore) {
        setTotalPages(page + 1);
      } else {
        setTotalPages(page);
      }
    } catch (error) {
      console.error("Error fetching job reports:", error);
      setReports([]);
      notifications.show({
        color: "red",
        title: "Error",
        message: "Failed to fetch job reports",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: IJobReportFilters) => {
    setFilters(newFilters);
    setPage(1);
    setLastDoc(null);
  };

  const handleResetFilters = () => {
    setFilters({});
    setPage(1);
    setLastDoc(null);
  };

  const handleViewDetails = (report: IJobReport) => {
    setSelectedReport(report);
    setModalOpened(true);
  };

  const handleModalClose = () => {
    setModalOpened(false);
    setSelectedReport(null);
  };

  const handleStatusUpdate = () => {
    // Refresh the current page
    fetchReports(true);
  };



  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={3}>Job Reports</Title>

      </Group>

      <JobReportFilters
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      <JobReportsTable
        reports={reports}
        onViewDetails={handleViewDetails}
        isLoading={loading}
        totalData={totalPages * itemsPerPage}
        showPagination={true}
        fetchData={setPage}
      />

      <JobReportDetailsModal
        opened={modalOpened}
        onClose={handleModalClose}
        report={selectedReport}
        onStatusUpdate={handleStatusUpdate}
      />
    </Stack>
  );
}
