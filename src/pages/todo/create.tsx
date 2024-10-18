import { Todo } from "@/API";
import awsExports from "@/aws-exports";
import { createTodo } from "@/graphql/mutations";
import { listTodos } from "@/graphql/queries";
import {
	Authenticator,
	Button,
	DropZone,
	Flex,
	SelectField,
	Tabs,
	Text,
	TextField,
	VisuallyHidden,
} from "@aws-amplify/ui-react";
import { API, Amplify, Auth, withSSRContext } from "aws-amplify";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

Amplify.configure({ ...awsExports, ssr: true });

const okFileTypes = ["image/png", "image/jpeg"];

export default function PageCreateTodo() {
	const router = useRouter();
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [type, setType] = useState<"work" | "personal">("work");
	const [files, setFiles] = useState<File[]>([]);

	const tempInput = useRef(null);

	const filePick = (event) => {
		const { files } = event.target;

		// ファイルが選択されていなければ何もしない
		if (files === null || files === undefined || files.length === 0) {
			return;
		}
		setFiles(Array.from(files));
	};

	// TODOを作成する
	const addTodo = useCallback(
		async (name: string, description: string, type: string) => {
			try {
				const { data } = await API.graphql({
					authMode: "AMAZON_COGNITO_USER_POOLS",
					query: createTodo,
					variables: {
						input: {
							name: name,
							description: description,
							type: type,
						},
					},
				});

				router.refresh();
				setName("");
				setDescription("");
			} catch (error) {
				// エラーがあればエラーを返す
				console.error(error);
			}
		},
		[router],
	);

	return (
		<div>
			<h3>New Todo</h3>

			<Authenticator>
				<form onSubmit={() => addTodo(name, description)}>
					<TextField
						label="名前"
						value={name}
						onChange={(e) => setName(e.target.value)}
					/>

					<TextField
						label="説明"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
					/>

					<SelectField
						label="タイプ"
						value={type}
						onChange={(e) => setType(e.target.value as "work" | "personal")}
					>
						<option value="work">仕事</option>
						<option value="private">プライベート</option>
					</SelectField>

					<DropZone
						acceptedFileTypes={okFileTypes}
						onDropComplete={({ acceptedFiles }) => {
							setFiles(acceptedFiles);
						}}
					>
						<Flex direction="column" alignItems="center">
							<Text>Drag images here or</Text>
							<Button size="small" onClick={() => tempInput.current?.click()}>
								Browse
							</Button>
						</Flex>
						<VisuallyHidden>
							<input
								type="file"
								tabIndex={-1}
								ref={tempInput}
								onChange={filePick}
								multiple={true}
								accept={okFileTypes.join(",")}
							/>
						</VisuallyHidden>
					</DropZone>

					<Flex marginTop={24} marginBottom={8}>
						<Button onClick={() => addTodo(name, description, type)}>
							Todoを作成
						</Button>
					</Flex>
				</form>
			</Authenticator>
		</div>
	);
}
