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
import { IUserVerificationProfile } from "../types";
import { CustomTable } from "../../../../common/components/Table/CustomTable";

interface VerificationTableProps {
  verifications: IUserVerificationProfile[];
  onViewDetails: (verification: IUserVerificationProfile) => void;
  isLoading?: boolean;
  totalData?: number;
  showPagination?: boolean;
  fetchData?: (offset: number) => void;
}

type ProfileVerificationStatus = "pending" | "verified" | "rejected" | "failed";

const getStatusColor = (status: ProfileVerificationStatus) => {
  switch (status) {
    case "pending":
      return "yellow";
    case "verified":
      return "green";
    case "rejected":
      return "red";
    case "failed":
      return "orange";
    default:
      return "gray";
  }
};

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    identity: "Identity",
    business: "Business",
    employer: "Employer",
    phone: "Phone",
    email: "Email",
  };
  return labels[type] || type;
};

const formatDate = (date: any) => {
  if (!date) return "N/A";
  try {
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "N/A";
  }
};

export default function VerificationTable({
  verifications,
  onViewDetails,
  isLoading = false,
  totalData = 0,
  showPagination = false,
  fetchData,
}: VerificationTableProps) {
  const columns = (
    <Table.Tr>
      <Table.Th>User</Table.Th>
      <Table.Th>ID Type</Table.Th>
      <Table.Th>Status</Table.Th>
      <Table.Th>Verification Date</Table.Th>
      <Table.Th>Method</Table.Th>
      <Table.Th>Active</Table.Th>
      <Table.Th>Actions</Table.Th>
    </Table.Tr>
  );

  const rows = verifications.map((verification) => (
    <Table.Tr key={verification.id}>
      <Table.Td>
        <Group gap="sm">
          <Avatar src={verification.avatarURL} color="blue" size="sm" radius="xl">
            {verification.fullName?.charAt(0)?.toUpperCase() || "?"}
          </Avatar>
          <div>
            <Text size="sm" fw={500}>
              {verification.fullName || "Unknown"}
            </Text>
            <Text size="xs" c="dimmed">
              {verification.email}
            </Text>
          </div>
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge size="sm" variant="light" color="blue">
          {getTypeLabel(verification.idCardType || "unknown")}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge
          color={getStatusColor(verification.verificationStatus as ProfileVerificationStatus)}
          size="md"
          variant="light"
        >
          {verification.verificationStatus?.toUpperCase() || "N/A"}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{formatDate(verification.verificationDate)}</Text>
      </Table.Td>
      <Table.Td>
        <Badge size="sm" variant="outline">
          {verification.verificationMethod || "N/A"}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge size="sm" variant="light" color={verification.isActive ? "green" : "red"}>
          {verification.isActive ? "Active" : "Inactive"}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Center>
          <Tooltip label="View verification details" position="top" withArrow>
            <ActionIcon
              variant="subtle"
              color="blue"
              size="lg"
              onClick={() => onViewDetails(verification)}
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
      colSpan={7}
      isLoading={isLoading}
      totalData={totalData}
      showPagination={showPagination}
      fetchData={fetchData}
      title="User Verifications"
    />
  );
}
