// client/src/pages/Workspace.js
import React, { useEffect, useState } from "react";
import {
  fetchUserDocs,
  createDocument,
  updateDocument,
  deleteDocument,
} from "../api";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../styles/Workspace.css";

// Helper function to extract text from Quill delta
const getTextFromDelta = (content) => {
  if (!content) return "";

  if (typeof content === "string") {
    return content;
  }

  if (content.ops && Array.isArray(content.ops)) {
    return content.ops
      .filter((op) => op.insert && typeof op.insert === "string")
      .map((op) => op.insert)
      .join("")
      .substring(0, 100);
  }

  if (typeof content === "object") {
    return JSON.stringify(content).substring(0, 100);
  }

  return "";
};

export default function Workspace() {
  const [open, setOpen] = useState(true);
  const nav = useNavigate();
  const stored = JSON.parse(localStorage.getItem("user") || "null");
  const userId = stored?.uid;

  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [editingDocId, setEditingDocId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  // Normalize document object
  const normalizeDoc = (doc) => ({
    _id: doc._id,
    title: doc.title || "Untitled Document",
    content: doc.content || doc.data || { ops: [] },
    data: doc.data || doc.content || { ops: [] },
    pages: doc.pages || [{ id: 1, content: { ops: [] } }],
    pageConfig: doc.pageConfig || { name: "A4", width: 210, height: 297 },
    owner: doc.owner || userId || "anonymous",
    createdAt: doc.createdAt || new Date().toISOString(),
    updatedAt: doc.updatedAt || new Date().toISOString(),
  });

  useEffect(() => {
    if (!userId) {
      nav("/login");
      return;
    }
    loadDocs();
  }, [userId]);

  async function loadDocs() {
    try {
      setLoading(true);
      const res = await fetchUserDocs(userId);

      if (res?.data?.ok) {
        const docsArray = Array.isArray(res.data.docs) ? res.data.docs : [];
        setDocs(docsArray.map(normalizeDoc));
      } else {
        setDocs([]);
      }
    } catch (err) {
      console.error("❌ Error fetching docs:", err);
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }

  // ✅ Save recent activity to history
  function addToHistory(doc) {
    const normalizedDoc = normalizeDoc(doc);

    setHistory((prevHistory) => {
      const updated = [
        normalizedDoc,
        ...prevHistory.filter((h) => h._id !== normalizedDoc._id),
      ].slice(0, 5);

      localStorage.setItem("docHistory", JSON.stringify(updated));
      return updated;
    });
  }

  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem("docHistory") || "[]");
    setHistory(Array.isArray(storedHistory) ? storedHistory.map(normalizeDoc) : []);
  }, []);

  // ✅ FIXED CREATE DOCUMENT
  async function handleNew() {
    if (creating) return;
    setCreating(true);

    try {
      console.log("📝 Creating new document for user:", userId);

      const res = await createDocument(userId, "Untitled Document");
      console.log("✅ Create document response:", res?.data);

      if (res?.data?.ok && res?.data?.doc) {
        const newDoc = normalizeDoc(res.data.doc);

        // ✅ Immediately show in UI without refresh
        setDocs((prev) => {
          const safePrev = Array.isArray(prev) ? prev : [];

          // prevent duplicate
          const alreadyExists = safePrev.some((doc) => doc._id === newDoc._id);
          if (alreadyExists) return safePrev;

          return [newDoc, ...safePrev];
        });

        // ✅ Add to recent history
        addToHistory(newDoc);

        // ✅ Navigate directly
        setTimeout(() => {
          nav(`/documents/${newDoc._id}`);
        }, 300);
      } else {
        console.error("⚠️ Invalid create response:", res?.data);
        alert("⚠️ Could not create document. Invalid server response.");
      }
    } catch (err) {
      console.error("❌ Error creating document:", err);

      if (err.response) {
        console.error("📛 Backend create error:", err.response.data);
        // alert(`Create failed: ${err.response.data?.error || "Unknown server error"}`);
      } else {
        alert("Failed to create document. Please check backend connection.");
      }
    } finally {
      setCreating(false);
    }
  }

  // ✏️ Start editing document title
  const startEditingTitle = (docId, currentTitle) => {
    setEditingDocId(docId);
    setEditingTitle(currentTitle);
  };

  // 💾 Save document title
  const saveDocumentTitle = async (docId) => {
    if (!editingTitle.trim()) {
      setEditingDocId(null);
      return;
    }

    try {
      await updateDocument(docId, { title: editingTitle.trim() });

      setDocs((prev) =>
        prev.map((doc) =>
          doc._id === docId ? { ...doc, title: editingTitle.trim() } : doc
        )
      );

      setHistory((prev) => {
        const updated = prev.map((doc) =>
          doc._id === docId ? { ...doc, title: editingTitle.trim() } : doc
        );
        localStorage.setItem("docHistory", JSON.stringify(updated));
        return updated;
      });

      setEditingDocId(null);
      setEditingTitle("");
    } catch (err) {
      console.error("❌ Error updating document title:", err);
      alert("Failed to update document title. Please try again.");
    }
  };

  // ❌ Cancel editing
  const cancelEditing = () => {
    setEditingDocId(null);
    setEditingTitle("");
  };

  // 🔍 Filter documents based on search
  const filteredDocs = docs.filter((doc) =>
    (doc.title || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 📊 Sort documents
  const sortedDocs = [...filteredDocs].sort((a, b) => {
    switch (sortBy) {
      case "title":
        return (a.title || "").localeCompare(b.title || "");
      case "createdAt":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "updatedAt":
      default:
        return new Date(b.updatedAt) - new Date(a.updatedAt);
    }
  });

  // 🎯 Toggle document selection
  const toggleDocSelection = (docId) => {
    setSelectedDocs((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId]
    );
  };

  // 📤 Bulk actions
  const handleBulkAction = (action) => {
    if (selectedDocs.length === 0) return;

    switch (action) {
      case "share":
        const shareLinks = selectedDocs
          .map((id) => `${window.location.origin}/documents/${id}`)
          .join("\n");
        navigator.clipboard.writeText(shareLinks);
        alert(`Share links for ${selectedDocs.length} documents copied!`);
        break;

      case "download":
        alert(`Preparing to download ${selectedDocs.length} documents...`);
        break;

      default:
        break;
    }

    setSelectedDocs([]);
  };

  // 🗑️ Delete document
  const handleDeleteDocument = async (docId, docTitle) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${docTitle}"?`
    );

    if (!confirmDelete) return;

    try {
      await deleteDocument(docId);

      setDocs((prev) => prev.filter((doc) => doc._id !== docId));

      const updatedHistory = history.filter((doc) => doc._id !== docId);
      setHistory(updatedHistory);
      localStorage.setItem("docHistory", JSON.stringify(updatedHistory));

      setSelectedDocs((prev) => prev.filter((id) => id !== docId));

      alert("✅ Document deleted successfully!");
    } catch (err) {
      console.error("❌ Error deleting document:", err);
      alert("Failed to delete document.");
    }
  };

  // Handle key events for title editing
  const handleTitleKeyPress = (e, docId) => {
    if (e.key === "Enter") {
      saveDocumentTitle(docId);
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  };

  return (
    <div
      className={`workspace-container ${
        open ? "sidebar-open" : "sidebar-closed"
      }`}
    >
      <Sidebar open={open} setOpen={setOpen} />

      <div className="workspace-main fade-in">
        <header className="workspace-header">
          <div className="header-content">
            <div className="header-text">
              <h2 className="workspace-title gradient-text">Your Workspace</h2>
              <p className="workspace-subtitle">
                {docs.length} document{docs.length !== 1 ? "s" : ""} •{" "}
                {history.length} recent
              </p>
            </div>
            <button
              className={`new-doc-btn ${creating ? "disabled" : ""}`}
              onClick={handleNew}
              disabled={creating}
            >
              <span className="btn-icon">+</span>
              {creating ? "Creating..." : "New Document"}
            </button>
          </div>

          {/* 🔍 Search and Controls */}
          <div className="workspace-controls">
            <div className="search-container">
              <input
                type="text"
                placeholder="🔍 Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button
                  className="clear-search"
                  onClick={() => setSearchTerm("")}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="controls-right">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="updatedAt">Last Modified</option>
                <option value="createdAt">Date Created</option>
                <option value="title">Title A-Z</option>
              </select>

              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                  onClick={() => setViewMode("grid")}
                  title="Grid View"
                >
                  ⏹️
                </button>
                <button
                  className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                  onClick={() => setViewMode("list")}
                  title="List View"
                >
                  ☰
                </button>
              </div>
            </div>
          </div>

          {/* 🎯 Bulk Actions Bar */}
          {selectedDocs.length > 0 && (
            <div className="bulk-actions-bar">
              <span className="selection-count">
                {selectedDocs.length} document
                {selectedDocs.length !== 1 ? "s" : ""} selected
              </span>
              <div className="bulk-actions">
                <button
                  className="bulk-btn"
                  onClick={() => handleBulkAction("share")}
                >
                  📤 Share All
                </button>
                <button
                  className="bulk-btn"
                  onClick={() => handleBulkAction("download")}
                >
                  💾 Export All
                </button>
                <button
                  className="bulk-btn danger"
                  onClick={() => setSelectedDocs([])}
                >
                  ✕ Clear
                </button>
              </div>
            </div>
          )}
        </header>

        {/* 🕘 Document History */}
        {history.length > 0 && (
          <div className="history-section slide-in">
            <div className="section-header">
              <h3>📚 Recently Opened</h3>
              <button
                className="clear-history"
                onClick={() => {
                  setHistory([]);
                  localStorage.removeItem("docHistory");
                }}
              >
                Clear History
              </button>
            </div>
            <div className="history-list">
              {history.map((doc) => (
                <div
                  key={doc._id}
                  className="history-item"
                  onClick={(e) => {
                    if (
                      e.target.closest(".edit-title-btn") ||
                      editingDocId === doc._id
                    ) {
                      return;
                    }
                    addToHistory(doc);
                    nav(`/documents/${doc._id}`);
                  }}
                >
                  <div className="history-icon">📄</div>
                  <div className="history-content">
                    {editingDocId === doc._id ? (
                      <div className="title-edit-container">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => handleTitleKeyPress(e, doc._id)}
                          onBlur={() => saveDocumentTitle(doc._id)}
                          className="title-edit-input"
                          autoFocus
                          maxLength={100}
                        />
                        <div className="edit-actions">
                          <button
                            className="save-title-btn"
                            onClick={() => saveDocumentTitle(doc._id)}
                            title="Save"
                          >
                            ✓
                          </button>
                          <button
                            className="cancel-title-btn"
                            onClick={cancelEditing}
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="title-display">
                        <p className="history-title" title="Click to edit">
                          {doc.title}
                        </p>
                        <button
                          className="edit-title-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditingTitle(doc._id, doc.title);
                          }}
                          title="Edit document title"
                        >
                          ✏️
                        </button>
                      </div>
                    )}
                    <small className="history-date">
                      Last opened: {new Date(doc.updatedAt).toLocaleString()}
                    </small>
                  </div>
                  <div className="history-arrow">→</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 📄 Documents Grid/List */}
        <div className="docs-container">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading your documents...</p>
            </div>
          ) : sortedDocs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📄</div>
              <h3>No documents found</h3>
              <p>
                {searchTerm
                  ? `No documents match "${searchTerm}"`
                  : "No documents yet. Create your first document to get started!"}
              </p>
              {!searchTerm && (
                <button className="create-first-btn" onClick={handleNew}>
                  Create Your First Document
                </button>
              )}
            </div>
          ) : (
            <div className={`docs-${viewMode}`}>
              {sortedDocs.map((doc) => (
                <div
                  key={doc._id}
                  className={`doc-card scale-in ${
                    selectedDocs.includes(doc._id) ? "selected" : ""
                  }`}
                  onClick={() => toggleDocSelection(doc._id)}
                >
                  <div className="card-header">
                    <div className="doc-icon">📄</div>
                    <div className="doc-info">
                      {editingDocId === doc._id ? (
                        <div className="title-edit-container">
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => handleTitleKeyPress(e, doc._id)}
                            onBlur={() => saveDocumentTitle(doc._id)}
                            className="title-edit-input"
                            autoFocus
                            maxLength={100}
                          />
                          <div className="edit-actions">
                            <button
                              className="save-title-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                saveDocumentTitle(doc._id);
                              }}
                              title="Save"
                            >
                              ✓
                            </button>
                            <button
                              className="cancel-title-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                cancelEditing();
                              }}
                              title="Cancel"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="title-display">
                          <strong
                            className="doc-title"
                            title="Click to edit"
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              startEditingTitle(doc._id, doc.title);
                            }}
                          >
                            {doc.title}
                          </strong>
                          <button
                            className="edit-title-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditingTitle(doc._id, doc.title);
                            }}
                            title="Edit document title"
                          >
                            ✏️
                          </button>
                        </div>
                      )}
                      <div className="doc-dates">
                        <span>
                          Modified: {new Date(doc.updatedAt).toLocaleDateString()}
                        </span>
                        <span>
                          Created: {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {selectedDocs.includes(doc._id) && (
                      <div className="selection-indicator">✓</div>
                    )}
                  </div>

                  <div className="doc-preview">
                    {getTextFromDelta(doc.content) || "No content yet"}...
                  </div>

                  <div className="doc-buttons">
                    <button
                      className="open-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToHistory(doc);
                        nav(`/documents/${doc._id}`);
                      }}
                    >
                      Open
                    </button>

                    <button
                      className="share-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(
                          `${window.location.origin}/documents/${doc._id}`
                        );
                        alert("Share link copied to clipboard!");
                      }}
                    >
                      Share
                    </button>

                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDocument(doc._id, doc.title);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 📊 Quick Stats */}
        {docs.length > 0 && (
          <footer className="workspace-footer">
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">{docs.length}</span>
                <span className="stat-label">Total Documents</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{history.length}</span>
                <span className="stat-label">Recently Opened</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {new Date().toLocaleDateString()}
                </span>
                <span className="stat-label">Last Active</span>
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}