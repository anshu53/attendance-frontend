import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    todayAttendance: 0,
    attendanceRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Check API health first
      await apiService.healthCheck();
      
      // Simulate dashboard data - in real app, these would be separate API calls
      setStats({
        totalStudents: 156,
        totalCourses: 8,
        todayAttendance: 142,
        attendanceRate: 91.0
      });
      
      setError('');
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const weeklyAttendance = [
    { day: 'Mon', present: 145, absent: 11 },
    { day: 'Tue', present: 138, absent: 18 },
    { day: 'Wed', present: 142, absent: 14 },
    { day: 'Thu', present: 149, absent: 7 },
    { day: 'Fri', present: 135, absent: 21 },
  ];

  const recentAttendance = [
    { course: 'CS101', time: '09:00 AM', present: 28, total: 30, status: 'completed' as const },
    { course: 'CS201', time: '10:00 AM', present: 24, total: 25, status: 'completed' as const },
    { course: 'MATH101', time: '11:00 AM', present: 0, total: 35, status: 'upcoming' as const },
    { course: 'PHY101', time: '02:00 PM', present: 0, total: 28, status: 'upcoming' as const },
  ];

  const StatCard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ElementType;
    color: string;
    change?: string;
    loading?: boolean;
  }> = ({ title, value, icon: Icon, color, change, loading: cardLoading }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {cardLoading ? (
            <div className="animate-pulse bg-gray-200 h-8 w-16 rounded mt-1"></div>
          ) : (
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          )}
          {change && !cardLoading && (
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
              <span className="text-sm text-emerald-600">{change}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const AttendanceCard: React.FC<{
    course: string;
    time: string;
    present: number;
    total: number;
    status: 'completed' | 'upcoming' | 'ongoing';
  }> = ({ course, time, present, total, status }) => {
    const getStatusIcon = () => {
      switch (status) {
        case 'completed':
          return <CheckCircle className="h-5 w-5 text-emerald-500" />;
        case 'ongoing':
          return <Activity className="h-5 w-5 text-blue-500 animate-pulse" />;
        case 'upcoming':
          return <Clock className="h-5 w-5 text-amber-500" />;
        default:
          return <XCircle className="h-5 w-5 text-gray-400" />;
      }
    };

    const getStatusColor = () => {
      switch (status) {
        case 'completed':
          return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'ongoing':
          return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'upcoming':
          return 'bg-amber-50 text-amber-700 border-amber-200';
        default:
          return 'bg-gray-50 text-gray-700 border-gray-200';
      }
    };

    return (
      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-all duration-200">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <p className="font-medium text-gray-900">{course}</p>
            <p className="text-sm text-gray-500">{time}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            {status === 'upcoming' ? `0/${total}` : `${present}/${total}`}
          </p>
          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize border ${getStatusColor()}`}>
            {status}
          </span>
        </div>
      </div>
    );
  };

  const attendancePieData = [
    { name: 'Present', value: stats.todayAttendance, fill: '#10B981' },
    { name: 'Absent', value: stats.totalStudents - stats.todayAttendance, fill: '#EF4444' },
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name.split(' ')[0]}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your attendance system today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
          change="+12 this month"
          loading={loading}
        />
        <StatCard
          title="Active Courses"
          value={stats.totalCourses}
          icon={BookOpen}
          color="bg-gradient-to-r from-indigo-500 to-indigo-600"
          loading={loading}
        />
        <StatCard
          title="Today's Present"
          value={stats.todayAttendance}
          icon={Calendar}
          color="bg-gradient-to-r from-emerald-500 to-emerald-600"
          loading={loading}
        />
        <StatCard
          title="Attendance Rate"
          value={`${stats.attendanceRate}%`}
          icon={TrendingUp}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
          change="+2.5% from last week"
          loading={loading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Attendance Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Attendance</h3>
          {loading ? (
            <div className="animate-pulse bg-gray-200 h-64 rounded"></div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyAttendance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="present" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Today's Attendance Pie Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Overview</h3>
          {loading ? (
            <div className="animate-pulse bg-gray-200 h-64 rounded"></div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={attendancePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {attendancePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center space-x-4 mt-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Present ({stats.todayAttendance})</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">Absent ({stats.totalStudents - stats.todayAttendance})</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
            View All
          </button>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-16 rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {recentAttendance.map((item, index) => (
              <AttendanceCard
                key={index}
                course={item.course}
                time={item.time}
                present={item.present}
                total={item.total}
                status={item.status}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;