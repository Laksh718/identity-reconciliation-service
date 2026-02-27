# Identity Reconciliation Service

## Overview
This project implements an Identity Reconciliation Service for managing customer identities across multiple purchases. It ensures that different orders with varying contact details (email or phone number) are linked to the same customer.

## Features
- **/identify Endpoint**: Consolidates customer contact information.
- **Database Schema**: Tracks primary and secondary contacts.
- **Node.js with TypeScript**: Backend implementation.

## API Endpoint
### POST /identify
**Request Body:**
```json
{
  "email": "string",
  "phoneNumber": "string"
}
```

**Response Body:**
```json
{
  "contact": {
    "primaryContatctId": number,
    "emails": ["string"],
    "phoneNumbers": ["string"],
    "secondaryContactIds": [number]
  }
}
```

## Setup Instructions
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the database:
   - Create a PostgreSQL database.
   - Run the schema file located at `src/database/schema.sql`.
4. Start the server:
   ```bash
   npm start
   ```

## Hosting
The service can be hosted on platforms like Render or Heroku. Update the `README` with the hosted endpoint once deployed.

## License
This project is open-source and available under the MIT License.