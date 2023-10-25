//server.js
import express, { json } from 'express';
import cors from 'cors';
import { query } from './db.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(json());

app.get('/tasks', async (req, res) => {
    try {
        const { rows } = await query('SELECT * FROM tasks');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/tasks', async (req, res) => {
    try {
        const { column_id, content, description, priority, difficulty } = req.body;
        const { rows } = await query(
            'INSERT INTO tasks (column_id, content, description, priority, difficulty) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [column_id, content, description, priority, difficulty]
        );
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { column_id, content, description, priority, difficulty } = req.body;
        const { rows } = await query(
            'UPDATE tasks SET column_id=$1, content=$2, description=$3, priority=$4, difficulty=$5 WHERE id=$6 RETURNING *',
            [column_id, content, description, priority, difficulty, id]
        );
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await query('DELETE FROM tasks WHERE id=$1 RETURNING *', [id]);
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/columns', async (req, res) => {
    try {
        const { rows } = await query('SELECT * FROM columns');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/columns', async (req, res) => {
    try {
        const { title } = req.body;
        const { rows } = await query('INSERT INTO columns (title) VALUES ($1) RETURNING *', [title]);
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/columns/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title } = req.body;
        const { rows } = await query('UPDATE columns SET title=$1 WHERE id=$2 RETURNING *', [title, id]);
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/columns/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await query('DELETE FROM columns WHERE id=$1 RETURNING *', [id]);
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
