import React, { useState, useRef, useEffect } from 'react';
import { courtBackend } from '../api/canister';

interface DashboardProps {
  principal: string;
}

const Dashboard: React.FC<DashboardProps> = ({ principal }) => {
  const [trialId, setTrialId] = useState<string>('');
  const [joinedTrial, setJoinedTrial] = useState<boolean>(false);
  const [evidence, setEvidence] = useState<string>('');
  const [chat, setChat] = useState<string>('');
  const [log, setLog] = useState<{ role: string; content: string; type?: string }[]>([]);
  const [currentTrialId, setCurrentTrialId] = useState<string>('');
  const [aiThinking, setAIThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  const handleCreateTrial = async () => {
    try {
      const id = await courtBackend.createTrial(principal, principal);
      setCurrentTrialId(String(id));
      setJoinedTrial(true);
      setLog([{ role: 'System', content: `⚖️ Trial #${id} created. Session is now open.`, type: 'system' }]);
    } catch (e) {
      setLog((l) => [...l, { role: 'System', content: '❌ Error creating trial', type: 'system' }]);
    }
  };

  const handleJoinTrial = async () => {
    if (!trialId.trim()) return;
    try {
      const success = await courtBackend.joinTrial(Number(trialId));
      if (success) {
        setCurrentTrialId(trialId);
        setJoinedTrial(true);
        setLog([{ role: 'System', content: `Joined trial #${trialId}`, type: 'system' }]);
      } else {
        setLog((l) => [...l, { role: 'System', content: `Trial #${trialId} not found`, type: 'system' }]);
      }
    } catch (e) {
      setLog((l) => [...l, { role: 'System', content: '❌ Error joining trial', type: 'system' }]);
    }
  };

  const handleUploadEvidence = async () => {
    if (!evidence.trim()) return;
    try {
      await courtBackend.submitEvidence(Number(currentTrialId), evidence, '');
      setLog((l) => [...l, { role: 'Evidence', content: `📎 ${evidence}`, type: 'evidence' }]);
      setEvidence('');
    } catch (e) {
      setLog((l) => [...l, { role: 'System', content: '❌ Error uploading evidence', type: 'system' }]);
    }
  };

  const handleSendChat = async () => {
    if (!chat.trim()) return;
    try {
      await courtBackend.postMessage(Number(currentTrialId), { 'Plaintiff': null }, chat);
      setLog((l) => [...l, { role: 'You', content: chat }]);
      setChat('');
    } catch (e) {
      setLog((l) => [...l, { role: 'System', content: '❌ Error sending message', type: 'system' }]);
    }
  };

  const handleAIJudge = async () => {
    setAIThinking(true);
    setLog((l) => [...l, { role: 'System', content: '🤖 AI Judge is analyzing the case...', type: 'system' }]);
    
    // Simulate thinking delay for demo
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      await courtBackend.setAIVerdict(Number(currentTrialId), '');
      const trial = await courtBackend.getTrial(Number(currentTrialId));
      if (trial?.aiVerdict) {
        setLog((l) => [...l, { role: 'AI Judge', content: trial.aiVerdict, type: 'ai' }]);
      }
    } catch (e) {
      setLog((l) => [...l, { role: 'System', content: '❌ Error with AI judge', type: 'system' }]);
    }
    setAIThinking(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      action();
    }
  };

  // Pre-trial welcome view
  if (!joinedTrial) {
    return (
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>Dashboard</h2>
        </div>
        <div className="welcome-card">
          <div className="icon">⚖️</div>
          <h3>Start a Trial</h3>
          <p>Create a new trial session or join an existing one to begin.</p>
          
          <button className="btn btn-primary" onClick={handleCreateTrial} style={{ width: '100%', marginBottom: 12 }}>
            ✨ Create New Trial
          </button>
          
          <div style={{ width: '100%', maxWidth: 280 }}>
            <div className="text-xs text-muted mb-2" style={{ textAlign: 'center' }}>— or join existing —</div>
            <div className="input-group">
              <input
                className="input-field"
                type="text"
                placeholder="Trial ID"
                value={trialId}
                onChange={e => setTrialId(e.target.value)}
                onKeyDown={e => handleKeyDown(e, handleJoinTrial)}
              />
              <button className="btn btn-secondary" onClick={handleJoinTrial}>Join</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active trial view
  return (
    <div className="dashboard-sidebar">
      <div className="sidebar-header">
        <h2>Trial Session</h2>
        <div className="trial-id">
          <span className="status-live">Live</span> — Trial #{currentTrialId}
        </div>
      </div>

      {/* Evidence Section */}
      <div className="dash-section">
        <div className="dash-section-title">Submit Evidence</div>
        <div className="input-group">
          <input
            className="input-field"
            type="text"
            placeholder="URL or description..."
            value={evidence}
            onChange={e => setEvidence(e.target.value)}
            onKeyDown={e => handleKeyDown(e, handleUploadEvidence)}
          />
          <button className="btn btn-secondary btn-sm" onClick={handleUploadEvidence}>📎</button>
        </div>
      </div>

      {/* AI Judge Section */}
      <div className="dash-section">
        <div className="dash-section-title">AI Judge</div>
        <button 
          className="btn btn-primary" 
          onClick={handleAIJudge} 
          disabled={aiThinking}
          style={{ width: '100%' }}
        >
          {aiThinking ? '🤖 Analyzing...' : '⚖️ Request AI Verdict'}
        </button>
      </div>

      {/* Chat Log */}
      <div className="chat-log">
        {log.map((entry, i) => (
          <div key={i} className={`chat-entry ${entry.type || ''}`}>
            <div className="meta">{entry.role}</div>
            {entry.content}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input */}
      <div className="chat-input-bar">
        <div className="input-group">
          <input
            className="input-field"
            type="text"
            placeholder="Type your message..."
            value={chat}
            onChange={e => setChat(e.target.value)}
            onKeyDown={e => handleKeyDown(e, handleSendChat)}
          />
          <button className="btn btn-primary btn-sm" onClick={handleSendChat}>↑</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;