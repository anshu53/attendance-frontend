const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";
console.log("API base URL:", import.meta.env.VITE_API_URL);
class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Network error" }));
      throw new Error(
        error.message || `HTTP error! status: ${response.status}`
      );
    }
    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return this.handleResponse(response);
  }

  async register(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Registration failed");
    }

    return response.json();
  }

  // Admin endpoints
  async getPendingUsers() {
    const response = await fetch(`${API_BASE_URL}/users/pending`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async approveUser(userId: string) {
    const response = await fetch(`${API_BASE_URL}/users/approve/${userId}`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });
    console.log("Approving user:", userId);
    return this.handleResponse(response);
  }

  async rejectUser(userId: string) {
    const response = await fetch(`${API_BASE_URL}/users/reject/${userId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Location endpoints
  async getLocations() {
    const response = await fetch(`${API_BASE_URL}/locations`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async verifyLocation(locationData: any) {
    const response = await fetch(`${API_BASE_URL}/attendance/verify-location`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(locationData),
    });
    return this.handleResponse(response);
  }

  // Course endpoints
  async getCourses() {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async createCourse(courseData: any) {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(courseData),
    });
    return this.handleResponse(response);
  }

  async updateCourse(courseId: string, courseData: any) {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(courseData),
    });
    return this.handleResponse(response);
  }

  async deleteCourse(courseId: string) {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getCourseStats() {
    const response = await fetch(`${API_BASE_URL}/courses/stats/overview`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Attendance endpoints
  async getAttendance(filters?: {
    courseId?: string;
    studentId?: string;
    date?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.courseId) params.append("courseId", filters.courseId);
    if (filters?.studentId) params.append("studentId", filters.studentId);
    if (filters?.date) params.append("date", filters.date);

    const response = await fetch(`${API_BASE_URL}/attendance?${params}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async markAttendance(attendanceData: any) {
    const response = await fetch(`${API_BASE_URL}/attendance`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(attendanceData),
    });
    return this.handleResponse(response);
  }

  async getAttendanceStats() {
    const response = await fetch(`${API_BASE_URL}/attendance/stats`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getWeeklyAttendance() {
    const response = await fetch(`${API_BASE_URL}/attendance/weekly`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // User endpoints
  async getUsers() {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getStudents() {
    const response = await fetch(`${API_BASE_URL}/users/students`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getTeachers() {
    const response = await fetch(`${API_BASE_URL}/users/teachers`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async createUser(userData: any) {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  async getUserStats() {
    const response = await fetch(`${API_BASE_URL}/users/stats`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Health check
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return this.handleResponse(response);
  }

  // Location detection utilities
  async getCurrentLocation(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }

  async getWiFiNetworks(): Promise<string[]> {
    // Note: Direct WiFi scanning is not available in web browsers for security reasons
    // This would typically be handled by a native app or browser extension
    // For demo purposes, we'll simulate WiFi detection
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate detected WiFi networks
        const mockNetworks = [
          "CollegeWiFi_CS201",
          "CollegeWiFi_CS202",
          "CollegeWiFi_Main",
          "StudentWiFi",
        ];
        resolve(mockNetworks);
      }, 1000);
    });
  }

  async getBluetoothBeacons(): Promise<string[]> {
    // Note: Web Bluetooth API has limited support and requires user interaction
    // This would typically be handled by a native app
    // For demo purposes, we'll simulate Bluetooth beacon detection
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate detected Bluetooth beacons
        const mockBeacons = [
          "CS201-BEACON-001",
          "CS201-BEACON-002",
          "CS202-BEACON-001",
        ];
        resolve(mockBeacons);
      }, 1500);
    });
  }

  async detectLocationData() {
    try {
      const [coordinates, wifiNetworks, bluetoothBeacons] =
        await Promise.allSettled([
          this.getCurrentLocation(),
          this.getWiFiNetworks(),
          this.getBluetoothBeacons(),
        ]);

      return {
        coordinates:
          coordinates.status === "fulfilled" ? coordinates.value : null,
        wifiSSID:
          wifiNetworks.status === "fulfilled" ? wifiNetworks.value[0] : null,
        bluetoothBeacons:
          bluetoothBeacons.status === "fulfilled" ? bluetoothBeacons.value : [],
      };
    } catch (error) {
      console.error("Location detection error:", error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
export default apiService;
