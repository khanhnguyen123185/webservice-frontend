import api from './api';

export const attendanceService = {
  // Lấy danh sách sinh viên: GET /students
  getStudents: async () => {
    const response = await api.get('/students');
    return response.data;
  },

  // Gửi thông tin điểm danh: POST /attendance
  submitAttendance: async (attendanceData) => {
    const response = await api.post('/attendance', attendanceData);
    return response.data;
  },

  // Cập nhật điểm danh: PUT /update/:id
  updateAttendance: async (id, updateData) => {
    const response = await api.put(`/update/${id}`, updateData);
    return response.data;
  },

  // Xóa buổi điểm danh: DELETE /session/:id
  deleteSession: async (sessionId) => {
    const response = await api.delete(`/session/${sessionId}`);
    return response.data;
  }
};