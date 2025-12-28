import { Badge, Table, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { DocumentSnapshot } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { MdRemoveRedEye } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { CustomTable } from "../../../../common/components/Table/CustomTable";
import { useJobServices } from "../services";
import { IHiredJob } from "../types";

export default function HiredTable() {
  const navigate = useNavigate();
  const { getHiredJobs } = useJobServices();
  const [hiredJobs, setHiredJobs] = useState<IHiredJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalJobs, setTotalJobs] = useState(0);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | undefined>();
  const [firstDoc, setFirstDoc] = useState<DocumentSnapshot | undefined>();
  const [pageSize, setPageSize] = useState(20);

  // Store complete page information for reliable backward navigation
  type PageInfo = {
    firstDoc: DocumentSnapshot;
    lastDoc: DocumentSnapshot;
    startPosition: number;
  };
  const [pageStack, setPageStack] = useState<PageInfo[]>([]);
  const [currentPageStart, setCurrentPageStart] = useState(1);

  const fetchHiredJobs = useCallback(
    async (
      direction: "next" | "prev" | string | undefined = "next",
      startAfterDoc?: DocumentSnapshot,
      endBeforeDoc?: DocumentSnapshot
    ) => {
      setIsLoading(true);
      try {
        const result = await getHiredJobs(
          direction,
          startAfterDoc,
          endBeforeDoc,
          pageSize
        );

        // Only update state if we got results
        if (result.data.length > 0) {
          setHiredJobs(result.data);
          setTotalJobs(result.count);
          setLastDoc(result.lastDoc);
          setFirstDoc(result.firstDoc);
        } else {
          // If no results, just show a notification but keep current state
          console.warn("No data found for this page");
        }
      } catch (error) {
        console.error("Error fetching hired jobs:", error);
        notifications.show({
          title: "Error",
          message: "Failed to fetch hired jobs",
          color: "red",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [getHiredJobs, pageSize]
  );

  const handleNextPage = useCallback(() => {
    if (lastDoc && firstDoc) {
      // Save current page info to stack before moving forward
      setPageStack(prev => [...prev, {
        firstDoc,
        lastDoc,
        startPosition: currentPageStart
      }]);
      setCurrentPageStart(prev => prev + hiredJobs.length);
      fetchHiredJobs("next", lastDoc, undefined);
    }
  }, [lastDoc, firstDoc, hiredJobs.length, currentPageStart, fetchHiredJobs]);

  const handlePreviousPage = useCallback(async () => {
    if (pageStack.length > 0) {
      const newStack = [...pageStack];
      const previousPage = newStack.pop();

      if (!previousPage) return;

      setPageStack(newStack);
      setCurrentPageStart(previousPage.startPosition);

      try {
        setIsLoading(true);
        const result = await getHiredJobs(
          "next",
          newStack.length > 0 ? newStack[newStack.length - 1].lastDoc : undefined,
          undefined,
          pageSize
        );

        if (result.data.length > 0) {
          setHiredJobs(result.data);
          setTotalJobs(result.count);
          setLastDoc(result.lastDoc);
          setFirstDoc(result.firstDoc);
        }
      } catch (error) {
        console.error("Failed to fetch previous page", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [pageStack, pageSize, getHiredJobs]);

  const handlePageSizeChange = useCallback(
    async (newSize: number) => {
      setPageSize(newSize);
      setLastDoc(undefined);
      setFirstDoc(undefined);
      setPageStack([]);
      setCurrentPageStart(1);

      setIsLoading(true);
      try {
        const result = await getHiredJobs("next", undefined, undefined, newSize);
        setHiredJobs(result.data);
        setTotalJobs(result.count);
        setLastDoc(result.lastDoc);
        setFirstDoc(result.firstDoc);
      } catch (error) {
        console.error("Error fetching hired jobs:", error);
        notifications.show({
          title: "Error",
          message: "Failed to fetch hired jobs",
          color: "red",
        });
        setHiredJobs([]);
        setTotalJobs(0);
      } finally {
        setIsLoading(false);
      }
    },
    [getHiredJobs]
  );

  const handleViewJobDetails = (job: IHiredJob) => {
    navigate("/jobs/" + job.jobId);
  };

  useEffect(() => {
    fetchHiredJobs();
  }, []); // Only run on mount

  const columns = (
    <Table.Tr>
      <Table.Th
        style={{
          borderTopLeftRadius: 8,
        }}
      >
        Job Title
      </Table.Th>
      <Table.Th>Hired</Table.Th>
      <Table.Th>Completed</Table.Th>
      <Table.Th>Approved</Table.Th>
      <Table.Th>Date Hired</Table.Th>
      <Table.Th
        style={{
          borderTopRightRadius: 8,
        }}
      >
        Action
      </Table.Th>
    </Table.Tr>
  );

  const rows = hiredJobs.map((job) => (
    <Table.Tr key={job.id || job.jobId}>
      <Table.Td>
        <Text size="sm" fw={500}>
          {job.jobTitle || "Untitled Job"}
        </Text>
      </Table.Td>

      <Table.Td>
        <Badge
          variant="light"
          color={(job.applicantsCount ?? 0) > 0 ? "blue" : "yellow"}
          size="md"
        >
          {job.applicantsCount || 0} applicant
          {job.applicantsCount !== 1 ? "s" : ""}
        </Badge>
      </Table.Td>

      <Table.Td>
        <Badge
          variant="light"
          color={
            job.completedApplicants && job.completedApplicants > 0
              ? "green"
              : "gray"
          }
          size="md"
        >
          {job.completedApplicants || 0} applicant
          {job.completedApplicants !== 1 ? "s" : ""}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge
          variant="light"
          color={
            job.approvedApplicants && job.approvedApplicants > 0
              ? "violet"
              : "gray"
          }
          size="md"
        >
          {job.approvedApplicants || 0} applicant
          {job.approvedApplicants !== 1 ? "s" : ""}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm">
          {job.dateHired
            ? new Date(
              typeof job.dateHired === "string"
                ? job.dateHired
                : (job.dateHired as any).toDate?.() || job.dateHired
            ).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
            : "-"}
        </Text>
      </Table.Td>
      <Table.Td>
        <div className="flex justify-center">
          <button
            onClick={() => handleViewJobDetails(job)}
            className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
            title="View job details"
          >
            <MdRemoveRedEye className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </button>
        </div>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <CustomTable
        columns={columns}
        rows={rows}
        colSpan={6}
        totalData={totalJobs}
        isLoading={isLoading}
        title="Hired Jobs"
        subtitle="Manage jobs with hired applicants"
        showPagination={true}
        onNextPage={handleNextPage}
        onPreviousPage={handlePreviousPage}
        onPageSizeChange={handlePageSizeChange}
        currentPageSize={pageSize}
        hasNextPage={totalJobs > currentPageStart + hiredJobs.length - 1}
        hasPreviousPage={pageStack.length > 0}
        currentRange={{
          start: currentPageStart,
          end: currentPageStart + hiredJobs.length - 1,
        }}
      />
    </>
  );
}
