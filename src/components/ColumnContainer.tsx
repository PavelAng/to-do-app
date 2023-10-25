//ColumnContainer.tsx
import { useMemo, useState } from "react";
import TrashIcon from "../icons/TrashIcon";
import { Column, Id, Task } from "../types";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import PlusIcon from "../icons/PlusIcon";
import TaskCard from "./TaskCard";

interface Props {
  column: Column;
  deleteColumn: (id: Id) => void;
  updateColumn: (id: Id, title: string) => void;

  createTask: (columnId: Id) => void;
  updateTask: (id: Id, content: string) => void;
  deleteTask: (id: Id) => void;
  tasks: Task[];
}
function ColumnContainer(props: Props) {
  const {
    column,
    deleteColumn,
    updateColumn,
    createTask,
    tasks,
    deleteTask,
    updateTask,
  } = props;

  const [editMode, setEditMode] = useState(false);

  const tasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  },[tasks]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="
    bg-columnBackgroundColor
    opacity-30
    border-2
    border-yellow
    w-[400px]
    h-[650px]
    max-h-[650px]
    rounded-md
    flex
    flex-col"></div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="
      bg-columnBackgroundColor
      w-[400px]
      h-[650px]
    max-h-[650px]
      rounded-md
      flex
      flex-col
  ">
      <div
        {...attributes}
        {...listeners}
        onClick={() => {
          setEditMode(true);
        }}
        className="
      bg-mainBackgroundColor
      text-md
      h-[60px]
      cursor-grab
      rounded-md
      p-3
      font-bold
      border-columnBackgroundColor
      border-4
      flex
      items-center
      justify-between
      ">
        <div>
          {!editMode && column.title}
          {editMode && (
            <input
              className="bg-black focus:border-yellow border-2 rounded outline-none px-2"
              value={column.title}
              onChange={(e) =>
                updateColumn(column.id, e.target.value.slice(0, 20))
              }
              autoFocus
              onBlur={() => {
                setEditMode(false);
              }}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                setEditMode(false);
              }}
              maxLength={20}
            />
          )}
        </div>
        <button
          onClick={() => {
            deleteColumn(column.id);
          }}
          className="
           stroke-gray-500
           hover:stroke-white
           hover:bg-columnBackgroundColor
           rounded
           px-1
           py-2
           ">
          <TrashIcon />
        </button>
      </div>

      <div className=" flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              deleteTask={deleteTask}
              updateTask={updateTask}
            />
          ))}
        </SortableContext>
      </div>

      <button
        className="flex gap-2 items-center 
      border-columnBackgroundColor border-2 rounded-md p-4 
      border-x-columnBackgroundColor 
      hover:bg-mainBackgroundColor 
      hover:text-yellow 
      active:bg-black"
        onClick={() => {
          createTask(column.id);
        }}>
        <PlusIcon />
        Add Task
      </button>
    </div>
  );
}

export default ColumnContainer;
