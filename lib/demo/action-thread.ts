export type ThreadIntent = "guidance" | "requirements" | "resources" | "completion" | "limits";
export type ThreadMessage =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; intent: ThreadIntent };
export type ActionThreadState = { messages: ThreadMessage[]; draft: string };
