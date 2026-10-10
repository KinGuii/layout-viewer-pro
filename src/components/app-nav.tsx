import { Link } from '@tanstack/react-router';
import { Compass, Disc3, Headphones, UserRound } from 'lucide-react';

const ITEMS = [
  { to: '/', label: 'Diário', Icon: Disc3 },
  { to: '/dj', label: 'DJ Desk', Icon: Headphones },
  { to: '/descobrir', label: 'Descobrir', Icon: Compass },
  { to: '/perfil', label: 'Perfil', Icon: UserRound },
] as const;

export function AppNav() {
  return <nav className="app-nav" aria-label="Navegação principal">
    <Link to="/" className="app-nav-logo" aria-label="Music Desk — ir para Diário">Music Desk <span>PRO</span></Link>
    <ul>{ITEMS.map(({ to, label, Icon }) => <li key={to}><Link to={to} activeOptions={{ exact: true }} activeProps={{ 'aria-current': 'page' }}><Icon size={20} /><span>{label}</span></Link></li>)}</ul>
  </nav>;
}
