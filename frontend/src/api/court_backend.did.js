// Auto-generated Candid IDL factory for court_backend (local dev stub)
export const idlFactory = ({ IDL }) => {
  const Role = IDL.Variant({
    Judge: IDL.Null,
    Plaintiff: IDL.Null,
    Defendant: IDL.Null,
    Observer: IDL.Null,
    AIJudge: IDL.Null,
    AILawyer: IDL.Null,
  });
  const Evidence = IDL.Record({
    id: IDL.Nat,
    uploader: IDL.Principal,
    url: IDL.Text,
    description: IDL.Text,
    timestamp: IDL.Int,
  });
  const Message = IDL.Record({
    sender: IDL.Principal,
    role: Role,
    content: IDL.Text,
    timestamp: IDL.Int,
  });
  const Trial = IDL.Record({
    id: IDL.Nat,
    judge: IDL.Principal,
    plaintiff: IDL.Principal,
    defendant: IDL.Principal,
    observers: IDL.Vec(IDL.Principal),
    evidence: IDL.Vec(Evidence),
    log: IDL.Vec(Message),
    verdict: IDL.Opt(IDL.Text),
    aiVerdict: IDL.Opt(IDL.Text),
    status: IDL.Text,
  });
  return IDL.Service({
    createTrial: IDL.Func([IDL.Principal, IDL.Principal], [IDL.Nat], []),
    joinTrial: IDL.Func([IDL.Nat], [IDL.Bool], []),
    submitEvidence: IDL.Func([IDL.Nat, IDL.Text, IDL.Text], [IDL.Bool], []),
    postMessage: IDL.Func([IDL.Nat, Role, IDL.Text], [IDL.Bool], []),
    setVerdict: IDL.Func([IDL.Nat, IDL.Text], [IDL.Bool], []),
    setAIVerdict: IDL.Func([IDL.Nat, IDL.Text], [IDL.Bool], []),
    getTrial: IDL.Func([IDL.Nat], [IDL.Opt(Trial)], ['query']),
    listTrials: IDL.Func([], [IDL.Vec(Trial)], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
