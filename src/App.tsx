import { useRef, useState } from "react";
import { CategoryMenu } from "./components/CategoryMenu";
import { Shelf } from "./components/Shelf";
import { Sidebar } from "./components/Sidebar";
import { TaskForm } from "./components/TaskForm";
import { TitleBar } from "./components/TitleBar";
import * as storage from "./storage";
import type { Edit, Task } from "./types";
import "./App.css";

// Loads all data one time on launch
const savedCategories = storage.loadCategories();
const savedTasks = storage.loadTasks();

function App() {
  const [categories, setCategories] = useState(savedCategories);
  const [category, setCategory] = useState(savedCategories[0] ?? "");
  const [tasks, setTasks] = useState(savedTasks);
  const [edit, setEdit] = useState<Edit | null>(null);
  const [menu, setMenu] = useState<{
    name: string;
    x: number;
    y: number;
  } | null>(null);
  const nextId = useRef(Math.max(0, ...savedTasks.map((t) => t.id)) + 1);

  const saveTasks = (next: Task[]) => {
    setTasks(next);
    storage.saveTasks(next);
  };

  const saveCategories = (next: string[]) => {
    setCategories(next);
    storage.saveCategories(next);
  };

  const addTask = (title: string) =>
    saveTasks([
      ...tasks,
      { id: nextId.current++, title, done: false, category },
    ]);

  const toggleTask = (id: number) =>
    saveTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const removeTask = (id: number) =>
    saveTasks(tasks.filter((t) => t.id !== id));

  // Tasks key off of names to allow renames to carry over.
  const commitEdit = () => {
    if (!edit) return;
    const name = edit.text.trim();
    const from = edit.of;
    setEdit(null);
    if (!name || name === from) return;
    if (categories.includes(name)) {
      setCategory(name);
      return;
    }
    saveCategories(
      from === null
        ? [...categories, name]
        : categories.map((c) => (c === from ? name : c)),
    );
    if (from !== null)
      saveTasks(
        tasks.map((t) => (t.category === from ? { ...t, category: name } : t)),
      );
    setCategory(name);
  };

  // Takes the category's tasks with it — the menu item is red for a reason.
  const removeCategory = (name: string) => {
    const next = categories.filter((c) => c !== name);
    saveCategories(next);
    saveTasks(tasks.filter((t) => t.category !== name));
    if (category === name) setCategory(next[0] ?? "");
  };

  return (
    <div className="flex h-screen w-full flex-col bg-void font-ui text-ink overflow-hidden rounded-[10px]">
      <TitleBar />
      <div className="flex min-h-0 flex-1">
        <Sidebar
          categories={categories}
          selected={category}
          onSelect={setCategory}
          edit={edit}
          setEdit={setEdit}
          onCommit={commitEdit}
          onMenu={(name, x, y) => setMenu({ name, x, y })}
        />
        <main className="scroll-thin flex min-w-0 flex-1 flex-col gap-4.5 overflow-y-auto p-3">
          {category ? (
            <>
              <TaskForm onAdd={addTask} />
              <Shelf
                title={category}
                tasks={tasks.filter((t) => t.category === category)}
                onToggle={toggleTask}
                onRemove={removeTask}
              />
            </>
          ) : (
            <p className="m-auto text-[11px] text-faint">
               ...
            </p>
          )}
        </main>
      </div>

      {menu && (
        <CategoryMenu
          x={menu.x}
          y={menu.y}
          onRename={() => setEdit({ of: menu.name, text: menu.name })}
          onDelete={() => removeCategory(menu.name)}
          onClose={() => setMenu(null)}
        />
      )}
    </div>
  );
}

export default App;
