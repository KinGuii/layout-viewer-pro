export interface Activity { day: string; hour: number; trackId: string }
export interface MusicEvent { id: string; name: string; date: string; location: string }
export function localDay(date: Date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
export function streakDays(days: string[], now: Date) {
 const set = new Set(days); const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
 if (!set.has(localDay(cursor))) cursor.setDate(cursor.getDate()-1);
 let count=0; while(set.has(localDay(cursor))) { count++; cursor.setDate(cursor.getDate()-1); } return count;
}
export function weekDays(now: Date) { const start=new Date(now.getFullYear(),now.getMonth(),now.getDate());start.setDate(start.getDate()-((start.getDay()+6)%7));return Array.from({length:7},(_,i)=>{const day=new Date(start);day.setDate(day.getDate()+i);return localDay(day);}); }
export function badges(tracks: { sample?: boolean; review?: string; createdAt?: string }[], activity: Activity[]) {
 const own=tracks.filter(t=>!t.sample);
 return [own.length>0, activity.some(a=>a.hour>=22||a.hour<5)||own.some(t=>{if(!t.createdAt)return false;const hour=new Date(t.createdAt).getHours();return hour>=22||hour<5;}),own.some(t=>Boolean(t.review?.trim()))];
}
const facts = [
 {category:'SYNTHS CLÁSSICOS',title:'O baixo que encontrou outra pista.',text:'Lançado em 1981 para simular um baixista, o Roland TB-303 não encontrou seu público original. Anos depois, suas linhas ressonantes se tornaram uma assinatura do acid house.',source:'Roland — história do TB-303',url:'https://www.roland.com/global/promos/roland50th/303/'},
 {category:'PRODUÇÃO',title:'Um erro também pode virar linguagem.',text:'O som de um sampler depende de sua resolução e frequência de amostragem. As limitações de máquinas antigas, como o E-mu SP-1200, ajudaram a definir uma textura reconhecível no hip-hop e na música eletrônica.',source:'Smithsonian — instrumentos eletrônicos',url:'https://www.si.edu/search?edan_q=SP-1200'},
 {category:'ÁLBUNS HISTÓRICOS',title:'Uma viagem sem sair do fone.',text:'Ambient 1: Music for Airports, de Brian Eno, foi lançado em 1978. Suas peças exploram repetição e sobreposição, propondo música que pode acolher tanto a atenção quanto a escuta de fundo.',source:'Brian Eno — discografia',url:'https://www.brian-eno.net/'},
 {category:'BASTIDORES',title:'Quando a cidade vira instrumento.',text:'Em 1977, o Kraftwerk lançou Trans-Europe Express. Ritmos mecânicos e uma viagem ferroviária imaginada ajudaram a consolidar uma linguagem eletrônica que influenciou electro e hip-hop.',source:'Kraftwerk — catálogo',url:'https://www.kraftwerk.com/'}
];
export function dailyFact(day: string) { const n=Date.parse(`${day}T12:00:00Z`);const fact=facts[(Math.floor(n/86400000)%facts.length+facts.length)%facts.length];if(!fact)throw new Error('Invalid curiosity date');return fact; }
function escapeICS(value: string) {return value.replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');}
export function calendarFile(event: MusicEvent) { const date=event.date.replace(/-/g,'');const end=new Date(`${event.date}T12:00:00Z`);end.setUTCDate(end.getUTCDate()+1);return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Music Desk Pro//Perfil//PT-BR','BEGIN:VEVENT',`UID:${escapeICS(event.id)}@musicdesk`,`DTSTAMP:${date}T120000Z`,`DTSTART;VALUE=DATE:${date}`,`DTEND;VALUE=DATE:${end.toISOString().slice(0,10).replace(/-/g,'')}`,`SUMMARY:${escapeICS(event.name)}`,`LOCATION:${escapeICS(event.location)}`,'END:VEVENT','END:VCALENDAR',''].join('\r\n'); }
