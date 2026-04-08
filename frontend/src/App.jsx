import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import MealPlanner from './pages/MealPlanner';
import FoodLogger from './pages/FoodLogger';
import Analytics from './pages/Analytics';
import Places from './pages/Places';
import Chatbot from './pages/Chatbot';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <Routes>

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Onboarding */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Onboarding />
              </>
            </ProtectedRoute>
          }
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Dashboard />
              </>
            </ProtectedRoute>
          }
        />

        {/* Meal Planner */}
        <Route
          path="/meal-planner"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <MealPlanner />
              </>
            </ProtectedRoute>
          }
        />

        {/* Food Logger */}
        <Route
          path="/food-logger"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <FoodLogger />
              </>
            </ProtectedRoute>
          }
        />

        {/* Analytics */}
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Analytics />
              </>
            </ProtectedRoute>
          }
        />

        {/* Places */}
        <Route
          path="/places"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Places />
              </>
            </ProtectedRoute>
          }
        />

        {/* Chatbot */}
        <Route
          path="/chatbot"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Chatbot />
              </>
            </ProtectedRoute>
          }
        />

        {/* Root Redirect */}
        <Route
          path="/"
          element={
            <Navigate
              to={isAuthenticated ? "/dashboard" : "/login"}
              replace
            />
          }
        />

        {/* Fallback */}
        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />

      </Routes>
    </Router>
  );
}

export default App;