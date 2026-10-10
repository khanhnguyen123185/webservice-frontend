import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AttendancePage from './pages/AttendancePage';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/diem-danh" replace />} />
        <Route path="/diem-danh" element={<AttendancePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;