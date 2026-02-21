import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import LoadingScreen from './components/LoadingScreen'
import Discovery from './pages/Discovery'
import Profile from './pages/Profile'
import GlobalSearch from './components/GlobalSearch'
import Lists from './pages/Lists'
import SavedSearches from './pages/SavedSearches'
import { ToastProvider } from './contexts/Toastcontext'
import NotFound from './pages/NotFound'
import ErrorBoundary from './components/ErrorBoundary'
const LOADING_DURATION_MS = 1800

function App() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), LOADING_DURATION_MS)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <LoadingScreen visible={!isLoaded} />
      <ErrorBoundary>
        <BrowserRouter>
          <ToastProvider>
            <GlobalSearch />
            <div className="flex h-screen overflow-hidden bg-[#FAFAFA] font-sans text-gray-900">
              {/* Sleek Dark Sidebar */}
              <Sidebar />

              {/* Main Content Area */}
              <main className="flex-1 overflow-y-auto">
                <Routes>
                  <Route path="/" element={<Discovery />} />
                  <Route path="/companies" element={<Discovery />} />
                  <Route path="/profile/:id" element={<Profile />} />
                  <Route path="/lists" element={<Lists />} />
                  <Route path="/saved-searches" element={<SavedSearches />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </ToastProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </>
  )
}

// Sidebar component with navigation
function Sidebar() {
  const location = useLocation()

  const navItems = [
    { path: '/companies', label: 'Discover' },
    { path: '/lists', label: 'My Lists' },
    { path: '/saved-searches', label: 'Saved Searches' },
  ]

  return (
    <aside className="w-[260px] bg-[#0A0A0B] flex flex-col border-r border-gray-800/50 flex-shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-gray-800/50">
        <Link to="/companies" className="flex items-center gap-2">
          <div className="bg-blue-500/10 p-1.5 rounded-md">
            <Sparkles className="h-4 w-4 text-blue-400" />
          </div>
          <span className="text-gray-100 font-medium tracking-tight text-sm">VC Scout UI</span>
        </Link>
        {/* NEW SHORTCUT BADGE */}
        <div className="flex items-center gap-1 text-[10px] font-medium text-gray-400 bg-gray-800/50 px-1.5 py-0.5 mx-auto rounded border border-gray-700/50">
          <kbd className="font-sans">⌘</kbd><kbd className="font-sans">K</kbd>
        </div>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path === '/companies' && location.pathname === '/')
          return (
            <NavItem key={item.path} to={item.path} active={isActive}>
              {item.label}
            </NavItem>
          )
        })}
      </nav>
    </aside>
  )
}

// Helper component for the Sidebar navigation
function NavItem({ children, to, active }) {
  return (
    <Link
      to={to}
      className={`block px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${active
          ? 'bg-gray-800/80 text-white'
          : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
        }`}
    >
      {children}
    </Link>
  )
}

export default App
