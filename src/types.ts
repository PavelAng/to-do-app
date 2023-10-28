//types.ts
export type Id = string | number;

export type Column = {
  id: Id;
  title: string;
  position: number;
};

export type Task = {
  id: Id;
  columnId: Id;
  content: string;
  description: string;
  position: number;
  priority: string;
  difficulty: string;
};
