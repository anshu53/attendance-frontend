import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/api";
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Mail,
  GraduationCap,
  Building,
  AlertTriangle,
  UserPlus,
  MoreVertical,
  Calendar,
  BookOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
interface Student {
  id: string;
  email: string;
  name: string;
  role: "student";
  department: string;
  studentId: string;
  year: number;
  status: "approved";
  createdAt: string;
}

const Students: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const studentsData = await apiService.getStudents();
      setStudents(studentsData);
      setError("");
    } catch (error: any) {
      console.error("Failed to fetch students:", error);
      setError("Failed to load students. Please try again.");
      // Mock data as fallback
      setStudents([
        {
          id: "1",
          email: "john.smith@college.edu",
          name: "John Smith",
          role: "student",
          department: "Computer Science",
          studentId: "CS2024001",
          year: 2,
          status: "approved",
          createdAt: "2024-01-15T00:00:00Z",
        },
        {
          id: "2",
          email: "emma.wilson@college.edu",
          name: "Emma Wilson",
          role: "student",
          department: "Computer Science",
          studentId: "CS2024002",
          year: 1,
          status: "approved",
          createdAt: "2024-01-16T00:00:00Z",
        },
        {
          id: "3",
          email: "michael.brown@college.edu",
          name: "Michael Brown",
          role: "student",
          department: "Mathematics",
          studentId: "MATH2024001",
          year: 3,
          status: "approved",
          createdAt: "2024-01-17T00:00:00Z",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      selectedDepartment === "" || student.department === selectedDepartment;
    const matchesYear =
      selectedYear === "" || student.year.toString() === selectedYear;
    return matchesSearch && matchesDepartment && matchesYear;
  });

  const departments = [
    ...new Set(students.map((student) => student.department)),
  ];
  const years = [...new Set(students.map((student) => student.year))].sort();

  const StudentCard: React.FC<{ student: Student }> = ({ student }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-white text-lg font-semibold">
              {student.name.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {student.name}
            </h3>
            <p className="text-sm text-gray-500">{student.studentId}</p>
          </div>
        </div>
        {(user?.role === "admin" || user?.role === "teacher") && (
          <div className="flex space-x-2">
            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <Edit className="h-4 w-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{student.email}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Building className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{student.department}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <GraduationCap className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>Year {student.year}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>
            Enrolled: {new Date(student.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            Active
          </span>
        </div>
        <button
          className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          onClick={() => navigate(`/students/${student.id}`)}
        >
          View Profile
        </button>
      </div>
    </div>
  );

  if (user?.role !== "admin" && user?.role !== "teacher") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-600">
            Only administrators and teachers can access student management.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Students
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchStudents}
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
          <h1 className="text-3xl font-bold text-gray-900">
            Students Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and view student information
          </p>
        </div>
        {user?.role === "admin" && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
          >
            <UserPlus className="h-5 w-5" />
            <span>Add Student</span>
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
              placeholder="Search students by name, ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year.toString()}>
                  Year {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {students.length}
              </p>
            </div>
            <Users className="h-8 w-8 text-emerald-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Departments</p>
              <p className="text-2xl font-bold text-gray-900">
                {departments.length}
              </p>
            </div>
            <Building className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {students.filter((s) => s.status === "approved").length}
              </p>
            </div>
            <GraduationCap className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">New This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  students.filter((s) => {
                    const createdDate = new Date(s.createdAt);
                    const thisMonth = new Date();
                    return (
                      createdDate.getMonth() === thisMonth.getMonth() &&
                      createdDate.getFullYear() === thisMonth.getFullYear()
                    );
                  }).length
                }
              </p>
            </div>
            <Calendar className="h-8 w-8 text-indigo-500" />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
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
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Students Grid */}
      {!loading && (
        <>
          {filteredStudents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map((student) => (
                <StudentCard key={student.id} student={student} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                No students found
              </h3>
              <p className="text-gray-500 mt-1">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Students;
