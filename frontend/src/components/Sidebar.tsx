interface SidebarProps {
  currentView: 'calendar'
}

export default function Sidebar({ currentView }: SidebarProps) {
  return (
    <aside className="w-56 min-h-screen bg-[#111111] border-r border-[#2a2a2a] flex flex-col px-3 py-6 shrink-0">
      {/* Logo / título */}
      <div className="flex items-center gap-2 px-2 mb-8">
        <span className="text-2xl">📅</span>
        <span className="font-semibold text-white text-lg tracking-tight">
          TodoCalendar
        </span>
      </div>

      {/* Navegação */}
      <nav className="flex flex-col gap-1">
        <NavItem
          icon="🗓️"
          label="Calendário"
          active={currentView === 'calendar'}
        />
      </nav>

      {/* Rodapé */}
      <div className="mt-auto px-2 text-xs text-gray-600">
        v0.1.0
      </div>
    </aside>
  )
}

function NavItem({
  icon,
  label,
  active,
}: {
  icon: string
  label: string
  active: boolean
}) {
  return (
    <button
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm w-full text-left transition-colors ${
        active
          ? 'bg-[#2c2c2c] text-white font-medium'
          : 'text-gray-400 hover:bg-[#222] hover:text-gray-200'
      }`}
    >
      <span>{icon}</span>
      {label}
    </button>
  )
}
