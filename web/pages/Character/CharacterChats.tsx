import { useNavigate, useParams } from '@solidjs/router'
import { Component, createEffect, createSignal, For, Show } from 'solid-js'
import { chatStore } from '../../store'
import PageHeader from '../../shared/PageHeader'
import Button from '../../shared/Button'
import { Plus, Trash } from 'lucide-solid'
import CreateChatModal from './CreateChat'
import { toDuration } from '../../shared/util'
import { ConfirmModel } from '../../shared/Modal'

const CharacterChats: Component = () => {
  const [showCreate, setCreate] = createSignal(false)

  const state = chatStore()
  const { id } = useParams()

  createEffect(() => {
    chatStore.getBotChats(id)
  })

  return (
    <div class="flex flex-col gap-2">
      <PageHeader title={`Conversations with ${state.char?.char.name || '...'}`} />

      <div class="flex w-full justify-end gap-2">
        <Button onClick={() => setCreate(true)}>
          <Plus />
          Conversation
        </Button>
      </div>
      {state.char?.chats.length === 0 && <NoChats />}
      <Show when={state.char?.chats.length}>
        <Chats />
      </Show>
      <CreateChatModal show={showCreate()} onClose={() => setCreate(false)} />
    </div>
  )
}

const Chats: Component = () => {
  const state = chatStore()
  const nav = useNavigate()
  const [showDelete, setDelete] = createSignal('')

  const confirmDelete = () => {
    chatStore.deleteChat(showDelete(), () => setDelete(''))
  }

  return (
    <div class="flex flex-col gap-2">
      <div class="flex items-center">
        <div class="w-6/12 px-4 text-sm">Name</div>
        <div class="flex w-2/12 justify-center"></div>
        <div class="flex w-4/12 justify-start text-sm">Updated</div>
      </div>
      <For each={state.char?.chats}>
        {(chat) => (
          <div class="flex w-full gap-2">
            <div
              class="flex h-12 w-full cursor-pointer flex-row items-center gap-2 rounded-xl bg-gray-900"
              onClick={() => nav(`/chat/${chat._id}`)}
            >
              <div class="w-6/12 px-4">{chat.name || 'Untitled'}</div>
              <div class="flex w-2/12 justify-center"></div>
              <div class="flex w-4/12 justify-between">
                <div class="text-sm">{toDuration(new Date(chat.updatedAt))} ago</div>
                <div class="mx-4 flex items-center gap-2"></div>
              </div>
            </div>
            <div class="flex items-center" onClick={() => setDelete(chat._id)}>
              <Trash size={16} class="icon-button" />
            </div>
          </div>
        )}
      </For>
      <ConfirmModel
        show={!!showDelete()}
        close={() => setDelete('')}
        confirm={confirmDelete}
        message="Are you sure wish to delete the conversation?"
      />
    </div>
  )
}

const NoChats: Component = () => (
  <div class="mt-4 flex w-full justify-center text-xl">
    There are no conversations saved for this character. Get started!
  </div>
)

export default CharacterChats
