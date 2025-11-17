import {
  Table,
  Badge,
  Group,
  Avatar,
  Text,
  Tooltip,
  ActionIcon,
  Center,
} from "@mantine/core";
import { MdRemoveRedEye } from "react-icons/md";
import { IJobReportWithJobDetails, ReportStatus } from "../types";
import { CustomTable } from "../../../../common/components/Table/CustomTable";

interface JobReportsTableProps {
  reports: IJobReportWithJobDetails[];
  onViewDetails: (report: IJobReportWithJobDetails) => void;
  isLoading?: boolean;
  totalData?: number;
  showPagination?: boolean;
  fetchData?: (offset: number) => void;
}

const getStatusColor = (status: ReportStatus) => {
  switch (status) {
    case "pending":
      return "yellow";
    case "reviewed":
      return "blue";
    case "resolved":
      return "green";
    case "dismissed":
      return "gray";
    default:
      return "gray";
  }
};

const getReasonLabel = (reason: string) => {
  const labels: Record<string, string> = {
    spam: "Spam",
    inappropriate: "Inappropriate",
    fraud: "Fraud/Scam",
    misleading: "Misleading",
    duplicate: "Duplicate",
    other: "Other",
  };
  return labels[reason] || reason;
};

const formatDate = (date: any) => {
  if (!date) return "N/A";
  try {
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "N/A";
  }
};

export default function JobReportsTable({
  reports,
  onViewDetails,
  isLoading = false,
  totalData = 0,
  showPagination = false,
  fetchData,
}: JobReportsTableProps) {
  const columns = (
    <Table.Tr>
      <Table.Th>Reporter</Table.Th>
      <Table.Th>Reported Job</Table.Th>
      <Table.Th>Reason</Table.Th>
      <Table.Th>Description</Table.Th>
      <Table.Th>Status</Table.Th>
      <Table.Th>Actions</Table.Th>
    </Table.Tr>
  );

  const rows = reports.map((report) => (
    <Table.Tr key={report.id}>
      <Table.Td>
        <Group gap="sm">
          <Avatar color="blue" size="sm" radius="xl">
            {report.fullName?.charAt(0).toUpperCase() || "?"}
          </Avatar>
          <div>
            <Text size="sm" fw={500}>
              {report.fullName || "Unknown"}
            </Text>
            <Text size="xs" c="dimmed">
              {formatDate(report.reportedAt)}
            </Text>
          </div>
        </Group>
      </Table.Td>
      <Table.Td>
        <div>
          <Text size="sm" fw={500} lineClamp={1}>
            {report.jobDetails?.title || "N/A"}
          </Text>
          <Text size="xs" c="dimmed">
            By {report.jobDetails?.fullName || "Unknown"}
          </Text>
        </div>
      </Table.Td>
      <Table.Td>
        <Badge size="sm" variant="light">
          {getReasonLabel(report.reason)}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Tooltip label={report.additionalDetails || "No details"} position="top" withArrow>
          <Text size="sm" lineClamp={2} style={{ maxWidth: 250 }}>
            {report.additionalDetails || "No details provided"}
          </Text>
        </Tooltip>
      </Table.Td>
      <Table.Td>
        <Badge color={getStatusColor(report.status)} size="md" variant="light">
          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Center>
          <Tooltip label="View report details" position="top" withArrow>
            <ActionIcon
              variant="subtle"
              color="blue"
              size="lg"
              onClick={() => onViewDetails(report)}
            >
              <MdRemoveRedEye size={18} />
            </ActionIcon>
          </Tooltip>
        </Center>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <CustomTable
      columns={columns}
      rows={rows}
      colSpan={6}
      isLoading={isLoading}
      totalData={totalData}
      showPagination={showPagination}
      fetchData={fetchData}
      title="Job Reports"
    />
  );
}
