import { useLocalStorage } from '../hooks/useLocalStorage'
import { Building2, ChevronRight, Download, FileJson, Inbox } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../contexts/Toastcontext'
export default function Lists() {
  const [myList] = useLocalStorage('my-vc-list', [])
  const navigate = useNavigate()
  const { showToast } = useToast()

  const handleDownloadCSV = () => {
    if (myList.length === 0) return

    // Create CSV headers
    const headers = ['Name', 'Website', 'Sector', 'Stage', 'Status', 'Description']
    
    // Create CSV rows
    const rows = myList.map(company => [
      company.name || '',
      company.website || '',
      company.sector || '',
      company.stage || '',
      company.status || '',
      company.description || '',
    ])

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map(cell => {
          // Escape commas and quotes in CSV
          const cellStr = String(cell).replace(/"/g, '""')
          return `"${cellStr}"`
        }).join(',')
      )
    ].join('\n')

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `vc-list-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadJSON = () => {
    if (myList.length === 0) return
    const jsonContent = JSON.stringify(myList, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'vc-scout-list.json')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showToast(`Downloaded list for ${company.name}`);
  }

  const handleCompanyClick = (company) => {
    navigate(`/profile/${company.id}`)
    showToast(`Opening profile for ${company.name}`);
  }

  return (
    <div className="max-w-[1000px] mx-auto p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">My Lists</h1>
        {myList.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200/75 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 shadow-sm transition-colors"
            >
              <Download className="h-4 w-4" />
              Download CSV
            </button>
            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200/75 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 shadow-sm transition-colors"
            >
              <FileJson className="h-4 w-4" />
              Download JSON
            </button>
          </div>
        )}
      </div>

      {myList.length === 0 ? (
        <div className="bg-white border border-gray-200/75 rounded-xl shadow-sm p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
              <Inbox className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No companies saved yet</h3>
              <p className="text-sm text-gray-500">
                Start exploring companies and save them to your list to see them here.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200/75 rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Sector
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Stage
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {myList.map((company) => (
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
                          {company.website?.replace('https://', '')}
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
        </div>
      )}
    </div>
  )
}
