// client/src/pages/Editor.js
import React, { useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import { BACKEND_URL } from "../api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Sidebar from '../components/Sidebar';
import "../styles/Editor.css";

const SAVE_INTERVAL_MS = 2000;

// Enhanced MS Word Style Toolbar
const TOOLBAR_OPTIONS = [
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  [{ 'font': [] }, { 'size': [] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'script': 'sub' }, { 'script': 'super' }],
  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
  [{ 'indent': '-1' }, { 'indent': '+1' }],
  [{ 'align': [] }],
  ['blockquote', 'code-block'],
  ['link', 'image', 'video'],
  ['clean']
];

// Page configurations
const PAGE_CONFIGS = {
  A4: { 
    width: 210, 
    height: 297, 
    name: 'A4',
    cssWidth: '210mm',
    cssHeight: '297mm',
    margin: 20,
    maxLines: 45
  },
  Letter: { 
    width: 216, 
    height: 279, 
    name: 'Letter',
    cssWidth: '216mm',
    cssHeight: '279mm',
    margin: 20,
    maxLines: 40
  },
  A5: { 
    width: 148, 
    height: 210, 
    name: 'A5',
    cssWidth: '148mm',
    cssHeight: '210mm',
    margin: 15,
    maxLines: 30
  },
  Legal: { 
    width: 216, 
    height: 356, 
    name: 'Legal',
    cssWidth: '216mm',
    cssHeight: '356mm',
    margin: 20,
    maxLines: 55
  }
};

export default function Editor() {
  const [open, setOpen] = useState(true);
  const editorRef = useRef(null);
  const quillInstances = useRef({});
  const socketRef = useRef(null);
  const chatSocketRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatInputRef = useRef(null);
  const chatMessagesRef = useRef(null);
  
  const [shareLink, setShareLink] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [pageConfig, setPageConfig] = useState(PAGE_CONFIGS.A4);
  const [pages, setPages] = useState([{ id: 1, content: { ops: [] }, quill: null }]);
  const [currentPage, setCurrentPage] = useState(1);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [documentName, setDocumentName] = useState("Untitled Document");
  const [isEditingDocName, setIsEditingDocName] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  
  // Chat states
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);

  const documentId = window.location.pathname.split("/")[2];
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userName = user?.displayName || user?.email || "Anonymous";

  // Calculate total word and character count
  const calculateTotalCounts = () => {
    let totalWords = 0;
    let totalChars = 0;
    
    Object.values(quillInstances.current).forEach(quill => {
      if (quill) {
        const text = quill.getText();
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        totalWords += words;
        totalChars += text.length;
      }
    });
    
    setWordCount(totalWords);
    setCharCount(totalChars);
  };

  // Initialize Quill editor for a page
  const initializeQuill = (pageElement, pageId) => {
    const quill = new Quill(pageElement, {
      theme: "snow",
      modules: {
        toolbar: TOOLBAR_OPTIONS,
        history: {
          delay: 1000,
          maxStack: 500,
          userOnly: true,
        },
      },
    });

    // Store quill instance
    quillInstances.current[pageId] = quill;

    // Text change handler
    quill.on('text-change', () => {
      calculateTotalCounts();
      setSaveStatus("Saving...");
      
      // Check if we need to add new page due to overflow
      checkPageOverflow(pageId);
    });

    // Socket changes
    quill.on('text-change', (delta, oldDelta, source) => {
      if (source !== "user") return;
      
      if (socketRef.current) {
        socketRef.current.emit("send-changes", {
          pageId,
          delta
        });
      }
    });

    return quill;
  };

  // Check if page content overflows and add new page if needed
  const checkPageOverflow = (pageId) => {
    const quill = quillInstances.current[pageId];
    if (!quill) return;

    const text = quill.getText();
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    // If content exceeds max lines for this page size, move excess to new page
    if (lines.length > pageConfig.maxLines) {
      const currentPageLines = lines.slice(0, pageConfig.maxLines);
      const excessLines = lines.slice(pageConfig.maxLines);
      
      // Update current page content
      quill.setText(currentPageLines.join('\n'));
      
      // Add new page with excess content
      addNewPage(excessLines.join('\n'));
    }
  };

  // Emit page structure update to server
  const emitPageStructureUpdate = () => {
    if (socketRef.current) {
      // Prepare clean pages data for emission
      const cleanPages = pages.map(page => ({
        id: page.id,
        content: page.quill ? page.quill.getContents() : page.content
      }));
      
      socketRef.current.emit("page-structure-changed", {
        documentId,
        pages: cleanPages,
        pageConfig
      });
    }
  };

  // Add new page
  const addNewPage = (initialContent = '') => {
    const newPageId = pages.length + 1;
    const newPage = {
      id: newPageId,
      content: typeof initialContent === 'string' ? { ops: [{ insert: initialContent }] } : initialContent,
      quill: null
    };
    
    setPages(prev => [...prev, newPage]);

    // Create page element
    const editorContainer = document.querySelector('.editor-container-pages');
    if (editorContainer) {
      const newPageElement = createPageElement(newPageId);
      editorContainer.appendChild(newPageElement);
      
      // Initialize Quill for the new page
      setTimeout(() => {
        const contentElement = newPageElement.querySelector('.editor-content');
        if (contentElement) {
          const quill = initializeQuill(contentElement, newPageId);
          
          // Set initial content if provided
          if (initialContent) {
            if (typeof initialContent === 'string') {
              quill.setText(initialContent);
            } else {
              quill.setContents(initialContent);
            }
          }
          
          // Update pages state with quill instance
          setPages(prev => prev.map(page => 
            page.id === newPageId ? { ...page, quill } : page
          ));
        }
      }, 100);
    }

    // Emit page structure update after a short delay
    setTimeout(() => {
      emitPageStructureUpdate();
    }, 200);
    
    return newPageId;
  };

  // Create page element
  const createPageElement = (pageId) => {
    const pageDiv = document.createElement("div");
    pageDiv.className = `editor-page ${pageConfig.name}`;
    pageDiv.setAttribute('data-page-id', pageId);
    pageDiv.style.width = pageConfig.cssWidth;
    pageDiv.style.height = pageConfig.cssHeight;
    pageDiv.style.margin = '20px auto';
    pageDiv.style.background = 'white';
    pageDiv.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
    pageDiv.style.position = 'relative';
    
    const contentDiv = document.createElement("div");
    contentDiv.className = "editor-content";
    contentDiv.style.height = 'calc(100% - 40px)';
    contentDiv.style.padding = '20px';
    contentDiv.style.overflow = 'hidden';
    
    pageDiv.appendChild(contentDiv);
    
    return pageDiv;
  };

  // Safe array checking for pages data
  const getSafePagesArray = (pagesData) => {
    if (!pagesData) return [{ id: 1, content: { ops: [] } }];
    
    if (Array.isArray(pagesData)) {
      return pagesData.map((page, index) => ({
        id: page.id || index + 1,
        content: page.content || page.data || { ops: [] },
        quill: null
      }));
    }
    
    // If pagesData is an object but not array
    if (typeof pagesData === 'object' && pagesData !== null) {
      if (Array.isArray(pagesData.pages)) {
        return pagesData.pages.map((page, index) => ({
          id: page.id || index + 1,
          content: page.content || page.data || { ops: [] },
          quill: null
        }));
      }
    }
    
    return [{ id: 1, content: { ops: [] } }];
  };

  // Chat Functions
  const initializeChat = () => {
    if (chatSocketRef.current) return;

    const chatSocket = io(`${BACKEND_URL}/chat`);
    chatSocketRef.current = chatSocket;

    chatSocket.on("connect", () => {
      console.log("💬 Chat connected");
      // Join document chat room
      chatSocket.emit("join-document-chat", {
        documentId,
        userId: user?.uid || "anonymous",
        userName
      });
    });

    chatSocket.on("receive-chat-message", (message) => {
      setChatMessages(prev => [...prev, message]);
      // Auto scroll to bottom
      setTimeout(() => {
        if (chatMessagesRef.current) {
          chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
      }, 100);
    });

    chatSocket.on("user-joined-chat", (data) => {
      setChatMessages(prev => [...prev, data]);
    });

    chatSocket.on("user-left-chat", (data) => {
      setChatMessages(prev => [...prev, data]);
    });

    chatSocket.on("user-typing", (data) => {
      if (data.isTyping) {
        setTypingUsers(prev => {
          if (!prev.includes(data.userName)) {
            return [...prev, data.userName];
          }
          return prev;
        });
      } else {
        setTypingUsers(prev => prev.filter(user => user !== data.userName));
      }
    });

    chatSocket.on("disconnect", () => {
      console.log("💬 Chat disconnected");
    });
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !chatSocketRef.current) return;

    const messageData = {
      documentId,
      userId: user?.uid || "anonymous",
      userName,
      message: newMessage.trim(),
      timestamp: new Date()
    };

    chatSocketRef.current.emit("send-chat-message", messageData);
    setNewMessage("");
  };

  const handleTypingStart = () => {
    if (chatSocketRef.current) {
      chatSocketRef.current.emit("typing-start", {
        documentId,
        userName
      });
    }
  };

  const handleTypingStop = () => {
    if (chatSocketRef.current) {
      chatSocketRef.current.emit("typing-stop", {
        documentId,
        userName
      });
    }
  };

  const toggleChat = () => {
    setShowChat(!showChat);
    if (!showChat) {
      // Initialize chat when opening
      setTimeout(() => {
        initializeChat();
      }, 100);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Format time for chat messages
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  useEffect(() => {
    let saveInterval;

    const initializeEditor = () => {
      try {
        if (editorRef.current) {
          editorRef.current.innerHTML = "";
          const editorContainer = document.createElement("div");
          editorContainer.className = "editor-container-pages";
          editorRef.current.appendChild(editorContainer);

          // Initialize first page
          const firstPageElement = createPageElement(1);
          editorContainer.appendChild(firstPageElement);

          // Initialize socket connection
          const s = io(BACKEND_URL);
          socketRef.current = s;

          // Socket event handlers
          s.on("connect", () => {
            console.log("🟢 Connected to server");
            s.emit("get-document", {
              documentId,
              userId: user?.uid || "anonymous",
              userName: user?.displayName || user?.email || "Anonymous",
              userEmail: user?.email || "anonymous@example.com"
            });
          });

          s.on("load-document", (doc) => {
            console.log("📄 Document loaded:", doc);
            
            // Initialize Quill for first page
            setTimeout(() => {
              const contentElement = firstPageElement.querySelector('.editor-content');
              if (contentElement) {
                const quill = initializeQuill(contentElement, 1);
                
                // Handle document data with safe array checking
                const safePages = getSafePagesArray(doc.pages || doc.content);
                setPages(safePages);
                
                if (doc && doc.content) {
                  if (Array.isArray(doc.content)) {
                    // Multi-page document - load first page content
                    if (doc.content.length > 0 && doc.content[0].content) {
                      quill.setContents(doc.content[0].content || { ops: [] });
                    }
                  } else {
                    // Single page document
                    quill.setContents(doc.content || { ops: [] });
                  }
                } else {
                  quill.setContents(doc || { ops: [] });
                }
                
                setDocumentName(doc.title || doc.name || "Untitled Document");
                quill.enable();
                setIsLoading(false);
                calculateTotalCounts();
                
                // Update pages state with quill instance for first page
                setPages(prev => prev.map(page => 
                  page.id === 1 ? { ...page, quill } : page
                ));

                // Create additional pages if they exist
                if (safePages.length > 1) {
                  safePages.forEach((page, index) => {
                    if (index > 0) { // Skip first page (already created)
                      setTimeout(() => {
                        const newPageId = addNewPage(page.content);
                        // The new page will be initialized in addNewPage
                      }, index * 200);
                    }
                  });
                }
              }
            }, 100);
          });

          s.on("receive-changes", (data) => {
            const { pageId, delta } = data;
            const quill = quillInstances.current[pageId];
            if (quill) {
              quill.updateContents(delta);
            }
          });

          s.on("user-joined", (userData) => {
            setCollaborators(prev => {
              const exists = prev.find(u => u.id === userData.id);
              if (!exists) {
                return [...prev, userData];
              }
              return prev;
            });
          });

          s.on("user-left", (userId) => {
            setCollaborators(prev => prev.filter(u => u.id !== userId));
          });

          s.on("collaborators-update", (users) => {
            setCollaborators(users);
          });

          s.on("document-name-updated", (newName) => {
            setDocumentName(newName);
          });

          s.on("page-structure-updated", (data) => {
            console.log("📄 Page structure updated from server:", data);
            if (data && Array.isArray(data.pages)) {
              const safePages = data.pages.map((page, index) => ({
                id: page.id || index + 1,
                content: page.content || { ops: [] },
                quill: quillInstances.current[page.id || index + 1] || null
              }));
              setPages(safePages);
            }
            if (data.pageConfig) {
              setPageConfig(data.pageConfig);
            }
          });

          s.on("document-saved", (data) => {
            setSaveStatus("Saved");
            // Update page structure if provided
            if (data && Array.isArray(data.pages)) {
              const safePages = data.pages.map((page, index) => ({
                id: page.id || index + 1,
                content: page.content || { ops: [] },
                quill: quillInstances.current[page.id || index + 1] || null
              }));
              setPages(safePages);
            }
            if (data.pageConfig) {
              setPageConfig(data.pageConfig);
            }
          });

          // Auto-save
          saveInterval = setInterval(() => {
            if (s) {
              const allContent = Object.entries(quillInstances.current).map(([pageId, quill]) => ({
                pageId: parseInt(pageId),
                content: quill ? quill.getContents() : { ops: [] }
              }));
              
              s.emit("save-document", { 
                content: allContent, 
                name: documentName,
                pageConfig 
              });
            }
          }, SAVE_INTERVAL_MS);

          return () => {
            clearInterval(saveInterval);
            s.disconnect();
            if (chatSocketRef.current) {
              chatSocketRef.current.disconnect();
            }
          };
        }
      } catch (err) {
        console.error("Editor init error:", err);
        setIsLoading(false);
      }
    };

    const cleanup = initializeEditor();
    return cleanup;
  }, [documentId]);

  // 📄 Page Management
  const handlePageSizeChange = (e) => {
    const newSize = e.target.value;
    const newConfig = PAGE_CONFIGS[newSize];
    setPageConfig(newConfig);
    
    // Update all pages with new size
    const pageElements = document.querySelectorAll('.editor-page');
    pageElements.forEach(page => {
      page.className = `editor-page ${newSize}`;
      page.style.width = newConfig.cssWidth;
      page.style.height = newConfig.cssHeight;
    });
    
    // Recheck page overflow for all pages
    Object.keys(quillInstances.current).forEach(pageId => {
      checkPageOverflow(parseInt(pageId));
    });

    // Emit page structure update
    emitPageStructureUpdate();
  };

  // 📤 Export Functions
  const exportAsPDF = async () => {
    try {
      setSaveStatus("Exporting PDF...");
      
      const pdf = new jsPDF({
        orientation: pageConfig.height > pageConfig.width ? 'portrait' : 'landscape',
        unit: 'mm',
        format: [pageConfig.width, pageConfig.height]
      });

      const pageCount = Object.keys(quillInstances.current).length;

      for (let i = 0; i < pageCount; i++) {
        const pageId = i + 1;
        const quill = quillInstances.current[pageId];
        
        if (quill) {
          if (i > 0) {
            pdf.addPage();
          }

          // Get clean HTML content without editor UI
          const content = quill.root.innerHTML;
          
          // Create a temporary div for clean export
          const tempDiv = document.createElement('div');
          tempDiv.style.width = pageConfig.cssWidth;
          tempDiv.style.padding = '20mm';
          tempDiv.style.fontFamily = 'Arial, sans-serif';
          tempDiv.style.fontSize = '12pt';
          tempDiv.style.lineHeight = '1.6';
          tempDiv.innerHTML = content;
          
          document.body.appendChild(tempDiv);

          const canvas = await html2canvas(tempDiv, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
          });

          document.body.removeChild(tempDiv);

          const imgData = canvas.toDataURL('image/png');
          pdf.addImage(imgData, 'PNG', 0, 0, pageConfig.width, pageConfig.height);
        }
      }

      pdf.save(`${documentName}.pdf`);
      setSaveStatus("Saved");
    } catch (error) {
      console.error("PDF export error:", error);
      setSaveStatus("Export failed");
      alert("PDF export failed. Please try again.");
    }
  };

  const exportAsDOC = () => {
    try {
      setSaveStatus("Exporting DOC...");
      
      let htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${documentName}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12pt;
            line-height: 1.6;
            margin: 20mm;
            max-width: ${pageConfig.cssWidth};
        }
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    <h1>${documentName}</h1>
`;

      Object.entries(quillInstances.current).forEach(([pageId, quill], index) => {
        if (quill) {
          const content = quill.root.innerHTML;
          htmlContent += `<div class="content-page">${content}</div>`;
          
          if (index < Object.keys(quillInstances.current).length - 1) {
            htmlContent += '<div class="page-break"></div>';
          }
        }
      });

      htmlContent += '</body></html>';

      // Create and download the file
      const blob = new Blob([htmlContent], { 
        type: 'application/msword' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentName}.doc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setSaveStatus("Saved");
    } catch (error) {
      console.error("DOC export error:", error);
      setSaveStatus("Export failed");
      alert("DOC export failed. Please try again.");
    }
  };

  const exportAsTXT = () => {
    let fullText = `${documentName}\n${'='.repeat(documentName.length)}\n\n`;
    
    Object.values(quillInstances.current).forEach((quill, index) => {
      if (quill) {
        const text = quill.getText();
        if (text.trim()) {
          fullText += text + '\n\n';
        }
      }
    });

    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 👀 View Options
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handlePrint = () => {
    // Create a print-friendly version
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${documentName}</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.6; margin: 20mm; }
          .page-break { page-break-after: always; }
          @media print {
            body { margin: 15mm; }
          }
        </style>
      </head>
      <body>
        <h1>${documentName}</h1>
    `);

    Object.values(quillInstances.current).forEach((quill, index) => {
      if (quill) {
        const content = quill.root.innerHTML;
        printWindow.document.write(`<div>${content}</div>`);
        if (index < Object.keys(quillInstances.current).length - 1) {
          printWindow.document.write('<div class="page-break"></div>');
        }
      }
    });

    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  // 📎 Copy share link
  const handleShare = async () => {
    const link = `${window.location.origin}/documents/${documentId}`;
    try {
      await navigator.clipboard.writeText(link);
      setShareLink(link);
      alert("🔗 Link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy link:", err);
      alert("Failed to copy link. Please copy it manually.");
    }
  };

  // 📝 Update document name
  const handleDocumentNameUpdate = () => {
    if (documentName.trim()) {
      socketRef.current.emit("update-document-name", { 
        documentId, 
        name: documentName 
      });
    }
    setIsEditingDocName(false);
  };

  // Navigate between pages
  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= pages.length) {
      setCurrentPage(pageNumber);
      const pageElement = document.querySelector(`[data-page-id="${pageNumber}"]`);
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Remove a page
  const removePage = (pageId) => {
    if (pages.length <= 1) {
      alert("Cannot remove the only page!");
      return;
    }

    if (window.confirm("Are you sure you want to remove this page?")) {
      // Remove from state
      setPages(prev => prev.filter(page => page.id !== pageId));
      
      // Remove from DOM
      const pageElement = document.querySelector(`[data-page-id="${pageId}"]`);
      if (pageElement) {
        pageElement.remove();
      }
      
      // Remove quill instance
      delete quillInstances.current[pageId];
      
      // Adjust current page if needed
      if (currentPage >= pageId) {
        setCurrentPage(prev => Math.max(1, prev - 1));
      }
      
      calculateTotalCounts();
      
      // Emit page structure update
      emitPageStructureUpdate();
    }
  };

  return (
    <div className="editor-container">
      <Sidebar open={open} setOpen={setOpen} />
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".txt,.doc,.docx,.rtf,.odt"
        onChange={() => setShowComingSoon(true)}
      />
      
      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div className="coming-soon-modal">
          <div className="modal-content">
            <h3>🚧 Coming Soon</h3>
            <p>This feature is under development and will be available soon!</p>
            <button onClick={() => setShowComingSoon(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Export Options Modal */}
      {showExportOptions && (
        <div className="export-modal">
          <div className="modal-content">
            <h3>Export Document</h3>
            <p>Export entire document with all pages</p>
            <div className="export-options">
              <button onClick={exportAsPDF} className="export-btn pdf">
                📄 Export as PDF
              </button>
              <button onClick={exportAsDOC} className="export-btn doc">
                📝 Export as Word DOC
              </button>
              <button onClick={exportAsTXT} className="export-btn txt">
                📄 Export as TXT
              </button>
            </div>
            <button 
              onClick={() => setShowExportOptions(false)} 
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      <div className="editor-header">
        <div className="header-left">
          {/* Editable Document Name */}
          <div className="document-name-section">
            {isEditingDocName ? (
              <input
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                onBlur={handleDocumentNameUpdate}
                onKeyPress={(e) => e.key === 'Enter' && handleDocumentNameUpdate()}
                autoFocus
                className="document-name-input"
              />
            ) : (
              <h2 onClick={() => setIsEditingDocName(true)} className="document-name">
                📝 {documentName}
              </h2>
            )}
          </div>
          
          <div className="status">
            <span className={`dot ${saveStatus === "Saved" ? "saved" : "saving"}`}></span>
            {saveStatus}
          </div>
          
          <div className="word-count">
            Words: {wordCount} | Chars: {charCount} | Pages: {pages.length}
          </div>

          {/* Online Collaborators */}
          {collaborators.length > 0 && (
            <div className="collaborators-section">
              <span className="online-users">Online: </span>
              {collaborators.map((user, index) => (
                <div key={user.id} className="collaborator-avatar" title={user.name || user.email}>
                  {user.name ? user.name.substring(0, 2).toUpperCase() : user.email.substring(0, 2).toUpperCase()}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="header-right">
          <select value={pageConfig.name} onChange={handlePageSizeChange}>
            <option value="A4">A4</option>
            <option value="Letter">Letter</option>
            <option value="A5">A5</option>
            <option value="Legal">Legal</option>
          </select>
          
          <button onClick={() => addNewPage()}>+ Add Page</button>
          {pages.length > 1 && (
            <button onClick={() => removePage(currentPage)}>− Remove Page</button>
          )}
          <button onClick={handleShare}>Share</button>
          <button onClick={() => setShowExportOptions(true)}>Export</button>
          <button onClick={handlePrint}>Print</button>
          
          {isFullscreen ? (
            <button onClick={toggleFullscreen}>Exit Fullscreen</button>
          ) : (
            <button onClick={toggleFullscreen}>Fullscreen</button>
          )}
        </div>
      </div>

      {/* Page Navigation */}
      <div className="page-navigation-top">
        <button 
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ← Previous
        </button>
        <span>Page {currentPage} of {pages.length}</span>
        <button 
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === pages.length}
        >
          Next →
        </button>
        
        {/* Page Thumbnails */}
        <div className="page-thumbnails">
          {Array.isArray(pages) && pages.map((page, index) => (
            <div 
              key={page.id || index}
              className={`page-thumbnail ${currentPage === (page.id || index + 1) ? 'active' : ''}`}
              onClick={() => goToPage(page.id || index + 1)}
              title={`Page ${page.id || index + 1}`}
            >
              {page.id || index + 1}
            </div>
          ))}
          <button 
            className="add-page-thumbnail"
            onClick={() => addNewPage()}
            title="Add New Page"
          >
            +
          </button>
        </div>
      </div>

      {/* Editor Area with Multiple Pages */}
      <div ref={editorRef} className="quill-wrapper" />

      {/* Bottom Page Navigation */}
      <div className="page-navigation-bottom">
        <button 
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ← Previous Page
        </button>
        <span>Page {currentPage} of {pages.length}</span>
        <button 
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === pages.length}
        >
          Next Page →
        </button>
      </div>

      {/* Chat Toggle Button - Bottom Right */}
      <button 
        className={`chat-toggle-btn ${showChat ? 'active' : ''}`}
        onClick={toggleChat}
        title="Open Chat"
      >
        💬
        {chatMessages.length > 0 && (
          <span className="chat-notification">{chatMessages.length}</span>
        )}
      </button>

      {/* Chat Popup */}
      {showChat && (
        <div className="chat-popup">
          <div className="chat-header">
            <h3>Document Chat</h3>
            <button className="close-chat" onClick={toggleChat}>✕</button>
          </div>
          
          <div className="chat-messages" ref={chatMessagesRef}>
            {chatMessages.map((msg, index) => (
              <div 
                key={msg.messageId || index} 
                className={`chat-message ${msg.userId === (user?.uid || 'anonymous') ? 'own-message' : ''}`}
              >
                {msg.message ? (
                  <>
                    <div className="message-header">
                      <strong className="message-sender">
                        {msg.userId === (user?.uid || 'anonymous') ? 'You' : msg.userName}
                      </strong>
                      <span className="message-time">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <div className="message-content">{msg.message}</div>
                  </>
                ) : (
                  // System message (user joined/left)
                  <div className="system-message">
                    {msg.message} • {formatTime(msg.timestamp)}
                  </div>
                )}
              </div>
            ))}
            
            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="typing-indicator">
                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </div>
            )}
          </div>
          
          <div className="chat-input-container">
            <textarea
              ref={chatInputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              onFocus={handleTypingStart}
              onBlur={handleTypingStop}
              placeholder="Type a message... (Press Enter to send)"
              className="chat-input"
              rows="2"
            />
            <button 
              onClick={sendMessage} 
              disabled={!newMessage.trim()}
              className="send-message-btn"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {shareLink && (
        <div className="share-section">
          <p>Shareable Link:</p>
          <a href={shareLink} target="_blank" rel="noopener noreferrer">
            {shareLink}
          </a>
        </div>
      )}
    </div>
  );
}