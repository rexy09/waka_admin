import {
  Modal,
  Stack,
  Text,
  Badge,
  Group,
  Button,
  Divider,
  Select,
  Textarea,
  Avatar,
  Paper,
  Loader,
  Center,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IJobReport, IReportStatusUpdate, ReportStatus } from "../types";
import { useJobReportServices } from "../services";
import { IJobPost } from "../../jobs/types";

interface JobReportDetailsModalProps {
  opened: boolean;
  onClose: () => void;
  report: IJobReport | null;
  onStatusUpdate: () => void;
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
    inappropriate: "Inappropriate Content",
    fraud: "Fraud/Scam",
    misleading: "Misleading Information",
    duplicate: "Duplicate Post",
    other: "Other",
  };
  return labels[reason] || reason;
};

export default function JobReportDetailsModal({
  opened,
  onClose,
  report,
  onStatusUpdate,
}: JobReportDetailsModalProps) {
  const navigate = useNavigate();
  const { getJobDetails, updateReportStatus } = useJobReportServices();
  const [jobDetails, setJobDetails] = useState<IJobPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<ReportStatus | undefined>();
  const [reviewNotes, setReviewNotes] = useState("");
  const [actionTaken, setActionTaken] = useState("");

  useEffect(() => {
    if (report && opened) {
      setNewStatus(report.status);
      setReviewNotes("");
      setActionTaken("");
      fetchJobDetails();
    }
  }, [report, opened]);

  const fetchJobDetails = async () => {
    if (!report) return;
    setLoading(true);
    try {
      const job = await getJobDetails(report.jobId);
      setJobDetails(job);
    } catch (error) {
      console.error("Error fetching job details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!report || !newStatus) return;

    setUpdating(true);
    try {
      const updateData: IReportStatusUpdate = {
        status: newStatus,
        reviewNotes: reviewNotes.trim(),
        actionTaken: actionTaken.trim(),
        reviewedBy: "admin",
        reviewedByName: "Admin",
      };

      await updateReportStatus(report.id, updateData);
      notifications.show({
        color: "green",
        title: "Success",
        message: "Report status updated successfully",
      });
      onStatusUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating report:", error);
      notifications.show({
        color: "red",
        title: "Error",
        message: "Failed to update report status",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleViewJob = () => {
    if (report) {
      navigate(`/jobs/${report.jobId}`);
      onClose();
    }
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

  if (!report) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Job Report Details"
      size="lg"
    >
      <Stack gap="md">
        {/* Report Status */}
        <Group justify="space-between">
          <Text size="sm" fw={500}>
            Report Status
          </Text>
          <Badge color={getStatusColor(report.status)} size="lg">
            {report.status.toUpperCase()}
          </Badge>
        </Group>

        <Divider />

        {/* Reporter Info */}
        <Paper p="sm" withBorder>
          <Text size="sm" fw={600} mb="xs">
            Reporter Information
          </Text>
          <Group gap="sm">
            <Avatar color="blue" size="md" radius="xl">
              {report.fullName?.charAt(0)?.toUpperCase() || "?"}
            </Avatar>
            <div>
              <Text size="sm" fw={500}>
                {report.fullName}
              </Text>
              <Text size="xs" c="dimmed">
                Reported on {formatDate(report.reportedAt)}
              </Text>
            </div>
          </Group>
        </Paper>

        {/* Report Details */}
        <Paper p="sm" withBorder>
          <Text size="sm" fw={600} mb="xs">
            Report Details
          </Text>
          <Stack gap="xs">
            <Group>
              <Text size="sm" c="dimmed">
                Reason:
              </Text>
              <Badge>{getReasonLabel(report.reason)}</Badge>
            </Group>
            <div>
              <Text size="sm" c="dimmed" mb={4}>
                Description:
              </Text>
              <Text size="sm">{report.additionalDetails}</Text>
            </div>
          </Stack>
        </Paper>

        {/* Job Info */}
        <Paper p="sm" withBorder>
          <Text size="sm" fw={600} mb="xs">
            Reported Job
          </Text>
          {loading ? (
            <Center p="md">
              <Loader size="sm" />
            </Center>
          ) : (
            <Stack gap="xs">
              {jobDetails ? (
                <>
                  <Text size="sm">
                    <strong>Title:</strong> {jobDetails.title || "N/A"}
                  </Text>
                  <Text size="sm">
                    <strong>Posted by:</strong> {jobDetails.fullName}
                  </Text>
                </>
              ) : (
                <Text size="sm" c="dimmed">
                  Loading job details...
                </Text>
              )}
              {jobDetails && (
                <>
                  <Text size="sm">
                    <strong>Budget:</strong> {jobDetails.currency?.symbol}
                    {jobDetails.budget}
                  </Text>
                  <Text size="sm">
                    <strong>Location:</strong> {jobDetails.location?.address}
                  </Text>
                </>
              )}
              <Button
                variant="light"
                size="xs"
                onClick={handleViewJob}
                mt="xs"
              >
                View Full Job Details
              </Button>
            </Stack>
          )}
        </Paper>

        {/* Update Status Section */}
        <Divider label="Update Report" labelPosition="center" />

        <Select
          label="Status"
          data={[
            { value: "pending", label: "Pending" },
            { value: "reviewed", label: "Reviewed" },
            { value: "resolved", label: "Resolved" },
            { value: "dismissed", label: "Dismissed" },
          ]}
          value={newStatus}
          onChange={(value) => setNewStatus(value as ReportStatus)}
        />

        <Textarea
          label="Review Notes"
          placeholder="Add your review notes here..."
          value={reviewNotes}
          onChange={(e) => setReviewNotes(e.currentTarget.value)}
          minRows={3}
        />

        <Textarea
          label="Action Taken"
          placeholder="Describe any actions taken..."
          value={actionTaken}
          onChange={(e) => setActionTaken(e.currentTarget.value)}
          minRows={2}
        />

        {/* Existing Review Info */}
        {report.reviewerId && (
          <Paper p="sm" withBorder bg="gray.0">
            <Text size="xs" c="dimmed">
              Last reviewed by {report.reviewerId} on{" "}
              {formatDate(report.reviewedAt)}
            </Text>
          </Paper>
        )}

        {/* Action Buttons */}
        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateStatus}
            loading={updating}
            disabled={!newStatus}
          >
            Update Status
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
