import express from 'express';
import identifyRouter from './routes/identify';
import { pool } from './database/connection';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', identifyRouter);

// Test database connection
pool.connect()
    .then(() => console.log('Connected to the database'))
    .catch((err: Error) => console.error('Database connection error:', err));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});