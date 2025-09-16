import {
  Anchor,
  Button,
  Group,
  PasswordInput,
  Space,
  Text,
  TextInput,
} from "@mantine/core";
import { isEmail, isNotEmpty, useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useEffect } from "react";
import useSignIn from "react-auth-kit/hooks/useSignIn";
import { useNavigate } from "react-router-dom";
import { Color } from "../../../common/theme";
import useAuthServices from "../services";
import { UserCredentials } from "../types";

function LoginForm() {
  const { submitted, setSubmitted } = useAuthServices();
  const auth = getAuth();
  const signIn = useSignIn();

  const navigate = useNavigate();

  const form = useForm<UserCredentials>({
    initialValues: {
      username: "",
      password: "",
    },
    validate: {
      username: isEmail("Email required"),
      password: isNotEmpty("Password required"),
    },
  });

  const setValues = () => {
    const values = {
      username: "",
      password: "",
    };
    form.setValues(values);
    form.resetDirty(values);
  };

  const loginWithEmail = async () => {
    setSubmitted(true);
    signInWithEmailAndPassword(auth, form.values.username, form.values.password)
      .then(async (userCredential) => {
        setSubmitted(false);
        const user = userCredential.user;
        if (user) {
          const accessToken = await user.getIdToken();
          if (
            signIn({
              auth: {
                token: accessToken,
                type: "Bearer",
              },
              userState: {
                email: user.email,
                name: user.displayName,
                photoUrl: user.photoURL,
              },
            })
          ) {
            navigate("/");
          } else {
            navigate("/login");
          }
        }
      })
      .catch((error) => {
        setSubmitted(false);
        console.log(error.code);

        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorCode === "auth/invalid-credential") {
          notifications.show({
            title: `Error`,
            color: "red",
            message: `Invalid email or password`,
            position: "bottom-left",
          });
        } else {
          notifications.show({
            title: `Error`,
            color: "red",
            message: `${errorMessage}`,
            position: "bottom-left",
          });
        }
      });
  };

  useEffect(() => {
    setValues();
  }, []);

  return (
    <>
      <form
        onSubmit={form.onSubmit(() => {
          loginWithEmail();
        })}
      >
        <Text c={"#414651"} size="14px" fw={500} style={{ lineHeight: "20px" }}>
          Email
        </Text>
        <Space h="xs" />
        <TextInput
          placeholder="Email address"
          radius={"md"}
          size="md"
          {...form.getInputProps("username")}
        />

        <Space h="md" />
        <Text c={"#414651"} size="14px" fw={500} style={{ lineHeight: "20px" }}>
          Password
        </Text>
        <Space h="xs" />
        <PasswordInput
          placeholder="Password"
          radius={"md"}
          size="md"
          {...form.getInputProps("password")}
        />

        <Space h="lg" />

        <Group justify="flex-end" gap={2}>
          <Anchor
            component="button"
            type="button"
            c="dimmed"
            onClick={() => {}}
            size="xs"
          >
            <Text size="16px" fw={600} c={"#151F42"}>
              Forgot password
            </Text>
          </Anchor>
        </Group>
        <Space h="lg" />

        <Group>
          <Button
            radius="md"
            size="lg"
            fullWidth
            style={{ backgroundColor: Color.DarkBlue }}
            disabled={submitted}
            loading={submitted}
            type="submit"
          >
            Sign in
          </Button>
        </Group>

        <Space h="lg" />
       
      </form>
    
      <Space h="md" />
    </>
  );
}

export default LoginForm;
