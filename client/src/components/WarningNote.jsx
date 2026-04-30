import { AlertTriangle } from 'lucide-react';

export default function WarningNote() {
  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg my-4">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
        <div>
          <h4 className="text-sm font-bold text-red-800 uppercase tracking-wide">Important Warning</h4>
          <p className="text-sm text-red-700 mt-1">
            If you enter your fake details you will be removed from the database and you will not be able to login next time. Please provide accurate information to maintain trust in our community.
          </p>
        </div>
      </div>
    </div>
  );
}
