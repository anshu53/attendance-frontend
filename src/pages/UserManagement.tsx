import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Mail, 
  GraduationCap,
  Building,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface PendingUser {
  id: string;
  email: string;
  name: string;
  role: 'teacher' | 'student';
  department?: string;
  studentId?: string;
  year?: number;
  status: 'pending';
  createdAt: string;
}

const UserManagement: React.FC = () => {
  const { user } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingUsers, setProcessingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchPendingUsers();
    }
  }, [user]);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPendingUsers();
      setPendingUsers(data);
      setError('');
    } catch (error: any) {
      console.error('Failed to fetch pending users:', error);
      setError('Failed to load pending users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      setProcessingUsers(prev => new Set(prev).add(userId));
      await apiService.approveUser(userId);
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error: any) {
      console.error('Failed to approve user:', error);
      setError('Failed to approve user. Please try again.');
    } finally {
      setProcessingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      setProcessingUsers(prev => new Set(prev).add(userId));
      await apiService.rejectUser(userId);
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error: any) {
      console.error('Failed to reject user:', error);
      setError('Failed to reject user. Please try again.');
    } finally {
      setProcessingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const UserCard: React.FC<{ user: PendingUser }> = ({ user: pendingUser }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${
            pendingUser.role === 'teacher' 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
              : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
          }`}>
            {pendingUser.role === 'teacher' ? (
              <GraduationCap className="h-6 w-6 text-white" />
            ) : (
              <Users className="h-6 w-6 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{pendingUser.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{pendingUser.role}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-medium">Pending</span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{pendingUser.email}</span>
        </div>
        {pendingUser.department && (
          <div className="flex items-center text-sm text-gray-600">
            <Building className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{pendingUser.department}</span>
          </div>
        )}
        {pendingUser.studentId && (
          <div className="flex items-center text-sm text-gray-600">
            <GraduationCap className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>ID: {pendingUser.studentId}</span>
          </div>
        )}
        {pendingUser.year && (
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>Year {pendingUser.year}</span>
          </div>
        )}
      </div>

      <div className="flex space-x-3 pt-4 border-t border-gray-100">
        <button
          onClick={() => handleApproveUser(pendingUser.id)}
          disabled={processingUsers.has(pendingUser.id)}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processingUsers.has(pendingUser.id) ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-700"></div>
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">Approve</span>
        </button>
        <button
          onClick={() => handleRejectUser(pendingUser.id)}
          disabled={processingUsers.has(pendingUser.id)}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processingUsers.has(pendingUser.id) ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700"></div>
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">Reject</span>
        </button>
      </div>
    </div>
  );

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">Only administrators can access user management.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Users</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchPendingUsers}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Approve or reject pending user registrations</p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
          <UserCheck className="h-5 w-5" />
          <span className="font-medium">{pendingUsers.length} Pending</span>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Users</p>
              <p className="text-2xl font-bold text-gray-900">{pendingUsers.length}</p>
            </div>
            <Clock className="h-8 w-8 text-amber-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Teachers</p>
              <p className="text-2xl font-bold text-gray-900">
                {pendingUsers.filter(u => u.role === 'teacher').length}
              </p>
            </div>
            <GraduationCap className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {pendingUsers.filter(u => u.role === 'student').length}
              </p>
            </div>
            <Users className="h-8 w-8 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="flex space-x-3">
                  <div className="h-8 bg-gray-200 rounded flex-1"></div>
                  <div className="h-8 bg-gray-200 rounded flex-1"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pending Users Grid */}
      {!loading && (
        <>
          {pendingUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingUsers.map(pendingUser => (
                <UserCard key={pendingUser.id} user={pendingUser} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No pending users</h3>
              <p className="text-gray-500 mt-1">All user registrations have been processed.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserManagement;