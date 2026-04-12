// client/src/api.js
import axios from "axios";

const BACKEND = process.env.REACT_APP_BACKEND_URL || "http://localhost:5002";

// ✅ Axios instance with base URL & timeout
const api = axios.create({
  baseURL: BACKEND,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// ✅ Interceptor for debugging network issues
api.interceptors.request.use(
  (config) => {
    console.log(
      `🟡 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
    );
    return config;
  },
  (err) => {
    console.error("⚠️ Request setup error:", err.message);
    return Promise.reject(err);
  }
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("🔴 Axios Error:", err.message);

    if (err.response) {
      console.error("📛 Response error:", err.response.status, err.response.data);
    } else if (err.request) {
      console.error("📡 Request sent but no response:", err.request);
    } else {
      console.error("⚠️ Request setup error:", err.message);
    }

    return Promise.reject(err);
  }
);

// ✅ Fetch all user documents
export async function fetchUserDocs(userId) {
  console.log("📚 Fetching docs for user:", userId);
  return api.get(`/api/user/${userId}/documents`);
}

// ✅ Fetch single document
export async function fetchDocument(docId) {
  console.log("📖 Fetching single document:", docId);
  return api.get(`/api/documents/${docId}`);
}

// ✅ Create a new document
export async function createDocument(owner, title = "Untitled Document") {
  console.log("📝 Creating doc for:", owner);
  return api.post(`/api/documents`, { owner, title });
}

// ✅ Delete a document
export async function deleteDocument(docId) {
  console.log("🗑️ Deleting document:", docId);
  return api.delete(`/api/documents/${docId}`);
}

// ✅ Update an existing document
export async function updateDocument(docId, updates) {
  console.log("✏️ Updating document:", docId, updates);
  return api.put(`/api/documents/${docId}`, updates);
}

// ✅ Upload a document to Google Drive
export async function uploadToDrive(formData) {
  console.log("☁️ Uploading to Google Drive...");
  return api.post(`/api/upload-to-drive`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

// ✅ Health check
export async function checkServerHealth() {
  return api.get(`/api/health`);
}

export const BACKEND_URL = BACKEND;
export default api;