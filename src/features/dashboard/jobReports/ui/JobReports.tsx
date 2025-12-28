import { Group, Stack, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { DocumentSnapshot } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import JobReportDetailsModal from "../components/JobReportDetailsModal";
import JobReportFilters from "../components/JobReportFilters";
import JobReportsTable from "../components/JobReportsTable";
import { useJobReportServices } from "../services";
import { IJobReport, IJobReportFilters } from "../types";

type PageInfo = {
  firstDoc: DocumentSnapshot;
  lastDoc: DocumentSnapshot;
  startPosition: number;
};

export default function JobReports() {
  const { getJobReports } = useJobReportServices();
  const [reports, setReports] = useState<IJobReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<IJobReport | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [filters, setFilters] = useState<IJobReportFilters>({});

  // Page stack pagination
  const [pageStack, setPageStack] = useState<PageInfo[]>([]);
  const [firstDoc, setFirstDoc] = useState<DocumentSnapshot | undefined>();
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | undefined>();
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPageStart, setCurrentPageStart] = useState(0);

  const fetchReports = useCallback(
    async (
      startAfterDoc?: DocumentSnapshot
    ) => {
      try {
        setLoading(true);

        const response = await getJobReports(filters, startAfterDoc, pageSize);

        if (response.data.length > 0) {
          setReports(response.data);
          setFirstDoc(response.firstDoc);
          setLastDoc(response.lastDoc);
          setTotalCount(response.totalCount);
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
    },
    [filters, pageSize, getJobReports]
  );

  useEffect(() => {
    setPageStack([]);
    setCurrentPageStart(0);
    fetchReports(undefined);
  }, [filters, pageSize]);

  const handleNextPage = useCallback(() => {
    if (lastDoc && firstDoc && reports.length > 0) {
      setPageStack(prev => [...prev, {
        firstDoc,
        lastDoc,
        startPosition: currentPageStart
      }]);
      setCurrentPageStart(prev => prev + reports.length);
      fetchReports(lastDoc);
    }
  }, [lastDoc, firstDoc, reports.length, currentPageStart, fetchReports]);

  const handlePreviousPage = useCallback(() => {
    if (pageStack.length > 0) {
      const newStack = [...pageStack];
      const previousPage = newStack.pop();
      setPageStack(newStack);

      if (previousPage) {
        setCurrentPageStart(previousPage.startPosition);
        const startDoc = newStack.length > 0 ? newStack[newStack.length - 1].lastDoc : undefined;
        fetchReports(startDoc);
      }
    }
  }, [pageStack, fetchReports]);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setPageStack([]);
    setCurrentPageStart(0);
  }, []);

  const handleFilterChange = (newFilters: IJobReportFilters) => {
    setFilters(newFilters);
    setPageStack([]);
    setCurrentPageStart(0);
  };

  const handleResetFilters = () => {
    setFilters({});
    setPageStack([]);
    setCurrentPageStart(0);
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
    fetchReports(undefined);
    setPageStack([]);
    setCurrentPageStart(0);
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
        onNextPage={handleNextPage}
        onPreviousPage={handlePreviousPage}
        onPageSizeChange={handlePageSizeChange}
        currentPageSize={pageSize}
        hasNextPage={totalCount > currentPageStart + reports.length}
        hasPreviousPage={pageStack.length > 0}
        currentRange={{
          start: currentPageStart + 1,
          end: currentPageStart + reports.length,
        }}
        totalData={totalCount}
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
