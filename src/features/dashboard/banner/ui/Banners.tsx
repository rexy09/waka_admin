import { Title, SimpleGrid, Loader, Center, Text, Stack, Pagination, Group, Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useBannerServices } from "../services";
import { useEffect, useState } from "react";
import { IBannerResponse, IBannerDetails } from "../types";
import BannerCard from "../components/BannerCard";
import BannerModalForm from "../components/BannerModalForm";

export default function Banners() {
  const { getBanners, deleteBanner, getBanner } = useBannerServices();

  const [banners, setBanners] = useState<IBannerResponse>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<IBannerDetails | undefined>();

  const fetchBanners = async (currentPage: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getBanners(currentPage);
      setBanners(response.data);
    } catch (error) {
      console.error("Error fetching banners:", error);
      setError("Failed to fetch banners. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners(page);
  }, [page]);

  const handleEdit = async (id: string) => {
    try {
      const response = await getBanner(id);
      setSelectedBanner(response.data);
      setModalOpened(true);
    } catch (err) {
      console.error("Error fetching banner details:", err);
      notifications.show({
        color: "red",
        title: "Error",
        message: "Failed to fetch banner details",
      });
    }
  };

  const handleCreate = () => {
    setSelectedBanner(undefined);
    setModalOpened(true);
  };

  const handleModalClose = () => {
    setModalOpened(false);
    setSelectedBanner(undefined);
  };

  const handleSuccess = () => {
    fetchBanners(page);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      try {
        await deleteBanner(id);
        fetchBanners(page);
      } catch (err) {
        console.error("Error deleting banner:", err);
        alert("Failed to delete banner. Please try again.");
      }
    }
  };

  const totalPages = banners ? Math.ceil(banners.count / 10) : 1;

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={3}>Banner Management</Title>
        <Button onClick={handleCreate}>Create Banner</Button>
      </Group>

      {loading ? (
        <Center style={{ minHeight: 300 }}>
          <Loader size="lg" />
        </Center>
      ) : error ? (
        <Center style={{ minHeight: 300 }}>
          <Text c="red">{error}</Text>
        </Center>
      ) : !banners || banners.results.length === 0 ? (
        <Center style={{ minHeight: 300 }}>
          <Text c="dimmed">No banners found</Text>
        </Center>
      ) : (
        <>
          <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }}>
            {banners.results.map((banner) => (
              <BannerCard
                key={banner.id}
                banner={banner}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </SimpleGrid>

          {totalPages > 1 && (
            <Group justify="center" mt="xl">
              <Pagination
                value={page}
                onChange={setPage}
                total={totalPages}
              />
            </Group>
          )}
        </>
      )}

      <BannerModalForm
        opened={modalOpened}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
        banner={selectedBanner}
      />
    </Stack>
  );
}
