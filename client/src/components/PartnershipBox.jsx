import { TrendingUp, Mail, Banknote } from 'lucide-react';

export default function PartnershipBox() {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 my-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="bg-amber-100 p-2 rounded-lg">
          <TrendingUp className="text-amber-600" size={24} />
        </div>
        <h3 className="text-lg font-bold text-amber-800">Become a Partner</h3>
      </div>
      
      <p className="text-amber-700 mb-4">
        Want to be part of UniSync's success? Get shares of this website and earn as we grow!
      </p>
      
      <div className="bg-white rounded-lg p-4 space-y-3">
        <div className="flex items-start space-x-3">
          <Banknote className="text-amber-600 mt-1 shrink-0" size={18} />
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Step 1:</span> Pay cash to our bank account to purchase partnership shares.
          </p>
        </div>
        
        <div className="flex items-start space-x-3">
          <Mail className="text-amber-600 mt-1 shrink-0" size={18} />
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Step 2:</span> After payment confirmation, you will be given a partnership account via email.
          </p>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-amber-100 rounded-lg">
        <p className="text-sm text-amber-800 font-medium text-center">
          Contact us at <span className="underline">partnerships@unisync.com</span> for bank details and partnership opportunities.
        </p>
      </div>
    </div>
  );
}
