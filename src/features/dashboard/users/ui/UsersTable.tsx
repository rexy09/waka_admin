import { Avatar, Group, Table, Text } from "@mantine/core";
import { DocumentSnapshot } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { CustomTable } from "../../../../common/components/Table/CustomTable";
import { IUser } from "../../../auth/types";
import CustomBadge from "../components/CustomBadge";
import UserFilters from "../components/UserFilters";
import { useUserServices } from "../services";
import { UserFilterParameters } from "../types";

export default function UsersTable() {
    const { getUsers, getFilterOptions } = useUserServices();
    const [users, setUsers] = useState<IUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalUsers, setTotalUsers] = useState(0);
    const [lastDoc, setLastDoc] = useState<DocumentSnapshot | undefined>();
    const [_firstDoc, setFirstDoc] = useState<DocumentSnapshot | undefined>();
    const [filters, setFilters] = useState<UserFilterParameters>({ isProduction: "both", isVerified: "both" });
    const [filterOptions, setFilterOptions] = useState<{
        roles: string[];
        statuses: string[];
        countries: { name: string; code: string; }[];
        userTypes: string[];
    }>({ roles: [], statuses: [], countries: [], userTypes: [] });

    const fetchUsers = useCallback(async (
        direction: "next" | "prev" | string | undefined = "next",
        startAfterDoc?: DocumentSnapshot,
        endBeforeDoc?: DocumentSnapshot,
        currentFilters: UserFilterParameters = filters
    ) => {
        setIsLoading(true);
        try {
            const result = await getUsers(currentFilters, direction, startAfterDoc, endBeforeDoc, 10);
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
    }, [filters]);

    const handlePagination = useCallback((page: number) => {
        // For Firebase cursor-based pagination, we need to track direction
        // This is a simplified approach - in a real app you'd want more sophisticated pagination tracking
        if (page > 1) {
            fetchUsers("next", lastDoc, undefined, filters);
        } else {
            fetchUsers("next", undefined, undefined, filters);
        }
    }, [fetchUsers, lastDoc, filters]);

    const handleFiltersChange = useCallback((newFilters: UserFilterParameters) => {
        setFilters(newFilters);
        // Reset pagination when filters change
        setLastDoc(undefined);
        setFirstDoc(undefined);
        fetchUsers("next", undefined, undefined, newFilters);
    }, [fetchUsers]);

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
            <Table.Th style={{
                borderTopLeftRadius: 8,
            }}>User</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Role</Table.Th>
            <Table.Th>User Type</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Verified</Table.Th>
            <Table.Th >Environment</Table.Th>
            <Table.Th >Country</Table.Th>
            <Table.Th >Date Added</Table.Th>
            <Table.Th style={{
                borderTopRightRadius: 8,
            }}>Action</Table.Th>
        </Table.Tr>
    );

    const rows = users.map((user) => (
        <Table.Tr key={user.id}>
            <Table.Td>
                <Group gap="sm" wrap="nowrap">
                    <Avatar src={user.avatarURL} size={30} radius="xl">
                        {user.fullName?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Text size="sm" fw={500}>
                        {user.fullName}
                    </Text>
                </Group>
            </Table.Td>
            <Table.Td>
                <Text size="sm">{user.email}</Text>
            </Table.Td>
            <Table.Td style={{ minWidth: '80px' }}>
                <div className="min-w-[60px] flex justify-center">
                    <CustomBadge variant={user.role === "admin" ? "error" : "primary"} size="sm">
                        {user.role}
                    </CustomBadge>
                </div>
            </Table.Td>
            <Table.Td style={{ minWidth: '100px' }}>
                <div className="min-w-[80px] flex justify-center">
                    <CustomBadge
                        variant={user.userType === "employer" ? "purple" : user.userType === "jobseeker" ? "orange" : "secondary"}
                        size="sm"
                    >
                        {user.userType || "unknown"}
                    </CustomBadge>
                </div>
            </Table.Td>
            <Table.Td style={{ minWidth: '80px' }}>
                <div className="min-w-[60px] flex justify-center">
                    <CustomBadge variant={user.status === "active" ? "success" : "secondary"} size="sm">
                        {user.status || "active"}
                    </CustomBadge>
                </div>
            </Table.Td>
            <Table.Td style={{ minWidth: '100px' }}>
                <div className="min-w-[80px] flex justify-center">
                    <CustomBadge variant={user.isVerified ? "success" : "error"} size="sm">
                        {user.isVerified ? "Verified" : "Unverified"}
                    </CustomBadge>
                </div>
            </Table.Td>
            <Table.Td style={{ minWidth: '100px' }}>
                <div className="min-w-[80px] flex justify-center">
                    <CustomBadge variant={user.isProduction ? "success" : "error"} size="sm">
                        {user.isProduction ? "Production" : "Staging"}
                    </CustomBadge>
                </div>
            </Table.Td>
            <Table.Td>
                <Text size="sm">{user.country?.name || "-"}</Text>
            </Table.Td>
            <Table.Td>
                <Text size="sm">
                    {user.dateAdded ?
                        new Date(typeof user.dateAdded === 'string'
                            ? user.dateAdded
                            : (user.dateAdded as any).toDate()).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })
                        : "-"
                    }
                </Text>
            </Table.Td>
            <Table.Td>
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
                fetchData={handlePagination}
            />
        </>
    );
}

