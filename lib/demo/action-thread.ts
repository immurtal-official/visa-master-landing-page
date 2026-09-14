export type ThreadIntent =
  "guidance" | "requirements" | "resources" | "completion" | "limits";
export type ThreadMessage =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; intent: ThreadIntent };
export type ActionThreadState = { messages: ThreadMessage[]; draft: string };

// Local form follow-ups remain separate from validated PDF answers.
export function formFollowupIntent(text: string): ThreadIntent {
  if (
    /edit|change|correct|update|修改|更改|改一下|改成|改为|错误|correg|cambiar/i.test(
      text,
    )
  )
    return "requirements";
  if (/sign|photo|签名|签字|照片|firma|foto/i.test(text)) return "completion";
  if (
    /pdf|download|preview|review|下载|预览|检查|descargar|revisar/i.test(text)
  )
    return "resources";
  return "limits";
}
