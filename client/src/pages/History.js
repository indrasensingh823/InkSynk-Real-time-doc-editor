// client/src/pages/History.js
import React, { useEffect, useState } from 'react';
import { fetchUserDocs } from '../api';
import { useNavigate } from 'react-router-dom';

export default function History(){
  const nav = useNavigate();
  const u = JSON.parse(localStorage.getItem('user') || 'null');
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    if (!u) return;
    load();
  }, [u]);

  async function load(){
    const res = await fetchUserDocs(u.uid);
    if (res.data.ok) setDocs(res.data.docs);
  }

  return (
    <div style={{padding:20}}>
      <h2>Document History</h2>
      <ul>
        {docs.map(d => (
          <li key={d._id} style={{border:'1px solid #ddd', margin:8, padding:8}}>
            <div><strong>{d.title}</strong></div>
            <div>Updated: {new Date(d.updatedAt).toLocaleString()}</div>
            <button onClick={() => nav(`/documents/${d._id}`)}>Open</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
