//server.js
import express, { json } from "express";
import cors from "cors";
import { query } from "./db.js";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(json());

app.get("/tasks", async (res) => {
  try {
    const { rows } = await query("SELECT * FROM tasks ORDER BY position");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Internal Server Error" });
  }
});

app.post("/tasks", async (req, res) => {
  try {
    const { columnId, content, description, priority, difficulty, position } =
      req.body;
    const { rows } = await query(
      'INSERT INTO tasks ("columnId", content, description, priority, difficulty, position) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [columnId, content, description, priority, difficulty, position]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Internal Server Error" });
  }
});

app.put("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { columnId, content, description, priority, difficulty, position } =
      req.body;
    const { rows } = await query(
      'UPDATE tasks SET "columnId"=$1, content=$2, description=$3, priority=$4, difficulty=$5, position=$6 WHERE id=$7 RETURNING *',
      [columnId, content, description, priority, difficulty, position, id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Internal Server Error" });
  }
});

app.delete("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await query("DELETE FROM tasks WHERE id=$1 RETURNING *", [
      id,
    ]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Internal Server Error" });
  }
});

app.get("/columns", async (res) => {
  try {
    const { rows } = await query("SELECT * FROM columns ORDER BY position ASC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Internal Server Error" });
  }
});

app.post("/columns", async (req, res) => {
  try {
    const { title, position } = req.body;
    const { rows } = await query(
      "INSERT INTO columns (title, position) VALUES ($1, $2) RETURNING *",
      [title, position]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Internal Server Error" });
  }
});

app.put("/columns/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, position } = req.body;
    const { rows } = await query(
      "UPDATE columns SET title=$1, position=$2 WHERE id=$3 RETURNING *",
      [title, position, id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Internal Server Error" });
  }
});

app.delete("/columns/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await query(
      "DELETE FROM columns WHERE id=$1 RETURNING *",
      [id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
