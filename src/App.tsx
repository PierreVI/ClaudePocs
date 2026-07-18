import { HashRouter, Routes, Route } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import { VillagePage } from './pages/VillagePage'
import { NewSpacePage } from './pages/NewSpacePage'
import { EditSpacePage } from './pages/EditSpacePage'
import { SpacePage } from './pages/SpacePage'
import { CatalogPage } from './pages/CatalogPage'
import { BudgetPage } from './pages/BudgetPage'
import { SettingsPage } from './pages/SettingsPage'

function App() {
  return (
    <HashRouter>
      <div className="flex min-h-0 flex-1 flex-col">
        <main className="flex-1 overflow-y-auto pb-4">
          <Routes>
            <Route path="/" element={<VillagePage />} />
            <Route path="/room/new" element={<NewSpacePage />} />
            <Route path="/room/:id/edit" element={<EditSpacePage />} />
            <Route path="/room/:id" element={<SpacePage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/budget" element={<BudgetPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </HashRouter>
  )
}

export default App
