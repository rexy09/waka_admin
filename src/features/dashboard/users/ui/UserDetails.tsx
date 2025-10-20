import {
    Avatar,
    Badge,
    Button,
    Card,
    Container,
    Grid,
    Group,
    Loader,
    Paper,
    Stack,
    Text,
    Title,
    Tooltip
} from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import {
    MdArrowBack,
    MdContentCopy,
    MdEmail,
    MdPhone,
    MdPublic,
    MdVerifiedUser
} from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { IUser } from "../../../auth/types";
import { useUserServices } from "../services";

function UserDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const clipboard = useClipboard();
    const { getUserById } = useUserServices();

    const [user, setUser] = useState<IUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    return (
        <Container size="lg" py="xl">
            <Stack gap="lg">
                {/* Header with Back Button */}
                <Group justify="space-between" align="center">
                    <Button
                        variant="subtle"
                        leftSection={<MdArrowBack />}
                        onClick={handleBack}
                    >
                        Back to Users
                    </Button>
                </Group>

                {/* User Profile Card */}
                <Card shadow="sm" padding="xl" radius="md" withBorder>
                    <Group align="flex-start" gap="xl" wrap="nowrap">
                        <Avatar
                            src={user.avatarURL}
                            size={120}
                            radius="lg"
                            className="ring-4 ring-blue-50"
                        >
                            {user.fullName?.charAt(0)?.toUpperCase()}
                        </Avatar>

                        <Stack gap="sm" style={{ flex: 1 }}>
                            <div>
                                <Title order={2}>{user.fullName || "Unknown User"}</Title>
                                <Group gap="xs" mt="xs">
                                    <Badge
                                        variant="light"
                                        color={
                                            user.userType === "employer"
                                                ? "violet"
                                                : user.userType === "jobseeker"
                                                    ? "orange"
                                                    : "gray"
                                        }
                                        size="lg"
                                    >
                                        {user.userType || "unknown"}
                                    </Badge>
                                    <Badge
                                        variant="light"
                                        color={user.role === "admin" ? "red" : "blue"}
                                        size="lg"
                                    >
                                        {user.role}
                                    </Badge>
                                    <Badge
                                        variant="light"
                                        color={user.status === "active" ? "green" : "gray"}
                                        size="lg"
                                    >
                                        {user.status || "active"}
                                    </Badge>
                                </Group>
                            </div>

                            <Group gap="md" mt="sm">
                                {user.isVerified && (
                                    <Tooltip label="Verified User">
                                        <Badge
                                            variant="light"
                                            color="green"
                                            leftSection={<MdVerifiedUser size={14} />}
                                        >
                                            Verified
                                        </Badge>
                                    </Tooltip>
                                )}
                                <Badge
                                    variant="light"
                                    color={user.isProduction ? "blue" : "orange"}
                                >
                                    {user.isProduction ? "Production" : "Staging"}
                                </Badge>
                            </Group>
                        </Stack>
                    </Group>
                </Card>

                {/* Contact Information */}
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Title order={3} mb="md">
                        Contact Information
                    </Title>
                    <Grid>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Paper p="md" className="bg-gray-50 rounded-lg">
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
                            </Paper>
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Paper p="md" className="bg-gray-50 rounded-lg">
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
                                                <MdContentCopy className="text-gray-500" size={16} />
                                            </button>
                                        </Tooltip>
                                    )}
                                </Group>
                            </Paper>
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Paper p="md" className="bg-gray-50 rounded-lg">
                                <Group gap="xs" mb="xs">
                                    <MdPublic className="text-purple-600" size={20} />
                                    <Text size="sm" fw={600} c="dimmed">
                                        Country
                                    </Text>
                                </Group>
                                <Text size="sm" fw={500}>
                                    {user.country?.name || "Not specified"}
                                </Text>
                            </Paper>
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Paper p="md" className="bg-gray-50 rounded-lg">
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
                            </Paper>
                        </Grid.Col>
                    </Grid>
                </Card>

                {/* Account Details */}
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Title order={3} mb="md">
                        Account Details
                    </Title>
                    <Grid>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Paper p="md" className="bg-gray-50 rounded-lg">
                                <Text size="sm" fw={600} c="dimmed" mb="xs">
                                    User ID
                                </Text>
                                <Group gap="xs">
                                    <Text size="sm" fw={500} className="font-mono">
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
                            </Paper>
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Paper p="md" className="bg-gray-50 rounded-lg">
                                <Text size="sm" fw={600} c="dimmed" mb="xs">
                                    Gender
                                </Text>
                                <Text size="sm" fw={500} tt="capitalize">
                                    {user.gender || "Not specified"}
                                </Text>
                            </Paper>
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Paper p="md" className="bg-gray-50 rounded-lg">
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
                            </Paper>
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Paper p="md" className="bg-gray-50 rounded-lg">
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
                            </Paper>
                        </Grid.Col>
                    </Grid>
                </Card>

                {/* Notification Tokens (Admin Only) */}
                {user.fcmTokens && user.fcmTokens.length > 0 && (
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                        <Title order={3} mb="md">
                            Push Notification Tokens
                        </Title>
                        <Stack gap="xs">
                            {user.fcmTokens.map((token, index) => (
                                <Paper key={index} p="sm" className="bg-gray-50 rounded-lg">
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
                                </Paper>
                            ))}
                        </Stack>
                    </Card>
                )}
            </Stack>
        </Container>
    );
}

export default UserDetails;