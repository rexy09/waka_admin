import { Button, Group, Select } from "@mantine/core";
import { useState } from "react";
import { IJobReportFilters, ReportReason, ReportStatus } from "../types";

interface JobReportFiltersProps {
  onFilterChange: (filters: IJobReportFilters) => void;
  onReset: () => void;
}

export default function JobReportFilters({
  onFilterChange,
  onReset,
}: JobReportFiltersProps) {
  const [status, setStatus] = useState<ReportStatus | undefined>();
  const [reason, setReason] = useState<ReportReason | undefined>();

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "reviewed", label: "Reviewed" },
    { value: "resolved", label: "Resolved" },
    { value: "dismissed", label: "Dismissed" },
  ];

  const reasonOptions = [
    { value: "spam", label: "Spam" },
    { value: "inappropriate", label: "Inappropriate Content" },
    { value: "fraud", label: "Fraud/Scam" },
    { value: "misleading", label: "Misleading Information" },
    { value: "duplicate", label: "Duplicate Post" },
    { value: "other", label: "Other" },
  ];

  const handleApplyFilters = () => {
    const filters: IJobReportFilters = {
      status,
      reason,
    };
    onFilterChange(filters);
  };

  const handleReset = () => {
    setStatus(undefined);
    setReason(undefined);
    onReset();
  };

  return (
    <Group gap="md" align="end">
      <Select
        label="Status"
        placeholder="All statuses"
        data={statusOptions}
        value={status}
        onChange={(value) => setStatus(value as ReportStatus | undefined)}
        clearable
        style={{ minWidth: 150 }}
      />

      <Select
        label="Reason"
        placeholder="All reasons"
        data={reasonOptions}
        value={reason}
        onChange={(value) => setReason(value as ReportReason | undefined)}
        clearable
        style={{ minWidth: 200 }}
      />

      <Button onClick={handleApplyFilters}>Apply Filters</Button>
      <Button variant="subtle" onClick={handleReset}>
        Reset
      </Button>
    </Group>
  );
}
