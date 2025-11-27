import {
  Avatar,
  Badge,
  Button,
  Card,
  Container,
  Divider,
  Grid,
  Group,
  Loader,
  Paper,
  Space,
  Stack,
  Tabs,
  Text,
  Title,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import {
  MdApartment,
  MdArrowBack,
  MdBusinessCenter,
  MdContentCopy,
  MdEmail,
  MdPerson,
  MdPhone,
  MdPublic,
  MdSecurity,
  MdVerifiedUser,
  MdMale,
  MdFemale,
  MdTransgender,
} from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { IUser } from "../../../auth/types";
import { useUserServices } from "../services";
import { IoArrowBack } from "react-icons/io5";
import SendNotificationModal from "../components/SendNotificationModal";
import MyJobs from "../../jobs/ui/MyJobs";
import { Color } from "../../../../common/theme";
import { useUserJobCounts } from "../../jobs/hooks/useUserJobCounts";

function UserDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const clipboard = useClipboard();
  const { getUserById } = useUserServices();

  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use React Query hook for cached job counts
  const { data: jobCounts, isLoading: isLoadingCounts } = useUserJobCounts(id);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) {
        setError("User ID is required");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const userData = await getUserById(id);
        if (userData) {
          setUser(userData);
        } else {
          setError("User not found");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to load user details");
        notifications.show({
          title: "Error",
          message: "Failed to load user details",
          color: "red",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // Only depend on id, not getUserById

  const handleCopy = (text: string, label: string) => {
    clipboard.copy(text);
    notifications.show({
      title: "Copied!",
      message: `${label} copied to clipboard`,
      color: "green",
      icon: <MdContentCopy />,
    });
  };

  const handleBack = () => {
    navigate("/users");
  };

  if (isLoading) {
    return (
      <Container size="lg" py="xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader size="lg" />
        </div>
      </Container>
    );
  }

  if (error || !user) {
    return (
      <Container size="lg" py="xl">
        <Paper p="xl" withBorder className="text-center">
          <Text size="xl" fw={600} c="red" mb="md">
            {error || "User not found"}
          </Text>
          <Button onClick={handleBack} leftSection={<MdArrowBack />}>
            Back to Users
          </Button>
        </Paper>
      </Container>
    );
  }

  const formatCount = (count: number) => String(count).padStart(2, "0");

  const userStats = [
    {
      label: "Posted",
      value: jobCounts?.posted ?? 0,
    },
    {
      label: "Applied",
      value: jobCounts?.applied ?? 0,
    },
    {
      label: "Hired",
      value: jobCounts?.hired ?? 0,
    },
    {
      label: "Saved Jobs",
      value: jobCounts?.saved ?? 0,
    },
  ];

  const profileBadges = [
    {
      key: "type",
      label: (user.userType || "unknown").replace(/^\w/, (char) =>
        char.toUpperCase()
      ),
      color:
        user.userType === "individual"
          ? "teal"
          : user.userType === "institute"
          ? "violet"
          : "gray",
      icon:
        user.userType === "individual" ? (
          <MdPerson size={14} />
        ) : user.userType === "institute" ? (
          <MdApartment size={14} />
        ) : (
          <MdBusinessCenter size={14} />
        ),
    },
    {
      key: "role",
      label: user.role,
      color: user.role === "admin" ? "red" : "indigo",
      icon: <MdSecurity size={14} />,
    },
    {
      key: "status",
      label: user.status || "Active",
      color: user.status === "Active" ? "green" : "gray",
      icon: <MdVerifiedUser size={14} />,
    },
  ];

  return (
    <Stack gap="md">
      <Group wrap="wrap" justify="space-between" align="start">
        <Group justify="start">
          <UnstyledButton onClick={() => navigate(-1)}>
            <IoArrowBack size={20} />
          </UnstyledButton>
          <Text size="28px" fw={700} c="#141514">
            User Details
          </Text>
        </Group>
        <SendNotificationModal
          userId={user.uid}
          userName={user.fullName}
          countryCode={user.country?.code}
        />
      </Group>
      <Divider />
      <Tabs color={Color.PrimaryBlue} defaultValue="first">
        <Tabs.List>
          <Tabs.Tab value="first">Profile</Tabs.Tab>
          <Tabs.Tab value="second" color="blue">
            Jobs
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="first" pt="xs">
          <Stack gap="md">
            {/* User Profile Card */}
            <Card shadow="sm" padding="md" radius="md" withBorder>
              <Group
                justify="space-between"
                align="center"
                gap="xl"
                wrap="wrap"
              >
                <Group align="center" gap="md" wrap="wrap">
                  <div style={{ position: "relative" }}>
                    <Avatar
                      src={user.avatarURL}
                      size={120}
                      radius="xl"
                      className="ring-1 ring-blue-50"
                    >
                      {user.fullName?.charAt(0)?.toUpperCase()}
                    </Avatar>
                  </div>

                  <Stack gap="xs" style={{ minWidth: 200, flex: 1 }}>
                    <Title order={2} tt="capitalize">
                      {user.fullName || "Unknown User"}
                    </Title>
                    <Group gap="sm" wrap="wrap">
                      {profileBadges.map(({ key, label, color, icon }) => (
                        <Badge
                          key={key}
                          variant="outline"
                          color={color}
                          radius="xl"
                          size="lg"
                          leftSection={icon}
                          tt="capitalize"
                          styles={{
                            root: {
                              paddingInline: 14,
                              borderColor: "rgba(20,20,20,0.12)",
                              backgroundColor: "rgba(20,20,20,0.02)",
                            },
                            label: {
                              fontWeight: 600,
                              letterSpacing: 0.3,
                            },
                          }}
                        >
                          {label}
                        </Badge>
                      ))}
                    </Group>
                    <Group gap="sm" wrap="wrap">
                      <Badge
                        variant="light"
                        color={
                          user.gender === "Male"
                            ? "blue"
                            : user.gender === "Female"
                            ? "pink"
                            : "gray"
                        }
                        radius="xl"
                        size="lg"
                        tt="capitalize"
                        leftSection={
                          user.gender === "Male" ? (
                            <MdMale size={16} />
                          ) : user.gender === "Female" ? (
                            <MdFemale size={16} />
                          ) : (
                            <MdTransgender size={16} />
                          )
                        }
                        styles={{
                          root: {
                            paddingInline: 14,
                          },
                          label: {
                            fontWeight: 600,
                            letterSpacing: 0.3,
                          },
                        }}
                      >
                        {user.gender || "Not specified"}
                      </Badge>
                    </Group>

                    <Group gap="sm" wrap="wrap">
                      {user.isVerified && (
                        <Tooltip label="Verified User">
                          <Badge
                            variant="gradient"
                            gradient={{ from: "teal", to: "green" }}
                            leftSection={<MdVerifiedUser size={14} />}
                            size="lg"
                            radius="xl"
                            styles={{
                              label: { fontWeight: 600 },
                            }}
                          >
                            Verified
                          </Badge>
                        </Tooltip>
                      )}
                    </Group>
                  </Stack>
                </Group>
                <Stack gap={"md"}>
                  <Group justify="flex-end">
                    <Group gap="xs">
                      <Text
                        size="sm"
                        fw={500}
                        c={"dimmed"}
                        className="font-mono"
                      >
                        {user.uid}
                      </Text>
                      <Tooltip label="Copy User ID">
                        <button
                          onClick={() => handleCopy(user.uid, "User ID")}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <MdContentCopy className="text-gray-500" size={16} />
                        </button>
                      </Tooltip>
                    </Group>
                  </Group>
                  <Group gap="xl" align="center" wrap="wrap">
                    {userStats.map(({ label, value }) => (
                      <Stack key={label} gap={0} align="center" miw={100}>
                        {isLoadingCounts ? (
                          <Loader size="sm" />
                        ) : (
                          <Text size="36px" fw={700} c="#141414">
                            {formatCount(value)}
                          </Text>
                        )}
                        <Text size="sm" c="dimmed">
                          {label}
                        </Text>
                      </Stack>
                    ))}
                  </Group>
                </Stack>
              </Group>
              <Space h="md" />
              {(user as any).bio && (
                <Paper shadow="0" maw={"70%"}>
                  <Text size="md" c="dimmed" mb={4} fw={500}>
                    Biography
                  </Text>
                  <Text size="sm" style={{ lineHeight: 1.6 }}>
                    {(user as any).bio}
                  </Text>
                </Paper>
              )}
            </Card>

            {/* Contact Information */}
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={3} mb="md">
                Account Information
              </Title>
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <div>
                    <Group gap="xs" mb="xs">
                      <MdEmail className="text-blue-600" size={20} />
                      <Text size="sm" fw={600} c="dimmed">
                        Email Address
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <Text size="sm" fw={500}>
                        {user.email}
                      </Text>
                      <Tooltip label="Copy email">
                        <button
                          onClick={() => handleCopy(user.email, "Email")}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <MdContentCopy className="text-gray-500" size={16} />
                        </button>
                      </Tooltip>
                    </Group>
                  </div>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <div>
                    <Group gap="xs" mb="xs">
                      <MdPhone className="text-green-600" size={20} />
                      <Text size="sm" fw={600} c="dimmed">
                        Phone Number
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <Text size="sm" fw={500}>
                        {user.phoneNumber || "Not provided"}
                      </Text>
                      {user.phoneNumber && (
                        <Tooltip label="Copy phone">
                          <button
                            onClick={() =>
                              handleCopy(user.phoneNumber!, "Phone number")
                            }
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <MdContentCopy
                              className="text-gray-500"
                              size={16}
                            />
                          </button>
                        </Tooltip>
                      )}
                    </Group>
                  </div>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <div>
                    <Group gap="xs" mb="xs">
                      <MdPublic className="text-purple-600" size={20} />
                      <Text size="sm" fw={600} c="dimmed">
                        Country
                      </Text>
                    </Group>
                    <Text size="sm" fw={500}>
                      {user.country?.name || "Not specified"}
                    </Text>
                  </div>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <div>
                    <Group gap="xs" mb="xs">
                      <Text size="sm" fw={600} c="dimmed">
                        Currency
                      </Text>
                    </Group>
                    <Text size="sm" fw={500}>
                      {user.currency?.name
                        ? `${user.currency.name} (${user.currency.symbol})`
                        : "Not specified"}
                    </Text>
                  </div>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <div>
                    <Text size="sm" fw={600} c="dimmed" mb="xs">
                      Date Joined
                    </Text>
                    <Text size="sm" fw={500}>
                      {user.dateAdded
                        ? new Date(
                            typeof user.dateAdded === "string"
                              ? user.dateAdded
                              : (user.dateAdded as any).toDate()
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Unknown"}
                    </Text>
                  </div>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <div>
                    <Text size="sm" fw={600} c="dimmed" mb="xs">
                      Last Updated
                    </Text>
                    <Text size="sm" fw={500}>
                      {user.dateUpdated
                        ? new Date(
                            typeof user.dateUpdated === "string"
                              ? user.dateUpdated
                              : (user.dateUpdated as any).toDate()
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Unknown"}
                    </Text>
                  </div>
                </Grid.Col>
              </Grid>
            </Card>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="second" pt="xs">
          <MyJobs />
        </Tabs.Panel>
      </Tabs>

      {/* Notification Tokens (Admin Only) */}
      {/* {user.fcmTokens && user.fcmTokens.length > 0 && (
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Title order={3} mb="md">
                        Push Notification Tokens
                    </Title>
                    <Stack gap="xs">
                        {user.fcmTokens.map((token, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-2">
                                <Group gap="xs">
                                    <Text size="xs" className="font-mono flex-1 truncate">
                                        {token}
                                    </Text>
                                    <Tooltip label="Copy token">
                                        <button
                                            onClick={() => handleCopy(token, "Token")}
                                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                                        >
                                            <MdContentCopy className="text-gray-500" size={14} />
                                        </button>
                                    </Tooltip>
                                </Group>
                            </div>
                        ))}
                    </Stack>
                </Card>
            )} */}
    </Stack>
  );
}

export default UserDetails;
