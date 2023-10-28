// WorkBoard.tsx
import PlusIcon from "../icons/PlusIcon";
import { useState, useEffect, useMemo } from "react";
import { Column, Id, Task } from "../types";
import ColumnContainer from "./ColumnContainer";
import {
  DndContext,
  DragStartEvent,
  DragEndEvent,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
  DragOverEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard";

function WorkBoard() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  ); 

  useEffect(() => {
    // Fetch columns
    fetch("http://localhost:3001/columns")
      .then((response) => response.json())
      .then((data) => setColumns(data));

    // Fetch tasks
    fetch("http://localhost:3001/tasks")
      .then((response) => response.json())
      .then((data) => setTasks(data));
  }, []);

  return (
    <div
      className="
        m-auto
        flex
        min-h-screen
        w-full
        items-center
        overflow-x-auto
        overflow-y-hidden
        px-[10px]
    ">
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}>
        <div className="m-auto flex gap-2">
          <div className="flex gap-2">
            <SortableContext items={columnsId}>
              {columns.map((col) => (
                <ColumnContainer
                  key={col.id}
                  column={col}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  createTask={createTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                  tasks={tasks.filter((task) => task.columnId === col.id)}
                />
              ))}
            </SortableContext>
          </div>
          <button
            onClick={createNewColumn}
            className="
        h-[60px]
        w-[350px]
        min-w-[350px]
        cursor-pointer
        rounded-lg
        bg-mainBackgroundColor
        border-2
        border-columnBackgroundColor
        p-4
        ring-yellow
        hover:ring-2
        flex
        gap-2
        ">
            <PlusIcon />
            Add Column
          </button>
        </div>

        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer
                column={activeColumn}
                deleteColumn={deleteColumn}
                updateColumn={updateColumn}
                createTask={createTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
                tasks={tasks.filter(
                  (task) => task.columnId === activeColumn.id
                )}
              />
            )}
            {activeTask && (
              <TaskCard
                task={activeTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );

  function createTask(columnId: Id) {
    const newTask: Task = {
      id: generateId(),
      columnId,
      content: `Task ${tasks.length + 1}`,
      description: "description",
      priority: "Low",   // Use selected priority
      difficulty: "Easy", // Use selected difficulty
    };

    fetch("http://localhost:3001/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTask),
    })
      .then((response) => response.json())
      .then((data) => {
        setTasks([...tasks, data]);
      });
  }

  function deleteTask(id: Id) {
    fetch(`http://localhost:3001/tasks/${id}`, {
      method: "DELETE",
    }).then(() => {
      const newTasks = tasks.filter((task) => task.id !== id);
      setTasks(newTasks);
    });
  }

  function updateTask(
    id: Id,
    content: string,
    description: string,
    priority: string,
    difficulty: string
  ) {
    const taskToUpdate = tasks.find((t) => t.id === id);
    if (taskToUpdate) {
      const updatedTask = {
        ...taskToUpdate,
        content,
        description,
        priority,
        difficulty,
      };
      fetch(`http://localhost:3001/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTask),
      })
        .then((response) => response.json())
        .then((data) => {
          const newTasks = tasks.map((task) => {
            if (task.id !== id) return task;
            return data; // Assuming backend returns updated task
          });
          setTasks(newTasks);
        });
    }
  }

  function createNewColumn() {
    const columnToAdd: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`,
    };

    fetch("http://localhost:3001/columns", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(columnToAdd),
    })
      .then((response) => response.json())
      .then((data) => {
        setColumns([...columns, data]);
      });
  }

  function deleteColumn(id: Id) {
    fetch(`http://localhost:3001/columns/${id}`, {
      method: "DELETE",
    }).then(() => {
      const filteredColumns = columns.filter((col) => col.id !== id);
      setColumns(filteredColumns);

      const newTasks = tasks.filter((t) => t.columnId !== id);
      setTasks(newTasks);
    });
  }

  function updateColumn(id: Id, title: string) {
    const columnToUpdate = columns.find((col) => col.id === id);
    if (columnToUpdate) {
      const updatedColumn = { ...columnToUpdate, title };
      fetch(`http://localhost:3001/columns/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedColumn),
      })
        .then((response) => response.json())
        .then((data) => {
          const newColumns = columns.map((col) => {
            if (col.id !== id) return col;
            return data; // Assuming backend returns updated column
          });
          setColumns(newColumns);
        });
    }
  }

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);
    const { active, over } = event;

    if (!over) return;

    const activeColumnId = active.id;
    const overColumnId = over.id;

    if (activeColumnId === overColumnId) return;

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex(
        (col) => col.id === activeColumnId
      );
      const overColumnIndex = columns.findIndex(
        (col) => col.id === overColumnId
      );

      return arrayMove(columns, activeColumnIndex, overColumnIndex); //swapwa activeindex s overindex w arraya columns
    });
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (!isActiveATask) return;

    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (tasks[activeIndex].columnId != tasks[overIndex].columnId) {
          tasks[activeIndex].columnId = tasks[overIndex].columnId;
          return arrayMove(tasks, activeIndex, overIndex - 1);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverAColumn = over.data.current?.type === "Column";

    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);

        tasks[activeIndex].columnId = overId;

        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  }
}

function generateId() {
  return Math.floor(Math.random() * 10001);
}

export default WorkBoard;
