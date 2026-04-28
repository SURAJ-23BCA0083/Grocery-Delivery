import { useState, useEffect } from 'react';
import { useAppContext } from '../context/appContext';
import { toast } from 'react-hot-toast';
import { Calendar, AlertTriangle, Clock, CheckCircle, XCircle, Scan } from 'lucide-react';

const ExpiryScanner = () => {
  const { axios } = useAppContext();
  const [scanning, setScanning] = useState(false);
  const [expiryData, setExpiryData] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const scanExpiryDates = async () => {
    setScanning(true);
    try {
      const { data } = await axios.get('/api/product/scan-expiry');
      if (data.success) {
        setExpiryData(data);
        setShowResults(true);
        toast.success(`Scan complete: ${data.totalExpired} expired, ${data.totalExpiring} expiring soon`);
      }
    } catch (error) {
      toast.error('Failed to scan expiry dates');
    } finally {
      setScanning(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'expired':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'warning':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getStatusColor = (daysUntilExpiry) => {
    if (daysUntilExpiry < 0) return 'bg-red-50 border-red-200 text-red-800';
    if (daysUntilExpiry <= 3) return 'bg-orange-50 border-orange-200 text-orange-800';
    if (daysUntilExpiry <= 7) return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    return 'bg-green-50 border-green-200 text-green-800';
  };

  const formatExpiryText = (daysUntilExpiry) => {
    if (daysUntilExpiry < 0) return `Expired ${Math.abs(daysUntilExpiry)} days ago`;
    if (daysUntilExpiry === 0) return 'Expires today';
    if (daysUntilExpiry === 1) return 'Expires tomorrow';
    return `Expires in ${daysUntilExpiry} days`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Scan className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Expiry Date Scanner</h1>
              <p className="text-gray-600">Smart expiry date tracking and warnings</p>
            </div>
          </div>
          <button
            onClick={scanExpiryDates}
            disabled={scanning}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <Scan className="w-5 h-5" />
            {scanning ? 'Scanning...' : 'Scan Products'}
          </button>
        </div>

        {showResults && expiryData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800">Safe Products</span>
              </div>
              <p className="text-2xl font-bold text-green-900">
                {expiryData.products?.length - expiryData.totalExpiring - expiryData.totalExpired || 0}
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="font-semibold text-yellow-800">Expiring Soon</span>
              </div>
              <p className="text-2xl font-bold text-yellow-900">{expiryData.totalExpiring}</p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-red-800">Expired</span>
              </div>
              <p className="text-2xl font-bold text-red-900">{expiryData.totalExpired}</p>
            </div>
          </div>
        )}
      </div>

      {showResults && expiryData && (
        <div className="space-y-6">
          {expiryData.expired.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
                <XCircle className="w-6 h-6" />
                Expired Products ({expiryData.expired.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {expiryData.expired.map((product) => (
                  <div key={product._id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-800">{product.name}</h3>
                      <span className="text-xs font-medium px-2 py-1 bg-red-100 text-red-800 rounded-full">
                        EXPIRED
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                    <div className="flex items-center gap-2 text-sm text-red-700">
                      <Calendar className="w-4 h-4" />
                      <span>{formatExpiryText(product.daysUntilExpiry)}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Expiry: {new Date(product.expiryDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {expiryData.expiringSoon.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-yellow-800 mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6" />
                Expiring Soon ({expiryData.expiringSoon.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {expiryData.expiringSoon.map((product) => (
                  <div 
                    key={product._id} 
                    className={`border rounded-lg p-4 ${getStatusColor(product.daysUntilExpiry)}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-800">{product.name}</h3>
                      <span className="text-xs font-medium px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                        {product.daysUntilExpiry <= 3 ? 'URGENT' : 'SOON'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="w-4 h-4" />
                      <span>{formatExpiryText(product.daysUntilExpiry)}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Expiry: {new Date(product.expiryDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {expiryData.expired.length === 0 && expiryData.expiringSoon.length === 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">All Products Safe!</h3>
              <p className="text-gray-600">No products are expiring soon or expired.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpiryScanner;
