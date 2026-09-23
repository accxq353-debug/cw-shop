"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/useUser";
import {
  Bot,
  Check,
  Code,
  HelpCircle,
  MessageSquare,
  Play,
  Plus,
  RefreshCw,
  Save,
  Send,
  Terminal,
  Trash2,
  Wrench,
  Sparkles,
} from "lucide-react";

type CustomCmd = {
  id: number;
  name: string;
  description: string;
  response: string;
  asEmbed: boolean;
  ephemeral: boolean;
  createdAt: string;
};

export default function AdminDiscordBot() {
  const [status, setStatus] = useState<{
    online: boolean;
    userTag: string | null;
    tokenConfigured: boolean;
    guildsCount: number;
    config?: {
      vouchChannelId: string;
      transcriptChannelId: string;
      logsChannelId: string;
      announceChannelId: string;
      reklamaChannelId: string;
      categories: {
        buyTickets: string;
        supportTickets: string;
        partnershipTickets: string;
        reklamaCategory: string;
      };
    };
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initMsg, setInitMsg] = useState("");
  const [error, setError] = useState("");
  const [showGuide, setShowGuide] = useState(false);

  // Form states
  const [vouchChannelId, setVouchChannelId] = useState("1537118421714599998");
  const [transcriptChannelId, setTranscriptChannelId] = useState("1537121548211720222");
  const [announceChannelId, setAnnounceChannelId] = useState("1537119243823353906");
  const [buyTickets, setBuyTickets] = useState("1537121405936730223");
  const [supportTickets, setSupportTickets] = useState("1538723924261478530");
  const [partnershipTickets, setPartnershipTickets] = useState("1538722110967382056");
  const [reklamaCategory, setReklamaCategory] = useState("1538722110967382056");

  // Custom Commands Builder State
  const [customCommandsList, setCustomCommandsList] = useState<CustomCmd[]>([]);
  const [showCreateCmd, setShowCreateCmd] = useState(false);
  const [newCmdName, setNewCmdName] = useState("");
  const [newCmdDesc, setNewCmdDesc] = useState("");
  const [newCmdResponse, setNewCmdResponse] = useState("");
  const [newCmdAsEmbed, setNewCmdAsEmbed] = useState(true);
  const [newCmdEphemeral, setNewCmdEphemeral] = useState(false);
  const [creatingCmd, setCreatingCmd] = useState(false);

  const checkStatus = async () => {
    try {
      const res = await apiFetch("/api/bot/init");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        if (data.config) {
          setVouchChannelId(data.config.vouchChannelId || "1537118421714599998");
          setTranscriptChannelId(data.config.transcriptChannelId || "1537121548211720222");
          setAnnounceChannelId(data.config.announceChannelId || "1537119243823353906");
          if (data.config.categories) {
            setBuyTickets(data.config.categories.buyTickets || "1537121405936730223");
            setSupportTickets(data.config.categories.supportTickets || "1538723924261478530");
            setPartnershipTickets(data.config.categories.partnershipTickets || "1538722110967382056");
            setReklamaCategory(data.config.categories.reklamaCategory || "1538722110967382056");
          }
        }
      }
    } catch {}
  };

  const loadCustomCommands = async () => {
    try {
      const res = await apiFetch("/api/admin/bot/commands");
      if (res.ok) {
        const data = await res.json();
        setCustomCommandsList(data.commands || []);
      }
    } catch {}
  };

  useEffect(() => {
    checkStatus();
    loadCustomCommands();
  }, []);

  const handleStartBot = async () => {
    setLoading(true);
    setInitMsg("");
    setError("");
    try {
      const res = await apiFetch("/api/bot/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Nepavyko paleisti boto");
      setInitMsg(data.message);
      await checkStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Klaida paleidžiant botą");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setInitMsg("");
    setError("");
    try {
      const res = await apiFetch("/api/bot/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_config",
          vouchChannelId,
          transcriptChannelId,
          announceChannelId,
          buyTickets,
          supportTickets,
          partnershipTickets,
          reklamaCategory,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Nepavyko išsaugoti nustatymų");
      setInitMsg(data.message || "Boto nustatymai išsaugoti!");
      await checkStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Klaida saugant nustatymus");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCustomCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingCmd(true);
    setError("");
    setInitMsg("");
    try {
      const res = await apiFetch("/api/admin/bot/commands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCmdName,
          description: newCmdDesc,
          response: newCmdResponse,
          asEmbed: newCmdAsEmbed,
          ephemeral: newCmdEphemeral,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Nepavyko sukurti komandos");
      setInitMsg(data.message);
      setNewCmdName("");
      setNewCmdDesc("");
      setNewCmdResponse("");
      setShowCreateCmd(false);
      await loadCustomCommands();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Klaida kuriant komandą");
    } finally {
      setCreatingCmd(false);
    }
  };

  const handleDeleteCommand = async (id: number, name: string) => {
    if (!confirm(`Ar tikrai norite ištrinti komandą /${name}?`)) return;
    try {
      const res = await apiFetch(`/api/admin/bot/commands?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Nepavyko ištrinti");
      setInitMsg(`Komanda /${name} ištrinta.`);
      await loadCustomCommands();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Klaida trinant komandą");
    }
  };

  return (
    <div className="space-y-6">
      {/* Bot Status Header */}
      <div className="panel rounded-3xl p-6 border border-line bg-gradient-to-b from-[#180e2f] via-[#120a24] to-[#0b0616] shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
          <div className="flex items-center gap-3.5">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5865f2]/20 text-[#5865f2] border border-[#5865f2]/30 shadow-md">
              <Bot size={26} />
            </span>
            <div>
              <div className="flex items-center gap-2 font-display text-[20px] font-extrabold text-white">
                Cw-Shop Discord Bot Valdymo Centras
                {status?.online ? (
                  <span className="micro flex items-center gap-1.5 rounded-full bg-live/15 border border-live/30 px-2.5 py-0.5 text-live font-bold">
                    <span className="h-2 w-2 rounded-full bg-live animate-pulse" />
                    ONLINE
                  </span>
                ) : (
                  <span className="micro rounded-full bg-warn/15 border border-warn/30 px-2.5 py-0.5 text-warn font-bold">
                    {status?.tokenConfigured ? "STANDBY / PARUOŠTAS" : "REIKIA DISCORD_BOT_TOKEN"}
                  </span>
                )}
              </div>
              <p className="text-[13px] text-muted mt-0.5">
                {status?.userTag
                  ? `Prisijungęs kaip: ${status.userTag} (${status.guildsCount} serveriai)`
                  : "Bilietų sistema, reklamos kanalų kūrimas, prekių pristatymas į DM ir +rep sekimas"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white/[0.04] px-3.5 py-2 text-[13px] text-muted hover:text-white transition-colors"
            >
              <HelpCircle size={15} />
              <span>{showGuide ? "Slėpti instrukciją" : "Kaip pilnai nustatyti?"}</span>
            </button>

            <button
              type="button"
              onClick={checkStatus}
              className="rounded-xl border border-line bg-white/[0.04] p-2 text-muted hover:text-ink transition-colors"
              title="Tikrinti būseną"
            >
              <RefreshCw size={15} />
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handleStartBot}
              className="inline-flex items-center gap-2 rounded-xl bg-[#5865f2] px-5 py-2.5 font-display text-[13.5px] font-extrabold text-white hover:bg-[#4752c4] transition-all shadow-md active:scale-95"
            >
              <Play size={15} />
              {loading ? "Jungiamasi..." : status?.online ? "Perkrauti Botą" : "Paleisti Botą"}
            </button>
          </div>
        </div>

        {/* Netlify 24/7 Forever Mode Box */}
        <div className="mt-5 rounded-2xl border border-live/40 bg-live/[0.08] p-5 text-[13.5px] leading-relaxed text-ink space-y-3 shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-display font-extrabold text-[15px] text-live flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-live animate-ping" />
              🌐 Netlify 24/7 Nuolatinis Rėžimas (Interactions Endpoint):
            </span>
            <span className="micro rounded bg-live/20 text-live px-2 py-0.5 font-bold">
              NEREIKIA JOKIO KITO SERVERIO
            </span>
          </div>
          <p className="text-muted text-[13px]">
            Discord oficialiai palaiko HTTP užklausas tiesiai į jūsų Netlify svetainę! Discord pats siunčia užklausą į jūsų puslapį, o Netlify atsako per <strong>15ms</strong>. Botas niekada neužmiega ir veikia amžinai be atskiro hostingo!
          </p>
          <div className="rounded-xl border border-line bg-black/60 p-3 font-mono text-[13px] text-white flex items-center justify-between flex-wrap gap-2">
            <span className="text-live select-all">
              https://cw-shop.xyz/api/discord/interactions
            </span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText("https://cw-shop.xyz/api/discord/interactions");
                alert("Nuoroda nukopijuota! Įklijuokite ją į Discord Developer Portal -> General Information -> Interactions Endpoint URL.");
              }}
              className="rounded-lg bg-live px-3 py-1 font-sans text-[12px] font-bold text-void hover:opacity-90"
            >
              Kopijuoti URL
            </button>
          </div>
          <div className="text-[12px] text-muted">
            1. Eikite į <a href="https://discord.com/developers/applications" target="_blank" rel="noreferrer" className="text-signal underline font-bold">Discord Developer Portal</a> ➔ Pasirinkite <strong>Cw-Shop</strong> ➔ <strong>General Information</strong>.<br />
            2. Įklijuokite šią nuorodą į laukelį <strong>„INTERACTIONS ENDPOINT URL“</strong> ir paspauskite Save Changes.<br />
            3. Nukopijuokite <strong>PUBLIC KEY</strong> ir įdėkite į Netlify prie aplinkos kintamųjų (<code className="text-signal font-mono">DISCORD_PUBLIC_KEY</code>).
          </div>
        </div>

        {/* Step-by-Step Setup Guide Accordion */}
        {showGuide ? (
          <div className="mt-5 rounded-2xl border border-signal/40 bg-void/90 p-5 text-[13.5px] leading-relaxed text-ink space-y-3 shadow-2xl">
            <div className="font-display font-extrabold text-[16px] text-signal flex items-center gap-2">
              <span>📖</span> Kaip pilnai pajungti ir sukonfigūruoti Discord Botą?
            </div>
            <ol className="list-decimal pl-5 space-y-2 text-muted">
              <li>
                Eikite į <a href="https://discord.com/developers/applications" target="_blank" rel="noreferrer" className="text-signal underline font-bold">Discord Developer Portal</a> ir paspauskite <strong>New Application</strong> (pavadinimas: <strong>Cw-Shop</strong>).
              </li>
              <li>
                Kairėje meniu pasirinkite <strong>Bot</strong>:
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Paspauskite <strong>Reset Token</strong> ir nukopijuokite savo <strong>Bot Token</strong>.</li>
                  <li>Slinkite žemyn iki <strong>Privileged Gateway Intents</strong> ir būtinai įjunkite visus tris:
                    <strong className="text-white block mt-0.5">• Message Content Intent (kad botas matytų +rep žinutes)</strong>
                    <strong className="text-white block">• Server Members Intent</strong>
                    <strong className="text-white block">• Presence Intent</strong>
                  </li>
                  <li>Paspauskite <strong>Save Changes</strong>.</li>
                </ul>
              </li>
              <li>
                Kairėje meniu eikite į <strong>OAuth2 ➔ URL Generator</strong>:
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Scopes: pažymėkite <code className="bg-black/40 px-1 py-0.5 rounded text-signal font-mono">bot</code> ir <code className="bg-black/40 px-1 py-0.5 rounded text-signal font-mono">applications.commands</code>.</li>
                  <li>Bot Permissions: pažymėkite <strong>Administrator</strong> (arba Manage Channels, Send Messages, Manage Messages, Embed Links, Read Message History, Add Reactions).</li>
                  <li>Nukopijuokite generuotą nuorodą apačioje, atidarykite naršyklėje ir pakvieskite botą į savo serverį!</li>
                </ul>
              </li>
              <li>
                Pridėkite kintamuosius į Netlify (arba .env):
                <div className="mt-1.5 p-2 rounded-xl bg-black/50 font-mono text-[12px] text-live border border-line">
                  DISCORD_BOT_TOKEN="jūsų_boto_tokenas"<br />
                  DISCORD_CLIENT_ID="jūsų_aplikacijos_id"
                </div>
              </li>
              <li>
                Spauskite <strong>„Paleisti Botą“</strong> viršuje! Serveryje parašę <code className="bg-black/50 px-1.5 py-0.5 rounded text-signal font-mono">/ticket-panel</code> iškart gausite paruoštą pirkimo/bilietų skydelį.
              </li>
            </ol>
          </div>
        ) : null}

        {initMsg ? (
          <div className="mt-4 rounded-xl border border-live/30 bg-live/10 p-3 text-[13.5px] text-live">
            {initMsg}
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-[13.5px] text-red-300">
            {error}
          </div>
        ) : null}

        {/* Live Vouch Detection Notice */}
        <div className="mt-6 rounded-2xl border border-signal/40 bg-signal/[0.08] p-4 flex items-start gap-3 text-[13.5px]">
          <span className="text-xl">💜</span>
          <div>
            <strong className="text-white block font-display">Automatinis +rep Atsiliepimų Sekimas Be Jokių Komandų:</strong>
            <p className="text-muted mt-0.5">
              Nariams nereikia jokių komandų! Kai kas nors #vouched kanale parašo pvz. <code className="bg-black/50 px-1.5 py-0.5 rounded font-mono text-signal">+rep @westas_ Random Steam Keys 4x 2€</code>, botas automatiškai uždeda <strong>💜 reakciją</strong>, padidina teigiamų atsiliepimų skaičių ir atsako su oficialiu <strong>✦ Our Reputation</strong> skydeliu!
            </p>
          </div>
        </div>
      </div>

      {/* NO-CODE CUSTOM COMMANDS BUILDER */}
      <div className="panel rounded-3xl p-6 border border-line bg-[#0c0d12]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
          <div>
            <div className="flex items-center gap-2 font-display text-[18px] font-extrabold text-white">
              <Sparkles size={20} className="text-signal" />
              Boto Komandų Kūrimas Be Programavimo (No-Code Command Builder)
            </div>
            <p className="text-[13px] text-muted mt-0.5">
              Sukurkite naujas /slash komandas savo Discord botui tiesiogiai iš šio puslapio!
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateCmd(!showCreateCmd)}
            className="inline-flex items-center gap-2 rounded-xl bg-signal px-4 py-2 font-display text-[13px] font-extrabold text-void hover:opacity-90"
          >
            <Plus size={15} />
            <span>Sukurti Naują Komandą</span>
          </button>
        </div>

        {/* Create Command Form */}
        {showCreateCmd ? (
          <form onSubmit={handleCreateCustomCommand} className="mt-5 rounded-2xl border border-signal/40 bg-void p-5 space-y-4">
            <div className="font-display font-extrabold text-[15px] text-white">
              Naujos /slash komandos parametrai:
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="micro block text-muted/70">Komandos pavadinimas (be pasvirojo brūkšnio) *</label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3.5 top-2.5 text-muted font-mono font-bold">/</span>
                  <input
                    type="text"
                    required
                    value={newCmdName}
                    onChange={(e) => setNewCmdName(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                    placeholder="pvz. rules, kontaktai, tos"
                    className="w-full rounded-xl border border-line bg-panel pl-7 pr-3.5 py-2 font-mono text-[14px] text-signal outline-none focus:border-signal"
                  />
                </div>
                <span className="text-[11px] text-muted">Tik mažosios raidės, skaičiai ir brūkšneliai.</span>
              </div>

              <div>
                <label className="micro block text-muted/70">Komandos aprašymas (matomas Discord&apos;e) *</label>
                <input
                  type="text"
                  required
                  value={newCmdDesc}
                  onChange={(e) => setNewCmdDesc(e.target.value)}
                  placeholder="pvz. Oficialios Cw-Shop pirkimo ir elgesio taisyklės"
                  className="mt-1.5 w-full rounded-xl border border-line bg-panel px-3.5 py-2 text-[14px] outline-none focus:border-signal"
                />
              </div>
            </div>

            <div>
              <label className="micro block text-muted/70">Boto atsakymo tekstas *</label>
              <textarea
                required
                rows={3}
                value={newCmdResponse}
                onChange={(e) => setNewCmdResponse(e.target.value)}
                placeholder="Įrašykite tekstą, nuorodas arba instrukcijas, kuriomis botas atsakys į komandą..."
                className="mt-1.5 w-full resize-none rounded-xl border border-line bg-panel px-3.5 py-2.5 text-[14px] outline-none focus:border-signal"
              />
            </div>

            <div className="flex flex-wrap items-center gap-6 text-[13px] text-ink">
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={newCmdAsEmbed}
                  onChange={(e) => setNewCmdAsEmbed(e.target.checked)}
                  className="rounded border-line"
                />
                <span>Atsakyti stilingu violetiniu Embed rėmeliu</span>
              </label>

              <label className="inline-flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={newCmdEphemeral}
                  onChange={(e) => setNewCmdEphemeral(e.target.checked)}
                  className="rounded border-line"
                />
                <span>Matoma tik komandą iškvietusiam nariui (Ephemeral)</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateCmd(false)}
                className="rounded-xl border border-line px-4 py-2 text-[13px] text-muted hover:text-ink"
              >
                Atšaukti
              </button>
              <button
                type="submit"
                disabled={creatingCmd}
                className="inline-flex items-center gap-1.5 rounded-xl bg-signal px-5 py-2 font-display text-[13.5px] font-extrabold text-void hover:opacity-90 disabled:opacity-50"
              >
                <Check size={15} strokeWidth={3} />
                {creatingCmd ? "Registruojama..." : "Užregistruoti Discord Komandą"}
              </button>
            </div>
          </form>
        ) : null}

        {/* Existing Custom Commands List */}
        <div className="mt-5 space-y-2.5">
          {customCommandsList.length === 0 ? (
            <p className="text-[13px] text-muted py-4 text-center">
              Individualių komandų kol kas nesukurta. Spauskite „Sukurti Naują Komandą“ viršuje.
            </p>
          ) : (
            customCommandsList.map((cmd) => (
              <div
                key={cmd.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-void p-3.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-signal text-[14.5px]">
                      /{cmd.name}
                    </span>
                    <span className="text-[13px] text-white/90">
                      — {cmd.description}
                    </span>
                    {cmd.asEmbed ? (
                      <span className="micro text-[10px] bg-signal/15 text-signal px-2 py-0.5 rounded">
                        Embed
                      </span>
                    ) : null}
                  </div>
                  <div className="text-[12px] text-muted truncate mt-1">
                    {cmd.response}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteCommand(cmd.id, cmd.name)}
                  className="p-2 text-muted hover:text-red-400 rounded-lg hover:bg-white/[0.04]"
                  title="Ištrinti komandą"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Editable Channels & Categories Form */}
      <form onSubmit={handleSaveConfig} className="panel rounded-3xl p-6 border border-line">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2 font-display text-[17px] font-extrabold text-white">
            <Wrench size={18} className="text-signal" />
            Konfigūruoti Boto Kanalus, Reklamos & Bilietų Kategorijas
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl bg-signal px-4 py-2 font-display text-[13px] font-extrabold text-void hover:opacity-90 disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? "Saugoma..." : "Išsaugoti ID nustatymus"}
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="micro block text-muted/70">#vouched Kanalo ID</label>
            <input
              type="text"
              required
              value={vouchChannelId}
              onChange={(e) => setVouchChannelId(e.target.value.trim())}
              className="mt-1.5 w-full rounded-xl border border-line bg-void px-3.5 py-2.5 font-mono text-[13.5px] text-live outline-none focus:border-signal"
            />
            <span className="text-[11px] text-muted">Kanale laukiama +rep atsiliepimų</span>
          </div>

          <div>
            <label className="micro block text-muted/70">#transcripts & Logs Kanalo ID</label>
            <input
              type="text"
              required
              value={transcriptChannelId}
              onChange={(e) => setTranscriptChannelId(e.target.value.trim())}
              className="mt-1.5 w-full rounded-xl border border-line bg-void px-3.5 py-2.5 font-mono text-[13.5px] text-signal outline-none focus:border-signal"
            />
            <span className="text-[11px] text-muted">Čia siunčiami uždarytų bilietų įrašai</span>
          </div>

          <div>
            <label className="micro block text-muted/70">#announce Kanalo ID</label>
            <input
              type="text"
              required
              value={announceChannelId}
              onChange={(e) => setAnnounceChannelId(e.target.value.trim())}
              className="mt-1.5 w-full rounded-xl border border-line bg-void px-3.5 py-2.5 font-mono text-[13.5px] text-warn outline-none focus:border-signal"
            />
            <span className="text-[11px] text-muted">Siunčiami Restocking pranešimai su @everyone</span>
          </div>

          <div>
            <label className="micro block text-muted/70">Purchase Bilietų Kategorijos ID</label>
            <input
              type="text"
              required
              value={buyTickets}
              onChange={(e) => setBuyTickets(e.target.value.trim())}
              className="mt-1.5 w-full rounded-xl border border-line bg-void px-3.5 py-2.5 font-mono text-[13.5px] text-ink outline-none focus:border-signal"
            />
            <span className="text-[11px] text-muted">Kategorija, kur kuriami pirkimo kanalai</span>
          </div>

          <div>
            <label className="micro block text-muted/70">Support Bilietų Kategorijos ID</label>
            <input
              type="text"
              required
              value={supportTickets}
              onChange={(e) => setSupportTickets(e.target.value.trim())}
              className="mt-1.5 w-full rounded-xl border border-line bg-void px-3.5 py-2.5 font-mono text-[13.5px] text-ink outline-none focus:border-signal"
            />
            <span className="text-[11px] text-muted">Kategorija, kur kuriami pagalbos kanalai</span>
          </div>

          <div>
            <label className="micro block text-muted/70">Partnership Bilietų Kategorijos ID</label>
            <input
              type="text"
              required
              value={partnershipTickets}
              onChange={(e) => setPartnershipTickets(e.target.value.trim())}
              className="mt-1.5 w-full rounded-xl border border-line bg-void px-3.5 py-2.5 font-mono text-[13.5px] text-ink outline-none focus:border-signal"
            />
            <span className="text-[11px] text-muted">Kategorija partnerystės bilietams</span>
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="micro block text-signal">Reklamos Kanalų Kategorijos ID (/reklama)</label>
            <input
              type="text"
              required
              value={reklamaCategory}
              onChange={(e) => setReklamaCategory(e.target.value.trim())}
              className="mt-1.5 w-full rounded-xl border border-signal/50 bg-void px-3.5 py-2.5 font-mono text-[13.5px] text-signal outline-none focus:border-signal"
            />
            <span className="text-[11px] text-muted">Kategorija, kurioje botas automatiškai sukuria dedikuotą reklamavimo kanalą (1day/7days/lifetime).</span>
          </div>
        </div>
      </form>
    </div>
  );
}
