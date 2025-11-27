import { Button, Group, Modal, Stack, Text, Textarea, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import { useEffect, useState } from "react";
import { MdNotifications, MdSend } from "react-icons/md";
import Env from "../../../../config/env";

type Props = {
    userId: string;
    userName?: string;
    countryCode?: string;
};

interface NotificationFormValues {
    title: string;
    body: string;
    country_code: string;
    data: string;
}

export default function SendNotificationModal({ userId, userName, countryCode }: Props) {
    const [opened, { open, close }] = useDisclosure(false);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<NotificationFormValues>({
        initialValues: {
            title: "",
            body: "",
            country_code: countryCode || "",
            data: "{}",
        },
        validate: {
            title: (value) => (!value ? "Title is required" : null),
            body: (value) => (!value ? "Body is required" : null),
            data: (value) => {
                try {
                    JSON.parse(value);
                    return null;
                } catch (error) {
                    return "Invalid JSON format";
                }
            },
        },
    });

    useEffect(() => {
        form.setFieldValue("country_code", countryCode || "");
    }, [countryCode]);

    const handleSubmit = async (values: NotificationFormValues) => {
        setIsLoading(true);
        try {
            const parsedData = JSON.parse(values.data);

            await axios.post(
                Env.baseURL + "/notifications/job_notifications",
                {
                    user_id: userId,
                    country_code: values.country_code,
                    title: values.title,
                    body: values.body,
                    data: parsedData,
                },
            );

            notifications.show({
                title: "Success",
                message: "Notification sent successfully",
                color: "green",
                icon: <MdSend />,
            });

            form.reset();
            close();
        } catch (error: any) {
            console.error("Error sending notification:", error);
            notifications.show({
                title: "Error",
                message: error?.response?.data?.message || "Failed to send notification",
                color: "red",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Modal
                opened={opened}
                onClose={() => {
                    form.reset();
                    close();
                }}
                centered
                size="lg"
                title={
                    <Group gap="xs">
                        <MdNotifications size={24} />
                        <Text size="xl" fw={600}>
                            Send Notification
                        </Text>
                    </Group>
                }
            >
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack gap="md">
                        {userName && (
                            <Text size="sm" c="dimmed">
                                Sending notification to: <strong>{userName}</strong>
                            </Text>
                        )}

                        <TextInput
                            label="Title"
                            placeholder="Enter notification title"
                            required
                            {...form.getInputProps("title")}
                        />

                        <Textarea
                            label="Body"
                            placeholder="Enter notification body"
                            required
                            {...form.getInputProps("body")}
                        />

                

                        <Group justify="flex-end" gap="md" mt="md">
                            <Button
                                variant="subtle"
                                color="gray"
                                onClick={() => {
                                    form.reset();
                                    close();
                                }}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                leftSection={<MdSend size={16} />}
                                loading={isLoading}
                            >
                                Send Notification
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>

            <Button
                leftSection={<MdNotifications size={18} />}
                variant="light"
                onClick={open}
            >
                Send Notification
            </Button>
        </>
    );
}
