import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, RedirectGuard } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

import Navbar from './components/Navbar';

import HomePage from './pages/HomePage';
import Publications from './pages/Publications';
import PublicationDetail from './pages/PublicationDetail';
import Researchers from './pages/Researchers';
import ResearcherDetail from './pages/ResearcherDetail';
import SearchPage from './pages/SearchPage';
import Highlights from './pages/Highlights';
import HighlightDetail from './pages/HighlightDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import MyPublications from './pages/dashboard/MyPublications';
import ResearcherProfile from './pages/dashboard/ResearcherProfile';
import AdminDashboard from './pages/admin/AdminPanel.jsx';
import ModerateurPanel from './pages/moderator/ModeratorPanel';

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
            <Route path="/researchers" element={<Researchers />} />
            <Route path="/researchers/:id" element={<ResearcherDetail />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/highlights" element={<Highlights />} />
            <Route path="/highlights/:id" element={<HighlightDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/profile" element={
              <PrivateRoute><Profile /></PrivateRoute>
            } />
            <Route path="/dashboard" element={
              <PrivateRoute><Dashboard /></PrivateRoute>
            } />
            <Route path="/dashboard/publications" element={
              <PrivateRoute><MyPublications /></PrivateRoute>
            } />
            <Route path="/dashboard/researcher-profile" element={
              <PrivateRoute><ResearcherProfile /></PrivateRoute>
            } />
            <Route path="/admin/*" element={
              <PrivateRoute roles={['ADMIN']}><AdminDashboard /></PrivateRoute>
            } />
            <Route path="/moderateur/*" element={
              <PrivateRoute roles={['MODERATEUR', 'ADMIN']}><ModerateurPanel /></PrivateRoute>
            } />
          </Routes>
        </main>

      </Router>
    </AuthProvider>
  );
}

export default App;