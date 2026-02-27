"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const identify_1 = __importDefault(require("./routes/identify"));
const connection_1 = require("./database/connection");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use('/api', identify_1.default);
// Test database connection
connection_1.pool.connect()
    .then(() => console.log('Connected to the database'))
    .catch((err) => console.error('Database connection error:', err));
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
