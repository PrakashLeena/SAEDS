import React, { useState, useEffect } from 'react';
import { TrendingUp, Mail, Phone, MapPin, Calendar, Search } from 'lucide-react';
import { memberAPI } from '../services/api';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [searchTerm, selectedCategory, members]);

  const fetchMembers = async () => {
    try {
      const res = await memberAPI.getAll();
      if (res && res.success) {
        const list = res.data || [];
        setMembers(list);
        setFilteredMembers(list);
      }
    } catch (err) {
      console.error('Failed to fetch members:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    let filtered = [...members];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.universityOrRole && member.universityOrRole.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category (you can add category field to members if needed)
    if (selectedCategory !== 'all') {
      // Add category filtering logic here if you have categories
    }

    setFilteredMembers(filtered);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Community Members
          </h1>
          <p className="text-lg text-gray-600">
            Meet the amazing people who make our community thrive
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search members by name or role..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Filter (optional - can be expanded) */}
            <div className="md:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Members</option>
                <option value="active">Active</option>
                <option value="alumni">Alumni</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredMembers.length} of {members.length} members
          </div>
        </div>

        {/* Members Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading members...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">No members found</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMembers.map((member, index) => {
              const avatar = member.photoURL || 'https://via.placeholder.com/150';
              const role = member.universityOrRole || 'Member';
              const bio = member.notes || '';
              const sinceYear = member.since || (member.joinedAt ? new Date(member.joinedAt).getFullYear() : '');
              const email = member.email || '';
              const phone = member.phone || '';
              const address = member.address || '';

              return (
                <div
                  key={member._id || index}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Avatar Section */}
                  <div className="relative h-48 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                    <img
                      src={avatar}
                      alt={member.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  {/* Content Section */}
                  <div className="p-6">
                    {/* Name and Role */}
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                      <p className="text-sm text-primary-600 font-medium">{role}</p>
                    </div>

                    {/* Bio */}
                    {bio && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 text-center">
                        {bio}
                      </p>
                    )}

                    {/* Contact Info */}
                    <div className="space-y-2 mb-4">
                      {email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2 text-primary-500 flex-shrink-0" />
                          <span className="truncate">{email}</span>
                        </div>
                      )}
                      {phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2 text-primary-500 flex-shrink-0" />
                          <span>{phone}</span>
                        </div>
                      )}
                      {address && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 text-primary-500 flex-shrink-0" />
                          <span className="truncate">{address}</span>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-1 text-gray-500 text-xs">
                        <TrendingUp className="h-4 w-4" />
                        <span>Member</span>
                      </div>
                      {sinceYear && (
                        <div className="flex items-center space-x-1 text-gray-500 text-xs">
                          <Calendar className="h-4 w-4" />
                          <span>Since {sinceYear}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Members;
