//TaskCard.tsx
import { useState } from "react";
import { Id, Task } from "../types";
import TrashIcon from "../icons/TrashIcon";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  task: Task;
  deleteTask: (id: Id) => void;
  updateTask: (
    id: Id,
    content: string,
    description: string,
    priority: string,
    difficulty: string
  ) => void;
}

function TaskCard({ task, deleteTask, updateTask }: Props) {
  const [mouseIsOver, setMouseIsOver] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
    setMouseIsOver(false);
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-mainBackgroundColor p-2.5 h-[200px] 
      min-h-[200px] items-center flex text-left rounded-xl 
      hover:ring-2 border-2 border-yellow
      cursor-grab relative opacity-50"
      />
    );
  }

  if (editMode) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="bg-mainBackgroundColor p-2.5 h-[200px] 
        min-h-[200px] w-[340px] min-w-[340px] items-center flex flex-col text-left rounded-xl 
        hover:ring-2 hover:ring-inset hover:ring-yellow cursor-grab relative "
      >
        <textarea
          className="w-full pl-2 resize-none border-none 
            rounded bg-transparent text-white text-lg font-bold focus:outline-none"
          value={task.content}
          autoFocus
          placeholder="Task content here"
          onBlur={(e) => {
            if (
              e.relatedTarget &&
              (e.relatedTarget.tagName === "SELECT" ||
                e.relatedTarget.tagName === "TEXTAREA")
            ) {
              // Do not turn off edit mode if the focus is on a <select> or <textarea> element.
              return;
            }
            toggleEditMode();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              toggleEditMode();
            }
          }}
          onChange={(e) =>
            updateTask(
              task.id,
              e.target.value,
              task.description,
              task.priority,
              task.difficulty
            )
          }
        ></textarea>
        <textarea
          className="w-full resize-none border-none 
            rounded bg-transparent text-white opacity-60 pl-1 pt-1 focus:outline-none"
          value={task.description}
          onChange={(e) =>
            updateTask(
              task.id,
              task.content,
              e.target.value,
              task.priority,
              task.difficulty
            )
          }
        />
        <div className="flex flex-row gap-2 p-3">
          <div>
            <label className="font-semibold">Priority:</label>
            <select
              className="bg-mainBackgroundColor text-white"
              value={task.priority}
              onChange={(e) =>
                updateTask(
                  task.id,
                  task.content,
                  task.description,
                  e.target.value,
                  task.difficulty
                )
              }
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div>
            <label className="font-semibold">Difficulty:</label>
            <select
              className="bg-mainBackgroundColor text-white"
              value={task.difficulty}
              onChange={(e) =>
                updateTask(
                  task.id,
                  task.content,
                  task.description,
                  task.priority,
                  e.target.value
                )
              }
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={toggleEditMode}
      className="bg-mainBackgroundColor p-2.5 h-[200px] 
    min-h-[200px] w-[340px] min-w-[340px] items-center flex flex-col text-left rounded-xl 
    hover:ring-2 hover:ring-inset hover:ring-yellow cursor-grab relative task "
      onMouseEnter={() => {
        setMouseIsOver(true);
      }}
      onMouseLeave={() => {
        setMouseIsOver(false);
      }}
    >
      <div
        className="
      h-[90%] w-full overflow-y-auto overflow-x-hidden
      whitespace-pre-wrap 
      "
      >
        <div className="font-bold text-lg pl-2">{task.content}</div>
        <div className="opacity-60 px-1 py-[32px]">{task.description}</div>
        <div className="flex flex-row gap-10 ">
          <div className="flex flex-row pt-1 pl-2">
            {" "}
            <p className="font-semibold">Priority: </p>
            {task.priority}
          </div>
          <div className="flex flex-row pt-1 pl-2">
            {" "}
            <p className="font-semibold">Difficulty: </p>
            {task.difficulty}{" "}
          </div>
        </div>
      </div>
      {mouseIsOver && (
        <button
          onClick={() => {
            deleteTask(task.id);
          }}
          className="stroke-white absolute right-4  
          bg-columnBackgroundColor 
          p-1 rounded opacity-70 hover:opacity-100"
        >
          <TrashIcon />
        </button>
      )}
    </div>
  );
}

export default TaskCard;
