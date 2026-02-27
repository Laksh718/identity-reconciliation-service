import { Pool } from 'pg';

const pool = new Pool();

export const findContacts = async (email: string | null, phoneNumber: string | null) => {
    const query = `
        SELECT * FROM Contact
        WHERE (email = $1 OR phoneNumber = $2) AND deletedAt IS NULL
    `;
    const { rows } = await pool.query(query, [email, phoneNumber]);
    return rows;
};

export const createPrimaryContact = async (email: string | null, phoneNumber: string | null) => {
    const query = `
        INSERT INTO Contact (email, phoneNumber, linkPrecedence)
        VALUES ($1, $2, 'primary')
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [email, phoneNumber]);
    return rows[0];
};

export const updateContactToSecondary = async (contactId: number, primaryContactId: number) => {
    const query = `
        UPDATE Contact
        SET linkedId = $1, linkPrecedence = 'secondary'
        WHERE id = $2
    `;
    await pool.query(query, [primaryContactId, contactId]);
};