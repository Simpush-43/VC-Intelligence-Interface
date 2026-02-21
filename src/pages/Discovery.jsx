import { useState, useEffect, useMemo } from 'react'
import { Search, Filter, Building2, ChevronRight, BookmarkPlus, ChevronUp, ChevronDown } from 'lucide-react'
import { mockCompanies } from '../mockData'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useToast } from '../contexts/Toastcontext'
const PAGE_SIZE = 5

export default function Discovery() {
  const [searchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')
  const [savedSearches, setSavedSearches] = useLocalStorage('saved-searches', [])
  const [sortField, setSortField] = useState(null) // 'company' | 'sector' | 'stage' | null
  const [sortDirection, setSortDirection] = useState('asc') // 'asc' | 'desc'
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [filterSectors, setFilterSectors] = useState([])
  const [filterStages, setFilterStages] = useState([])
  const navigate = useNavigate()
  const { showToast } = useToast()
  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1)
  }, [searchQuery])

  const uniqueSectors = useMemo(() => [...new Set(mockCompanies.map(c => c.sector))].sort(), [])
  const uniqueStages = useMemo(() => [...new Set(mockCompanies.map(c => c.stage))].sort(), [])

  const filteredCompanies = useMemo(() => {
    return mockCompanies.filter(company => {
      const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesSector = filterSectors.length === 0 || filterSectors.includes(company.sector)
      const matchesStage = filterStages.length === 0 || filterStages.includes(company.stage)
      return matchesSearch && matchesSector && matchesStage
    })
  }, [searchQuery, filterSectors, filterStages])
  // Clamp page when total pages shrink (e.g. after filtering)
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredCompanies.length / PAGE_SIZE))
    setPage(p => Math.min(p, maxPage))
  }, [filteredCompanies.length])


  const sortedCompanies = useMemo(() => {
    if (!sortField) return filteredCompanies
    return [...filteredCompanies].sort((a, b) => {
      let aVal, bVal
      if (sortField === 'company') {
        aVal = a.name.toLowerCase()
        bVal = b.name.toLowerCase()
      } else if (sortField === 'sector') {
        aVal = a.sector.toLowerCase()
        bVal = b.sector.toLowerCase()
      } else {
        aVal = a.stage.toLowerCase()
        bVal = b.stage.toLowerCase()
      }
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredCompanies, sortField, sortDirection])

  const totalPages = Math.max(1, Math.ceil(sortedCompanies.length / PAGE_SIZE))
  const paginatedCompanies = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return sortedCompanies.slice(start, start + PAGE_SIZE)
  }, [sortedCompanies, page])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setPage(1)
  }

  const handleCompanyClick = (company) => {
    navigate(`/profile/${company.id}`);
    showToast(`Opening profile for ${company.name}`);
  }

  const handleSaveSearch = () => {
    if (!searchQuery.trim()) return
    if (!savedSearches.includes(searchQuery.trim())) {
      setSavedSearches([...savedSearches, searchQuery.trim()])
    }
    showToast(`Search saved: ${searchQuery.trim()}`);
  }

  const toggleFilterSector = (sector) => {
    setFilterSectors(prev =>
      prev.includes(sector) ? prev.filter(s => s !== sector) : [...prev, sector]
    )
    setPage(1)
  }

  const toggleFilterStage = (stage) => {
    setFilterStages(prev =>
      prev.includes(stage) ? prev.filter(s => s !== stage) : [...prev, stage]
    )
    setPage(1)
  }

  const clearFilters = () => {
    setFilterSectors([])
    setFilterStages([])
    setPage(1)
  }

  const activeFilterCount = filterSectors.length + filterStages.length

  const SortHeader = ({ field, label }) => {
    const isActive = sortField === field
    return (
      <th
        className="px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none"
        onClick={() => handleSort(field)}
      >
        <span className="inline-flex items-center gap-1">
          {label}
          {isActive && (
            sortDirection === 'asc' ? (
              <ChevronUp className="h-3.5 w-3.5 text-blue-500" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-blue-500" />
            )
          )}
        </span>
      </th>
    )
  }

  return (
    <div className="max-w-[1000px] mx-auto p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Discovery</h1>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-gray-200/75 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-[13px] w-64 shadow-sm transition-all"
            />
          </div>
          {searchQuery.trim() && (
            <button
              onClick={handleSaveSearch}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200/75 rounded-lg hover:bg-gray-50 text-[13px] font-medium text-gray-700 shadow-sm transition-colors"
              title="Save this search"
            >
              <BookmarkPlus className="h-3.5 w-3.5" />
              Save Search
            </button>
          )}
          <div className="relative">
            <button
              onClick={() => setShowFilters(f => !f)}
              className={`flex items-center gap-2 px-3 py-2 bg-white border rounded-lg text-[13px] font-medium shadow-sm transition-colors ${
                activeFilterCount > 0
                  ? 'border-blue-300 bg-blue-50/50 text-blue-700 hover:bg-blue-50'
                  : 'border-gray-200/75 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-3.5 w-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-blue-500 text-white text-[11px] font-semibold">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {showFilters && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowFilters(false)}
                  aria-hidden="true"
                />
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-semibold text-gray-800">Filters</span>
                      {activeFilterCount > 0 && (
                        <button
                          onClick={clearFilters}
                          className="text-[12px] font-medium text-blue-600 hover:text-blue-700"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="p-4 border-b border-gray-100">
                      <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Sector</div>
                      <div className="flex flex-wrap gap-1.5">
                        {uniqueSectors.map(sector => (
                          <button
                            key={sector}
                            onClick={() => toggleFilterSector(sector)}
                            className={`px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                              filterSectors.includes(sector)
                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                : 'bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200'
                            }`}
                          >
                            {sector}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Stage</div>
                      <div className="flex flex-wrap gap-1.5">
                        {uniqueStages.map(stage => (
                          <button
                            key={stage}
                            onClick={() => toggleFilterStage(stage)}
                            className={`px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                              filterStages.includes(stage)
                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                : 'bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200'
                            }`}
                          >
                            {stage}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* High-Density Data Table */}
      <div className="bg-white border border-gray-200/75 rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <SortHeader field="company" label="Company" />
              <SortHeader field="sector" label="Sector" />
              <SortHeader field="stage" label="Stage" />
              <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedCompanies.map((company) => (
              <tr
                key={company.id}
                onClick={() => handleCompanyClick(company)}
                className="group hover:bg-gray-50/80 transition-colors cursor-pointer"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <div className="text-[14px] font-medium text-gray-900">{company.name}</div>
                      <div className="text-[12px] text-gray-500 mt-0.5">
                        {company.website.replace('https://', '')}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-[11px] font-medium border border-gray-200/50">
                    {company.sector}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-[13px] text-gray-600">{company.stage}</td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-200/50">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                    {company.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-600 transition-colors inline-block" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between">
          <span className="text-[13px] text-gray-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
