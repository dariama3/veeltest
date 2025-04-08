'use client'
import { FormEvent, useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

type Todo = {
  id: number
  title: string
  completed: boolean
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState<string>('')
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      return await fetch('https://jsonplaceholder.typicode.com/todos?_limit=10').then((res) =>
        res.json(),
      )
    },
  })

  useEffect(() => {
    if (data) {
      setTodos(data)
    }
  }, [data])

  const addMutation = useMutation({
    mutationFn: async (title: string) => {
      return await fetch('https://jsonplaceholder.typicode.com/todos', {
        method: 'POST',
        body: JSON.stringify({
          title: title,
          completed: false,
        }),
        headers: { 'Content-Type': 'application/json' },
      }).then((res) => res.json())
    },
    onSuccess: (todo: Todo) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })

      setTodos((prev) => [todo, ...prev])
      setNewTodo('')
    },
  })

  const addTodo = async (e: FormEvent) => {
    e.preventDefault()

    if (!newTodo.trim()) return

    addMutation.mutate(newTodo)
  }

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
        method: 'DELETE',
      }).then((res) => res.json())
    },
    onSuccess: (unused, id: number) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })

      setTodos((prev) => prev.filter((todo) => todo.id !== id))
    },
  })

  const deleteTodo = async (id: number) => {
    deleteMutation.mutate(id)
  }

  const toggleComplete = (id: number) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)),
    )
  }

  return (
    <section className="mx-auto max-w-xl p-4">
      <h1 className="mb-4 text-center text-2xl font-bold">Todo List</h1>

      <form className="mb-4 flex gap-2" onSubmit={addTodo}>
        <input
          className="flex-1 rounded border p-2"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="New task..."
        />
        <button className="cursor-pointer rounded bg-orange-500 px-4 text-white hover:bg-orange-600 dark:bg-orange-800 dark:hover:bg-orange-900">
          Add
        </button>
      </form>

      <ul className="space-y-2">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center justify-between rounded border border-gray-200 p-2 dark:border-gray-700"
          >
            <div
              onClick={() => toggleComplete(todo.id)}
              className={`flex-1 cursor-pointer ${
                todo.completed ? 'text-gray-500 line-through' : ''
              }`}
            >
              {todo.title}
            </div>
            <button
              className="cursor-pointer px-2 text-red-500 hover:text-red-700"
              onClick={() => deleteTodo(todo.id)}
            >
              X
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
