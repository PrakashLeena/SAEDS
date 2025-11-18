import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home'));
const Browse = lazy(() => import('./pages/Browse'));
const BrowseSection = lazy(() => import('./pages/BrowseSection'));
const BookDetail = lazy(() => import('./pages/BookDetail'));
const ConnectionTest = process.env.NODE_ENV !== 'production' ? lazy(() => import('./components/ConnectionTest')) : null;
const Favorites = lazy(() => import('./pages/Favorites'));
const Profile = lazy(() => import('./pages/Profile'));
const Activity = lazy(() => import('./pages/Activity'));
const Contact = lazy(() => import('./pages/Contact'));
const SignIn = lazy(() => import('./pages/SignIn'));
const SignUp = lazy(() => import('./pages/SignUp'));
// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const UserForm = lazy(() => import('./pages/admin/UserForm'));
const BookManagement = lazy(() => import('./pages/admin/BookManagement'));
const BookForm = lazy(() => import('./pages/admin/BookForm'));
const ActivityManagement = lazy(() => import('./pages/admin/ActivityManagement'));
const ActivityForm = lazy(() => import('./pages/admin/ActivityForm'));
const MemberManagement = lazy(() => import('./pages/admin/MemberManagement'));
const MemberForm = lazy(() => import('./pages/admin/MemberForm'));
const AchievementManagement = lazy(() => import('./pages/admin/AchievementManagement'));
const AchievementForm = lazy(() => import('./pages/admin/AchievementForm'));
const Gallery = lazy(() => import('./pages/Gallery'));
const GalleryManagement = lazy(() => import('./pages/admin/GalleryManagement'));
const ElibraryManagement = lazy(() => import('./pages/admin/ElibraryManagement'));
const FolderStructureAdmin = lazy(() => import('./pages/admin/FolderStructureAdmin'));
const JoinUs = lazy(() => import('./pages/JoinUs'));
const JoinSuccess = lazy(() => import('./pages/JoinSuccess'));
const Members = lazy(() => import('./pages/Members'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <ErrorBoundary>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Suspense fallback={<div className="p-6 text-center text-gray-600">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/browse" element={<Browse />} />
              {process.env.NODE_ENV !== 'production' && ConnectionTest && (
                <Route path="/test-connection" element={<ConnectionTest />} />
              )}
              <Route path="/browse/section/:folderId" element={<BrowseSection />} />
              <Route path="/book/:id" element={<BookDetail />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/members" element={<Members />} />
              <Route path="/activity" element={<Activity />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/join" element={<JoinUs />} />
              <Route path="/join-success" element={<JoinSuccess />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              
              {/* Admin Routes - Protected */}
              <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute requireAdmin={true}><UserManagement /></ProtectedRoute>} />
              <Route path="/admin/users/add" element={<ProtectedRoute requireAdmin={true}><UserForm /></ProtectedRoute>} />
              <Route path="/admin/books" element={<ProtectedRoute requireAdmin={true}><BookManagement /></ProtectedRoute>} />
              <Route path="/admin/books/add" element={<ProtectedRoute requireAdmin={true}><BookForm /></ProtectedRoute>} />
              <Route path="/admin/books/edit/:id" element={<ProtectedRoute requireAdmin={true}><BookForm /></ProtectedRoute>} />
              <Route path="/admin/activities" element={<ProtectedRoute requireAdmin={true}><ActivityManagement /></ProtectedRoute>} />
              <Route path="/admin/activities/add" element={<ProtectedRoute requireAdmin={true}><ActivityForm /></ProtectedRoute>} />
              <Route path="/admin/activities/edit/:id" element={<ProtectedRoute requireAdmin={true}><ActivityForm /></ProtectedRoute>} />
              <Route path="/admin/members" element={<ProtectedRoute requireAdmin={true}><MemberManagement /></ProtectedRoute>} />
              <Route path="/admin/members/add" element={<ProtectedRoute requireAdmin={true}><MemberForm /></ProtectedRoute>} />
              <Route path="/admin/members/edit/:id" element={<ProtectedRoute requireAdmin={true}><MemberForm /></ProtectedRoute>} />
              <Route path="/admin/achievements" element={<ProtectedRoute requireAdmin={true}><AchievementManagement /></ProtectedRoute>} />
              <Route path="/admin/achievements/add" element={<ProtectedRoute requireAdmin={true}><AchievementForm /></ProtectedRoute>} />
              <Route path="/admin/achievements/edit/:id" element={<ProtectedRoute requireAdmin={true}><AchievementForm /></ProtectedRoute>} />
              <Route path="/admin/gallery" element={<ProtectedRoute requireAdmin={true}><GalleryManagement /></ProtectedRoute>} />
              <Route path="/admin/elibrary" element={<ProtectedRoute requireAdmin={true}><ElibraryManagement /></ProtectedRoute>} />
              <Route path="/admin/folder-structure" element={<ProtectedRoute requireAdmin={true}><FolderStructureAdmin /></ProtectedRoute>} />
            </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
        </ErrorBoundary>
      </AuthProvider>
    </Router>
  );
}

export default App;
