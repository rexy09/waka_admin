import {
  Badge,
  Table,
  Text
} from "@mantine/core";
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

  const fetchHiredJobs = useCallback(
    async (
      direction: "next" | "prev" | string | undefined = "next",
      startAfterDoc?: DocumentSnapshot,
      endBeforeDoc?: DocumentSnapshot
    ) => {
      setIsLoading(true);
      try {
        const result = await getHiredJobs(direction, startAfterDoc, endBeforeDoc);
        setHiredJobs(result.data);
        setTotalJobs(result.count);
        setLastDoc(result.lastDoc);
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

  const handlePagination = useCallback(
    (page: number) => {
      if (page > 1) {
        fetchHiredJobs("next", lastDoc, undefined);
      } else {
        fetchHiredJobs("next", undefined, undefined);
      }
    },
    [fetchHiredJobs, lastDoc]
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
      <Table.Th>Applicants</Table.Th>
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
        <Badge variant="light" color="blue" size="md">
          {job.applicantsCount || 0} applicant{job.applicantsCount !== 1 ? 's' : ''}
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
        colSpan={5}
        totalData={totalJobs}
        isLoading={isLoading}
        title="Hired Jobs"
        subtitle="Manage jobs with hired applicants"
        showPagination={true}
        fetchData={handlePagination}
      />

      
    </>
  );
}
