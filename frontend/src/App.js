import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import OAuthCallback from './pages/auth/OAuthCallback';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Unauthorized from './pages/auth/Unauthorized';

// Protected Route Component
import ProtectedRoute from './components/routing/ProtectedRoute';

// Main Pages
import Home from './pages/Home';
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/profile/Profile';

// Team Pages
import TeamsList from './pages/teams/TeamsList';
import TeamDetail from './pages/teams/TeamDetail';
import CreateTeam from './pages/teams/CreateTeam';
import EditTeam from './pages/teams/EditTeam';
import InvitationResponse from './pages/teams/InvitationResponse';

// Project Pages
import ProjectsList from './pages/projects/ProjectsList';
import ProjectDetail from './pages/projects/ProjectDetail';
import CreateProject from './pages/projects/CreateProject';
import EditProject from './pages/projects/EditProject';

// Admin Pages
import UserManagement from './pages/admin/UserManagement';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <div className="flex-grow bg-gray-50">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/oauth-callback" element={<OAuthCallback />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Team Routes - Public view with some protected actions */}
              <Route path="/teams" element={<TeamsList />} />
              <Route path="/teams/:id" element={<TeamDetail />} />
              
              {/* Team Invitation */}
              <Route path="/teams/invite/:token" element={<InvitationResponse />} />
              
              {/* Project Routes */}
              <Route path="/projects" element={<ProjectsList />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/teams/create" element={<CreateTeam />} />
                <Route path="/teams/:id/edit" element={<EditTeam />} />
                <Route path="/projects/create" element={<CreateProject />} />
                <Route path="/projects/:id/edit" element={<EditProject />} />
              </Route>
              
              {/* Admin Routes */}
              <Route element={<ProtectedRoute requiredRole="admin" />}>
                <Route path="/admin/users" element={<UserManagement />} />
              </Route>
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
