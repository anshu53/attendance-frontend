import React from 'react';
import { GraduationCap } from 'lucide-react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4 animate-pulse">
          <GraduationCap className="h-8 w-8 text-white" />
        </div>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">AttendanceHub</h2>
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;