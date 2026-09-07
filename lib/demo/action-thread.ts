export const threadIntents = [
  "guidance",
  "requirements",
  "resources",
  "completion",
  "limits",
] as const;
export type ThreadIntent = (typeof threadIntents)[number];
export type ThreadMessage =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; intent: ThreadIntent };
export type ActionThreadState = { messages: ThreadMessage[]; draft: string };

// The demo selects a bounded response from the curated action; it never claims
// to inspect uploads, perform external work, or complete an application step.
export function classifyThreadMessage(text: string): ThreadIntent {
  if (
    /\b(book|submit|pay|upload|send|sign|buy|purchase|verify|check my)\b|帮我预约|代我|上传|支付|提交|购买|reserva por|paga|envía|sube/i.test(
      text,
    )
  )
    return "limits";
  if (
    /\b(need|requirement|requirements|condition|conditions|stamp|signature|translation|photo|photos)\b|要求|需要|盖章|签名|翻译|照片|necesit|requisito|condici/i.test(
      text,
    )
  )
    return "requirements";
  if (
    /\b(file|files|document|documents|template|form|download|artifact|guide|letter)\b|材料|文件|模板|表格|下载|指南|证明|documento|plantilla|formulario|archivo/i.test(
      text,
    )
  )
    return "resources";
  if (
    /\b(done|finish|complete|completion|ready|review)\b|完成|核对|准备好|terminar|complet|listo/i.test(
      text,
    )
  )
    return "completion";
  if (
    /\b(start|prepare|how|help|next)\b|怎么|如何|开始|帮助|下一步|cómo|ayuda|empezar/i.test(
      text,
    )
  )
    return "guidance";
  return "limits";
}
