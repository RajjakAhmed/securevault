# SecureVault Backend (Node.js + TypeScript + Prisma)

SecureVault is a production-style encrypted file storage backend that provides secure file upload, encryption, cloud storage, and controlled access using modern backend technologies.

It is designed as a real-world security-focused project with encryption, authentication, and cloud persistence.

---

## Live Backend API

**Render Deployment**

https://securevault-8fe3.onrender.com

**Test Root Endpoint**

```bash
GET /
Response:

text
Copy code
SecureVault API running 🚀
Core Features
Authentication System
Secure user registration and login

Password hashing using bcrypt

JWT token-based authentication

Protected routes for authorized users only

Secure File Vault
Upload any file securely

Files are encrypted before storage

Encrypted files stored in Supabase Storage

Metadata stored in PostgreSQL database

Encryption & Decryption Workflow
Files are never stored in plaintext

Download decrypts files temporarily on server

Temporary encrypted/decrypted files are auto-cleaned

Cloud Storage Support
Supabase Storage used instead of local disk

Works across devices (browser, mobile, cloud)

Access Control
Only the file owner can:

View uploaded files

Download decrypted files

Delete files permanently

Tech Stack
Technology	Purpose
Node.js	Backend runtime
Express.js	REST API framework
TypeScript	Type-safe development
Prisma ORM	Database interaction
PostgreSQL (Supabase)	Relational database
Supabase Storage	Encrypted file storage
Multer	File upload handling
AES Encryption	Secure file encryption
JWT Authentication	User authorization
Render	Deployment platform

Project Folder Structure
bash
Copy code
src/
 ┣ controllers/
 ┃ ┣ authcontrollers.ts
 ┃ ┗ filecontrollers.ts
 ┣ encryption/
 ┃ ┣ encrypt.ts
 ┃ ┗ decrypt.ts
 ┣ middleware/
 ┃ ┣ authMiddleware.ts
 ┃ ┗ uploadMiddleware.ts
 ┣ routes/
 ┃ ┣ authroutes.ts
 ┃ ┗ fileroutes.ts
 ┣ utils/
 ┃ ┣ prisma.ts
 ┃ ┣ supabase.ts
 ┃ ┣ storageUpload.ts
 ┃ ┗ storageDownload.ts
 ┣ uploads/ (local dev only)
 ┗ index.ts

prisma/
 ┣ schema.prisma
 ┗ migrations/
API Endpoints
Auth Routes
Method	Endpoint	Description
POST	/api/auth/register	Register new user
POST	/api/auth/login	Login user and return JWT

File Routes (Protected)
Method	Endpoint	Description
POST	/api/files/upload	Upload and encrypt file
GET	/api/files/myfiles	List user files
GET	/api/files/download/:id	Download and decrypt file
DELETE	/api/files/delete/:id	Delete file permanently

Testing with CURL
Register User
bash
Copy code
curl -X POST https://securevault-8fe3.onrender.com/api/auth/register \
-H "Content-Type: application/json" \
-d '{"name":"Rajjak","email":"rajjak@gmail.com","password":"123456"}'
Login User
bash
Copy code
curl -X POST https://securevault-8fe3.onrender.com/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"rajjak@gmail.com","password":"123456"}'
Response:

json
Copy code
{
  "token": "YOUR_JWT_TOKEN"
}
Upload File
bash
Copy code
curl -X POST https://securevault-8fe3.onrender.com/api/files/upload \
-H "Authorization: Bearer YOUR_TOKEN" \
-F "file=@/home/user/Desktop/test.pdf"
List My Files
bash
Copy code
curl -X GET https://securevault-8fe3.onrender.com/api/files/myfiles \
-H "Authorization: Bearer YOUR_TOKEN"
Download File
bash
Copy code
curl -L -X GET https://securevault-8fe3.onrender.com/api/files/download/FILE_ID \
-H "Authorization: Bearer YOUR_TOKEN" \
-o downloaded.pdf
Encryption Workflow
Upload Flow
text
Copy code
User uploads file
      ↓
Multer stores temporary upload
      ↓
AES encryption applied
      ↓
Encrypted file uploaded to Supabase Storage
      ↓
Metadata stored in PostgreSQL
      ↓
Temporary files removed
Download Flow
text
Copy code
User requests download
      ↓
Encrypted file fetched from Supabase
      ↓
Decrypted temporarily on server
      ↓
Sent to client securely
      ↓
Temporary decrypted file removed
Database Schema (Prisma)
prisma
Copy code
model User {
  id       String   @id @default(uuid())
  name     String
  email    String   @unique
  password String
  files    File[]
}

model File {
  id            String   @id @default(uuid())
  filename      String
  encryptedPath String
  ownerId       String
  uploadedAt    DateTime @default(now())

  owner User @relation(fields: [ownerId], references: [id])
}
Environment Variables
Create a .env file:

env
Copy code
DATABASE_URL=your_supabase_postgres_url

JWT_SECRET=your_secret_key

FILE_ENCRYPTION_KEY=32_char_secure_key

SUPABASE_URL=https://xxxx.supabase.co

SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
Run Locally
Install Dependencies
bash
Copy code
npm install
Generate Prisma Client
bash
Copy code
npx prisma generate
Run Migrations
bash
Copy code
npx prisma migrate dev
Start Server
bash
Copy code
npm run dev
Backend runs at:

text
Copy code
http://localhost:5000
Deployment (Render)
The backend is deployed on Render using:

bash
Copy code
npm install
npx prisma generate
npm run build
node dist/index.js
Supabase PostgreSQL and Storage provide cloud persistence.

Future Enhancements
QR-based secure file sharing links

Public/Private vault mode

File expiry system

VirusTotal malware scan integration

Download audit logs and security reports

Admin dashboard

Author
Rajjak Ahmed
Computer Science Engineer
Focused on building secure backend and full-stack systems

GitHub: https://github.com/RajjakAhmed

Support
If you found this project useful, consider giving it a star on GitHub.

yaml
Copy code

---

If you want, next I can do the **QR Share Feature README + Implementation plan** so your project becomes a standout security portfolio project.