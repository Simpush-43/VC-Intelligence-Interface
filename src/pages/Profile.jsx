import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Zap, Bookmark, BookmarkCheck, Sparkles, CheckCircle2, Loader2 } from 'lucide-react'
import { mockCompanies } from '../mockData'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useToast } from '../contexts/Toastcontext'
import NotFound from './NotFound'
export default function Profile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const companyId = parseInt(id, 10)

  const company = mockCompanies.find(c => c.id === companyId)

  // LocalStorage hooks
  const [myList, setMyList] = useLocalStorage('my-vc-list', [])
  const [notes, setNotes] = useLocalStorage(`notes-${companyId}`, '')
  const [enrichedData, setEnrichedData] = useState(null)
  const [isEnriching, setIsEnriching] = useState(false)

  // Check if company is saved
  const isSaved = myList.some(item => item.id === companyId)

  // Load enriched data from localStorage on mount
  useEffect(() => {
    if (company) {
      const stored = localStorage.getItem(`enrich-${companyId}`)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setEnrichedData(parsed.result)
        } catch (error) {
          console.warn('Error parsing stored enrich data:', error)
          showToast(`Error parsing stored enrich data: ${error}`);
        }
      }
    }
  }, [companyId, company])

  // Handle save/remove from list
  const handleSaveToList = () => {
    if (isSaved) {
      setMyList(myList.filter(item => item.id !== companyId))
      showToast(`${company.name} removed from list`);
    } else {
      showToast(`${company.name} added to list`);
      setMyList([...myList, company])
    }
  }

  // Handle live enrich
  const handleLiveEnrich = async () => {
    if (!company) {
      showToast(`Company not found`);
      return;
    }

    setIsEnriching(true)

    try {
      const response = await fetch('/api/enrich', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: company.website }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      const enrichPayload = {
        result: data.result,
        url: data.url,
        timestamp: new Date().toISOString(),
      }

      // Save to localStorage
      localStorage.setItem(`enrich-${companyId}`, JSON.stringify(enrichPayload))

      setEnrichedData(data.result)
      //  Toast notification
      showToast(`${company.name} enriched`);
    } catch (error) {
      console.error('Error enriching:', error)
      showToast(`Error enriching ${company.name}. Please try again.`);
    } finally {
      setIsEnriching(false)
    }
  }

  if (!company) {
    return (
      <NotFound message='The company profile you are trying to view does not exist or has been removed.' />
    )
  }

  // Load stored enrich data to get timestamp
  const storedEnrich = localStorage.getItem(`enrich-${companyId}`)
  let enrichTimestamp = null
  let enrichUrl = company.website
  if (storedEnrich) {
    try {
      const parsed = JSON.parse(storedEnrich)
      enrichTimestamp = parsed.timestamp
      enrichUrl = parsed.url || company.website
    } catch (e) {
      // Ignore
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Back Button */}
      <Link
        to="/companies"
        className="text-gray-500 hover:text-gray-900 mb-6 flex items-center gap-1.5 transition-colors text-sm font-medium inline-block"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Companies
      </Link>

      {/* Header Card */}
      <div className="bg-white border border-gray-200/75 rounded-2xl p-8 mb-6 shadow-sm flex justify-between items-start">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-3">
            {company.name}
          </h1>
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 flex items-center gap-1 hover:text-blue-700 transition-colors text-sm font-medium"
          >
            {company.website}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
        <div className="flex items-center gap-3">
          {/* Save to List Button */}
          <button
            onClick={handleSaveToList}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm font-medium shadow-sm ${isSaved
              ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
              : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="h-4 w-4" />
                Saved
              </>
            ) : (
              <>
                <Bookmark className="h-4 w-4" />
                Save to List
              </>
            )}
          </button>

          {/* Live Enrich Button */}
          <button
            onClick={handleLiveEnrich}
            disabled={isEnriching || enrichedData}
            className={`relative px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all text-sm font-medium overflow-hidden ${isEnriching
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white cursor-wait'
              : enrichedData
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
          >
            {isEnriching && (
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 animate-[shimmer_2s_infinite] opacity-75"></span>
            )}
            <span className="relative flex items-center gap-2">
              {isEnriching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="animate-pulse">Analyzing...</span>
                </>
              ) : enrichedData ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  Enriched
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Live Enrich
                </>
              )}
            </span>
          </button>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column (2/3) */}
        <div className="col-span-2 space-y-6">
          {/* Loading Skeleton */}
          {isEnriching && !enrichedData && (
            <div className="bg-white border border-gray-200/75 rounded-2xl p-6 shadow-sm animate-pulse">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-5 w-5 bg-blue-200 rounded"></div>
                <div className="h-4 w-48 bg-gray-200 rounded"></div>
              </div>

              <div className="space-y-6">
                {/* Summary Skeleton */}
                <div>
                  <div className="h-3 w-24 bg-gray-200 rounded mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-100 rounded"></div>
                    <div className="h-4 w-full bg-gray-100 rounded"></div>
                    <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
                  </div>
                </div>

                {/* Signals Skeleton */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="h-3 w-32 bg-gray-200 rounded mb-3"></div>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
                        <div className="h-4 w-full bg-gray-100 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Keywords Skeleton */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="h-3 w-24 bg-gray-200 rounded mb-3"></div>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-6 w-20 bg-gray-100 rounded-md"></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Animated progress bar */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Fetching and analyzing website content...</span>
                </div>
                <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-[progress_2s_ease-in-out_infinite]"></div>
                </div>
              </div>
            </div>
          )}

          {/* AI Intelligence Report */}
          {enrichedData && (
            <div className="bg-white border border-gray-200/75 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-2 mb-4 animate-in fade-in duration-300">
                <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" />
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  AI Intelligence Report
                </h3>
              </div>

              <div className="space-y-6">
                {/* Summary */}
                {enrichedData.summary && (
                  <div className="animate-in fade-in duration-500" style={{ animationDelay: '100ms' }}>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Summary
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {enrichedData.summary}
                    </p>
                  </div>
                )}
                {/* What they do */}
                {enrichedData.what_they_do && enrichedData.what_they_do.length > 0 && (
                  <div className="pt-4 border-t border-gray-100 animate-in fade-in duration-500" style={{ animationDelay: '200ms' }}>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                      What they do
                    </h4>
                    <ul className="list-disc list-outside ml-4 space-y-1.5 text-[13px] text-gray-700">
                      {enrichedData.what_they_do.map((item, idx) => (
                        <li key={idx} className="leading-relaxed">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Signals */}
                {enrichedData.signals && enrichedData.signals.length > 0 && (
                  <div className="pt-4 border-t border-gray-100 animate-in fade-in duration-500" style={{ animationDelay: '200ms' }}>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                      Detected Signals
                    </h4>
                    <div className="space-y-2">
                      {enrichedData.signals.map((signal, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 text-sm text-gray-700 animate-in fade-in duration-300"
                          style={{ animationDelay: `${300 + idx * 50}ms` }}
                        >
                          <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>{signal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Keywords */}
                {enrichedData.keywords && enrichedData.keywords.length > 0 && (
                  <div className="pt-4 border-t border-gray-100 animate-in fade-in duration-500" style={{ animationDelay: '400ms' }}>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                      Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {enrichedData.keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-md text-xs font-medium text-gray-700 animate-in fade-in duration-300"
                          style={{ animationDelay: `${500 + idx * 30}ms` }}
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer with URL and Timestamp */}
                <div className="pt-4 border-t border-gray-100 mt-6">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      Source:{' '}
                      <a
                        href={enrichUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {enrichUrl}
                      </a>
                    </span>
                    {enrichTimestamp && (
                      <span>
                        Enriched:{' '}
                        {new Date(enrichTimestamp).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Company Overview */}
          <div className="bg-white border border-gray-200/75 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Company Overview</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{company.description}</p>
          </div>
        </div>

        {/* Right Column (1/3) */}
        <div className="col-span-1 space-y-6">
          {/* Notes Section */}
          <div className="bg-white border border-gray-200/75 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your notes about this company..."
              className="w-full h-48 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-gray-700 resize-none"
            />
          </div>

          {/* Firmographics */}
          <div className="bg-white border border-gray-200/75 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
              Firmographics
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Sector</div>
                <div className="text-sm font-medium text-gray-900">{company.sector}</div>
              </div>
              <div className="h-px bg-gray-100"></div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Stage</div>
                <div className="text-sm font-medium text-gray-900">{company.stage}</div>
              </div>
              <div className="h-px bg-gray-100"></div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Status</div>
                <div className="text-sm font-medium text-gray-900">{company.status}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
