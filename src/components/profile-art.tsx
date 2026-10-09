import { useId } from 'react';

export const ART_NAMES = ['Órbita 01', 'Cromo 02', 'Trama 03', 'Fluxo 04', 'Prisma 05', 'Eco 06', 'Campo 07', 'Pulso 08', 'Ruído 09'];

export function ProfileArt({ index }: { index: number }) {
  const id = useId().replace(/:/g, '');
  return <span className={`profile-avatar-art art-${index}`}><svg viewBox="0 0 240 240" role="img" aria-label={ART_NAMES[index]}>
    <defs><linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="1"><stop className="art-stop-dark" offset="0"/><stop className="art-stop-light" offset=".48"/><stop className="art-stop-dark" offset=".65"/><stop className="art-stop-light" offset="1"/></linearGradient><radialGradient id={`${id}-field`}><stop className="art-stop-color"/><stop className="art-stop-dark" offset="1"/></radialGradient><filter id={`${id}-noise`}><feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".15"/></feComponentTransfer><feBlend in="SourceGraphic" mode="soft-light"/></filter></defs>
    <rect width="240" height="240" className="art-ground"/>
    {index === 0 && <g fill="none" stroke={`url(#${id}-metal)`}>{Array.from({length: 12}, (_,i) => <circle key={i} cx="120" cy="120" r={14+i*8} strokeWidth={3}/>)}</g>}
    {index === 1 && <g fill={`url(#${id}-metal)`} transform="rotate(-25 120 120)"><ellipse cx="120" cy="120" rx="90" ry="54"/><ellipse cx="120" cy="120" rx="66" ry="33" className="art-ground"/><ellipse cx="120" cy="120" rx="38" ry="85" opacity=".65"/></g>}
    {index === 2 && <g className="art-line" fill="none">{Array.from({length: 16},(_,i)=><path key={i} d={`M${i*18-30} 0 L${240-i*7} 240 M0 ${i*18} L240 ${i*7}`} strokeWidth=".8"/>)}<circle cx="120" cy="120" r="75" strokeWidth="2"/></g>}
    {index === 3 && <g fill="none" stroke={`url(#${id}-metal)`}>{Array.from({length: 16},(_,i)=><path key={i} d={`M-20 ${40+i*10} C70 ${-60+i*14},170 ${300-i*14},260 ${60+i*9}`} strokeWidth="3"/>)}</g>}
    {index === 4 && <g fill={`url(#${id}-metal)`}><path d="M120 20 222 196 18 196Z"/><path d="m120 65 70 115H50Z" className="art-ground"/><path d="m120 110 34 56H86Z" className="art-color"/></g>}
    {index === 5 && <g fill="none" className="art-line">{Array.from({length:12},(_,i)=><rect key={i} x={18+i*7} y={18+i*7} width={204-i*14} height={204-i*14} rx={i*2} strokeWidth="2" transform={`rotate(${i*4} 120 120)`}/>)}</g>}
    {index === 6 && <><rect width="240" height="240" fill={`url(#${id}-field)`}/><g className="art-line" opacity=".7">{Array.from({length:10},(_,i)=><path key={i} d={`M0 ${i*24}h240 M${i*24} 0v240`} strokeWidth=".5"/>)}</g><circle cx="120" cy="120" r="58" fill="none" stroke={`url(#${id}-metal)`} strokeWidth="10"/></>}
    {index === 7 && <g fill={`url(#${id}-metal)`}>{Array.from({length:15},(_,i)=><rect key={i} x={18+i*14} y={120-(20+Math.sin(i*.5)*60)/2} width="6" height={20+Math.sin(i*.5)*60} rx="3"/>)}</g>}
    {index === 8 && <g className="art-line" fill="none">{Array.from({length:20},(_,i)=><circle key={i} cx={80+i*4} cy={110+Math.sin(i)*12} r={20+i*4} strokeWidth="1"/>)}<path d="M20 195H220M20 202H155" strokeWidth="2"/></g>}
    <rect width="240" height="240" fill="transparent" filter={`url(#${id}-noise)`}/>
  </svg></span>;
}