import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, X } from 'lucide-react';
import { mockCompanies } from '../mockData';

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Listen for Cmd+K (Mac) or Ctrl+K (Windows) to open, and Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close the modal and navigate to the company profile
  const handleSelect = (id) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/profile/${id}`);
  };

  if (!isOpen) return null;

  // Filter companies as the user types
  const filtered = query === '' ? [] : mockCompanies.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden border border-gray-200 animate-in slide-in-from-top-4 duration-200">
        
        {/* Search Input Area */}
        <div className="flex items-center px-4 border-b border-gray-100">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            autoFocus
            className="flex-1 px-4 py-4 text-[15px] outline-none placeholder:text-gray-400 text-gray-900"
            placeholder="Search any company globally..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results Area */}
        {query && (
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {filtered.length > 0 ? (
              filtered.map(company => (
                <button
                  key={company.id}
                  onClick={() => handleSelect(company.id)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg flex items-center gap-3 transition-colors group"
                >
                  <div className="bg-gray-100 p-2 rounded-md group-hover:bg-white group-hover:shadow-sm transition-all">
                    <Building2 className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <div className="text-[14px] font-medium text-gray-900">{company.name}</div>
                    <div className="text-[12px] text-gray-500">{company.sector}</div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-[13px] text-gray-500">
                No companies found matching "{query}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}