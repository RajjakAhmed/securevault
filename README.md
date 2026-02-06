<h1 align="center">SecureVault Backend</h1>

<p align="center">
  Production-ready encrypted file storage backend built with Node.js, TypeScript, Prisma, PostgreSQL, and Supabase Storage.
</p>

<hr/>

<h2>Overview</h2>

<p>
  <b>SecureVault</b> is a security-focused backend system that allows users to upload, encrypt, store, and securely download files.
  Files are never stored in plaintext, and access is strictly controlled using JWT authentication.
</p>

<hr/>

<h2>Live API</h2>

<p>
  <b>Render Deployment:</b><br/>
  <a href="https://securevault-8fe3.onrender.com">
    https://securevault-8fe3.onrender.com
  </a>
</p>

<p>
  <b>Test Root Endpoint:</b>
</p>

<pre>
GET /
SecureVault API running 🚀
</pre>

<hr/>

<h2>Core Features</h2>

<ul>
  <li><b>Authentication System</b> (Register/Login with JWT)</li>
  <li><b>AES File Encryption</b> before cloud storage</li>
  <li><b>Supabase Storage Integration</b> for encrypted file persistence</li>
  <li><b>PostgreSQL Metadata Storage</b> via Prisma ORM</li>
  <li><b>Owner-Based Access Control</b> (users can only access their own files)</li>
  <li><b>Secure Download + Temporary Decryption</b></li>
</ul>

<hr/>

<h2>Tech Stack</h2>

<table>
  <tr>
    <th>Technology</th>
    <th>Purpose</th>
  </tr>
  <tr>
    <td>Node.js</td>
    <td>Backend runtime</td>
  </tr>
  <tr>
    <td>Express.js</td>
    <td>REST API framework</td>
  </tr>
  <tr>
    <td>TypeScript</td>
    <td>Type-safe backend development</td>
  </tr>
  <tr>
    <td>Prisma ORM</td>
    <td>Database interaction</td>
  </tr>
  <tr>
    <td>PostgreSQL (Supabase)</td>
    <td>Relational database</td>
  </tr>
  <tr>
    <td>Supabase Storage</td>
    <td>Encrypted cloud file storage</td>
  </tr>
  <tr>
    <td>AES Encryption</td>
    <td>File security layer</td>
  </tr>
  <tr>
    <td>JWT Authentication</td>
    <td>Route protection and access control</td>
  </tr>
  <tr>
    <td>Render</td>
    <td>Deployment platform</td>
  </tr>
</table>

<hr/>

<h2>Project Structure</h2>

<pre>
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
 ┗ index.ts

prisma/
 ┣ schema.prisma
 ┗ migrations/
</pre>

<hr/>

<h2>API Endpoints</h2>

<h3>Auth Routes</h3>

<table>
  <tr>
    <th>Method</th>
    <th>Endpoint</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>POST</td>
    <td>/api/auth/register</td>
    <td>Register new user</td>
  </tr>
  <tr>
    <td>POST</td>
    <td>/api/auth/login</td>
    <td>Login and return JWT token</td>
  </tr>
</table>

<br/>

<h3>File Routes (Protected)</h3>

<table>
  <tr>
    <th>Method</th>
    <th>Endpoint</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>POST</td>
    <td>/api/files/upload</td>
    <td>Upload + Encrypt file</td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/api/files/myfiles</td>
    <td>List user files</td>
  </tr>
  <tr>
    <td>GET</td>
    <td>/api/files/download/:id</td>
    <td>Download + Decrypt file</td>
  </tr>
  <tr>
    <td>DELETE</td>
    <td>/api/files/delete/:id</td>
    <td>Delete file permanently</td>
  </tr>
</table>

<hr/>

<h2>Encryption Workflow</h2>

<h3>Upload Flow</h3>

<pre>
User Uploads File
      ↓
Multer Temporary Storage
      ↓
AES Encryption Applied
      ↓
Encrypted File Uploaded to Supabase Storage
      ↓
Metadata Saved in PostgreSQL
      ↓
Temporary Files Removed
</pre>

<h3>Download Flow</h3>

<pre>
User Requests Download
      ↓
Encrypted File Fetched from Supabase
      ↓
Decrypted Temporarily on Server
      ↓
Sent Securely to Client
      ↓
Temporary Decrypted File Removed
</pre>

<hr/>

<h2>Environment Variables</h2>

<pre>
DATABASE_URL=your_supabase_postgres_url
JWT_SECRET=your_secret_key
FILE_ENCRYPTION_KEY=32_char_secure_key
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
</pre>

<hr/>

<h2>Run Locally</h2>

<pre>
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
</pre>

<p>
Backend runs at:
</p>

<pre>
http://localhost:5000
</pre>

<hr/>

<h2>Future Enhancements</h2>

<ul>
  <li>QR-based secure file sharing</li>
  <li>Public/Private vault mode</li>
  <li>File expiry system</li>
  <li>VirusTotal malware scan integration</li>
  <li>Download audit logs and security reports</li>
  <li>Admin dashboard</li>
</ul>

<hr/>

<h2>Author</h2>

<p>
  <b>Rajjak Ahmed</b><br/>
  Computer Science Engineer<br/>
  Focused on building secure backend and full-stack systems<br/><br/>

  GitHub:
  <a href="https://github.com/RajjakAhmed">
    https://github.com/RajjakAhmed
  </a>
</p>

<hr/>

<h2>Support</h2>

<p>
  If you found this project useful, consider giving it a star on GitHub.
</p>
