import {
  Avatar,
  Badge,
  Button,
  Center,
  Divider,
  Group,
  Image,
  Loader,
  Modal,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IUser } from "../../../auth/types";
import { useUserVerificationServices } from "../services";
import {
  IUserVerificationProfile,
  IVerificationStatusUpdate,
  VerificationStatus,
} from "../types";

interface VerificationDetailsModalProps {
  opened: boolean;
  onClose: () => void;
  verification: IUserVerificationProfile | null;
  onStatusUpdate: () => void;
}


const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "yellow";
    case "verified":
    case "approved":
      return "green";
    case "rejected":
      return "red";
    case "failed":
    case "needs_info":
      return "orange";
    case "under_review":
      return "blue";
    default:
      return "gray";
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

export default function VerificationDetailsModal({
  opened,
  onClose,
  verification,
  onStatusUpdate,
}: VerificationDetailsModalProps) {
  const navigate = useNavigate();
  const { getUserDetails, updateVerificationStatus } =
    useUserVerificationServices();
  const [userDetails, setUserDetails] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<VerificationStatus | undefined>();
  const [reviewNotes, setReviewNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [additionalInfoRequested, setAdditionalInfoRequested] = useState("");
  const updateUserStatus = true;

  useEffect(() => {
    if (verification && opened) {
      // Map verificationStatus to VerificationStatus for the form
      const mappedStatus = verification.verificationStatus === "verified" ? "approved" :
                          verification.verificationStatus === "failed" ? "rejected" :
                          verification.verificationStatus as VerificationStatus;
      setNewStatus(mappedStatus);
      setReviewNotes("");
      setRejectionReason("");
      setAdditionalInfoRequested("");
      fetchUserDetails();
    }
  }, [verification, opened]);

  const fetchUserDetails = async () => {
    if (!verification) return;
    setLoading(true);
    try {
      const user = await getUserDetails(verification.uid);
      setUserDetails(user);
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!verification || !newStatus) return;

    setUpdating(true);
    try {
      const updateData: IVerificationStatusUpdate = {
        status: newStatus,
        reviewNotes: reviewNotes.trim(),
        rejectionReason: rejectionReason.trim(),
        additionalInfoRequested: additionalInfoRequested.trim(),
        reviewedBy: "admin",
        reviewedByName: "Admin",
        updateUserVerificationStatus: updateUserStatus,
      };

      await updateVerificationStatus(verification.id, updateData);
      notifications.show({
        color: "green",
        title: "Success",
        message: "Verification status updated successfully",
      });
      onStatusUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating verification:", error);
      notifications.show({
        color: "red",
        title: "Error",
        message: "Failed to update verification status",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleViewUser = () => {
    if (verification) {
      navigate(`/users/${verification.uid}`);
      onClose();
    }
  };

  if (!verification) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Verification Request Details"
      size="xl"
    >
      <Stack gap="md">
        {/* Status Badge */}
        <Group justify="space-between">
          <Text size="sm" fw={500}>
            Current Status
          </Text>
          <Badge color={getStatusColor(verification.verificationStatus)} size="lg">
            {verification.verificationStatus?.toUpperCase() || "N/A"}
          </Badge>
        </Group>

        <Divider />

        {/* User Info */}
        <Paper p="sm" withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={600}>
              User Information
            </Text>
            <Button variant="subtle" size="xs" onClick={handleViewUser}>
              View Profile
            </Button>
          </Group>
          <Group gap="sm">
            <Avatar src={verification.avatarURL} size="md" radius="xl">
              {verification.fullName?.charAt(0)?.toUpperCase() || "?"}
            </Avatar>
            <div>
              <Text size="sm" fw={500}>
                {verification.fullName}
              </Text>
              <Text size="xs" c="dimmed">
                {verification.email}
              </Text>
              {verification.phoneNumber && (
                <Text size="xs" c="dimmed">
                  {verification.phoneNumber}
                </Text>
              )}
            </div>
          </Group>
          {loading ? (
            <Center mt="xs">
              <Loader size="sm" />
            </Center>
          ) : userDetails ? (
            <Stack gap="xs" mt="sm">
              <Text size="xs">
                <strong>Current Verification Status:</strong>{" "}
                {userDetails.isVerified ? "Verified" : "Not Verified"}
              </Text>
              <Text size="xs">
                <strong>User Type:</strong> {userDetails.userType}
              </Text>
              <Text size="xs">
                <strong>Country:</strong> {userDetails.country?.name || "N/A"}
              </Text>
            </Stack>
          ) : null}
        </Paper>

        {/* Verification Details */}
        <Paper p="sm" withBorder>
          <Text size="sm" fw={600} mb="xs">
            Verification Details
          </Text>
          <Stack gap="xs">
            <Group>
              <Text size="sm" c="dimmed">
                ID Card Type:
              </Text>
              <Badge color="blue">{verification.idCardType?.toUpperCase() || "N/A"}</Badge>
            </Group>
            <Group>
              <Text size="sm" c="dimmed">
                Verification Method:
              </Text>
              <Badge color="violet">{verification.verificationMethod || "N/A"}</Badge>
            </Group>
            <Text size="sm">
              <strong>Verification Date:</strong> {formatDate(verification.verificationDate)}
            </Text>
            <Text size="sm">
              <strong>Date Added:</strong> {formatDate(verification.dateAdded)}
            </Text>
            {verification.country && (
              <Text size="sm">
                <strong>Country:</strong> {verification.country}
              </Text>
            )}
            {verification.birthDate && (
              <Text size="sm">
                <strong>Birth Date:</strong> {verification.birthDate}
              </Text>
            )}
            <Group>
              <Text size="sm" c="dimmed">
                Active:
              </Text>
              <Badge color={verification.isActive ? "green" : "red"}>
                {verification.isActive ? "Active" : "Inactive"}
              </Badge>
            </Group>
            <Group>
              <Text size="sm" c="dimmed">
                Production:
              </Text>
              <Badge color={verification.isProduction ? "blue" : "gray"}>
                {verification.isProduction ? "Yes" : "No"}
              </Badge>
            </Group>
          </Stack>
        </Paper>

        {/* Verification Images */}
        <Paper p="sm" withBorder>
          <Text size="sm" fw={600} mb="md">
            Verification Images
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            {/* Face Image */}
            <Paper p="sm" withBorder>
              <Text size="xs" fw={500} mb="xs" c="dimmed">
                Face Verification Image
              </Text>
              <Image
                src={verification.faceImageUrl}
                alt="Face verification"
                radius="md"
                fit="contain"
                h={200}
                style={{ cursor: "pointer" }}
                onClick={() => window.open(verification.faceImageUrl, "_blank")}
              />
            </Paper>

            {/* ID Card Image */}
            <Paper p="sm" withBorder>
              <Text size="xs" fw={500} mb="xs" c="dimmed">
                ID Card Image
              </Text>
              <Image
                src={verification.idCardImageUrl}
                alt="ID card"
                radius="md"
                fit="contain"
                h={200}
                style={{ cursor: "pointer" }}
                onClick={() => window.open(verification.idCardImageUrl, "_blank")}
              />
            </Paper>
          </SimpleGrid>
        </Paper>

        {/* Metadata Info */}
        {verification.metadata && (
          <Paper p="sm" withBorder bg="gray.0">
            <Text size="xs" fw={500} mb={4}>
              Verification Metadata
            </Text>
            <Stack gap="xs">
              <Text size="xs">
                <strong>API Status:</strong> {verification.metadata.apiStatus}
              </Text>
              <Text size="xs">
                <strong>API Message:</strong> {verification.metadata.apiMessage}
              </Text>
              <Text size="xs">
                <strong>Scan Method:</strong> {verification.metadata.scanMethod}
              </Text>
              <Text size="xs">
                <strong>Total Samples:</strong> {verification.metadata.totalSamples}
              </Text>
              <Text size="xs">
                <strong>Embedding Samples:</strong> {verification.metadata.embeddingSampleCount}
              </Text>
            </Stack>
          </Paper>
        )}

        {/* Update Status Section */}
        <Divider label="Review & Update Status" labelPosition="center" />

        <Select
          label="New Status"
          data={[
            { value: "pending", label: "Pending" },
            // { value: "under_review", label: "Under Review" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" },
            // { value: "needs_info", label: "Needs Additional Info" },
          ]}
          value={newStatus}
          onChange={(value) => setNewStatus(value as VerificationStatus)}
        />

        {newStatus === "approved" && (
          <Paper p="sm" withBorder bg="green.0">
            <Text size="xs" c="green.9">
              Approving this verification will{" "}
              {updateUserStatus ? "mark the user as verified" : "not update user status"}.
            </Text>
          </Paper>
        )}

       {newStatus !== "rejected" &&  <Textarea
          label="Review Notes"
          placeholder="Add your review notes here..."
          value={reviewNotes}
          onChange={(e) => setReviewNotes(e.currentTarget.value)}
          minRows={3}
        />}

        {newStatus === "rejected" && (
          <Textarea
            label="Rejection Reason (Required)"
            placeholder="Explain why the verification was rejected..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.currentTarget.value)}
            minRows={2}
            required
          />
        )}

        {newStatus === "needs_info" && (
          <Textarea
            label="Additional Information Requested"
            placeholder="Specify what additional information is needed..."
            value={additionalInfoRequested}
            onChange={(e) => setAdditionalInfoRequested(e.currentTarget.value)}
            minRows={2}
          />
        )}

        {/* Action Buttons */}
        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateStatus}
            loading={updating}
            disabled={
              !newStatus ||
              (newStatus === "rejected" && !rejectionReason.trim())
            }
          >
            Update Status
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
