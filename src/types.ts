export type Task = {
  id: number;
  title: string;
  done: boolean;
  category: string;
  // YYYY-MM-DD, or absent when the task has no due date.
  due?: string;
  // HH:MM on that date, optional. Meaningless without `due`.
  time?: string;
};

// null = idle; { of: null } = creating a category; { of: name } = renaming it.
export type Edit = { of: string | null; text: string };
