import {
  Avatar,
  Group,
  Table,
  Text,
  UnstyledButton
} from "@mantine/core";
import { DocumentSnapshot } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CustomTable } from "../../../../common/components/Table/CustomTable";
import { IUser } from "../../../auth/types";
import CustomBadge from "../components/CustomBadge";
import UserFilters from "../components/UserFilters";
import { useUserServices } from "../services";
import { UserFilterParameters } from "../types";

export default function UsersTable() {
  const { getUsers, getFilterOptions } = useUserServices();
  const navigate = useNavigate();
  const [users, setUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | undefined>();
  const [firstDoc, setFirstDoc] = useState<DocumentSnapshot | undefined>();
  const [pageSize, setPageSize] = useState(20);

  // Store complete page information for reliable backward navigation
  type PageInfo = {
    firstDoc: DocumentSnapshot;
    lastDoc: DocumentSnapshot;
    startPosition: number;
  };
  const [pageStack, setPageStack] = useState<PageInfo[]>([]);
  const [currentPageStart, setCurrentPageStart] = useState(1);
  const [filters, setFilters] = useState<UserFilterParameters>({
    isProduction: "both",
    isVerified: "both",
  });
  const [filterOptions, setFilterOptions] = useState<{
    roles: string[];
    statuses: string[];
    countries: { name: string; code: string }[];
    userTypes: string[];
  }>({ roles: [], statuses: [], countries: [], userTypes: [] });

  const fetchUsers = useCallback(
    async (
      direction: "next" | "prev" | string | undefined = "next",
      startAfterDoc?: DocumentSnapshot,
      endBeforeDoc?: DocumentSnapshot,
      currentFilters: UserFilterParameters = filters
    ) => {
      setIsLoading(true);
      try {
        const result = await getUsers(
          currentFilters,
          direction,
          startAfterDoc,
          endBeforeDoc,
          pageSize
        );
        setUsers(result.data);
        setTotalUsers(result.totalCount);
        setLastDoc(result.lastDoc);
        setFirstDoc(result.firstDoc);
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
        setTotalUsers(0);
      } finally {
        setIsLoading(false);
      }
    },
    [filters, pageSize, getUsers]
  );

  const handleNextPage = useCallback(() => {
    if (lastDoc && firstDoc) {
      // Save current page info to stack before moving forward
      setPageStack(prev => [...prev, {
        firstDoc,
        lastDoc,
        startPosition: currentPageStart
      }]);
      setCurrentPageStart(prev => prev + users.length);
      fetchUsers("next", lastDoc, undefined, filters);
    }
  }, [lastDoc, firstDoc, users.length, currentPageStart, filters, fetchUsers]);

  const handlePreviousPage = useCallback(async () => {
    if (pageStack.length > 0) {
      // Pop the last doc from history
      const newStack = [...pageStack];
      const previousPage = newStack.pop();
      if (!previousPage) return;

      setPageStack(newStack);
      setCurrentPageStart(previousPage.startPosition);

      try {
        setIsLoading(true);
        const result = await getUsers(
          filters,
          "next",
          newStack.length > 0 ? newStack[newStack.length - 1].lastDoc : undefined,
          undefined,
          pageSize
        );

        if (result.data.length > 0) {
          setUsers(result.data);
          setTotalUsers(result.totalCount);
          setLastDoc(result.lastDoc);
          setFirstDoc(result.firstDoc);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [pageStack, pageSize, filters, getUsers]);

  const handlePageSizeChange = useCallback(
    async (newSize: number) => {
      setPageSize(newSize);
      // Reset pagination when page size changes
      setLastDoc(undefined);
      setFirstDoc(undefined);
      setPageStack([]);
      setCurrentPageStart(1);

      // Fetch with the new page size directly
      setIsLoading(true);
      try {
        const result = await getUsers(
          filters,
          "next",
          undefined,
          undefined,
          newSize
        );
        setUsers(result.data);
        setTotalUsers(result.totalCount);
        setLastDoc(result.lastDoc);
        setFirstDoc(result.firstDoc);
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
        setTotalUsers(0);
      } finally {
        setIsLoading(false);
      }
    },
    [filters, getUsers]
  );

  const handleFiltersChange = useCallback(
    (newFilters: UserFilterParameters) => {
      setFilters(newFilters);
      // Reset pagination when filters change
      setLastDoc(undefined);
      setFirstDoc(undefined);
      setPageStack([]);
      setCurrentPageStart(1);
      fetchUsers("next", undefined, undefined, newFilters);
    },
    [fetchUsers]
  );


  const handleViewUserDetails = (user: IUser) => {
    // Navigate to user details page
    navigate(`/users/${user.uid}`);
  };



  useEffect(() => {
    const initializeData = async () => {
      try {
        const options = await getFilterOptions();
        setFilterOptions(options);
        fetchUsers();
      } catch (error) {
        console.error("Error initializing data:", error);
      }
    };
    initializeData();
  }, []); // Only run on mount

  const columns = (
    <Table.Tr>
      <Table.Th>User</Table.Th>
      <Table.Th>Email</Table.Th>
      {/* <Table.Th>Role</Table.Th> */}
      <Table.Th>User Type</Table.Th>
      <Table.Th>Status</Table.Th>
      <Table.Th>Verified</Table.Th>
      <Table.Th>Environment</Table.Th>
      <Table.Th>Country</Table.Th>
      <Table.Th
        style={{
          borderTopRightRadius: 8,
        }}
      >
        Date Added
      </Table.Th>
    </Table.Tr>
  );

  const rows = users.map((user) => (
    <Table.Tr key={user.id}>
      <Table.Td>
        <UnstyledButton onClick={() => handleViewUserDetails(user)}>
          <Group gap="sm" wrap="nowrap">
            <Avatar src={user.avatarURL} size={30} radius="xl">
              {user.fullName?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Text size="sm" fw={500} lineClamp={1} style={{ maxWidth: "150px" }}>
              {user.fullName}
            </Text>
          </Group>
        </UnstyledButton>
      </Table.Td>
      <Table.Td>
        <Text size="sm" lineClamp={1} style={{ maxWidth: "200px" }}>{user.email}</Text>
      </Table.Td>

      {/* <Table.Td style={{ minWidth: "80px" }}>
        <div className="min-w-[60px] flex justify-center">
          <CustomBadge
            variant={user.role === "admin" ? "error" : "primary"}
            size="sm"
          >
            {user.role}
          </CustomBadge>
        </div>
      </Table.Td> */}
      <Table.Td style={{ minWidth: "100px" }}>
        <div className="min-w-[80px] flex justify-center">
          <CustomBadge
            variant={
              user.userType === "employer"
                ? "purple"
                : user.userType === "jobseeker"
                  ? "orange"
                  : "secondary"
            }
            size="sm"
          >
            {user.userType || "unknown"}
          </CustomBadge>
        </div>
      </Table.Td>
      <Table.Td style={{ minWidth: "80px" }}>
        <div className="min-w-[60px] flex justify-center">
          <CustomBadge
            variant={user.status === "active" ? "success" : "secondary"}
            size="sm"
          >
            {user.status || "active"}
          </CustomBadge>
        </div>
      </Table.Td>
      <Table.Td style={{ minWidth: "100px" }}>
        <div className="min-w-[80px] flex justify-center">
          <CustomBadge
            variant={user.isVerified ? "success" : "error"}
            size="sm"
          >
            {user.isVerified ? "Verified" : "Unverified"}
          </CustomBadge>
        </div>
      </Table.Td>
      <Table.Td style={{ minWidth: "100px" }}>
        <div className="min-w-[80px] flex justify-center">
          <CustomBadge
            variant={user.isProduction ? "success" : "error"}
            size="sm"
          >
            {user.isProduction ? "Production" : "Staging"}
          </CustomBadge>
        </div>
      </Table.Td>
      <Table.Td>
        <Text size="sm" lineClamp={1} style={{ maxWidth: "120px" }}>{user.country?.name || "-"}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">
          {user.dateAdded
            ? new Date(
              typeof user.dateAdded === "string"
                ? user.dateAdded
                : (user.dateAdded as any).toDate()
            ).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
            : "-"}
        </Text>
      </Table.Td>

    </Table.Tr>
  ));

  return (
    <>
      <UserFilters
        onFiltersChange={handleFiltersChange}
        filterOptions={filterOptions}
        isLoading={isLoading}
      />
      <CustomTable
        columns={columns}
        rows={rows}
        colSpan={9}
        totalData={totalUsers}
        isLoading={isLoading}
        title="Users"
        subtitle="Manage platform users"
        showPagination={true}
        onNextPage={handleNextPage}
        onPreviousPage={handlePreviousPage}
        onPageSizeChange={handlePageSizeChange}
        currentPageSize={pageSize}
        hasNextPage={totalUsers > currentPageStart + users.length - 1}
        hasPreviousPage={pageStack.length > 0}
        currentRange={{
          start: currentPageStart,
          end: currentPageStart + users.length - 1,
        }}
      />


    </>
  );
}
