// WorkBoard.tsx
import PlusIcon from "../icons/PlusIcon";
import { useEffect, useMemo } from "react";
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
  DragOverEvent
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard";
import { useBoard } from "./BoardContext";

function WorkBoard() {
  const { state, dispatch } = useBoard();

  const columnsId = useMemo(
    () => state.columns.map((col) => col.id),
    [state.columns]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10
      }
    })
  );

  useEffect(() => {
    fetch("http://localhost:3001/columns")
      .then((response) => response.json())
      .then((data) => dispatch({ type: "SET_COLUMNS", payload: data }));

    fetch("http://localhost:3001/tasks")
      .then((response) => response.json())
      .then((data) => dispatch({ type: "SET_TASKS", payload: data }));
  }, [dispatch]);

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
    "
    >
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <div className="m-auto flex gap-2">
          <div className="flex gap-2">
            <SortableContext items={columnsId}>
              {state.columns.map((col) => (
                <ColumnContainer
                  key={col.id}
                  column={col}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  createTask={createTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                  tasks={state.tasks.filter((task) => task.columnId === col.id)}
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
        "
          >
            <PlusIcon />
            Add Column
          </button>
        </div>

        {createPortal(
          <DragOverlay>
            {state.activeColumn && (
              <ColumnContainer
                column={state.activeColumn}
                deleteColumn={deleteColumn}
                updateColumn={updateColumn}
                createTask={createTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
                tasks={state.tasks.filter(
                  (task) => task.columnId === state.activeColumn!.id
                )}
              />
            )}
            {state.activeTask && (
              <TaskCard
                task={state.activeTask as Task}
                deleteTask={deleteTask as (id: Id) => void}
                updateTask={
                  updateTask as (
                    id: Id,
                    content: string,
                    description: string,
                    priority: string,
                    difficulty: string
                  ) => void
                }
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );

  function createTask(columnId: Id) {
    const newTask: Omit<Task, "id"> = {
      columnId,
      content: `Task ${state.tasks.length + 1}`,
      description: "Description",
      priority: "Low",
      difficulty: "Easy",
      position: state.tasks.length
    };

    fetch("http://localhost:3001/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newTask)
    })
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then((data) => {
        return dispatch({ type: "SET_TASKS", payload: [...state.tasks, data] });
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  }

  function deleteTask(id: Id) {
    fetch(`http://localhost:3001/tasks/${id}`, {
      method: "DELETE"
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Error deleting task with ID ${id}: ${response.statusText}`
          );
        }
        const newTasks = state.tasks.filter((task) => task.id !== id);
        dispatch({ type: "DELETE_TASK", payload: newTasks });
      })
      .catch((error) => {
        console.error("Error deleting task:", error);
      });
  }

  function updateTask(
    id: Id,
    content: string,
    description: string,
    priority: string,
    difficulty: string
  ) {
    const taskToUpdate = state.tasks.find((t) => t.id === id);
    if (taskToUpdate) {
      const updatedTask = {
        ...taskToUpdate,
        content,
        description,
        priority,
        difficulty
      };

      fetch(`http://localhost:3001/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedTask)
      })
        .then((response) => response.json())
        .then((data) => {
          const newTasks = state.tasks.map((task) => {
            if (task.id !== id) return task;
            return data;
          });
          dispatch({ type: "UPDATE_TASK", payload: newTasks });
        });
    }
  }
  function createNewColumn() {
    const columnToAdd: Omit<Column, "id"> = {
      title: `Column ${state.columns.length + 1}`,
      position: state.columns.length
    };

    fetch("http://localhost:3001/columns", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(columnToAdd)
    })
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then((data) => {
        dispatch({ type: "ADD_COLUMN", payload: [...state.columns, data] });
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  }

  function deleteColumn(id: Id) {
    fetch(`http://localhost:3001/columns/${id}`, {
      method: "DELETE"
    }).then(() => {
      const filteredColumns = state.columns.filter((col) => col.id !== id);
      dispatch({ type: "DELETE_COLUMN", payload: filteredColumns });

      const newTasks = state.tasks.filter((t) => t.columnId !== id);
      dispatch({ type: "DELETE_TASKS_BY_COLUMN_ID", payload: newTasks });
    });
  }

  function updateColumn(id: Id, title: string) {
    const columnToUpdate = state.columns.find((col) => col.id === id);
    if (columnToUpdate) {
      const updatedColumn = { ...columnToUpdate, title };
      fetch(`http://localhost:3001/columns/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedColumn)
      })
        .then((response) => response.json())
        .then((data) => {
          const newColumns = state.columns.map((col) => {
            if (col.id !== id) return col;
            return data;
          });
          dispatch({ type: "UPDATE_COLUMN", payload: newColumns });
        });
    }
  }

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Column") {
      dispatch({
        type: "SET_ACTIVE_COLUMN",
        payload: event.active.data.current.column
      });
      return;
    }
    if (event.active.data.current?.type === "Task") {
      dispatch({
        type: "SET_ACTIVE_TASK",
        payload: event.active.data.current.task
      });
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    dispatch({ type: "SET_ACTIVE_COLUMN", payload: null });
    dispatch({ type: "SET_ACTIVE_TASK", payload: null });

    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    if (
      active.data.current?.type === "Column" &&
      over.data.current?.type === "Column"
    ) {
      const activeColumnIndex = state.columns.findIndex(
        (col) => col.id === activeId
      );
      const overColumnIndex = state.columns.findIndex(
        (col) => col.id === overId
      );

      const reorderedColumns = arrayMove(
        state.columns,
        activeColumnIndex,
        overColumnIndex
      );
      updateColumnsInDb(reorderedColumns);
      dispatch({ type: "SET_COLUMNS", payload: reorderedColumns });
    } else if (
      active.data.current?.type === "Task" &&
      over.data.current?.type === "Task"
    ) {
      const activeTaskIndex = state.tasks.findIndex(
        (task) => task.id === activeId
      );
      const overTaskIndex = state.tasks.findIndex((task) => task.id === overId);

      if (
        state.tasks[activeTaskIndex].columnId !==
        state.tasks[overTaskIndex].columnId
      ) {
        state.tasks[activeTaskIndex].columnId =
          state.tasks[overTaskIndex].columnId;
      }

      const reorderedTasks = arrayMove(
        state.tasks,
        activeTaskIndex,
        overTaskIndex
      );
      updateTasksInDb(reorderedTasks);
      dispatch({ type: "SET_TASKS", payload: reorderedTasks });
    }
  }

  function updateColumnsInDb(reorderedColumns: Column[]) {
    reorderedColumns.forEach((column, index) => {
      fetch(`http://localhost:3001/columns/${column.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ...column, position: index })
      });
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
      const activeIndex = state.tasks.findIndex((t) => t.id === activeId);
      const overIndex = state.tasks.findIndex((t) => t.id === overId);

      let reorderedTasks;

      if (
        state.tasks[activeIndex].columnId !== state.tasks[overIndex].columnId
      ) {
        state.tasks[activeIndex].columnId = state.tasks[overIndex].columnId;
        reorderedTasks = arrayMove(state.tasks, activeIndex, overIndex - 1);
      } else {
        reorderedTasks = arrayMove(state.tasks, activeIndex, overIndex);
      }
      updateTasksInDb(reorderedTasks);
      dispatch({ type: "SET_TASKS", payload: reorderedTasks });
    }

    const isOverAColumn = over.data.current?.type === "Column";

    if (isActiveATask && isOverAColumn) {
      const updatedTasks = [...state.tasks];
      const activeTask = updatedTasks.find((t) => t.id === activeId);
      if (activeTask) {
        activeTask.columnId = overId;
      }
      updateTasksInDb(updatedTasks);
      dispatch({ type: "SET_TASKS", payload: updatedTasks });
    }
  }

  function updateTasksInDb(reorderedTasks: Task[]) {
    reorderedTasks.forEach((task, index) => {
      fetch(`http://localhost:3001/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ...task, position: index })
      });
    });
  }
}

export default WorkBoard;
