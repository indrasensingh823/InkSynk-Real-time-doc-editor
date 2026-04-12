import React, { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import domtoimage from 'dom-to-image';
import '../styles/Planner.css';
import Sidebar from '../components/Sidebar';

export default function Planner() {
  const [open, setOpen] = useState(true);
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('planner-events');
    return saved ? JSON.parse(saved) : [];
  });

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [desc, setDesc] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, today, upcoming, completed
  const [editingIndex, setEditingIndex] = useState(null);
  const [shareLink, setShareLink] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const plannerRef = useRef();

  useEffect(() => {
    localStorage.setItem('planner-events', JSON.stringify(events));
  }, [events]);

  const addEvent = () => {
    if (!date || !desc) return;
    
    const newEvent = {
      date,
      time: time || '00:00',
      desc,
      completed: false,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    setEvents([newEvent, ...events]);
    setDate('');
    setTime('');
    setDesc('');
  };

  const updateEvent = () => {
    if (editingIndex === null || !date || !desc) return;
    
    const updatedEvents = [...events];
    updatedEvents[editingIndex] = {
      ...updatedEvents[editingIndex],
      date,
      time: time || '00:00',
      desc
    };
    
    setEvents(updatedEvents);
    setEditingIndex(null);
    setDate('');
    setTime('');
    setDesc('');
  };

  const deleteEvent = (index) => {
    const newEvents = [...events];
    newEvents.splice(index, 1);
    setEvents(newEvents);
  };

  const toggleComplete = (index) => {
    const newEvents = [...events];
    newEvents[index].completed = !newEvents[index].completed;
    setEvents(newEvents);
  };

  const startEditing = (index) => {
    const event = events[index];
    setDate(event.date);
    setTime(event.time);
    setDesc(event.desc);
    setEditingIndex(index);
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setDate('');
    setTime('');
    setDesc('');
  };

  // 🔗 Share event functionality
  const shareEvent = (event) => {
    const eventData = {
      title: event.desc,
      date: event.date,
      time: event.time,
      type: 'planner-event'
    };
    
    const encodedData = btoa(JSON.stringify(eventData));
    const shareUrl = `${window.location.origin}/planner?event=${encodedData}`;
    
    setShareLink(shareUrl);
    setShowShareModal(true);
    
    // Auto copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
      console.log('Event link copied to clipboard');
    });
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Share link copied to clipboard!');
  };

  // 📊 Filter and search events
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.date.includes(search) || 
                         event.desc.toLowerCase().includes(search.toLowerCase()) ||
                         event.time.includes(search);
    
    const today = new Date().toISOString().split('T')[0];
    const eventDate = new Date(event.date);
    const now = new Date();
    
    switch(filter) {
      case 'today':
        return matchesSearch && event.date === today;
      case 'upcoming':
        return matchesSearch && eventDate >= now;
      case 'completed':
        return matchesSearch && event.completed;
      case 'pending':
        return matchesSearch && !event.completed;
      default:
        return matchesSearch;
    }
  });

  // 📈 Statistics
  const totalEvents = events.length;
  const completedEvents = events.filter(event => event.completed).length;
  const todayEvents = events.filter(event => event.date === new Date().toISOString().split('T')[0]).length;
  const upcomingEvents = events.filter(event => new Date(event.date) >= new Date()).length;

  // 📤 Export functions
  const exportTxt = () => {
    const text = filteredEvents.map(e => 
      `${e.date} ${e.time} - ${e.desc} ${e.completed ? '[COMPLETED]' : ''}`
    ).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'planner.txt';
    link.click();
  };

  const exportCsv = () => {
    const headers = 'Date,Time,Description,Status\n';
    const csv = filteredEvents.map(e => 
      `"${e.date}","${e.time}","${e.desc}","${e.completed ? 'Completed' : 'Pending'}"`
    ).join('\n');
    const blob = new Blob([headers + csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'planner.csv';
    link.click();
  };

  const exportPdf = () => {
    html2pdf().from(plannerRef.current).save('planner.pdf');
  };

  const exportJpg = () => {
    domtoimage.toJpeg(plannerRef.current).then(dataUrl => {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'planner.jpg';
      link.click();
    });
  };

  const exportDoc = () => {
    const html = `
      <html>
        <head>
          <title>Planner Export</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .event { margin: 10px 0; padding: 10px; border-left: 4px solid #007bff; }
            .completed { border-left-color: #28a745; opacity: 0.7; }
          </style>
        </head>
        <body>
          <h1>Planner Export</h1>
          <p>Generated on ${new Date().toLocaleString()}</p>
          ${filteredEvents.map(e => `
            <div class="event ${e.completed ? 'completed' : ''}">
              <h3>${e.date} ${e.time}</h3>
              <p>${e.desc}</p>
              <p><strong>Status:</strong> ${e.completed ? 'Completed' : 'Pending'}</p>
            </div>
          `).join('')}
        </body>
      </html>
    `;
    const blob = new Blob([html], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'planner.doc';
    link.click();
  };

  const clearAllEvents = () => {
    if (window.confirm('Are you sure you want to delete all events? This action cannot be undone.')) {
      setEvents([]);
    }
  };

  return (
    <div className={`planner-container ${open ? "sidebar-open" : "sidebar-closed"}`}>
      <Sidebar open={open} setOpen={setOpen} />
      
      <div className="planner-main">
        {/* Header */}
        <header className="planner-header">
          <div className="header-content">
            <h1 className="planner-title">📅 Personal Planner</h1>
            <p className="planner-subtitle">Organize your tasks and events efficiently</p>
          </div>
        </header>

        {/* Statistics */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <span className="stat-number">{totalEvents}</span>
              <span className="stat-label">Total Events</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <span className="stat-number">{completedEvents}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <span className="stat-number">{todayEvents}</span>
              <span className="stat-label">Today</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <span className="stat-number">{upcomingEvents}</span>
              <span className="stat-label">Upcoming</span>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="input-section">
          <h3>{editingIndex !== null ? 'Edit Event' : 'Add New Event'}</h3>
          <div className="input-grid">
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)}
              className="input-field"
              placeholder="Select date"
            />
            <input 
              type="time" 
              value={time} 
              onChange={e => setTime(e.target.value)}
              className="input-field"
              placeholder="Time"
            />
            <input 
              type="text" 
              value={desc} 
              onChange={e => setDesc(e.target.value)}
              className="input-field"
              placeholder="Event description"
            />
            <div className="action-buttons">
              {editingIndex !== null ? (
                <>
                  <button onClick={updateEvent} className="btn-primary">Update Event</button>
                  <button onClick={cancelEditing} className="btn-secondary">Cancel</button>
                </>
              ) : (
                <button onClick={addEvent} className="btn-primary">Add Event</button>
              )}
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="controls-section">
          <div className="search-filter">
            <div className="search-box">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="🔍 Search events..."
                className="search-input"
              />
            </div>
            
            <select 
              value={filter} 
              onChange={e => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Events</option>
              <option value="today">Today</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>

            <button onClick={clearAllEvents} className="btn-danger">
              🗑️ Clear All
            </button>
          </div>

          {/* Export Buttons */}
          <div className="export-section">
            <h4>Export Events</h4>
            <div className="export-buttons">
              <button onClick={exportTxt} className="export-btn">📄 TXT</button>
              <button onClick={exportCsv} className="export-btn">📊 CSV</button>
              <button onClick={exportPdf} className="export-btn">📑 PDF</button>
              <button onClick={exportJpg} className="export-btn">🖼️ JPG</button>
              <button onClick={exportDoc} className="export-btn">📝 DOC</button>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="events-section" ref={plannerRef}>
          <h3>Your Events ({filteredEvents.length})</h3>
          
          {filteredEvents.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <p>No events found</p>
              <small>
                {search || filter !== 'all' 
                  ? 'Try changing your search or filter criteria' 
                  : 'Add your first event to get started!'}
              </small>
            </div>
          ) : (
            <div className="events-list">
              {filteredEvents.map((event, idx) => (
                <div 
                  key={event.id} 
                  className={`event-item ${event.completed ? 'completed' : ''} ${new Date(event.date) < new Date() && !event.completed ? 'overdue' : ''}`}
                >
                  <div className="event-checkbox">
                    <input
                      type="checkbox"
                      checked={event.completed}
                      onChange={() => toggleComplete(idx)}
                      className="complete-checkbox"
                    />
                  </div>
                  
                  <div className="event-content">
                    <div className="event-header">
                      <span className="event-date">
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      <span className="event-time">🕒 {event.time}</span>
                    </div>
                    <p className="event-desc">{event.desc}</p>
                    <div className="event-meta">
                      <small>Created: {new Date(event.createdAt).toLocaleDateString()}</small>
                    </div>
                  </div>

                  <div className="event-actions">
                    <button 
                      onClick={() => startEditing(idx)}
                      className="action-btn edit-btn"
                      title="Edit event"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => shareEvent(event)}
                      className="action-btn share-btn"
                      title="Share event"
                    >
                      🔗
                    </button>
                    <button 
                      onClick={() => deleteEvent(idx)}
                      className="action-btn delete-btn"
                      title="Delete event"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div className="modal-overlay">
            <div className="share-modal">
              <h3>🔗 Share Event</h3>
              <p>Event link has been copied to your clipboard!</p>
              <div className="share-link">
                <input 
                  type="text" 
                  value={shareLink} 
                  readOnly 
                  className="link-input"
                />
                <button onClick={copyShareLink} className="copy-link-btn">
                  📋
                </button>
              </div>
              <div className="modal-actions">
                <button 
                  onClick={() => setShowShareModal(false)}
                  className="btn-primary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}