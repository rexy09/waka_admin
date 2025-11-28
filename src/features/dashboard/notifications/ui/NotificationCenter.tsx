import {
  Button,
  Card,
  Group,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
  Select,
  Alert,
  Image,
  Badge,
  Divider,
  Paper,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import {
  MdSend,
  MdNotifications,
  MdCheckCircle,
  MdError,
  MdInfo,
} from "react-icons/md";
import { INotificationForm } from "../types";
import { useNotificationServices } from "../services";
import logo from "../../../../assets/logo.png";
import { TUTORIALS, Language } from "../constants";

export default function NotificationCenter() {
  const { broadcastNotification } = useNotificationServices();
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("en");

  const form = useForm<INotificationForm>({
    initialValues: {
      title: "",
      body: "",
      country_code: "",
      user_id: "N/A",
      data: {},
    },
    validate: {
      title: (value) => (!value.trim() ? "Title is required" : null),
      body: (value) => (!value.trim() ? "Message is required" : null),
    },
  });

  const countryOptions = [
    { value: "", label: "All Countries" },
    { value: "TZ", label: "Tanzania" },
    { value: "KE", label: "Kenya" },
    { value: "UG", label: "Uganda" },
    { value: "RW", label: "Rwanda" },
    { value: "BI", label: "Burundi" },
  ];

  const languageOptions = [
    { value: "en", label: "English" },
    { value: "sw", label: "Swahili" },
  ];

  const templateOptions = [
    { value: "", label: "Select a template (optional)" },
    ...TUTORIALS.map((tutorial) => ({
      value: tutorial.id.toString(),
      label: tutorial.en.title,
    })),
  ];

  const handleTemplateChange = (value: string | null) => {
    setSelectedTemplate(value);

    if (value) {
      const tutorial = TUTORIALS.find((t) => t.id.toString() === value);
      if (tutorial) {
        const content = tutorial[selectedLanguage];
        form.setValues({
          title: content.title,
          body: content.description,
        });
      }
    }
  };

  const handleLanguageChange = (value: string | null) => {
    const newLanguage = (value as Language) || "en";
    setSelectedLanguage(newLanguage);

    if (selectedTemplate) {
      const tutorial = TUTORIALS.find((t) => t.id.toString() === selectedTemplate);
      if (tutorial) {
        const content = tutorial[newLanguage];
        form.setValues({
          title: content.title,
          body: content.description,
        });
      }
    }
  };

  const handleSubmit = async (values: INotificationForm) => {
    setLoading(true);
    try {
      await broadcastNotification(values);

      notifications.show({
        color: "green",
        title: "Success",
        message: "Notification sent successfully!",
        icon: <MdCheckCircle />,
      });

      form.reset();
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Error",
        message: "Failed to send notification. Please try again.",
        icon: <MdError />,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Title order={2} className="text-gray-900">
            Notification Center
          </Title>
          <Text size="sm" c="dimmed" mt="xs">
            Send notifications to platform users
          </Text>
        </div>
        <Badge
          size="lg"
          variant="gradient"
          gradient={{ from: "blue", to: "cyan" }}
          leftSection={<MdNotifications />}
        >
          Broadcast System
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notification Form */}
        <div className="lg:col-span-2">
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
                <div className="flex items-center gap-3">
                  <MdSend className="text-blue-600" size={24} />
                  <Title order={3} size="h4">
                    Send Notification
                  </Title>
                </div>

                <Divider />

                {/* Template Selection */}
                <Group grow>
                  <Select
                    label="Template"
                    placeholder="Choose a tutorial template"
                    data={templateOptions}
                    value={selectedTemplate}
                    onChange={handleTemplateChange}
                    clearable
                    searchable
                  />
                  <Select
                    label="Language"
                    placeholder="Select language"
                    data={languageOptions}
                    value={selectedLanguage}
                    onChange={handleLanguageChange}
                  />
                </Group>

                <Divider variant="dashed" />

                {/* Form Fields */}
                <TextInput
                  label="Notification Title"
                  placeholder="Enter notification title"
                  {...form.getInputProps("title")}
                />

                <Textarea
                  label="Message"
                  placeholder="Enter your notification message"
                  autosize
                  minRows={4}
                  maxRows={8}
                  {...form.getInputProps("body")}
                />

                <Select
                  label="Target Country"
                  placeholder="Select target country"
                  data={countryOptions}
                  {...form.getInputProps("country_code")}
                />

                {/* Submit Button */}
                <Group justify="flex-end" mt="md">
                  <Button
                    type="submit"
                    leftSection={<MdSend />}
                    loading={loading}
                    size="md"
                  >
                    Send Notification
                  </Button>
                </Group>
              </Stack>
            </form>
          </Card>
        </div>

        {/* Sidebar - Info and Guidelines */}
        <div className="space-y-6">
          {/* Guidelines */}
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="md">
              <Group>
                <MdInfo className="text-blue-600" />
                <Title order={4}>Guidelines</Title>
              </Group>

              <div className="space-y-3">
                <div>
                  <Text size="sm" fw={500} c="dark">
                    Title Best Practices:
                  </Text>
                  <Text size="xs" c="dimmed">
                    • Keep it under 50 characters
                  </Text>
                  <Text size="xs" c="dimmed">
                    • Be clear and actionable
                  </Text>
                </div>

                <div>
                  <Text size="sm" fw={500} c="dark">
                    Message Tips:
                  </Text>
                  <Text size="xs" c="dimmed">
                    • Keep it concise and relevant
                  </Text>
                  <Text size="xs" c="dimmed">
                    • Include a clear call-to-action
                  </Text>
                  <Text size="xs" c="dimmed">
                    • Avoid special characters
                  </Text>
                </div>
              </div>
            </Stack>
          </Card>

          {/* Preview */}
          {(form.values.title || form.values.body) && (
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="md">
                <Title order={4}>Preview</Title>

                <Paper p="md" radius="md" withBorder >
                  <Group gap="sm"  wrap="nowrap" justify="flex-start">
                    <Image
                      w={50}
                      src={logo}
                      alt="logo"
                      radius={"md"}
                    />
                    <div>
                      <Text size="sm" fw={600}>
                        {form.values.title || "Notification Title"}
                      </Text>
                        <Text size="xs" className="break-words overflow-hidden" >
                        {form.values.body ||
                          "Your notification message will appear here"}
                      </Text>
                    </div>
                  </Group>
                </Paper>

                <div>
                  <Text size="xs" c="dimmed">
                    Target:{" "}
                    {form.values.country_code
                      ? countryOptions.find(
                          (c) => c.value === form.values.country_code
                        )?.label
                      : "All Countries"}
                  </Text>
                </div>
              </Stack>
            </Card>
          )}

          {/* Quick Stats */}
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="md">
              <Title order={4}>Quick Stats</Title>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Text size="sm" c="dimmed">
                    Total Users:
                  </Text>
                  <Text size="sm" fw={500}>
                    2,450
                  </Text>
                </div>
                <div className="flex justify-between">
                  <Text size="sm" c="dimmed">
                    Active Today:
                  </Text>
                  <Text size="sm" fw={500}>
                    1,230
                  </Text>
                </div>
                <div className="flex justify-between">
                  <Text size="sm" c="dimmed">
                    Delivery Rate:
                  </Text>
                  <Text size="sm" fw={500}>
                    98.5%
                  </Text>
                </div>
              </div>
            </Stack>
          </Card>
        </div>
      </div>

      {/* Information Alert */}
      <Alert icon={<MdInfo />} title="Information" color="blue">
        <Text size="sm">
          Notifications will be delivered to all active users in the selected
          region. Delivery typically takes 2-5 minutes depending on the number
          of recipients.
        </Text>
      </Alert>
    </div>
  );
}
