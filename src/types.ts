export type Task = { id: number; title: string; done: boolean; category: string };

// null = idle; { of: null } = creating a category; { of: name } = renaming it.
export type Edit = { of: string | null; text: string };
