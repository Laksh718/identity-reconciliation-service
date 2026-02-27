import express, { Request, Response } from 'express';
import { pool } from '../database/connection';

const router = express.Router();

router.post('/identify', async (req: Request, res: Response) => {
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
        const { rows } = await pool.query(query, [email, phoneNumber]);

        if (rows.length === 0) {
            // No matching contact, create a new primary contact
            const insertQuery = `
                INSERT INTO Contact (email, phoneNumber, linkPrecedence)
                VALUES ($1, $2, 'primary')
                RETURNING *;
            `;
            const { rows: newContact } = await pool.query(insertQuery, [email, phoneNumber]);

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
        const primaryContact = rows.find((row: any) => row.linkPrecedence === 'primary') || rows[0];
        const secondaryContacts = rows.filter((row: any) => row.id !== primaryContact.id);

        // Consolidate data
        const emails = Array.from(new Set(rows.map((row: any) => row.email).filter(Boolean)));
        const phoneNumbers = Array.from(new Set(rows.map((row: any) => row.phoneNumber).filter(Boolean)));
        const secondaryContactIds = secondaryContacts.map((row: any) => row.id);

        // Ensure all secondary contacts are linked to the primary
        for (const contact of secondaryContacts) {
            if (contact.linkedId !== primaryContact.id) {
                await pool.query(
                    `UPDATE Contact SET linkedId = $1, linkPrecedence = 'secondary' WHERE id = $2`,
                    [primaryContact.id, contact.id]
                );
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
    } catch (error) {
        console.error('Error processing /identify request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;