import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Calendar, Heart, Lightbulb, Globe, TrendingUp } from 'lucide-react';
import HeroSlider from '../components/HeroSlider';
// Members will be fetched from the backend
import api from '../services/api';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const Home = () => {
  // featuredBooks removed - demo lists cleared
  const [aboutRef, aboutVisible] = useScrollAnimation();
  const [membersRef, membersVisible] = useScrollAnimation();
  const [members, setMembers] = useState([]);
  const [servicesRef, servicesVisible] = useScrollAnimation();
  const [booksRef, booksVisible] = useScrollAnimation();
  const [activeMembers, setActiveMembers] = useState('5,000+');
  const [eventsHosted, setEventsHosted] = useState('150+');

  useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      try {
        const res = await api.stats.getOverview();
        if (!mounted) return;
        const { activeMembers: a, eventsHosted: e } = res.data || {};

        const fmt = (n) => {
          if (typeof n !== 'number') return n || '0';
          if (n >= 1000) return `${Math.round(n / 100) / 10}k+`.replace('.0k', 'k+');
          return `${n}+`;
        };

        if (typeof a !== 'undefined') setActiveMembers(fmt(a));
        if (typeof e !== 'undefined') setEventsHosted(fmt(e));
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };

    fetchStats();
    // fetch featured members from backend
    const fetchMembers = async () => {
      try {
        const res = await api.member.getAll();
        if (!mounted) return;
        const list = (res && res.data) ? res.data : [];
        // show up to 6 featured members
        setMembers(list.slice(0, 6));
      } catch (err) {
        console.error('Failed to fetch members:', err);
      }
    };

    fetchMembers();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Slider */}
      <HeroSlider />

      {/* About Community Section */}
      <section ref={aboutRef} className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 transition-all duration-700 ${aboutVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Building a Stronger Community Together
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We are dedicated to creating a vibrant space where members can connect, share knowledge, 
              access resources, and support each other's growth and development.
            </p>
          </div>
          
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 text-center transition-all duration-700 delay-200 ${aboutVisible ? 'animate-fade-in' : 'opacity-0'}`}>
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <Users className="h-12 w-12 text-primary-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{activeMembers}</h3>
              <p className="text-gray-600">Active Members</p>
            </div>
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <Calendar className="h-12 w-12 text-primary-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{eventsHosted}</h3>
              <p className="text-gray-600">Events Hosted</p>
            </div>
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <Heart className="h-12 w-12 text-primary-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">100%</h3>
              <p className="text-gray-600">Community Driven</p>
            </div>
          </div>
        </div>
      </section>

  {/* Featured Members Section */}
  <section id="members" ref={membersRef} className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 transition-all duration-700 ${membersVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Community Members
            </h2>
            <p className="text-lg text-gray-600">
              Connect with amazing people making a difference
            </p>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-700 ${membersVisible ? 'opacity-100' : 'opacity-0'}`}>
            {(!members || members.length === 0) ? (
              <div className="col-span-full bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-600">We don't have featured members yet. View all members to explore the community.</p>
                <div className="mt-4">
                  <Link to="/profile" className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium">
                    <span>View All Members</span>
                  </Link>
                </div>
              </div>
            ) : (
              members.map((member, index) => {
                const avatar = member.photoURL || 'https://via.placeholder.com/150';
                const role = member.universityOrRole || '';
                const bio = member.notes || '';
                const joined = member.joinedAt ? new Date(member.joinedAt).getFullYear() : '';
                return (
                  <div 
                    key={member._id || index} 
                    className={`bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all hover:-translate-y-2 ${membersVisible ? 'animate-fade-in-up' : ''}`}
                    style={{animationDelay: `${index * 100}ms`}}
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={avatar}
                        alt={member.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-primary-200"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                        <p className="text-sm text-primary-600 font-medium">{role}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{bio}</p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1 text-gray-500">
                        <TrendingUp className="h-4 w-4" />
                        <span>Contributions</span>
                      </div>
                      <span className="text-gray-400">Since {joined}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className={`text-center mt-8 transition-all duration-700 delay-300 ${membersVisible ? 'animate-fade-in' : 'opacity-0'}`}>
            <Link
              to="/profile"
              className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium hover:gap-3 transition-all"
            >
              <span>View All Members</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Community Activity removed */}

      {/* Community Services Section */}
      <section ref={servicesRef} id="services" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 transition-all duration-700 ${servicesVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Community Services
            </h2>
            <p className="text-lg text-gray-600">
              Explore the various resources and opportunities available to our members
            </p>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-700 ${servicesVisible ? 'opacity-100' : 'opacity-0'}`}>
            {/* E-Library Service */}
            <div className={`bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition-all hover:scale-105 hover:-translate-y-1 ${servicesVisible ? 'animate-fade-in-up' : ''}`} style={{animationDelay: '100ms'}}>
              <div className="flex justify-center mb-4">
                <div className="bg-primary-100 p-4 rounded-full">
                  <BookOpen className="h-10 w-10 text-primary-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">E-Library</h3>
              <p className="text-gray-600 text-center mb-4">
                Access thousands of books, journals, and educational resources for free
              </p>
              <Link
                to="/browse"
                className="block w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors text-center font-medium"
              >
                Browse Books
              </Link>
            </div>

            {/* Events Service */}
            <div className={`bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition-all hover:scale-105 hover:-translate-y-1 ${servicesVisible ? 'animate-fade-in-up' : ''}`} style={{animationDelay: '200ms'}}>
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-4 rounded-full">
                  <Calendar className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Events & Workshops</h3>
              <p className="text-gray-600 text-center mb-4">
                Join our regular events, workshops, and networking sessions
              </p>
              <Link
                to="/activity"
                className="block w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-center font-medium"
              >
                View Events
              </Link>
            </div>


            {/* Learning Resources removed per request */}


            {/* Global Network */}
            <div className={`bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition-all hover:scale-105 hover:-translate-y-1 ${servicesVisible ? 'animate-fade-in-up' : ''}`} style={{animationDelay: '600ms'}}>
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-4 rounded-full">
                  <Globe className="h-10 w-10 text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Global Network</h3>
              <p className="text-gray-600 text-center mb-4">
                Connect with community members from around the world
              </p>
              <Link to="/join" className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium">
                Join Network
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books from E-Library (demo lists removed) */}
      <section ref={booksRef} className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex justify-between items-center mb-8 transition-all duration-700 ${booksVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured from E-Library</h2>
              <p className="text-gray-600">Discover popular books from our digital collection</p>
            </div>
            <Link
              to="/browse"
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1 hover:gap-2 transition-all"
            >
              <span>View All Books</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className={`text-center py-12 transition-all duration-700 ${booksVisible ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-gray-600">We don't have featured books yet. Visit the E-Library to explore our collection.</p>
            <div className="mt-4">
              <Link to="/browse" className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium">
                <span>Browse the Library</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Join Our Community?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Become a member today and unlock access to all our resources and services
          </p>
          <Link
            to="/join"
            className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
          >
            <Users className="h-5 w-5" />
            <span>Become a Member</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
