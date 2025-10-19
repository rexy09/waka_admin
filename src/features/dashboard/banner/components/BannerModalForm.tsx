import {
  Modal,
  TextInput,
  Textarea,
  Select,
  Button,
  Group,
  Stack,
  Switch,
  NumberInput,
  FileInput,
  Paper,
  Text,
  Badge,
  Box,
  Divider,
  SimpleGrid,
  ActionIcon,
} from "@mantine/core";
import { useForm, isNotEmpty } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useState, useEffect } from "react";
import { BannerFom, IBannerDetails } from "../types";
import { useBannerServices } from "../services";
import { useFormErrorHandler } from "../../../hooks/useFormErrorHandler";

interface BannerModalFormProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  banner?: IBannerDetails;
}

export default function BannerModalForm({
  opened,
  onClose,
  onSuccess,
  banner,
}: BannerModalFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const { postBanner, editBanner } = useBannerServices();
  const { handleFormError } = useFormErrorHandler();
  const isEditing = !!banner?.id;

  const form = useForm<BannerFom>({
    initialValues: {
      title: "",
      description: "",
      banner_type: "image",
      cta_text: "",
      cta_link: "",
      audience: "all",
      is_active: true,
      priority: 1,
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
      image: undefined,
      youtube_url: "",
    },

    validate: {
      title: isNotEmpty("Title is required"),
      description: isNotEmpty("Description is required"),
      banner_type: isNotEmpty("Banner type is required"),
      // cta_text: isNotEmpty("CTA text is required"),
      // cta_link: (value) => {
      //   if (!value) return "CTA link is required";
      //   try {
      //     new URL(value);
      //     return null;
      //   } catch {
      //     return "Please enter a valid URL";
      //   }
      // },
      audience: isNotEmpty("Audience is required"),
      priority: (value) => {
        if (value === undefined || value === null) return "Priority is required";
        if (value < 1) return "Priority must be at least 1";
        return null;
      },
      // start_date: isNotEmpty("Start date is required"),
      // end_date: isNotEmpty("End date is required"),
      image: (value, values) => {
        if (values.banner_type !== "youtube" && !isEditing && !value) {
          return "Image is required";
        }
        return null;
      },
      youtube_url: (value, values) => {
        if (values.banner_type === "youtube") {
          if (!value) return "YouTube URL is required";
          try {
            new URL(value);
            if (!value.includes("youtube.com") && !value.includes("youtu.be")) {
              return "Please enter a valid YouTube URL";
            }
            return null;
          } catch {
            return "Please enter a valid URL";
          }
        }
        return null;
      },
    },
  });

  useEffect(() => {
    if (banner && opened) {
      form.setValues({
        title: banner.title || "",
        description: banner.description || "",
        banner_type: banner.banner_type || "image",
        cta_text: banner.cta_text || "",
        cta_link: banner.cta_link || "",
        audience: banner.audience || "all",
        is_active: banner.is_active ?? true,
        priority: banner.priority || 1,
        start_date: banner.start_date?.split("T")[0] || new Date().toISOString().split("T")[0],
        end_date: banner.end_date?.split("T")[0] || "",
        image: undefined,
        youtube_url: banner.youtube_url || "",
      });
    } else if (!opened) {
      form.reset();
    }
  }, [banner, opened]);

  const handleSubmit = async (values: BannerFom) => {
    setSubmitted(true);

    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("banner_type", values.banner_type);
      formData.append("cta_text", values.cta_text);
      formData.append("cta_link", values.cta_link);
      formData.append("audience", values.audience);
      formData.append("is_active", String(values.is_active));
      formData.append("priority", String(values.priority));
      formData.append("start_date", values.start_date);
      formData.append("end_date", values.end_date);

      if (values.image instanceof File) {
        formData.append("image", values.image);
      }

      if (values.youtube_url) {
        formData.append("youtube_url", values.youtube_url);
      }

      if (isEditing && banner.id) {
        await editBanner(banner.id, formData as any);
        notifications.show({
          color: "green",
          title: "Success",
          message: "Banner updated successfully",
        });
      } else {
        await postBanner(formData as any);
        notifications.show({
          color: "green",
          title: "Success",
          message: "Banner created successfully",
        });
      }

      form.reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error saving banner:", error);
      handleFormError(error, form, {
        title: "Error",
        fallbackMessage: "Failed to save banner. Please try again.",
      });
    } finally {
      setSubmitted(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? "Edit Banner" : "Create New Banner"}
      size="xl"
      styles={{
        body: { maxHeight: "80vh", overflowY: "auto" },
      }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {/* Title and Description - Full Width */}
          <TextInput
            label="Title"
            placeholder="Enter banner title"
            withAsterisk
            {...form.getInputProps("title")}
          />

          <Textarea
            label="Description"
            placeholder="Enter banner description"
            withAsterisk
            minRows={2}
            {...form.getInputProps("description")}
          />

          {/* Banner Type and Media - Grid */}
          <SimpleGrid cols={2}>
            <Select
              label="Banner Type"
              placeholder="Select banner type"
              withAsterisk
              data={[
                { value: "image", label: "Image" },
                { value: "video", label: "Video" },
                { value: "youtube", label: "YouTube" },
                { value: "text", label: "Text" },
                { value: "info", label: "Info" },
                { value: "education", label: "Education" },
                { value: "news", label: "News" },
              ]}
              {...form.getInputProps("banner_type")}
            />

            {form.values.banner_type == "youtube" &&<TextInput
                label="YouTube URL"
                placeholder="https://www.youtube.com/watch?v=..."
                withAsterisk
                {...form.getInputProps("youtube_url")}
              />}
              <FileInput
                label="Image"
                placeholder="Select image file"
                accept="image/*"
                withAsterisk={!isEditing}
                {...form.getInputProps("image")}
                size="md"
                radius={"md"}
              />
          </SimpleGrid>

          {/* CTA Text and Link - Grid */}
          <SimpleGrid cols={2}>
            <TextInput
              label="CTA Link"
              placeholder="https://example.com"
              withAsterisk
              {...form.getInputProps("cta_link")}
            />
            <TextInput
              label="CTA Text"
              placeholder="e.g., Shop Now, Learn More"
              withAsterisk
              {...form.getInputProps("cta_text")}
            />

          </SimpleGrid>

          {/* Audience, Priority, and Active - Grid */}
          <SimpleGrid cols={3}>
            <Select
              label="Audience"
              placeholder="Select target audience"
              withAsterisk
              data={[
                { value: "all", label: "All Users" },
                // { value: "registered", label: "Registered Users" },
                // { value: "guest", label: "Guest Users" },
                // { value: "premium", label: "Premium Users" },
              ]}
              {...form.getInputProps("audience")}
            />

            <NumberInput
              label="Priority"
              placeholder="Enter priority"
              withAsterisk
              size="md"
              radius={"md"}
              min={1}
              {...form.getInputProps("priority")}
            />

            <Box>
              <Text size="sm" fw={500} mb={8}>Status</Text>
              <Switch
                label="Active"
                {...form.getInputProps("is_active", { type: "checkbox" })}
                styles={{ root: { marginTop: 4 } }}
              />
            </Box>
          </SimpleGrid>

          {/* Start Date and End Date - Grid */}
          <SimpleGrid cols={2}>
            <TextInput
              label="Start Date"
              type="date"
              {...form.getInputProps("start_date")}
            />

            <TextInput
              label="End Date"
              type="date"
              {...form.getInputProps("end_date")}
            />
          </SimpleGrid>

          <Divider  label="Banner Preview" labelPosition="center" />

          {/* Banner Preview Section */}
          <Paper
            shadow="sm"
            p={0}
            radius="lg"
            style={{
              overflow: "hidden",
              position: "relative",
              height: "200px",
              backgroundImage: form.values.image instanceof File
                ? `url(${URL.createObjectURL(form.values.image)})`
                : form.values.youtube_url
                ? `url(https://img.youtube.com/vi/${extractYouTubeId(form.values.youtube_url)}/maxresdefault.jpg)`
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Overlay gradient */}
            <Box
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(0deg, rgba(51, 65, 85, 0.8) 0%, rgba(51, 65, 85, 0.5) 50%, rgba(51, 65, 85, 0.1) 100%)",
                zIndex: 1,
              }}
            />

            {/* YouTube Play Button Overlay */}
            {form.values.youtube_url && form.values.banner_type === "youtube" && (
              <ActionIcon
                variant="filled"
                color="red"
                size="xl"
                radius="xl"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 10,
                  backgroundColor: "rgba(255, 0, 0, 0.9)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
                  cursor: "not-allowed",
                  width: "60px",
                  height: "60px",
                  pointerEvents: "none",
                }}
              >
                <Text size="xl" c="white">▶</Text>
              </ActionIcon>
            )}

            {/* Content */}
            <Box
              style={{
                position: "relative",
                zIndex: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "10px",
              }}
            >
              {/* Top section */}
              <Box>
                <Group gap="xs" justify="space-between">
                  <Group gap="xs">
                    <Badge
                      color={form.values.is_active ? "green" : "red"}
                      variant="filled"
                      size="sm"
                      style={{
                        backgroundColor: form.values.is_active ? "#51cf66" : "#ff6b6b",
                        color: "white",
                        fontWeight: 600,
                        textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                      }}
                    >
                      {form.values.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge
                      variant="filled"
                      color="blue"
                      size="sm"
                      style={{
                        backgroundColor: "#339af0",
                        color: "white",
                        fontWeight: 600,
                        textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                      }}
                    >
                      {form.values.banner_type || "image"}
                    </Badge>
                  </Group>
                </Group>

                <Text
                  size="xl"
                  fw={700}
                  c="white"
                  style={{
                    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                    lineHeight: 1.3,
                  }}
                >
                  {form.values.title || "Banner Title"}
                </Text>
              </Box>

              {/* Bottom section */}
              <Group justify="flex-end" align="center">
                {form.values.cta_link &&<Button
                  radius="md"
                  size="sm"
                  variant="white"
                  color="dark"
                  style={{
                    fontWeight: 600,
                    pointerEvents: "none",
                  }}
                >
                  {form.values.cta_text || "Learn More"}
                </Button>}
              </Group>
            </Box>
          </Paper>

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={onClose} disabled={submitted}>
              Cancel
            </Button>
            <Button type="submit" loading={submitted} disabled={submitted}>
              {isEditing ? "Update Banner" : "Create Banner"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

// Helper function to extract YouTube video ID
function extractYouTubeId(url: string): string {
  if (!url) return "";
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return "";
}
