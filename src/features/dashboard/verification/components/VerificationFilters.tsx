import { Button, Group, Select } from "@mantine/core";
import { useState } from "react";
import {
  IVerificationFilters,
  VerificationStatus,

} from "../types";

interface VerificationFiltersProps {
  onFilterChange: (filters: IVerificationFilters) => void;
  onReset: () => void;
}

export default function VerificationFilters({
  onFilterChange,
  onReset,
}: VerificationFiltersProps) {
  const [status, setStatus] = useState<VerificationStatus | undefined>();
  const [verificationType, setVerificationType] = useState<
    string | undefined
  >();

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "under_review", label: "Under Review" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "needs_info", label: "Needs Info" },
  ];

  const typeOptions = [
    { value: "identity", label: "Identity Verification" },
    { value: "business", label: "Business Verification" },
    { value: "employer", label: "Employer Verification" },
    { value: "phone", label: "Phone Verification" },
    { value: "email", label: "Email Verification" },
  ];

  const handleApplyFilters = () => {
    const filters: IVerificationFilters = {
      status,
      verificationType,
    };
    onFilterChange(filters);
  };

  const handleReset = () => {
    setStatus(undefined);
    setVerificationType(undefined);
    onReset();
  };

  return (
    <Group gap="md" align="end">
      <Select
        label="Status"
        placeholder="All statuses"
        data={statusOptions}
        value={status}
        onChange={(value) => setStatus(value as VerificationStatus | undefined)}
        clearable
        style={{ minWidth: 180 }}
      />

      <Select
        label="Verification Type"
        placeholder="All types"
        data={typeOptions}
        value={verificationType}
        onChange={(value) =>
          setVerificationType(value as string | undefined)
        }
        clearable
        style={{ minWidth: 220 }}
      />

      <Button onClick={handleApplyFilters}>Apply Filters</Button>
      <Button variant="subtle" onClick={handleReset}>
        Reset
      </Button>
    </Group>
  );
}
