import { Burger, Group, Image, Select } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import mainLogo from "../../../../assets/logo_white.svg";
import { Icons } from "../../../icons";
import { Color } from "../../../theme";
import AccountMenu from "./components/AccountMenu";
import NotificationMenu from "./components/NotificationMenu";

type Props = {
  opened: boolean;
  setOpened: React.Dispatch<React.SetStateAction<boolean>>;
};
export default function HeaderMenu({ opened, setOpened }: Props) {
  const navigate = useNavigate();


  return (
    <Group h="100%" justify="space-between" className="bg-[#151F42] lg:bg-white" p={"md"} style={{boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)'}}>
      <Group hiddenFrom="md">
        <Group>
          <Image radius="md" w={"130px"} src={mainLogo} alt="logo image" />

        </Group>
      </Group>
      <Group visibleFrom="md">
        <Select
          leftSection={Icons.search}
          rightSection={<></>}
          radius="md"
          size="md"
          value={''}
          variant="unstyled"
          placeholder="Search for pages"
          searchable
          clearable
          data={[
           
          ]}
          onChange={(value) => {
            navigate(value ?? "/");
          }}
        />

      </Group>
      <Group>
        <Group visibleFrom="sm">
          <NotificationMenu />
          <AccountMenu />
        </Group>
        
        <Group>
          <Burger
            color={Color.White}
            opened={opened}
            onClick={() => setOpened((o) => !o)}
            hiddenFrom="md"
          />
        </Group>
      </Group>
    </Group>
  );
}
