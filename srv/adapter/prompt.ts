import gpt from 'gpt-3-encoder'
import { store } from '../db'
import { AppSchema } from '../db/schema'

type PromptOpts = {
  chat: AppSchema.Chat
  char: AppSchema.Character
  members: AppSchema.Profile[]
  settings: AppSchema.GenSettings
  retry?: AppSchema.ChatMessage
  continue?: string
}

const DEFAULT_MAX_TOKENS = 2048

export async function getMessagesForPrompt({ chat, settings, char, members }: PromptOpts) {
  const maxContext = settings.maxContextLength || DEFAULT_MAX_TOKENS
  let before: string | undefined
  let tokens = 0

  const lines: string[] = []
  const msgs: AppSchema.ChatMessage[] = []

  const formatMsg = (chat: AppSchema.ChatMessage) => prefix(chat, char.name, members) + chat.msg

  do {
    const messages = await store.chats.getRecentMessages(chat._id, before)
    msgs.push(...messages)
    const history = messages.map(formatMsg)

    for (const hist of history) {
      const nextTokens = gpt.encode(hist).length
      if (nextTokens + tokens > maxContext) break
      tokens += nextTokens
      lines.unshift(hist)
    }

    if (tokens >= maxContext || messages.length < 50) break
    before = messages.slice(-1)[0].createdAt
  } while (true)

  return { lines, messages: msgs }
}

function prefix(chat: AppSchema.ChatMessage, bot: string, members: AppSchema.Profile[]) {
  const member = members.find((mem) => chat.userId === mem.userId)

  return chat.characterId ? `${bot}: ` : `${member?.handle}: `
}