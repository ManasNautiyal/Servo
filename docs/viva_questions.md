# Servo: 25 CSE Viva Questions & Answers

This guide contains the top 25 technical questions and answers commonly asked during engineering final-year project examinations for a web application stack like **Servo** (FastAPI, React, PostgreSQL, WebSockets, and Gemini AI).

---

### Phase 1: Architecture & Tech Stack

#### Q1: Why did you choose FastAPI over traditional frameworks like Django or Flask for the backend?
**Answer:** FastAPI is built on ASGI (Asynchronous Server Gateway Interface) rather than WSGI, making it inherently asynchronous. It offers performance on par with NodeJS and Go. Additionally, it provides automatic request validation via Pydantic and automatically generates OpenAPI/Swagger documentation, saving development time.

#### Q2: What is ASGI, and how does it differ from WSGI?
**Answer:** WSGI (Web Server Gateway Interface) is synchronous; it handles requests sequentially, blocking the thread until a database query or I/O task completes. ASGI (Asynchronous Server Gateway Interface) supports asynchronous code execution, enabling single-threaded concurrency to handle WebSockets, long polling, and concurrent API requests.

#### Q3: Why is React considered a Single Page Application (SPA)? How does routing work in it?
**Answer:** React is an SPA because the browser loads a single HTML file (index.html) and dynamically updates the DOM using JavaScript based on user interactions. We use `React Router` to intercept browser URL transitions and load the correct page components dynamically without reloading the page.

#### Q4: Why did you use PostgreSQL over MongoDB (NoSQL) for the database?
**Answer:** Servo is a service marketplace involving transactional relationships: Users create Services, place Orders, write Reviews, and send Messages. These entities have rigid relations, requiring constraints (foreign keys, cascading deletions) and ACID compliance to guarantee data consistency. Relational databases like PostgreSQL are better suited for this than document-based NoSQL stores.

#### Q5: How do you serve media files like student resumes and profile pictures in production?
**Answer:** In production, we upload files to **Supabase Storage** (which utilizes Amazon S3 internally) using REST API calls. Supabase generates public CDN URLs, which we store in the PostgreSQL database. For local development fallbacks, files are saved on the disk in `/static/uploads` and served using FastAPI's static files mount.

---

### Phase 2: Security & Session Management

#### Q6: How does JWT Authentication work? Why is it stateless?
**Answer:** JWT (JSON Web Token) authentication is stateless because the server does not store active user sessions in memory or a database. Instead, upon login, the server generates a token containing signed user metadata (`user_id`, `role`, `exp`). The browser stores this token (e.g., in localStorage) and attaches it in the `Authorization: Bearer <token>` header of subsequent API requests. The server verifies the cryptographic signature on each request to identify the user.

#### Q7: What cryptographic algorithm did you use to sign the JWTs, and how do you protect against tampering?
**Answer:** We sign JWTs using the **HS256 (HMAC with SHA-256)** symmetric key algorithm. The signature is created by hashing the header and payload combined with a private server key (`JWT_SECRET`). If a user attempts to tamper with the payload (e.g., changing their user ID or role to admin), the signature verification fails.

#### Q8: Why do we hash passwords using `bcrypt` instead of storing them in plain text or using MD5/SHA-1?
**Answer:** Storing plain text passwords is a severe security risk in the event of a database leak. MD5 and SHA-1 are fast hashing algorithms that are highly vulnerable to rainbow table lookups and brute-force attacks. `bcrypt` incorporates a salt (random value) to prevent identical passwords from having identical hashes, and it uses a cost factor to slow down verification speed, making brute-force attacks computationally infeasible.

#### Q9: What is Cross-Origin Resource Sharing (CORS)? How did you configure it in FastAPI?
**Answer:** CORS is a security mechanism enforced by web browsers to restrict web pages from making requests to a domain different from the one that served the page. We configured it in FastAPI using `CORSMiddleware`, specifying allowed origins (like `http://localhost:5173`) and allowed headers/methods to ensure safe, cross-origin API calls.

#### Q10: How does your application protect against SQL Injection?
**Answer:** SQL Injection is prevented by using **SQLAlchemy ORM** for database queries. SQLAlchemy automatically sanitizes parameters and uses prepared statements (parameterized queries) internally rather than raw string concatenation. This ensures user input is treated as literal values, not executable SQL statements.

---

### Phase 3: Real-Time Chat & WebSockets

#### Q11: How do WebSockets work, and how do they differ from HTTP polling?
**Answer:** HTTP is a unidirectional protocol where the client must request data, and the server responds. In HTTP polling, the client must repeatedly ping the server to check for new messages. WebSockets establish a **bi-directional, persistent TCP connection** through a single handshake, allowing the server to push new messages to the client instantly.

#### Q12: How do you keep track of online users and dispatch messages in the WebSocket router?
**Answer:** We implement a `ConnectionManager` class that stores active WebSocket objects in a dictionary mapping `user_id` to a list of active `WebSocket` connections. When a message is sent, the server looks up the receiver's ID in this dictionary and writes the payload directly to the receiver's WebSocket session.

#### Q13: How are typing indicators and read receipts handled in real-time?
**Answer:** 
- **Typing Indicator:** When a user types in the input field, the frontend emits a JSON frame containing `{type: "typing", receiver_id: X, is_typing: true}`. The server receives this and broadcasts it to the recipient's active WebSocket connection.
- **Read Receipts:** When a user views an active chat thread, the frontend sends a `{type: "read_receipt", receiver_id: X, message_id: Y}` frame. The database marks the message as read, and the server broadcasts this state to the sender to update their checkmark check index.

#### Q14: What happens if a user disconnects abruptly from the WebSocket?
**Answer:** The server intercepts a `WebSocketDisconnect` exception, calls the connection manager's `disconnect` function to remove the dead WebSocket object from the active registry, and broadcasts `{type: "online_status", online: false}` to other clients to show them offline.

---

### Phase 4: Database Modeling & Normalization

#### Q15: Explain the database schema of your project. How is it normalized?
**Answer:** The schema consists of 7 normalized tables: `users`, `skills`, `services`, `orders`, `reviews`, `messages`, and `notifications`. It is normalized to **3NF (Third Normal Form)**:
- Every table has a primary key (1NF).
- No repeating groups or multi-valued columns (1NF).
- All non-key fields depend entirely on the primary key (2NF).
- No transitive dependencies exist; fields only depend on the primary key (3NF). (For example, review records link directly to user IDs and service IDs rather than redundant columns for names).

#### Q16: What is a Cascade Delete, and how did you configure it in SQLAlchemy?
**Answer:** Cascade delete is a database constraint where deleting a parent record automatically deletes all child records that reference it. We configured it on foreign keys using `ondelete="CASCADE"` and SQLAlchemy relationship `cascade="all, delete-orphan"`. For example, deleting a `User` automatically removes their corresponding listing services, skills, orders, and messages.

#### Q17: Why did you separate `users` and `skills` tables instead of storing skills as a list column in the `users` table?
**Answer:** In raw relational databases, storing multi-valued arrays violates 1NF (First Normal Form). Storing a comma-separated string makes query search, sorting, and indexing on individual skills highly inefficient. Creating a separate `skills` table with a foreign key references the user ID, matching normalized schemas.

---

### Phase 5: Gemini AI Integration

#### Q18: Which Gemini model did you use, and how do you authorize requests?
**Answer:** We use the **`gemini-1.5-flash`** model because it is fast, cost-effective (free tier), and has a large context window. We authorize requests by configuring the `google-generativeai` SDK with a `GEMINI_API_KEY` stored in our environment configuration.

#### Q19: How does the AI Service Description Generator work?
**Answer:** The user provides a short description of their services (e.g., "I teach Java"). The backend wraps this brief inside a predefined prompt instructing Gemini to act as a copywriter, highlighting benefits, structure, pricing, and formatting details in Markdown suitable for a college student marketplace.

#### Q20: How does your AI recommendation system recommend listings?
**Answer:** We query all available active listings from the database. We package the current student user's profile branch, skills, and bio along with a summarized index of available listings (IDs, categories, tags) into a prompt. We instruct Gemini to sort the listings by relevance and return a clean, parseable JSON list of service IDs. The backend reads this JSON array and renders recommended cards accordingly.

#### Q21: What is "few-shot prompting" or "JSON enforcement" in Generative AI? How did you use it?
**Answer:** Few-shot prompting provides examples of the expected input and output structure inside the prompt. We used JSON enforcement by instructing Gemini to respond "STRICTLY in JSON format with exactly three keys: 'skills', 'technologies', and 'domains'". This allows the backend to reliably parse the model output using `json.loads()` without syntax crashes.

---

### Phase 6: Deployment & Scalability

#### Q22: What is the benefit of Dockerizing this web application?
**Answer:** Docker packages the application code, runtime libraries, dependencies, and environment configurations into immutable containers. This ensures the application runs identically on any environment (local, staging, production), resolving the "it works on my machine" problem.

#### Q23: How would you deploy this project in a real-world environment?
**Answer:** 
- **Database:** Deploy PostgreSQL on Supabase or AWS RDS.
- **Backend API:** Deploy the FastAPI Docker container to Render, Railway, or AWS ECS.
- **Frontend SPA:** Deploy the static React bundle to Vercel or Netlify for global distribution via CDN.

#### Q24: How would you scale the WebSocket chat module to handle thousands of concurrent students?
**Answer:** In memory, our WebSocket connection manager is limited to a single server instance. To scale, we would introduce a **Pub/Sub Broker (like Redis)**. When a message is received, the API server publishes it to Redis. All running instances read from Redis, allowing messages to be sent to users connected to different server instances. We would also run FastAPI behind a load balancer (like Nginx) supporting WebSocket upgrades.

#### Q25: How do you handle database migrations if you decide to add columns to the `users` table?
**Answer:** In a professional setup, we would use **Alembic** (the migration tool for SQLAlchemy). Alembic tracks changes to the python model declarations and auto-generates SQL migration scripts (like `upgrade` and `downgrade`), applying database schema edits incrementally without losing existing database records.
