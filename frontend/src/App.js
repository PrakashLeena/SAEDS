import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Browse from './pages/Browse';
import BrowseSection from './pages/BrowseSection';
import BookDetail from './pages/BookDetail';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import Activity from './pages/Activity';
import Contact from './pages/Contact';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import UserForm from './pages/admin/UserForm';
import BookManagement from './pages/admin/BookManagement';
import BookForm from './pages/admin/BookForm';
import ActivityManagement from './pages/admin/ActivityManagement';
import ActivityForm from './pages/admin/ActivityForm';
import MemberManagement from './pages/admin/MemberManagement';
import MemberForm from './pages/admin/MemberForm';
import Gallery from './pages/Gallery';
import GalleryManagement from './pages/admin/GalleryManagement';
import ElibraryManagement from './pages/admin/ElibraryManagement';
import JoinUs from './pages/JoinUs';
import JoinSuccess from './pages/JoinSuccess';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ErrorBoundary>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/browse/section/:folderId" element={<BrowseSection />} />
              <Route path="/book/:id" element={<BookDetail />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/activity" element={<Activity />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/join" element={<JoinUs />} />
              <Route path="/join-success" element={<JoinSuccess />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/users/add" element={<UserForm />} />
              <Route path="/admin/books" element={<BookManagement />} />
              <Route path="/admin/books/add" element={<BookForm />} />
              <Route path="/admin/books/edit/:id" element={<BookForm />} />
              <Route path="/admin/activities" element={<ActivityManagement />} />
              <Route path="/admin/activities/add" element={<ActivityForm />} />
              <Route path="/admin/activities/edit/:id" element={<ActivityForm />} />
              <Route path="/admin/members" element={<MemberManagement />} />
              <Route path="/admin/members/add" element={<MemberForm />} />
              <Route path="/admin/members/edit/:id" element={<MemberForm />} />
              <Route path="/admin/gallery" element={<GalleryManagement />} />
              <Route path="/admin/elibrary" element={<ElibraryManagement />} />
            </Routes>
          </main>
          <Footer />
        </div>
        </ErrorBoundary>
      </AuthProvider>
    </Router>
  );
}

export default App;
