import React, { createContext, useReducer, useContext } from "react";
import { Column, Task } from "../types";

type State = {
  columns: Column[];
  tasks: Task[];
  activeColumn: Column | null;
  activeTask: Task | null;
};

type Action =
  | { type: "SET_COLUMNS"; payload: Column[] }
  | { type: "SET_TASKS"; payload: Task[] }
  | { type: "SET_ACTIVE_COLUMN"; payload: Column | null }
  | { type: "SET_ACTIVE_TASK"; payload: Task | null }
  | { type: "DELETE_TASK"; payload: Task[] }
  | { type: "UPDATE_TASK"; payload: Task[] }
  | { type: "ADD_COLUMN"; payload: Column[] }
  | { type: "DELETE_COLUMN"; payload: Column[] }
  | { type: "FILTER_TASKS_BY_COLUMN_ID"; payload: Task[] }
  | { type: "DELETE_TASKS_BY_COLUMN_ID"; payload: Task[] }
  | { type: "UPDATE_COLUMN"; payload: Column[] };

const BoardContext = createContext<
  { state: State; dispatch: React.Dispatch<Action> } | undefined
>(undefined);

const initialState: State = {
  columns: [],
  tasks: [],
  activeColumn: null,
  activeTask: null
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_COLUMNS":
      return { ...state, columns: action.payload };
    case "SET_TASKS":
      return { ...state, tasks: action.payload };
    case "SET_ACTIVE_COLUMN":
      return { ...state, activeColumn: action.payload };
    case "SET_ACTIVE_TASK":
      return { ...state, activeTask: action.payload };
    case "DELETE_TASK":
      return {
        ...state,
        tasks: action.payload
      };
    case "UPDATE_TASK":
      return {
        ...state,
        tasks: action.payload
      };
    case "ADD_COLUMN":
      return {
        ...state,
        columns: action.payload
      };
    case "DELETE_COLUMN":
      return {
        ...state,
        columns: action.payload
      };
    case "FILTER_TASKS_BY_COLUMN_ID":
      return {
        ...state,
        tasks: action.payload
      };
    case "DELETE_TASKS_BY_COLUMN_ID":
      return {
        ...state,
        tasks: action.payload
      };
    case "UPDATE_COLUMN":
      return {
        ...state,
        columns: action.payload
      };
    default:
      return state;
  }
}

type BoardProviderProps = {
  children: React.ReactNode;
};

export const BoardProvider: React.FC<BoardProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <BoardContext.Provider value={{ state, dispatch }}>
      {children}
    </BoardContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useBoard() {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error("useBoard must be used within a BoardProvider");
  }
  return context;
}
