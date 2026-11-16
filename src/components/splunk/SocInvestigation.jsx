/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { splunkLabApi } from "../../services/splunkLabApi";
import { GlassCard, PrimaryButton, SoftButton } from "./Glass";

const initialReport = { account: "", sourceIp: "", mfaResult: "", file: "", evidence: "", response: "revoke_sessions" };
const control = "mt-1 w-full rounded-lg border border-white/15 bg-[#080f22] p-2 text-sm";
const investigationQueries = [
  ["Search VPN sign-ins", "source=vpn | table _time user src_ip action device_id"],
  ["Search identity and MFA", "source=identity | table _time user src_ip device_id mfa_result"],
  ["Search endpoint activity", "source=endpoint | table _time user src_ip device_id action"],
  ["Search file downloads", "source=files action=download | table _time user src_ip device_id file"],
];

export default function SocInvestigation({ onSearch }) {
  const [data, setData] = useState(null);
  const [report, setReport] = useState(initialReport);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const next = await splunkLabApi.getSocScenario();
        if (active) setData((current) => current && new Date(current.now) >= new Date(next.now) ? current : next);
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.message || "Could not load the investigation.");
      }
    };
    load();
    const timer = setInterval(load, 15_000);
    return () => { active = false; clearInterval(timer); };
  }, []);

  const run = async (action) => {
    setBusy(true);
    setError("");
    try { setData(await action()); }
    catch (requestError) { setError(requestError.response?.data?.message || "The investigation request failed."); }
    finally { setBusy(false); }
  };
  const session = data?.session;
  const finding = session?.finding;
  const fileActivityReady = session && new Date(data.now) - new Date(session.startedAt) >= 480_000;

  return <div className="grid gap-4 lg:grid-cols-2">
    <GlassCard className="space-y-4 p-5">
      <div>
        <h2 className="text-lg font-semibold">SOC Investigation</h2>
        <p className="mt-1 text-sm text-slate-300">Investigate suspicious activity at a fictional company with 500 employees. The replay continues on the backend while this tab is closed.</p>
      </div>
      {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
      {!data && !error && <p role="status">Loading investigation…</p>}
      {data && !session && <>
        {!data.schedulerEnabled && <p className="text-sm text-amber-200">The backend alert scheduler is disabled.</p>}
        <PrimaryButton disabled={busy || !data.schedulerEnabled} onClick={() => run(splunkLabApi.startSocScenario)}>Start password spray scenario</PrimaryButton>
      </>}
      {session && !finding?.detectedAt && <p role="status" className="text-sm text-cyan-200">Replay running. The password spray detection checks the first five minutes of VPN logs.</p>}
      {finding?.detectedAt && <section aria-label="Finding" className="space-y-2">
        <h3 className="font-semibold text-amber-200">Possible password spray</h3>
        <p className="text-sm">Source IP <code>{finding.sourceIp}</code> failed to sign in to {finding.affectedAccounts} distinct accounts.</p>
        <p className="text-xs text-slate-400">Detection window ended {new Date(finding.detectedAt).toLocaleString()}</p>
        <SoftButton onClick={() => onSearch(data.detectionQuery)}>Open detection search</SoftButton>
      </section>}
      {session && <div className="flex flex-wrap gap-2">
        {investigationQueries.map(([label, query]) => <SoftButton key={label} onClick={() => onSearch(`index=toa_soc ${query.replace(" | ", finding?.sourceIp ? ` src_ip=${finding.sourceIp} | ` : " | ")}`)}>{label}</SoftButton>)}
      </div>}
    </GlassCard>
    <GlassCard className="p-5">
      <h3 className="mb-3 font-semibold">Case report</h3>
      {session?.report?.submittedAt ? <div className="space-y-2 text-sm">
        <p className="text-emerald-300">Case submitted. Compromised account confirmed.</p>
        <p>{session.report.account} · {session.report.response === "revoke_sessions" ? "Sessions revoked in simulation" : "Account disabled in simulation"}</p>
        <p className="break-words">{session.report.sourceIp} · MFA {session.report.mfaResult} · {session.report.file}</p>
        <p className="whitespace-pre-wrap break-words">{session.report.evidence}</p>
      </div> : finding?.detectedAt && fileActivityReady ? <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); run(() => splunkLabApi.submitSocReport(report)); }}>
        <label className="block text-sm">Compromised account<input required maxLength={80} className={control} value={report.account} onChange={(event) => setReport({ ...report, account: event.target.value })}/></label>
        <label className="block text-sm">Source IP<input required maxLength={45} className={control} value={report.sourceIp} onChange={(event) => setReport({ ...report, sourceIp: event.target.value })}/></label>
        <label className="block text-sm">MFA result<input required maxLength={30} className={control} value={report.mfaResult} onChange={(event) => setReport({ ...report, mfaResult: event.target.value })}/></label>
        <label className="block text-sm">Downloaded file path<input required maxLength={200} className={control} value={report.file} onChange={(event) => setReport({ ...report, file: event.target.value })}/></label>
        <label className="block text-sm">Evidence from sign-in, MFA, and file logs<textarea required minLength={20} maxLength={3000} rows={5} className={control} value={report.evidence} onChange={(event) => setReport({ ...report, evidence: event.target.value })}/></label>
        <label className="block text-sm">Simulated response<select className={control} value={report.response} onChange={(event) => setReport({ ...report, response: event.target.value })}><option value="revoke_sessions">Revoke sessions</option><option value="disable_account">Disable account</option></select></label>
        <PrimaryButton disabled={busy} type="submit">Submit case report</PrimaryButton>
      </form> : <p className="text-sm text-slate-400">The report opens after the finding and file activity are available. File activity appears eight minutes into the replay.</p>}
    </GlassCard>
  </div>;
}
