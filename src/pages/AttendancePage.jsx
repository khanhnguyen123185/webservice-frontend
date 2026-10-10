import { useState } from 'react';
import { Save, Loader2, Users, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import './AttendancePage.css';

// DỮ LIỆU MẪU (MOCK DATA)
const MOCK_DANH_SACH_SV = [
    { ID: 1, MA_SINHVIEN: 'SV001', HOTEN: 'Lê Thanh Bình', LOP: 'CNTT K2024', TRANG_THAI: 'CO_MAT' },
    { ID: 2, MA_SINHVIEN: 'SV002', HOTEN: 'Nguyễn Thị Mai', LOP: 'CNTT K2024', TRANG_THAI: 'CO_MAT' },
    { ID: 3, MA_SINHVIEN: 'SV003', HOTEN: 'Trần Văn Hoàng', LOP: 'CNTT K2023', TRANG_THAI: 'CO_PHEP' },
    { ID: 4, MA_SINHVIEN: 'SV004', HOTEN: 'Phạm Thị Lan', LOP: 'CNTT K2024', TRANG_THAI: 'CO_MAT' },
    { ID: 5, MA_SINHVIEN: 'SV005', HOTEN: 'Đặng Minh Tuấn', LOP: 'CNTT K2023', TRANG_THAI: 'VANG' },
    { ID: 6, MA_SINHVIEN: 'SV006', HOTEN: 'Bùi Thị Quỳnh', LOP: 'CNTT K2024', TRANG_THAI: 'CO_MAT' },
    { ID: 7, MA_SINHVIEN: 'SV007', HOTEN: 'Vũ Đức Nam', LOP: 'CNTT K2023', TRANG_THAI: 'CO_PHEP' },
    { ID: 8, MA_SINHVIEN: 'SV008', HOTEN: 'Ngô Thị Hạnh', LOP: 'CNTT K2024', TRANG_THAI: 'CO_MAT' }
];

export default function AttendancePage() {
    const [danhSachDiemDanh, setDanhSachDiemDanh] = useState(MOCK_DANH_SACH_SV);
    const [loading, setLoading] = useState(false);
    const [ngayDiemDanh, setNgayDiemDanh] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [attendanceSheets, setAttendanceSheets] = useState([]); // ✅ lưu dữ liệu hiển thị

    const handleStatusChange = (id, newStatus) => {
        setDanhSachDiemDanh(prev =>
            prev.map(item => item.ID === id ? { ...item, TRANG_THAI: newStatus } : item)
        );
    };

    const filteredDanhSach = danhSachDiemDanh.filter(item =>
        item.HOTEN.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.MA_SINHVIEN.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.LOP.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ✅ Lưu điểm danh ra file Excel (nhiều sheet)
    const handleExportExcel = () => {
        const worksheetData = filteredDanhSach.map(sv => ({
            'Mã SV': sv.MA_SINHVIEN,
            'Họ tên': sv.HOTEN,
            'Lớp': sv.LOP,
            'Trạng thái': sv.TRANG_THAI === 'CO_MAT'
                ? 'Có mặt'
                : sv.TRANG_THAI === 'CO_PHEP'
                    ? 'Có phép'
                    : 'Vắng'
        }));

        const sheetName = `DiemDanh_${ngayDiemDanh}`;
        const fileName = 'DiemDanh_TongHop.xlsx';

        try {
            let workbook;

            // 🔹 Đọc workbook cũ từ localStorage nếu có
            const existingWorkbook = localStorage.getItem('attendanceWorkbook');
            if (existingWorkbook) {
                const binary = Uint8Array.from(JSON.parse(existingWorkbook));
                workbook = XLSX.read(binary, { type: 'array' });
            } else {
workbook = XLSX.utils.book_new();
            }

            // 🔹 Tạo sheet mới cho ngày hiện tại
            const worksheet = XLSX.utils.json_to_sheet(worksheetData);

            // Nếu sheet đã tồn tại, xóa trước khi thêm mới
            if (workbook.SheetNames.includes(sheetName)) {
                delete workbook.Sheets[sheetName];
                workbook.SheetNames = workbook.SheetNames.filter(name => name !== sheetName);
            }

            // 🔹 Thêm sheet mới vào workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

            // 🔹 Ghi workbook ra file Excel duy nhất
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), fileName);

            // 🔹 Lưu workbook vào localStorage để tái sử dụng
            localStorage.setItem('attendanceWorkbook', JSON.stringify(Array.from(excelBuffer)));

            alert(`✅ Đã lưu điểm danh ngày ${ngayDiemDanh} vào sheet "${sheetName}" trong file ${fileName}`);
        } catch (error) {
            console.error('Lỗi khi lưu Excel:', error);
            alert('❌ Không thể lưu dữ liệu điểm danh. Vui lòng thử lại!');
        }
    };

    // ✅ Hiển thị dữ liệu các sheet ngay trong giao diện
    const handleViewAttendance = () => {
        const existingFile = localStorage.getItem('attendanceWorkbook');
        if (!existingFile) {
            alert('❌ Chưa có dữ liệu điểm danh nào được lưu.');
            return;
        }

        const binary = Uint8Array.from(JSON.parse(existingFile));
        const wb = XLSX.read(binary, { type: 'array' });

        const sheetsData = wb.SheetNames.map(name => {
            const sheet = wb.Sheets[name];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            return { name, data: jsonData };
        });

        setAttendanceSheets(sheetsData);
    };

    const handleSaveAttendance = async () => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 600));
            alert('✅ Lưu bảng điểm danh sinh viên thành công!');
        } catch (error) {
            console.error("Lỗi khi lưu điểm danh:", error);
            alert('❌ Không thể lưu dữ liệu điểm danh. Vui lòng kiểm tra lại kết nối!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold flex items-center mb-4">
                <Users className="mr-2" /> Điểm danh lớp học
            </h1>

            <div className="flex justify-between items-center mb-4">
                <div>
                    <label className="mr-2 font-semibold">Ngày điểm danh:</label>
                    <input
                        type="date"
                        value={ngayDiemDanh}
onChange={(e) => setNgayDiemDanh(e.target.value)}
                        className="border px-2 py-1 rounded"
                    />
                </div>
                <input
                    type="text"
                    placeholder="Tìm kiếm theo mã SV, họ tên, lớp..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border px-3 py-1 rounded w-1/3"
                />
            </div>

            {/* Bảng danh sách sinh viên */}
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">Mã SV</th>
                        <th className="border p-2">Họ tên</th>
                        <th className="border p-2">Lớp</th>
                        <th className="border p-2">Trạng thái</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredDanhSach.map((sv) => (
                        <tr key={sv.ID}>
                            <td className="border p-2">{sv.MA_SINHVIEN}</td>
                            <td className="border p-2">{sv.HOTEN}</td>
                            <td className="border p-2">{sv.LOP}</td>
                            <td className="border p-2 text-center">
                                <select

                                    value={sv.TRANG_THAI}
                                    onChange={(e) => handleStatusChange(sv.ID, e.target.value)}
                                    className={`status-select ${sv.TRANG_THAI === 'CO_MAT'
                                        ? 'status-green'
                                        : sv.TRANG_THAI === 'CO_PHEP'
                                            ? 'status-yellow'
                                            : 'status-red'
                                        }`}
                                >
                                    <option value="CO_MAT">Có mặt</option>
                                    <option value="CO_PHEP">Có phép</option>
                                    <option value="VANG">Vắng</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Nút chức năng */}
            <div className="mt-6 flex justify-center gap-4">
                <button
                    onClick={handleSaveAttendance}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin mr-2" /> Đang lưu...
                        </>
                    ) : (
                        <>
<Save className="mr-2" /> Lưu điểm danh
                        </>
                    )}
                </button>

                <button
                    onClick={handleExportExcel}
                    className="bg-green-600 text-white px-4 py-2 rounded flex items-center"
                >
                    <FileSpreadsheet className="mr-2" /> Xuất Excel
                </button>

                <button
                    onClick={handleViewAttendance}
                    className="bg-yellow-500 text-white px-4 py-2 rounded flex items-center"
                >
                    📘 Xem thông tin điểm danh
                </button>
            </div> {/* ✅ Đóng div chứa các nút chức năng */}
        </div>
    ); // ✅ Đóng return
} // ✅ Đóng hàm AttendancePage