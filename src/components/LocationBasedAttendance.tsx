import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { 
  MapPin, 
  Wifi, 
  Bluetooth, 
  CheckCircle, 
  XCircle, 
  Loader, 
  AlertTriangle,
  Clock,
  Navigation
} from 'lucide-react';

interface LocationBasedAttendanceProps {
  courseId: string;
  courseName: string;
  onAttendanceMarked: () => void;
}

interface LocationData {
  coordinates?: { lat: number; lng: number };
  wifiSSID?: string;
  bluetoothBeacons?: string[];
}

const LocationBasedAttendance: React.FC<LocationBasedAttendanceProps> = ({
  courseId,
  courseName,
  onAttendanceMarked
}) => {
  const { user } = useAuth();
  const [locationData, setLocationData] = useState<LocationData>({});
  const [verificationStatus, setVerificationStatus] = useState<{
    isVerifying: boolean;
    isVerified: boolean;
    method?: string;
    error?: string;
  }>({ isVerifying: false, isVerified: false });
  const [attendanceStatus, setAttendanceStatus] = useState<{
    isMarking: boolean;
    isMarked: boolean;
    error?: string;
  }>({ isMarking: false, isMarked: false });

  const detectLocation = async () => {
    setVerificationStatus({ isVerifying: true, isVerified: false });
    
    try {
      const data = await apiService.detectLocationData();
      setLocationData(data);
      
      // Verify location with backend
      const verification = await apiService.verifyLocation({
        courseId,
        ...data
      });
      
      setVerificationStatus({
        isVerifying: false,
        isVerified: verification.isInRange,
        method: verification.verificationMethod,
        error: verification.isInRange ? undefined : verification.message
      });
    } catch (error: any) {
      console.error('Location detection error:', error);
      setVerificationStatus({
        isVerifying: false,
        isVerified: false,
        error: error.message || 'Failed to detect location'
      });
    }
  };

  const markAttendance = async () => {
    if (!verificationStatus.isVerified || !user) return;
    
    setAttendanceStatus({ isMarking: true, isMarked: false });
    
    try {
      await apiService.markAttendance({
        studentId: user.id,
        courseId,
        date: new Date().toISOString().split('T')[0],
        status: 'present',
        locationData: {
          verificationMethod: verificationStatus.method,
          ...locationData
        }
      });
      
      setAttendanceStatus({ isMarking: false, isMarked: true });
      onAttendanceMarked();
    } catch (error: any) {
      console.error('Mark attendance error:', error);
      setAttendanceStatus({
        isMarking: false,
        isMarked: false,
        error: error.message || 'Failed to mark attendance'
      });
    }
  };

  const LocationInfo: React.FC = () => (
    <div className="space-y-3">
      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
        <Navigation className="h-5 w-5 text-gray-500" />
        <div>
          <p className="text-sm font-medium text-gray-900">GPS Location</p>
          <p className="text-xs text-gray-600">
            {locationData.coordinates 
              ? `${locationData.coordinates.lat.toFixed(6)}, ${locationData.coordinates.lng.toFixed(6)}`
              : 'Not available'
            }
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
        <Wifi className="h-5 w-5 text-gray-500" />
        <div>
          <p className="text-sm font-medium text-gray-900">WiFi Network</p>
          <p className="text-xs text-gray-600">
            {locationData.wifiSSID || 'Not detected'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
        <Bluetooth className="h-5 w-5 text-gray-500" />
        <div>
          <p className="text-sm font-medium text-gray-900">Bluetooth Beacons</p>
          <p className="text-xs text-gray-600">
            {locationData.bluetoothBeacons?.length 
              ? `${locationData.bluetoothBeacons.length} beacon(s) detected`
              : 'None detected'
            }
          </p>
        </div>
      </div>
    </div>
  );

  if (user?.role !== 'student') {
    return null;
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <MapPin className="h-6 w-6 text-blue-500" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Location-Based Attendance</h3>
          <p className="text-sm text-gray-600">{courseName}</p>
        </div>
      </div>

      {/* Step 1: Detect Location */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              1
            </div>
            <div>
              <p className="font-medium text-blue-900">Detect Your Location</p>
              <p className="text-sm text-blue-700">We'll verify you're in the classroom</p>
            </div>
          </div>
          <button
            onClick={detectLocation}
            disabled={verificationStatus.isVerifying}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {verificationStatus.isVerifying ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Detecting...</span>
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4" />
                <span>Detect Location</span>
              </>
            )}
          </button>
        </div>

        {/* Location Information */}
        {Object.keys(locationData).length > 0 && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Detected Location Data</h4>
            <LocationInfo />
          </div>
        )}

        {/* Verification Status */}
        {verificationStatus.isVerified && (
          <div className="flex items-center space-x-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <CheckCircle className="h-6 w-6 text-emerald-500" />
            <div>
              <p className="font-medium text-emerald-900">Location Verified</p>
              <p className="text-sm text-emerald-700">
                Verified via {verificationStatus.method} - You're in the classroom!
              </p>
            </div>
          </div>
        )}

        {verificationStatus.error && (
          <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <XCircle className="h-6 w-6 text-red-500" />
            <div>
              <p className="font-medium text-red-900">Location Not Verified</p>
              <p className="text-sm text-red-700">{verificationStatus.error}</p>
            </div>
          </div>
        )}

        {/* Step 2: Mark Attendance */}
        <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              verificationStatus.isVerified 
                ? 'bg-emerald-500 text-white' 
                : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
            <div>
              <p className={`font-medium ${
                verificationStatus.isVerified ? 'text-emerald-900' : 'text-gray-600'
              }`}>
                Mark Your Attendance
              </p>
              <p className={`text-sm ${
                verificationStatus.isVerified ? 'text-emerald-700' : 'text-gray-500'
              }`}>
                {verificationStatus.isVerified 
                  ? 'You can now mark your attendance' 
                  : 'Location verification required first'
                }
              </p>
            </div>
          </div>
          <button
            onClick={markAttendance}
            disabled={!verificationStatus.isVerified || attendanceStatus.isMarking || attendanceStatus.isMarked}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {attendanceStatus.isMarking ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Marking...</span>
              </>
            ) : attendanceStatus.isMarked ? (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Marked</span>
              </>
            ) : (
              <>
                <Clock className="h-4 w-4" />
                <span>Mark Present</span>
              </>
            )}
          </button>
        </div>

        {/* Attendance Success */}
        {attendanceStatus.isMarked && (
          <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <div>
              <p className="font-medium text-green-900">Attendance Marked Successfully!</p>
              <p className="text-sm text-green-700">
                Your attendance has been recorded for {courseName}
              </p>
            </div>
          </div>
        )}

        {/* Attendance Error */}
        {attendanceStatus.error && (
          <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <div>
              <p className="font-medium text-red-900">Failed to Mark Attendance</p>
              <p className="text-sm text-red-700">{attendanceStatus.error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationBasedAttendance;