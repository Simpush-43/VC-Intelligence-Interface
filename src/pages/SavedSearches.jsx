import { useLocalStorage } from '../hooks/useLocalStorage'
import { Search, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function SavedSearches() {
  const navigate = useNavigate()
  const [savedSearches, setSavedSearches] = useLocalStorage('saved-searches', [])

  const handleDelete = (e, index) => {
    e.stopPropagation()
    setSavedSearches(savedSearches.filter((_, i) => i !== index))
  }

  const handleSearchClick = (query) => {
    navigate(`/companies?search=${encodeURIComponent(query)}`)
  }

  return (
    <div className="max-w-[1000px] mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Saved Searches</h1>
        <p className="text-sm text-gray-500 mt-2">
          Your saved search queries for quick access
        </p>
      </div>

      {savedSearches.length === 0 ? (
        <div className="bg-white border border-gray-200/75 rounded-xl shadow-sm p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No saved searches</h3>
              <p className="text-sm text-gray-500">
                Save search queries from the Discovery page to see them here.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200/75 rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {savedSearches.map((query, index) => (
              <div
                key={index}
                onClick={() => handleSearchClick(query)}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Search className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">{query}</span>
                </div>
                <button
                  onClick={(e) => handleDelete(e, index)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Delete search"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
