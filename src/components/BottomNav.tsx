import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', label: 'Village', icon: '🏘️', end: true },
  { to: '/catalog', label: 'Catalogue', icon: '🛋️', end: false },
  { to: '/budget', label: 'Budget', icon: '💰', end: false },
  { to: '/settings', label: 'Réglages', icon: '⚙️', end: false },
]

export function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-20 flex justify-around border-t-4 border-[var(--wood)] bg-[var(--parchment)] py-2 shadow-[0_-4px_12px_rgba(0,0,0,0.12)]">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-xs font-bold transition-colors ${
              isActive ? 'text-[var(--leaf-dark)]' : 'text-[var(--ink-soft)]'
            }`
          }
        >
          <span className="text-2xl">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
