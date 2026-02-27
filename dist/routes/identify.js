"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const connection_1 = require("../database/connection");
const router = express_1.default.Router();
router.post('/identify', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, phoneNumber } = req.body;
    if (!email && !phoneNumber) {
        return res.status(400).json({ error: 'Either email or phoneNumber must be provided.' });
    }
    try {
        // Query to find matching contacts
        const query = `
            SELECT * FROM Contact
            WHERE (email = $1 OR phoneNumber = $2) AND deletedAt IS NULL
        `;
        const { rows } = yield connection_1.pool.query(query, [email, phoneNumber]);
        if (rows.length === 0) {
            // No matching contact, create a new primary contact
            const insertQuery = `
                INSERT INTO Contact (email, phoneNumber, linkPrecedence)
                VALUES ($1, $2, 'primary')
                RETURNING *;
            `;
            const { rows: newContact } = yield connection_1.pool.query(insertQuery, [email, phoneNumber]);
            return res.status(200).json({
                contact: {
                    primaryContatctId: newContact[0].id,
                    emails: [newContact[0].email],
                    phoneNumbers: [newContact[0].phoneNumber],
                    secondaryContactIds: []
                }
            });
        }
        // Process existing contacts
        const primaryContact = rows.find((row) => row.linkPrecedence === 'primary') || rows[0];
        const secondaryContacts = rows.filter((row) => row.id !== primaryContact.id);
        // Consolidate data
        const emails = Array.from(new Set(rows.map((row) => row.email).filter(Boolean)));
        const phoneNumbers = Array.from(new Set(rows.map((row) => row.phoneNumber).filter(Boolean)));
        const secondaryContactIds = secondaryContacts.map((row) => row.id);
        // Ensure all secondary contacts are linked to the primary
        for (const contact of secondaryContacts) {
            if (contact.linkedId !== primaryContact.id) {
                yield connection_1.pool.query(`UPDATE Contact SET linkedId = $1, linkPrecedence = 'secondary' WHERE id = $2`, [primaryContact.id, contact.id]);
            }
        }
        return res.status(200).json({
            contact: {
                primaryContatctId: primaryContact.id,
                emails,
                phoneNumbers,
                secondaryContactIds
            }
        });
    }
    catch (error) {
        console.error('Error processing /identify request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
exports.default = router;
