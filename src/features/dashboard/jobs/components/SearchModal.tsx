import {
    Button,
    Card,
    Group,
    Loader,
    Modal,
    NumberFormatter,
    Space,
    Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { liteClient as algoliasearch } from "algoliasearch/lite";
import {
    Configure,
    InstantSearch,
    SearchBox,
    useHits,
} from "react-instantsearch";
import { useNavigate } from "react-router-dom";
import { TypeAnimation } from "react-type-animation";
import { Icons } from "../../../../common/icons";
import Env from "../../../../config/env";
import { ICategory } from "../types";
import { getCategoryText } from "../utils";
import axios from "axios";
import { useEffect, useState } from "react";

const searchClient = algoliasearch(Env.ALGOLIA_APP_ID, Env.ALGOLIA_SEARCH_KEY);

function CustomHits({ HitComponent }: { HitComponent: any }) {
    const { hits } = useHits();
    if (hits.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
                No jobs found. Try a different search.
            </div>
        );
    }
    return (
        <>
            {hits.map((hit) => (
                <HitComponent key={hit.objectID} hit={hit} />
            ))}
        </>
    );
}

export default function SearchModal() {
    const navigate = useNavigate();

    const [opened, { open, close }] = useDisclosure(false);

    const [categories, setCategories] = useState<ICategory[]>([]);

    useEffect(() => {
        axios
            .get(Env.baseURL + "/jobs/categories")
            .then((response) => {
                setCategories(response.data);
            })
            .catch((error) => {
                console.error("Error fetching jobs categories:", error);
            });
    }, []);
    const result = Array.isArray(categories)
        ? categories.reduce<(string | number)[]>((acc, cat) => {
            if (cat && typeof cat.en === "string") {
                acc.push(cat.en.toLowerCase(), 1000);
            }
            return acc;
        }, [])
        : [];
    function HitComponent({ hit }: { hit: any }) {
        const job = hit as any;
        return (
            <Card
                withBorder
                p={"md"}
                radius={"12px"}
                onClick={() => {
                    navigate("/jobs/" + job.id);
                }}
                mb={"sm"}
            >
                <Group wrap="nowrap" align="start">
                    <div className="w-[100%]">
                        <Text
                            size="16px"
                            fw={500}
                            c="#151F42"
                            lineClamp={1}
                            style={{ lineHeight: 1.2 }}
                        >
                            {job.title ? job.title : getCategoryText(job.category)}
                        </Text>

                        <Space h="xs" />
                    </div>
                </Group>
                <Group wrap="nowrap" gap={5}>
                    <Text
                        size="10px"
                        fw={500}
                        c="#044299"
                        lineClamp={1}
                        style={{ lineHeight: 1.2 }}
                    >
                        {getCategoryText(job.category)}
                    </Text>
                    <Group wrap="nowrap" gap={3}>
                        {Icons.location2}
                        <Text
                            size="10px"
                            fw={500}
                            c="#596258"
                            lineClamp={1}
                            style={{ lineHeight: 1.2 }}
                        >
                            {job.location.address}
                        </Text>
                    </Group>
                </Group>
                <Space h="xs" />

                <Group wrap="wrap" gap={5}>
                    <span className="inline-flex items-center rounded-[7px] bg-[#F0F0F0] px-2 py-1 text-xs font-medium text-[#151F42]  ">
                        {job.commitment}
                    </span>
                    <span className="inline-flex items-center rounded-[7px] bg-[#F0F0F0] px-2 py-1 text-xs font-medium text-[#151F42]  ">
                        {job.urgency}
                    </span>
                    <span className="inline-flex items-center rounded-[7px] bg-[#F0F0F0] px-2 py-1 text-xs font-medium text-[#151F42]  ">
                        {job.workLocation}
                    </span>

                    {/* <div className="inline-flex items-center rounded-[7px] bg-[#F0F0F0] px-2 py-1 text-xs font-medium text-[#151F42] ">
            <span className="mr-1">
              {(job.numberOfPositions ?? 1) > 1
                ? `${job.numberOfPositions ?? 1}`
                : `${job.numberOfPositions ?? 1}`}
            </span>
            {(job.numberOfPositions ?? 1) > 1 ? <TbUsers /> : <TbUser />}
          </div> */}
                </Group>
                <Space h="xs" />
                <Text size="sm" fw={400} c="#596258" lineClamp={1}>
                    {job.description}
                </Text>

                <Space h="xs" />
                <Text size="20px" fw={500} c="#151F42">
                    <NumberFormatter
                        prefix={`${job.currency ? job.currency.code : "TZS"} `}
                        value={job.budget}
                        thousandSeparator
                    />
                    {job.maxBudget > 0 && (
                        <NumberFormatter
                            prefix={` - ${job.currency ? job.currency.code : "TZS"} `}
                            value={job.maxBudget}
                            thousandSeparator
                        />
                    )}
                </Text>
            </Card>
        );
    }
    return (
        <>
            <Modal
                opened={opened}
                onClose={close}
                title={
                    <Text>
                        Search for{" "}
                        {categories.length > 0 ? (
                            <TypeAnimation
                                cursor={false}
                                sequence={result}
                                speed={30}
                                repeat={Infinity}
                            />
                        ) : (
                            "jobs"
                        )}
                    </Text>
                }
                overlayProps={{
                    backgroundOpacity: 0.55,
                    blur: 3,
                }}
                size={"lg"}
            >
                <InstantSearch
                    indexName={Env.ALGOLIA_INDEX_NAME}
                    searchClient={searchClient}
                    insights
                >
                    {/* <Configure filters="isProduction:flase" /> */}
                    <Configure filters={`isProduction:${Env.isProduction} AND isActive:true`} />
                    <SearchBox
                        placeholder="Search"
                        autoFocus
                        classNames={{
                            root: "w-full mb-4",
                            form: "w-full",
                            input:
                                "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500",
                        }}
                        submitIconComponent={({ classNames }) => (
                            <div className={classNames.submitIcon}>
                                {/* {Icons.search} */}
                            </div>
                        )}
                        resetIconComponent={({ classNames }) => (
                            <div className={classNames.resetIcon}>{/* Reset */}</div>
                        )}
                        loadingIconComponent={({ classNames }) => (
                            <Group
                                className={classNames.loadingIcon}
                                justify="center"
                                align="center"
                                mt={"xs"}
                            >
                                <Loader color="violet" type="dots" />
                            </Group>
                        )}
                    />
                    {/* <Hits hitComponent={HitComponent} /> */}
                    <CustomHits HitComponent={HitComponent} />
                </InstantSearch>
            </Modal>

            <Button
                leftSection={Icons.search}
                variant="default"
                onClick={open}
                fullWidth
                justify="start"
                c="dimmed"
                fw={400}
                fz={16}
                size="md"
            >
                <Text>
                    Search for{" "}
                    {categories.length > 0 ? (
                        <TypeAnimation
                            // cursor={false}
                            sequence={result}
                            speed={30}
                            repeat={Infinity}
                        />
                    ) : (
                        "jobs"
                    )}
                </Text>
            </Button>
        </>
    );
}
