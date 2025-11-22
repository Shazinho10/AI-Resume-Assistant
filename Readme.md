# **AI Resume Assistant**

A full-stack application that analyzes résumés and job descriptions using LLMs, embeddings, and FAISS vector search.
This project includes a **Node.js + Express + LangChain** backend and a **React** frontend client.

---

## 🚀 **Features**

* Upload PDF, DOCX, XLSX files for parsing
* Extract text using `pdf-parse`, `mammoth`, and `xlsx`
* Embed content using LangChain + OpenAI
* Vector search using **faiss-node**
* REST API with Swagger documentation
* React client for interacting with the AI assistant

---

## 📦 **Tech Stack**

### **Backend**

```
@langchain/classic
@langchain/community
@langchain/core
@langchain/openai
@langchain/textsplitters
cheerio
cors
dotenv
express
faiss-node
langchain
mammoth
multer
pdf-parse
pg
swagger-jsdoc
swagger-ui-express
xlsx
```

### **Frontend**

```
react 19
axios
lucide-react
react-markdown
remark-gfm
react-scripts
@testing-library/*
web-vitals
```

---

## 🛠️ **Prerequisites**

Before running the project, install:

* **Node.js (v18+)**
* **npm or yarn**
* **OpenAI API key**
  Create a `.env` file in the backend root:

```
OPENAI_API_KEY=your_api_key
```

---

## 📥 **Installation**

### 1️⃣ **Clone the repository**

```bash
git clone https://github.com/Shazinho10/AI-Resume-Assistant.git
```

---

### 2️⃣ **Install backend dependencies**

```bash
npm install
```

---

### 3️⃣ **Install frontend dependencies**

```bash
cd client
npm install
cd ..
```

---

## ▶️ **Running the Application**

### **Start the backend**

From the project root:

```bash
npx tsx server.ts
```

---

### **Start the frontend**

```bash
cd client
npm start
```

Frontend will start at:

```
http://localhost:3001
```

Backend typically runs on:

```
http://localhost:3000
```

(or whatever port is defined in your server.ts)

---

## 📚 **API Documentation**

Swagger UI is available at:

```
http://localhost:3000/api-docs
```

---
## 🏗️ Project Structure
```
ai_resume_assistant/
├── config/
│   └── database.ts
├── services/
│   ├── ingestionService.ts     # Document processing service
│   ├── ragChatService.ts        # RAG chat service
│   └── chatService.ts           # Chat service
├── uploads/                      # Uploaded files directory
├── client/                       # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUpload.js
│   │   │   ├── FileUpload.css
│   │   │   ├── ChatInterface.js
│   │   │   └── ChatInterface.css
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
├── server.ts                     # Express backend server
├── .env                          # Environment variables
├── package.json
└── tsconfig.json
```