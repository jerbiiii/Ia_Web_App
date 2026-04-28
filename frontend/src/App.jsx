import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, RedirectGuard } from './context/AuthContext';
import Navbar from './components/Navbar';

import HomePage from './pages/HomePage';
import Publications from './pages/Publications';
import PublicationDetail from './pages/PublicationDetail';
import Login from './pages/Login';
import Register from './pages/Register';


function App() {
  return (
    <AuthProvider>
      <Router>
        <RedirectGuard />
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/publications" element={<Publications />} />
            <Route path="/publications/:id" element={<PublicationDetail />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;