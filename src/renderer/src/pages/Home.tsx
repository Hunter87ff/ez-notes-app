// src/renderer/pages/Home.tsx

import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { themeClasses } from '@renderer/noteThemes'
import useNoteStore from '@renderer/store/useNoteStore'
import debounce from 'lodash.debounce'
import TitleInput from '@renderer/components/TitleInput'
import Tiptap from '@renderer/components/TipTap'
import { Pin, Trash2} from 'lucide-react'
// import TaskTimer from '@renderer/components/taskTimer'

const Home: React.FC = () => {
  const tiptapRef = useRef<any>(null) // Replace 'any' with the actual type if available

  const notes = useNoteStore((state) => state.notes)
  const loadNotes = useNoteStore((state) => state.loadNotes)
  const updateNote = useNoteStore((state) => state.updateNote)

  useEffect(() => {
    // Load notes when the component mounts
    loadNotes()
  }, [loadNotes])

  const debouncedUpdateNote = debounce(async (note) => {
    await updateNote(note)
  }, 300)

  const handleNoteChange = (noteId: string, field: 'title' | 'content', value: string) => {
    const noteToUpdate = notes.find((note) => note.id === noteId)
    if (noteToUpdate) {
      // Update local state immediately
      const updatedNote = { ...noteToUpdate, [field]: value || '' }
      useNoteStore.setState((state) => ({
        notes: state.notes.map((n) => (n.id === noteId ? updatedNote : n))
      }))

      // Trigger the debounced function for database update
      debouncedUpdateNote(updatedNote)
    }
  }

  const handlePinNote = async (noteId: string) => {
    const note = notes.find((n) => n.id === noteId)
    if (!note) return

    // Send the note to Electron main process to pin it
    window.electronAPI.pinNote(note.id)

    // Update the note in the database as pinned
    // await updateNote({ ...note, isPinned: true })
  }

  const handleDeleteNote = async (noteId: string) => {
    // Send the note to Electron main process to delete it
    window.electronAPI.deleteNote(noteId)

    // Update the note in the database as deleted
    // await updateNote({ ...note, isDeleted: true })
    // delete the note state
    useNoteStore.setState((state) => ({
      notes: state.notes.filter((n) => n.id !== noteId)})
    )
  }

  return (
    <div className="p-4">
        {/* This one looks better ig!! */}
        {/* <TaskTimer /> */}
      <h1 className="text-2xl font-bold mb-4">Notes</h1>
      {notes.length === 0 ? (
        <p>
          No notes available.
          <Link to="/create" className="text-blue-500 hover:underline">
            Create one now!
          </Link>
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`${themeClasses[note.theme]} relative shadow rounded-lg p-4 hover:shadow-lg transition-shadow group overflow-auto`}
            >
                <div
                className="absolute top-2 right-8 cursor-pointer opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity delay-100"
                onClick={() => handlePinNote(note.id)}
                >
                    <Pin className="h-5 w-5 cursor-pointer text-gray-500 hover:fill-white" />
                </div>
                <div
                    className="absolute top-2 right-2 cursor-pointer opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity delay-100"
                    onClick={() => handleDeleteNote(note.id)}
                >
                    <Trash2 className="h-5 w-5 cursor-pointer text-gray-500 hover:fill-white" />
                </div>


              <TitleInput
                className="border-none"
                title={note.title || 'Untitled Note'}
                handleTitleChange={(e) => handleNoteChange(note.id, 'title', e.target.value)}
              />

              <Tiptap
                content={note.content}
                ref={tiptapRef}
                onContentChange={(value) => handleNoteChange(note.id, 'content', value)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Home
