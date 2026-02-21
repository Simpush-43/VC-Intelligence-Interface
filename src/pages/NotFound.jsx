import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function NotFound({ message = "We couldn't find the page you're looking for." }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-[80vh] animate-in fade-in duration-300">
      <div className="bg-white border border-gray-200/75 p-8 rounded-2xl shadow-sm max-w-md w-full text-center">
        <div className="h-12 w-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-6 w-6" />
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-[14px] text-gray-500 mb-6 leading-relaxed">
          {message}
        </p>
        
        <button
          onClick={() => navigate('/companies')}
          className="w-full flex items-center justify-center gap-2 bg-[#0A0A0B] text-white px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors text-[13px] font-medium shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Discovery
        </button>
      </div>
    </div>
  );
}