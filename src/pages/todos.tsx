import Image from "next/image";
import {
  Authenticator,
  Button,
  Flex,
  Text,
  TextField,
} from "@aws-amplify/ui-react";
import { Amplify, API, Auth, withSSRContext } from "aws-amplify";
import awsExports from "@/aws-exports";
import { listTodos } from "@/graphql/queries";
import { createTodo, deleteTodo } from "@/graphql/mutations";
import Head from "next/head";
import { Todo } from "@/API";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { currentAuthenticatedUser } from "@/utils";

Amplify.configure({ ...awsExports, ssr: true });

export async function getServerSideProps({ req }) {
  const SSR = withSSRContext({ req });

  try {
    const response = await SSR.API.graphql({
      query: listTodos,
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });
    return {
      props: {
        todos: response.data.listTodos.items,
      },
    };
  } catch (err) {
    console.log(err);
    return {
      props: {},
    };
  }
}

export default function Home({ todos = [] }: { todos: Todo[] }) {
  const router = useRouter();

  const handleDeleteTodo = useCallback(async (id: string) => {
    try {
      const { data } = await API.graphql({
        authMode: "AMAZON_COGNITO_USER_POOLS",
        query: deleteTodo,
        variables: {
          input: {
            id: id,
          },
        },
      });

      router.refresh();
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    // NOTE: Redirect to top if not logged in
    (async () => {
      const user = await currentAuthenticatedUser();
      console.log("user", user);
      if (!user) router.push("/");
    })();
  }, [router]);

  return (
    <div>
      <Head>
        <title>Amplify | Todos</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Amplify + Next.js</h1>

        <Button onClick={() => router.push("/")}>Back to creation</Button>

        <h3>Todo List</h3>
        <Text>
          This page is likely &quot;protected&quot;, which means unauthenticated
          user cannot be accessed to this page.
        </Text>

        <Text>Total: {todos.length} todos created</Text>

        {todos.map((todo) => (
          <Flex key={todo.id} width="100%" gap={2} marginBlock={24}>
            <Flex flex={1} gap={2} direction="column">
              <Text fontSize="1.2em" fontWeight={600}>
                {todo.name}
              </Text>
              <Text fontSize="0.8em">{todo.description}</Text>
            </Flex>
            <Button
              variation="warning"
              gap="0.1rem"
              size="small"
              onClick={() => handleDeleteTodo(todo.id)}
            >
              Delete
            </Button>
          </Flex>
        ))}
      </main>
    </div>
  );
}
