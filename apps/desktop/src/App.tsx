import { useEffect, useMemo, useState } from 'react';
import type { MatchOutcome, Tournament } from '@swiss-duelist/engine';
import { computeStandings, createTournament, pairRound, roundsForPlayerCount } from '@swiss-duelist/engine';
import { listTournaments, loadTournament, saveTournament, deleteTournament, type TournamentSummary } from './db/repo';
import { initDb } from './db/db';
import { fireSideCannons } from './lib/confetti';
import { IconHome, IconPlus, IconSettings, IconTrophy } from './components/icons';
import Home from './screens/Home';
import TournamentsList from './screens/TournamentsList';
import CreateTournament, { type Draft } from './screens/CreateTournament';
import TournamentView from './screens/TournamentView';
import FinalView from './screens/FinalView';
import Config from './screens/Config';

type View = 'home' | 'create' | 'tournament' | 'final' | 'config' | 'torneos';

/** Empareja la ronda actual y la añade a los matches (mutación in-place del clon). */
function pairNextRound(t: Tournament): void {
  const r = pairRound(t.players, t.matches, t.currentRound);
  t.matches.push(
    ...r.matches.map((p, i) => ({
      id: crypto.randomUUID(),
      round: t.currentRound,
      table: i + 1,
      player1Id: p.player1Id,
      player2Id: p.player2Id,
      outcome: null,
    })),
  );
  if (r.bye) {
    t.matches.push({
      id: crypto.randomUUID(),
      round: t.currentRound,
      table: 0,
      player1Id: r.bye,
      player2Id: null,
      outcome: 'BYE',
    });
  }
}

export default function App() {
  const [view, setView] = useState<View>('home');
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [summaries, setSummaries] = useState<TournamentSummary[]>([]);
  const [clockOn, setClockOn] = useState(true);
  const [confettiOn, setConfettiOn] = useState(true);
  const [roundMinutes, setRoundMinutes] = useState(50);
  const [draft, setDraft] = useState<Draft>({ step: 1, name: '', players: [] });

  useEffect(() => {
    void (async () => {
      await initDb();
      setSummaries(await listTournaments());
    })();
  }, []);

  const standings = useMemo(
    () => (tournament ? computeStandings(tournament.players, tournament.matches) : []),
    [tournament],
  );

  function refreshSummaries() {
    void listTournaments().then(setSummaries);
  }

  function mutate(fn: (t: Tournament) => void): void {
    if (!tournament) return;
    const next = structuredClone(tournament);
    fn(next);
    setTournament(next);
    void saveTournament(next).then(refreshSummaries);
  }

  function startTournament(name: string, names: string[]): void {
    const t = createTournament(crypto.randomUUID(), name, roundsForPlayerCount(names.length));
    t.players = names.map((n) => ({ id: crypto.randomUUID(), name: n }));
    t.status = 'swiss';
    pairNextRound(t);
    setTournament(t);
    setDraft({ step: 1, name: '', players: [] });
    setView('tournament');
    void saveTournament(t).then(refreshSummaries);
  }

  function recordResult(matchId: string, outcome: MatchOutcome): void {
    mutate((t) => {
      const m = t.matches.find((x) => x.id === matchId);
      if (m) m.outcome = outcome;
    });
  }

  function nextRound(): void {
    if (!tournament) return;
    if (tournament.currentRound >= tournament.totalRounds) {
      mutate((t) => {
        t.status = 'finished';
        t.finishedAt = new Date().toISOString();
      });
      if (confettiOn) setTimeout(() => fireSideCannons(), 150);
      setView('final');
    } else {
      mutate((t) => {
        t.currentRound += 1;
        pairNextRound(t);
      });
    }
  }

  function dropPlayer(playerId: string): void {
    mutate((t) => {
      const p = t.players.find((x) => x.id === playerId);
      if (p) p.dropped = true;
    });
  }

  function openTournament(id: string): void {
    void (async () => {
      const t = await loadTournament(id);
      if (t) {
        setTournament(t);
        setView(t.status === 'finished' ? 'final' : 'tournament');
      }
    })();
  }

  function saveAndClose(): void {
    if (tournament) void saveTournament(tournament).then(refreshSummaries);
    setView('home');
  }

  function handleDelete(id: string): void {
    void deleteTournament(id).then(() => {
      if (tournament?.id === id) setTournament(null);
      refreshSummaries();
    });
  }

  function discardAndClose(): void {
    if (tournament) handleDelete(tournament.id);
    setView('home');
  }

  function goTo(id: View): void {
    if (id === 'torneos') {
      const active = summaries.filter((s) => s.status !== 'finished');
      if (active.length === 1) {
        void openTournament(active[0].id);
        return;
      }
      setView('torneos');
      return;
    }
    setView(id);
  }

  function isActive(id: View): boolean {
    if (id === 'torneos') return view === 'torneos' || view === 'tournament' || view === 'final';
    return view === id;
  }

  const nav: { id: View; label: string; Icon: typeof IconHome; disabled?: boolean }[] = [
    { id: 'home', label: 'Inicio', Icon: IconHome },
    { id: 'torneos', label: 'Torneos', Icon: IconTrophy, disabled: summaries.length === 0 },
    { id: 'create', label: 'Nuevo torneo', Icon: IconPlus },
    { id: 'config', label: 'Ajustes', Icon: IconSettings },
  ];

  return (
    <div className="app">
      <aside className="side">
        <div className="logo">
          <img src="/logo.png" alt="Swiss Duelist" className="logo-img" />
          <div><b>Swiss Duelist</b><small>Torneos suizos</small></div>
        </div>
        <nav className="anav">
          <div className="anl">Secciones</div>
          {nav.map((n) => (
            <button
              key={n.id}
              className={`ai ${isActive(n.id) ? 'on' : ''}`}
              disabled={n.disabled}
              onClick={() => goTo(n.id)}
            >
              <n.Icon size={16} />
              {n.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="main">
        <div className="topbar">
          <div className="tt">Swiss Duelist<small>gestor de torneos suizos · v2.5</small></div>
          <span className="sp" />
        </div>

        <div className="content">
          <div className="view-fade" key={view}>
            {view === 'home' && (
              <Home
                summaries={summaries}
                onCreate={() => setView('create')}
                onOpen={openTournament}
                onDelete={handleDelete}
              />
            )}
            {view === 'torneos' && (
              <TournamentsList
                summaries={summaries}
                onCreate={() => setView('create')}
                onOpen={openTournament}
              />
            )}
            {view === 'create' && (
              <CreateTournament
                draft={draft}
                onDraftChange={setDraft}
                onStart={startTournament}
                onBack={() => setView('home')}
              />
            )}
            {view === 'tournament' && tournament && tournament.status !== 'finished' && (
              <TournamentView
                tournament={tournament}
                standings={standings}
                clockOn={clockOn}
                roundMinutes={roundMinutes}
                onRecordResult={recordResult}
                onNextRound={nextRound}
                onDropPlayer={dropPlayer}
              />
            )}
            {view === 'final' && tournament && (
              <FinalView tournament={tournament} standings={standings} onSave={saveAndClose} onDiscard={discardAndClose} />
            )}
            {view === 'config' && (
              <Config
                clockOn={clockOn}
                onToggleClock={setClockOn}
                confettiOn={confettiOn}
                onToggleConfetti={setConfettiOn}
                roundMinutes={roundMinutes}
                onRoundMinutesChange={setRoundMinutes}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
