import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, AudioLines, Disc3, Headphones, Music2, Radio, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { camelotKey, transitionMatches, type DJTrack } from "@/lib/dj-library";

function Cover({ track, large = false }: { track: DJTrack; large?: boolean }) {
  return <div className={large ? "dj-cover dj-cover-large" : "dj-cover"}>{track.cover ? <img src={track.cover} alt={`Capa de ${track.title}`} onError={(event) => { event.currentTarget.hidden = true; }} /> : <Disc3 aria-hidden="true" />}</div>;
}

function KeyBadge({ value }: { value: string }) {
  const key = camelotKey(value);
  return <span className={`dj-key dj-key-${key ? (parseInt(key) - 1) % 6 : "unknown"}`} title={value || "Tom não cadastrado"}>{key ?? (value || "—")}</span>;
}

function Energy({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted-foreground" title="Energia não cadastrada">—</span>;
  return <span className="dj-energy" aria-label={`Energia ${value} de 5`}>{[1, 2, 3, 4, 5].map(n => <i key={n} data-active={n <= value} />)}<small>{value}</small></span>;
}

export function DJDesk({ tracks, onSelect }: { tracks: DJTrack[]; onSelect:(track:DJTrack)=>void }) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sort, setSort] = useState<"title" | "bpm">("title");
  const [descending, setDescending] = useState(false);
  const [tolerance, setTolerance] = useState(8);
  const selected = tracks.find(track => track.id === selectedId);
  const matches = useMemo(() => selected ? transitionMatches(selected, tracks, tolerance) : [], [selected, tracks, tolerance]);
  const visible = useMemo(() => tracks.filter(track => `${track.title} ${track.artist} ${track.key} ${track.elements.join(" ")}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())).sort((a, b) => {
    const difference = sort === "title" ? a.title.localeCompare(b.title, "pt-BR") : (a.bpm ?? Infinity) - (b.bpm ?? Infinity);
    return descending ? -difference : difference;
  }), [tracks, query, sort, descending]);
  const matchIds = new Set(matches.map(track => track.id));
  const bpms = tracks.flatMap(track => track.bpm === null ? [] : [track.bpm]);
  function changeSort(column: "title" | "bpm") { if (sort === column) setDescending(!descending); else { setSort(column); setDescending(false); } }
  function selectTrack(track:DJTrack){setSelectedId(track.id);onSelect(track);}
  return <div className="dj-desk">
    <header className="dj-heading">
      <div><div className="dj-eyebrow"><Headphones size={14} /> PERFORMANCE WORKSPACE</div><h1>DJ Desk<span className="dj-live-dot" /></h1><p>Seu acervo. Outra frequência.</p></div>
      <div className="dj-library-stats"><div><strong>{tracks.length.toString().padStart(2, "0")}</strong><span>FAIXAS NO ACERVO</span></div><div><strong>{bpms.length ? `${Math.min(...bpms)}–${Math.max(...bpms)}` : "—"}</strong><span>FAIXA DE BPM</span></div></div>
    </header>
    <div className="dj-workspace-content">
      <section className="dj-collection" aria-label="Acervo DJ">
        <div className="dj-toolbar"><div className="dj-collection-label"><Music2 size={17} /><h2>Acervo</h2><span>{visible.length}</span></div><label className="dj-search"><Search size={16} /><input aria-label="Buscar no acervo" type="search" placeholder="Buscar faixa, artista ou tom" value={query} onChange={event => setQuery(event.target.value)} /></label></div>
        {selected && <div className="dj-match-strip"><Radio size={14} /><span>{matches.length} {matches.length === 1 ? "transição compatível" : "transições compatíveis"} com <strong>{selected.title}</strong></span><Button variant="ghost" size="icon" title="Limpar seleção" aria-label="Limpar seleção" onClick={() => setSelectedId(null)}><X /></Button></div>}
        <div className="dj-table-scroll"><table className="dj-table"><thead><tr><th className="dj-index">#</th><th><Button variant="ghost" size="sm" onClick={() => changeSort("title")}>Faixa / Artista {sort === "title" ? descending ? <ArrowDown /> : <ArrowUp /> : <ArrowUpDown />}</Button></th><th><Button variant="ghost" size="sm" onClick={() => changeSort("bpm")}>BPM {sort === "bpm" ? descending ? <ArrowDown /> : <ArrowUp /> : <ArrowUpDown />}</Button></th><th>Tom</th><th>Energia</th><th>Elementos</th><th>Dica de mixagem</th></tr></thead><tbody>{visible.map((track, index) => <tr key={track.id} data-selected={track.id === selectedId} data-match={matchIds.has(track.id)} onClick={() => selectTrack(track)}>
          <td className="dj-index">{track.id === selectedId ? <AudioLines size={16} /> : String(index + 1).padStart(2, "0")}</td>
          <td><div className="dj-track-cell"><Cover track={track} /><div><Button variant="ghost" className="dj-track-title" onClick={(event) => { event.stopPropagation(); selectTrack(track); }}>{track.title}</Button><span>{track.artist}</span></div>{matchIds.has(track.id) && <span className="dj-match-indicator" title="BPM e harmonia compatíveis"><Radio size={13} /></span>}</div></td>
          <td><span className="dj-bpm">{track.bpm ?? "—"}</span></td><td><KeyBadge value={track.key} /></td><td><Energy value={track.energy} /></td>
          <td><div className="dj-tags">{track.elements.length ? track.elements.map(tag => <span key={tag}>{tag}</span>) : <span className="dj-missing">—</span>}</div></td><td className="dj-mix-tip">{track.mixTip || <span className="dj-missing">—</span>}</td>
        </tr>)}</tbody></table></div>
        {!visible.length && <div className="dj-empty"><Disc3 size={30} /><h3>{query ? "Nenhuma faixa encontrada" : "Seu acervo está vazio"}</h3><p>{query ? "Nenhum resultado para esta busca." : "As faixas da Curadoria aparecerão aqui."}</p></div>}
        <footer className="dj-table-footer"><span>{visible.length} de {tracks.length} faixas</span><span><span className="dj-live-dot" /> ACERVO COMPARTILHADO</span></footer>
      </section>
      {selected && <aside className="dj-radar" aria-label="Radar de transição"><div className="dj-radar-heading"><div><Radio size={18} /><h2>Radar de transição</h2></div><Button variant="ghost" size="icon" title="Fechar radar" aria-label="Fechar radar" onClick={() => setSelectedId(null)}><X /></Button></div>
        <div className="dj-source"><div className="dj-eyebrow">FAIXA DE ORIGEM</div><div className="dj-source-track"><Cover track={selected} large /><div><h3>{selected.title}</h3><p>{selected.artist}</p><div className="dj-source-specs"><strong>{selected.bpm ?? "—"} <small>BPM</small></strong><KeyBadge value={selected.key} /></div></div></div></div>
        <div className="dj-tolerance"><label htmlFor="bpm-tolerance">Proximidade de BPM <strong>±{tolerance}</strong></label><input id="bpm-tolerance" aria-label="Tolerância de BPM" type="range" min="1" max="15" value={tolerance} onChange={event => setTolerance(Number(event.target.value))} /><div><span>1 BPM</span><span>15 BPM</span></div></div>
        <div className="dj-radar-results"><div className="dj-results-label">BEAT MATCH + HARMONIA <span>{matches.length}</span></div>{matches.map(track => <Button key={track.id} variant="ghost" className="dj-match-track" onClick={() => selectTrack(track)}><Cover track={track} /><span className="dj-match-name"><strong>{track.title}</strong><small>{track.artist}</small><span>{track.bpm} BPM · {((track.bpm ?? 0) - (selected.bpm ?? 0)) > 0 ? "+" : ""}{Math.round(((track.bpm ?? 0) - (selected.bpm ?? 0)) * 10) / 10} BPM</span></span><KeyBadge value={track.key} /></Button>)}
          {!matches.length && <div className="dj-radar-empty"><Radio size={28} /><h3>{selected.bpm === null || !camelotKey(selected.key) ? "Dados técnicos incompletos" : "Nenhuma combinação nesta faixa"}</h3><p>{selected.bpm === null || !camelotKey(selected.key) ? "BPM e tom Camelot são necessários para comparar esta faixa." : `Nenhuma faixa do acervo combina em harmonia e andamento dentro de ±${tolerance} BPM.`}</p></div>}
        </div>{selected.review && <div className="dj-sensory-note"><span className="dj-eyebrow">DO SEU DIÁRIO</span><p>{selected.review}</p></div>}
      </aside>}
    </div>
  </div>;
}