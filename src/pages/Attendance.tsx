import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import LocationBasedAttendance from '../components/LocationBasedAttendance';
import { 
  Calendar, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users,
  Download,
  Plus,
  MoreVertical,
  AlertTriangle,
  MapPin
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  markedAt: string;
  markedBy: string;
  locationVerified?: boolean;
  verificationMethod?: string;
}

interface Course {
  id: string;
  code: string;
  name: string;
  schedule: {
    room: string;
  };
}

const Attendance: React.FC = () => {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCourse, setSelectedCourse] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showLocationAttendance, setShowLocationAttendance] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedDate, selectedCourse]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch courses
      const coursesData = await apiService.getCourses();
      setCourses(coursesData);
      
      // Fetch attendance data
      const filters = {
        ...(selectedCourse && { courseId: selectedCourse }),
        date: format(selectedDate, 'yyyy-MM-dd')
      };
      
      try {
        const attendanceData = await apiService.getAttendance(filters);
        setAttendanceRecords(attendanceData);
      } catch (apiError) {
        // Use mock data as fallback
        const mockAttendance: AttendanceRecord[] = [
          {
            id: '1',
            studentId: 'CS2024001',
            studentName: 'John Smith',
            courseId: 'CS101',
            courseName: 'Introduction to Programming',
            date: '2024-01-15',
            status: 'present',
            markedAt: '2024-01-15T09:00:00Z',
            markedBy: 'Dr. Sarah Johnson',
            locationVerified: true,
            verificationMethod: 'WiFi'
          },
          {
            id: '2',
            studentId: 'CS2024002',
            studentName: 'Emma Wilson',
            courseId: 'CS101',
            courseName: 'Introduction to Programming',
            date: '2024-01-15',
            status: 'present',
            markedAt: '2024-01-15T09:02:00Z',
            markedBy: 'Dr. Sarah Johnson',
            locationVerified: true,
            verificationMethod: 'Bluetooth'
          }
        ];
        setAttendanceRecords(mockAttendance);
      }
      
      setError('');
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === '' || record.courseId === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'absent':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'late':
        return <Clock className="h-5 w-5 text-amber-500" />;
      default:
        return <XCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'absent':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'late':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const AttendanceRow: React.FC<{ record: AttendanceRecord }> = ({ record }) => (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-white text-sm font-semibold">
              {record.studentName.charAt(0)}
            </span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{record.studentName}</div>
            <div className="text-sm text-gray-500">{record.studentId}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{record.courseName}</div>
        <div className="text-sm text-gray-500">{record.courseId}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{format(parseISO(record.date), 'MMM dd, yyyy')}</div>
        <div className="text-sm text-gray-500">{format(parseISO(record.markedAt), 'HH:mm')}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {getStatusIcon(record.status)}
          <span className={`ml-2 inline-flex px-2 py-1 rounded-full text-xs font-medium border capitalize ${getStatusColor(record.status)}`}>
            {record.status}
          </span>
          {record.locationVerified && (
            <div className="ml-2 flex items-center text-xs text-blue-600">
              <MapPin className="h-3 w-3 mr-1" />
              <span>{record.verificationMethod}</span>
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {record.markedBy}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <MoreVertical className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );

  const AttendanceStats = () => {
    const totalRecords = filteredRecords.length;
    const presentCount = filteredRecords.filter(r => r.status === 'present').length;
    const absentCount = filteredRecords.filter(r => r.status === 'absent').length;
    const lateCount = filteredRecords.filter(r => r.status === 'late').length;
    const attendanceRate = totalRecords > 0 ? (presentCount / totalRecords * 100).toFixed(1) : '0';
    const locationVerifiedCount = filteredRecords.filter(r => r.locationVerified).length;

    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">{totalRecords}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Present</p>
              <p className="text-2xl font-bold text-emerald-600">{presentCount}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Absent</p>
              <p className="text-2xl font-bold text-red-600">{absentCount}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Attendance Rate</p>
              <p className="text-2xl font-bold text-blue-600">{attendanceRate}%</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Location Verified</p>
              <p className="text-2xl font-bold text-purple-600">{locationVerifiedCount}</p>
            </div>
            <MapPin className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Attendance</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
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
          <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-600 mt-1">Track and manage student attendance</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          {user?.role === 'student' && (
            <button
              onClick={() => setShowLocationAttendance(!showLocationAttendance)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              <MapPin className="h-4 w-4" />
              <span>Mark Attendance</span>
            </button>
          )}
          {(user?.role === 'admin' || user?.role === 'teacher') && (
            <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl">
              <Plus className="h-4 w-4" />
              <span>Mark Attendance</span>
            </button>
          )}
        </div>
      </div>

      {/* Location-Based Attendance for Students */}
      {user?.role === 'student' && showLocationAttendance && (
        <LocationBasedAttendance
          courseId={selectedCourse || courses[0]?.id || ''}
          courseName={courses.find(c => c.id === selectedCourse)?.name || courses[0]?.name || 'Select a course'}
          onAttendanceMarked={() => {
            fetchData();
            setShowLocationAttendance(false);
          }}
        />
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students or courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <AttendanceStats />

      {/* Attendance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Attendance Records</h3>
        </div>
        
        {loading ? (
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/8"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marked By
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map(record => (
                  <AttendanceRow key={record.id} record={record} />
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {!loading && filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No attendance records found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;