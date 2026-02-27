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
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateContactToSecondary = exports.createPrimaryContact = exports.findContacts = void 0;
const pg_1 = require("pg");
const pool = new pg_1.Pool();
const findContacts = (email, phoneNumber) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
        SELECT * FROM Contact
        WHERE (email = $1 OR phoneNumber = $2) AND deletedAt IS NULL
    `;
    const { rows } = yield pool.query(query, [email, phoneNumber]);
    return rows;
});
exports.findContacts = findContacts;
const createPrimaryContact = (email, phoneNumber) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
        INSERT INTO Contact (email, phoneNumber, linkPrecedence)
        VALUES ($1, $2, 'primary')
        RETURNING *;
    `;
    const { rows } = yield pool.query(query, [email, phoneNumber]);
    return rows[0];
});
exports.createPrimaryContact = createPrimaryContact;
const updateContactToSecondary = (contactId, primaryContactId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
        UPDATE Contact
        SET linkedId = $1, linkPrecedence = 'secondary'
        WHERE id = $2
    `;
    yield pool.query(query, [primaryContactId, contactId]);
});
exports.updateContactToSecondary = updateContactToSecondary;
