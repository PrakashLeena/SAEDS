import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Calendar, Heart, Globe, TrendingUp, Trophy, Award, Medal, Star } from 'lucide-react';
const HeroSlider = lazy(() => import('../components/HeroSlider'));
const JoinModal = lazy(() => import('../components/JoinModal'));
// Members will be fetched from the backend
import api from '../services/api';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const Home = () => {
  // featuredBooks removed - demo lists cleared
  const [aboutRef, aboutVisible] = useScrollAnimation();
  const [membersRef, membersVisible] = useScrollAnimation();
  const [members, setMembers] = useState([]);
  const [achievementsRef, achievementsVisible] = useScrollAnimation();
  const [achievements, setAchievements] = useState([]);
  const [servicesRef, servicesVisible] = useScrollAnimation();
  const [booksRef, booksVisible] = useScrollAnimation();
  const [activeMembers, setActiveMembers] = useState('5,000+');
  const [eventsHosted, setEventsHosted] = useState('150+');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fmt = (n) => {
      if (typeof n !== 'number') return n || '0';
      if (n >= 1000) return `${Math.round(n / 100) / 10}k+`.replace('.0k', 'k+');
      return `${n}+`;
    };

    // Fetch all data in parallel for better performance
    Promise.all([
      api.stats.getOverview(),
      api.member.getAll(),
      api.achievement.getAll()
    ]).then(([statsRes, membersRes, achievementsRes]) => {
      if (!mounted) return;
      
      // Set stats
      const { activeMembers: a, eventsHosted: e } = statsRes?.data || {};
      if (typeof a !== 'undefined') setActiveMembers(fmt(a));
      if (typeof e !== 'undefined') setEventsHosted(fmt(e));
      
      // Set members (first 6)
      const membersList = membersRes?.data || [];
      setMembers(membersList.slice(0, 6));
      
      // Set achievements
      const achievementsList = achievementsRes?.data || [];
      setAchievements(achievementsList);
    }).catch(err => {
      console.error('Failed to fetch data:', err);
    });

    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Slider */}
      <Suspense fallback={<div className="h-[500px] sm:h-[550px] md:h-[600px] lg:h-[700px] bg-gray-200 animate-pulse" />}> 
        <HeroSlider onOpenJoinModal={() => setIsJoinModalOpen(true)} />
      </Suspense>
      
      {/* Join Modal */}
      <Suspense fallback={null}>
        <JoinModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} />
      </Suspense>

      {/* Mission and Vision Section */}
      <section className="py-16 bg-gradient-to-br from-primary-50 via-white to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 md:gap-8 lg:gap-12">
            {/* Mission */}
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-10 border-t-4 border-primary-600 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-center mb-3 md:mb-6">
                <div className="bg-primary-100 p-2 sm:p-3 md:p-4 rounded-full">
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-primary-600" />
                </div>
              </div>
              <h2 className="text-sm sm:text-xl md:text-3xl font-bold text-center text-gray-900 mb-2 md:mb-4">
                OUR MISSION
              </h2>
              <div className="h-0.5 md:h-1 w-12 md:w-20 bg-primary-600 mx-auto mb-3 md:mb-6"></div>
              <p className="text-center text-xs sm:text-base md:text-xl font-semibold text-primary-700 leading-relaxed">
                TOGETHER WE MAKE A DIFFERENCE
              </p>
            </div>

            {/* Vision */}
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-10 border-t-4 border-green-600 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-center mb-3 md:mb-6">
                <div className="bg-green-100 p-2 sm:p-3 md:p-4 rounded-full">
                  <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-green-600" />
                </div>
              </div>
              <h2 className="text-sm sm:text-xl md:text-3xl font-bold text-center text-gray-900 mb-2 md:mb-4">
                OUR VISION
              </h2>
              <div className="h-0.5 md:h-1 w-12 md:w-20 bg-green-600 mx-auto mb-3 md:mb-6"></div>
              <p className="text-center text-xs sm:text-sm md:text-lg font-medium text-gray-700 leading-relaxed">
                CREATING A BETTER-EDUCATED AND THRIVING SOCIETY FOR OUR VILLAGE, 
                EMPOWERING EVERYONE THROUGH ACCESSIBLE AND QUALITY EDUCATION.
              </p>
            </div>
          </div>
        </div>
      </section>

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
          
          <div className={`grid grid-cols-3 gap-2 sm:gap-4 md:gap-8 text-center transition-all duration-700 delay-200 ${aboutVisible ? 'animate-fade-in' : 'opacity-0'}`}>
            <div className="p-2 sm:p-4 md:p-6">
              <div className="flex justify-center mb-2 md:mb-4">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 md:h-12 md:w-12 text-primary-600" />
              </div>
              <h3 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">{activeMembers}</h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-600">Active Members</p>
            </div>
            <div className="p-2 sm:p-4 md:p-6">
              <div className="flex justify-center mb-2 md:mb-4">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 md:h-12 md:w-12 text-primary-600" />
              </div>
              <h3 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">{eventsHosted}</h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-600">Events Hosted</p>
            </div>
            <div className="p-2 sm:p-4 md:p-6">
              <div className="flex justify-center mb-2 md:mb-4">
                <Heart className="h-6 w-6 sm:h-8 sm:w-8 md:h-12 md:w-12 text-primary-600" />
              </div>
              <h3 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">100%</h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-600">Community Driven</p>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section ref={achievementsRef} className="py-16 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 transition-all duration-700 ${achievementsVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Achievements
            </h2>
            <p className="text-lg text-primary-100">
              Milestones we've reached together as a community
            </p>
          </div>

          {achievements.length === 0 ? (
            <div className={`text-center py-12 transition-all duration-700 ${achievementsVisible ? 'animate-fade-in' : 'opacity-0'}`}>
              <Trophy className="h-16 w-16 mx-auto mb-4 text-primary-200" />
              <p className="text-primary-100">No achievements to display yet.</p>
            </div>
          ) : (
            <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 transition-all duration-700 ${achievementsVisible ? 'opacity-100' : 'opacity-0'}`}>
              {achievements.map((achievement, index) => {
                // Icon mapping
                const iconMap = {
                  trophy: Trophy,
                  award: Award,
                  medal: Medal,
                  star: Star,
                };
                const IconComponent = iconMap[achievement.icon] || Trophy;

                return (
                  <div
                    key={achievement._id || index}
                    className={`bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 text-center hover:bg-white/20 transition-all hover:scale-105 ${achievementsVisible ? 'animate-fade-in-up' : ''}`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex justify-center mb-3 md:mb-4">
                      {achievement.imageURL ? (
                        <div className="bg-white/20 p-2 rounded-lg">
                          <img
                            src={achievement.imageURL}
                            alt={achievement.title}
                            className="h-16 w-16 md:h-20 md:w-20 object-contain"
                          />
                        </div>
                      ) : (
                        <div className="bg-white/20 p-3 md:p-4 rounded-full">
                          <IconComponent className="h-6 w-6 md:h-8 md:w-8 text-white" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-2xl md:text-4xl font-bold mb-2">{achievement.value}</h3>
                    <p className="text-sm md:text-base font-semibold mb-1">{achievement.title}</p>
                    <p className="text-xs md:text-sm text-primary-100">{achievement.description}</p>
                  </div>
                );
              })}
            </div>
          )}
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

          {(!members || members.length === 0) ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600">We don't have featured members yet. View all members to explore the community.</p>
              <div className="mt-4">
                <Link to="/members" className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium">
                  <span>View All Members</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden">
              {/* Scrollable Container */}
              <div 
                className={`flex gap-6 animate-scroll-horizontal transition-all duration-700 ${membersVisible ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  animation: members.length > 3 ? 'scroll-horizontal 8s linear infinite' : 'none'
                }}
              >
                {/* Duplicate members for seamless loop */}
                {[...members, ...members].map((member, index) => {
                  const avatar = member.photoURL || 'https://via.placeholder.com/150';
                  const role = member.universityOrRole || '';
                  const bio = member.notes || '';
                  const sinceYear = member.since || (member.joinedAt ? new Date(member.joinedAt).getFullYear() : '');
                  return (
                    <div 
                      key={`${member._id || index}-${index}`}
                      className="flex-shrink-0 w-80 bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all hover:-translate-y-2"
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
                      {bio && <p className="text-gray-600 text-sm mb-4 line-clamp-2">{bio}</p>}
                      <div className="flex items-center justify-between text-sm mt-4">
                        <div className="flex items-center space-x-1 text-gray-500">
                          <TrendingUp className="h-4 w-4" />
                          <span>Member</span>
                        </div>
                        {sinceYear && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            Since {sinceYear}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className={`text-center mt-8 transition-all duration-700 delay-300 ${membersVisible ? 'animate-fade-in' : 'opacity-0'}`}>
            <Link
              to="/members"
              className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium hover:gap-3 transition-all"
            >
              <span>View All Members</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Community Activities Section */}
      <section id="activity" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Community Activities & Events
            </h2>
            <p className="text-lg text-gray-600">
              Join our workshops, seminars, and networking events
            </p>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-6">Explore our upcoming events and activities</p>
            <Link
              to="/activity"
              className="inline-flex items-center space-x-2 bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              <Calendar className="h-5 w-5" />
              <span>View All Activities</span>
            </Link>
          </div>
        </div>
      </section>

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
      <section id="browse" ref={booksRef} className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex justify-between items-center mb-8 transition-all duration-700 ${booksVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured from E-Library</h2>
              <p className="text-gray-600 text-lg">Unlock a world of knowledge at your fingertips</p>
              <p className="text-gray-700 mt-3 leading-relaxed">
                <span className="font-semibold text-primary-600">Advanced Level:</span> Past papers, model papers, comprehensive guides & detailed elaborations • 
                <span className="font-semibold text-primary-600 ml-2">Ordinary Level:</span> Past papers, model papers & essential study materials • 
                <span className="font-semibold text-primary-600 ml-2">Plus:</span> A vast collection of reference books and educational resources
              </p>
            </div>
           
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
