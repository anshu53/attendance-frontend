import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/api";
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  Users,
  BookOpen,
  AlertTriangle,
  Filter,
  FileText,
  PieChart,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

interface AttendanceStats {
  totalStudents: number;
  totalCourses: number;
  todayPresent: number;
  todayAbsent: number;
  attendanceRate: number;
  locationVerifiedToday: number;
}

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [selectedCourse, setSelectedCourse] = useState("all");

  useEffect(() => {
    fetchReportsData();
  }, [selectedPeriod, selectedCourse]);

  const fetchReportsData = async () => {
    try {
      setLoading(true);

      // Fetch attendance statistics
      const attendanceStats = await apiService.getAttendanceStats();
      setStats(attendanceStats);

      // Fetch weekly attendance data
      const weeklyAttendance = await apiService.getWeeklyAttendance();
      setWeeklyData(weeklyAttendance);

      setError("");
    } catch (error: any) {
      console.error("Failed to fetch reports data:", error);
      setError("Failed to load reports data. Please try again.");

      // Mock data as fallback
      setStats({
        totalStudents: 156,
        totalCourses: 8,
        todayPresent: 142,
        todayAbsent: 14,
        attendanceRate: 91.0,
        locationVerifiedToday: 135,
      });

      setWeeklyData([
        {
          date: "2024-06-04",
          day: "Mon",
          present: 145,
          absent: 11,
          late: 3,
          total: 159,
        },
        {
          date: "2024-06-05",
          day: "Tue",
          present: 138,
          absent: 18,
          late: 5,
          total: 161,
        },
        {
          date: "2024-06-06",
          day: "Wed",
          present: 142,
          absent: 14,
          late: 2,
          total: 158,
        },
        {
          date: "2024-06-07",
          day: "Thu",
          present: 149,
          absent: 7,
          late: 4,
          total: 160,
        },
        {
          date: "2024-06-08",
          day: "Fri",
          present: 135,
          absent: 21,
          late: 6,
          total: 162,
        },
        {
          date: "2024-06-09",
          day: "Sat",
          present: 89,
          absent: 45,
          late: 8,
          total: 142,
        },
        {
          date: "2024-06-10",
          day: "Sun",
          present: 92,
          absent: 38,
          late: 5,
          total: 135,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const attendancePieData = stats
    ? [
        { name: "Present", value: stats.todayPresent, fill: "#10B981" },
        { name: "Absent", value: stats.todayAbsent, fill: "#EF4444" },
      ]
    : [];

  const departmentData = [
    { department: "Computer Science", students: 45, attendance: 92 },
    { department: "Mathematics", students: 38, attendance: 88 },
    { department: "Physics", students: 32, attendance: 85 },
    { department: "Chemistry", students: 28, attendance: 90 },
    { department: "Biology", students: 25, attendance: 87 },
  ];

  const monthlyTrends = [
    { month: "Jan", attendance: 88, enrollment: 145 },
    { month: "Feb", attendance: 90, enrollment: 148 },
    { month: "Mar", attendance: 87, enrollment: 152 },
    { month: "Apr", attendance: 91, enrollment: 156 },
    { month: "May", attendance: 89, enrollment: 159 },
    { month: "Jun", attendance: 92, enrollment: 162 },
  ];

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    change?: string;
    changeType?: "positive" | "negative" | "neutral";
  }> = ({
    title,
    value,
    icon: Icon,
    color,
    change,
    changeType = "neutral",
  }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <div
              className={`flex items-center mt-2 ${
                changeType === "positive"
                  ? "text-emerald-600"
                  : changeType === "negative"
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-sm">{change}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
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
            Only administrators and teachers can access reports.
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
            Error Loading Reports
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchReportsData}
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
            Reports & Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive attendance insights and analytics
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <FileText className="h-4 w-4" />
            <span>Generate Report</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl">
            <Download className="h-4 w-4" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="semester">This Semester</option>
            <option value="year">This Year</option>
          </select>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="all">All Courses</option>
            <option value="cs101">CS101 - Intro to Programming</option>
            <option value="cs201">CS201 - Data Structures</option>
            <option value="math101">MATH101 - Calculus I</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={Users}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
            change="+5.2% from last month"
            changeType="positive"
          />
          <StatCard
            title="Active Courses"
            value={stats.totalCourses}
            icon={BookOpen}
            color="bg-gradient-to-r from-indigo-500 to-indigo-600"
            change="2 new courses"
            changeType="positive"
          />
          <StatCard
            title="Attendance Rate"
            value={`${stats.attendanceRate}%`}
            icon={TrendingUp}
            color="bg-gradient-to-r from-emerald-500 to-emerald-600"
            change="+2.1% from last week"
            changeType="positive"
          />
          <StatCard
            title="Location Verified"
            value={`${Math.round(
              (stats.locationVerifiedToday / stats.todayPresent) * 100
            )}%`}
            icon={Activity}
            color="bg-gradient-to-r from-purple-500 to-purple-600"
            change="95% verification rate"
            changeType="positive"
          />
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Attendance Trend */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Weekly Attendance Trend
            </h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Present</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Absent</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Late</span>
              </div>
            </div>
          </div>
          {loading ? (
            <div className="animate-pulse bg-gray-200 h-64 rounded"></div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Bar dataKey="present" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="late" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Today's Attendance Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Today's Distribution
          </h3>
          {loading ? (
            <div className="animate-pulse bg-gray-200 h-64 rounded"></div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <RechartsPieChart>
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
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="flex justify-center space-x-4 mt-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">
                    Present ({stats?.todayPresent})
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">
                    Absent ({stats?.todayAbsent})
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Department Performance */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Department Performance
        </h3>
        {loading ? (
          <div className="animate-pulse bg-gray-200 h-64 rounded"></div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis
                dataKey="department"
                type="category"
                stroke="#6b7280"
                width={120}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Bar dataKey="attendance" fill="#3B82F6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Monthly Trends
        </h3>
        {loading ? (
          <div className="animate-pulse bg-gray-200 h-64 rounded"></div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="attendance"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#10B981", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="enrollment"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#3B82F6", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Reports;
