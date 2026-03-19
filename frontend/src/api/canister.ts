import { Actor, HttpAgent } from '@dfinity/agent';
// @ts-ignore
import { idlFactory as courtIDL } from './court_backend.did.js';

// ============================================
// Mock Backend (works without ICP canister)
// ============================================

interface MockTrial {
  id: number;
  judge: string;
  plaintiff: string;
  defendant: string;
  evidence: { url: string; description: string; timestamp: number }[];
  log: { role: string; content: string; timestamp: number }[];
  verdict: string | null;
  aiVerdict: string | null;
  status: string;
}

let mockTrials: MockTrial[] = [];
let mockNextId = 1;

const aiVerdicts = [
  "After careful analysis of the evidence presented, I find in favor of the plaintiff. The preponderance of evidence clearly establishes the claim. The defendant's counterarguments, while noted, fail to sufficiently rebut the core allegations. Judgment awarded with costs.",
  "Having reviewed all testimony and evidence, I find the matter should be settled by mediation. Both parties have valid points, and a collaborative resolution would best serve justice in this case.",
  "Based on the evidence and legal precedent, I rule in favor of the defendant. The plaintiff's claims lack sufficient substantiation. Case dismissed with prejudice.",
];

export const mockBackend = {
  createTrial: async (plaintiff: string, defendant: string): Promise<number> => {
    const trial: MockTrial = {
      id: mockNextId++,
      judge: 'AI-Judge',
      plaintiff,
      defendant,
      evidence: [],
      log: [{ role: 'System', content: 'Trial session opened. All parties may now present their case.', timestamp: Date.now() }],
      verdict: null,
      aiVerdict: null,
      status: 'open',
    };
    mockTrials.push(trial);
    return trial.id;
  },

  joinTrial: async (trialId: number): Promise<boolean> => {
    return mockTrials.some(t => t.id === trialId);
  },

  submitEvidence: async (trialId: number, url: string, description: string): Promise<boolean> => {
    const trial = mockTrials.find(t => t.id === trialId);
    if (!trial) return false;
    trial.evidence.push({ url, description, timestamp: Date.now() });
    trial.log.push({ role: 'Evidence', content: `📎 Evidence submitted: ${url || description}`, timestamp: Date.now() });
    return true;
  },

  postMessage: async (trialId: number, role: any, content: string): Promise<boolean> => {
    const trial = mockTrials.find(t => t.id === trialId);
    if (!trial) return false;
    const roleStr = typeof role === 'string' ? role : Object.keys(role)[0];
    trial.log.push({ role: roleStr, content, timestamp: Date.now() });
    return true;
  },

  setAIVerdict: async (trialId: number, _aiVerdict: string): Promise<boolean> => {
    const trial = mockTrials.find(t => t.id === trialId);
    if (!trial) return false;
    const verdict = aiVerdicts[Math.floor(Math.random() * aiVerdicts.length)];
    trial.aiVerdict = verdict;
    trial.log.push({ role: 'AI Judge', content: `⚖️ ${verdict}`, timestamp: Date.now() });
    return true;
  },

  setVerdict: async (trialId: number, verdict: string): Promise<boolean> => {
    const trial = mockTrials.find(t => t.id === trialId);
    if (!trial) return false;
    trial.verdict = verdict;
    trial.status = 'closed';
    return true;
  },

  getTrial: async (trialId: number): Promise<MockTrial | null> => {
    return mockTrials.find(t => t.id === trialId) || null;
  },

  listTrials: async (): Promise<MockTrial[]> => {
    return mockTrials;
  },
};

// ============================================
// Real ICP Backend (when canister is deployed)
// ============================================

let courtBackendReal: any = null;
try {
  const canisterId = process.env.REACT_APP_BACKEND_CANISTER_ID || 'aaaaa-aa';
  const agent = new HttpAgent({ host: 'http://localhost:4943' });
  if (process.env.NODE_ENV !== 'production') {
    agent.fetchRootKey().catch(() => {});
  }
  courtBackendReal = Actor.createActor(courtIDL, { agent, canisterId });
} catch (e) {
  // ICP not available
}

// Export mock as default — switch to courtBackendReal when canister is deployed
export const courtBackend = mockBackend as any;