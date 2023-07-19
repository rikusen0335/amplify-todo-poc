import Image from "next/image";
import { Authenticator, Button, Flex, TextField } from "@aws-amplify/ui-react";
import { Amplify, API, Auth, withSSRContext } from "aws-amplify";
import awsExports from "@/aws-exports";
import { listTodos } from "@/graphql/queries";
import { createTodo } from "@/graphql/mutations";
import Head from "next/head";
import { Todo } from "@/API";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

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
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreateTodo = useCallback(
    async (name: string, description: string) => {
      try {
        const { data } = await API.graphql({
          authMode: "AMAZON_COGNITO_USER_POOLS",
          query: createTodo,
          variables: {
            input: {
              name: name,
              description: description,
            },
          },
        });

        router.refresh();
        setName("");
        setDescription("");

        // window.location.href = `/todos/${data.createTodo.id}`;
      } catch (error) {
        console.error(error);
        // throw new Error(errors[0].message);
      }
    },
    []
  );

  return (
    <div>
      <Head>
        <title>Amplify + Next.js</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Amplify + Next.js</h1>

        <p>{todos.length} todos created</p>
        <Button onClick={() => router.push("/todos")}>Todo List</Button>

        <h3>New Todo</h3>

        <Authenticator>
          <form onSubmit={() => handleCreateTodo(name, description)}>
            <TextField
              label="Name"
              errorMessage="There is an error"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <TextField
              label="Description"
              errorMessage="There is an error"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <Flex marginTop={24} marginBottom={8}>
              <Button onClick={() => handleCreateTodo(name, description)}>
                Create Todo
              </Button>
              <Button type="button" onClick={() => Auth.signOut()}>
                Sign out
              </Button>
            </Flex>
          </form>
        </Authenticator>
      </main>
    </div>
  );
}
