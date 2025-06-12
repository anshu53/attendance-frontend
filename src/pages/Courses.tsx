import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { 
  Plus, 
  Search, 
  Filter, 
  BookOpen, 
  Clock, 
  MapPin, 
  Users,
  Calendar,
  Edit,
  Trash2,
  AlertTriangle
} from 'lucide-react';

interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  instructor: string;
  department: string;
  semester: string;
  credits: number;
  schedule: {
    days: string[];
    time: string;
    room: string;
  };
  enrolledStudents: string[];
}

const Courses: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const coursesData = await apiService.getCourses();
      setCourses(coursesData);
      setError('');
    } catch (error: any) {
      console.error('Failed to fetch courses:', error);
      setError('Failed to load courses. Please try again.');
      // Set mock data as fallback
      setCourses([
        {
          id: '1',
          code: 'CS101',
          name: 'Introduction to Programming',
          description: 'Basic programming concepts using Python. Learn variables, loops, functions, and problem-solving techniques.',
          instructor: 'Dr. Sarah Johnson',
          department: 'Computer Science',
          semester: 'Fall 2024',
          credits: 3,
          schedule: {
            days: ['Monday', 'Wednesday', 'Friday'],
            time: '09:00-10:00',
            room: 'CS-201'
          },
          enrolledStudents: ['1', '2', '3', '4', '5']
        },
        {
          id: '2',
          code: 'CS201',
          name: 'Data Structures',
          description: 'Advanced data structures and algorithms. Arrays, linked lists, trees, graphs, and their applications.',
          instructor: 'Dr. Sarah Johnson',
          department: 'Computer Science',
          semester: 'Fall 2024',
          credits: 4,
          schedule: {
            days: ['Tuesday', 'Thursday'],
            time: '10:00-11:30',
            room: 'CS-202'
          },
          enrolledStudents: ['1', '3', '5', '7']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === '' || course.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const departments = [...new Set(courses.map(course => course.department))];

  const CourseCard: React.FC<{ course: Course }> = ({ course }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{course.code}</h3>
            <p className="text-sm text-gray-500">{course.department}</p>
          </div>
        </div>
        {(user?.role === 'admin' || user?.role === 'teacher') && (
          <div className="flex space-x-2">
            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <Edit className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <h4 className="font-medium text-gray-900 mb-2">{course.name}</h4>
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Users className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{course.instructor}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{course.schedule.days.join(', ')}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{course.schedule.time}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{course.schedule.room}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            {course.enrolledStudents.length} students
          </span>
          <span className="text-sm text-gray-500">
            {course.credits} credits
          </span>
        </div>
        <button className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
          View Details
        </button>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Courses</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchCourses}
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
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-600 mt-1">Manage and view course information</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'teacher') && (
          <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl">
            <Plus className="h-5 w-5" />
            <span>Add Course</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses, codes, or instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Course Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Departments</p>
              <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
            </div>
            <Filter className="h-8 w-8 text-indigo-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(courses.reduce((acc, course) => acc + course.enrolledStudents.length, 0) / courses.length) || 0}
              </p>
            </div>
            <Users className="h-8 w-8 text-emerald-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Credits</p>
              <p className="text-2xl font-bold text-gray-900">
                {courses.reduce((acc, course) => acc + course.credits, 0)}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-purple-500" />
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
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Courses Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}

      {!loading && filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Courses;