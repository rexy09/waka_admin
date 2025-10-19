import { ActionIcon, Anchor, Badge, Box, Button, Card, Group, Text } from "@mantine/core";
import { Edit } from "lucide-react";
import { FaYoutube } from "react-icons/fa";
import { IBanner } from "../types";

interface BannerCardProps {
  banner: IBanner;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function BannerCard({ banner, onEdit }: BannerCardProps) {
  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;

    // Match patterns for different YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  // Get YouTube thumbnail URL
  const getYouTubeThumbnail = (url: string): string => {
    const videoId = getYouTubeVideoId(url);
    if (videoId) {
      // Use maxresdefault for highest quality, fallback to hqdefault if not available
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return "https://placehold.co/600x400?text=YouTube+Video";
  };

  const getImageUrl = () => {
    if (banner.image) return banner.image;
    if (banner.youtube_url) return getYouTubeThumbnail(banner.youtube_url);
    return "https://placehold.co/600x400?text=No+Image";
  };

  return (
    <Card
      shadow="sm"
      padding={0}
      radius="lg"
      style={{
        overflow: "hidden",
        position: "relative",
        height: "200px",
        backgroundImage: `url(${getImageUrl()})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Box
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(0deg, rgba(51, 65, 85, 0.8) 0%, rgba(51, 65, 85, 0.5) 50%, rgba(51, 65, 85, 0.1) 100%)",
          zIndex: 1,
        }}
      />

      {/* YouTube Play Button Overlay */}
      {banner.youtube_url && (
        <ActionIcon
          onClick={(e) => {
            e.stopPropagation();
            if (banner.youtube_url) {
              window.open(banner.youtube_url, '_blank', 'noopener,noreferrer');
            }
          }}
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
            cursor: "pointer",
            width: "60px",
            height: "60px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 0, 0, 1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 0, 0, 0.9)";
          }}
        >
          <FaYoutube size={28} />
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
                color={banner.is_active ? "green" : "red"}
                variant="filled"
                size="sm"
                style={{
                  backgroundColor: banner.is_active ? "#51cf66" : "#ff6b6b",
                  color: "white",
                  fontWeight: 600,
                  textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                }}
              >
                {banner.is_active ? "Active" : "Inactive"}
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
                {banner.banner_type}
              </Badge>
              </Group>
            {onEdit && (
              <ActionIcon
                variant="filled"
                color="transparent"
                radius="md"
                onClick={() => onEdit(banner.id)}
                style={{
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                }}
              >
                <Edit size={18} />
              </ActionIcon>
            )}
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
            {banner.title}
          </Text>

          
        </Box>

        {/* Bottom section */}
        <Group justify="flex-end" align="center">
          {banner.cta_link  &&<Anchor
            href={banner.cta_link || "#"}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
          >
            <Button
              radius="md"
              size="sm"
              variant="white"
              color="dark"
              style={{
                fontWeight: 600,
              }}
            >
              {banner.cta_text || "View Details"}
            </Button>
          </Anchor>}
        </Group>
      </Box>

      

  
    </Card>
  );
}
