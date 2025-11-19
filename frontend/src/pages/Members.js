import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { TrendingUp, Mail, Phone, MapPin, Calendar, Search } from 'lucide-react';
import { memberAPI } from '../services/api';

const resolveRole = (member) => {
  if (!member || typeof member !== 'object') return '';

  const candidates = [
    member.roleInCommunity,
    member.role_in_community,
    member.roleincommunity,
    member.roleIncommunity,
    member.communityRole,
    member.role,
    member.designation,
    member.position,
    member?.details?.roleInCommunity,
    member?.profile?.roleInCommunity,
    member?.meta?.roleInCommunity,
    member?.attributes?.roleInCommunity,
    member?.attributes?.role,
    member?.data?.roleInCommunity,
    member?.role?.name,
    member?.role?.title,
    member?.role?.label,
    member['role in community']
  ];

  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }

  const dynamicKey = Object.keys(member).find(
    (key) => key.toLowerCase().replace(/\s|_/g, '') === 'roleincommunity'
  );
  if (dynamicKey && typeof member[dynamicKey] === 'string' && member[dynamicKey].trim()) {
    return member[dynamicKey].trim();
  }

  return '';
};

const resolveUniversity = (member) => {
  if (!member || typeof member !== 'object') return '';

  const candidates = [
    member.universityOrRole,
    member.university,
    member.job,
    member.occupation,
    member?.profile?.universityOrRole,
    member?.details?.universityOrRole
  ];

  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }

  return '';
};

const normalizeMember = (member) => {
  if (!member || typeof member !== 'object') return member;
  const roleInCommunity = resolveRole(member);
  const universityOrRole = resolveUniversity(member);

  if (roleInCommunity || universityOrRole) {
    return {
      ...member,
      ...(roleInCommunity ? { roleInCommunity } : {}),
      ...(universityOrRole ? { universityOrRole } : {})
    };
  }

  return member;
};

// Memoized loading state
const LoadingState = memo(() => (
  <div className="text-center py-12">
    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
    <p className="mt-4 text-gray-600">Loading members...</p>
  </div>
));

LoadingState.displayName = 'LoadingState';

// Memoized empty state
const EmptyState = memo(({ searchTerm, onClearSearch }) => (
  <div className="bg-white rounded-lg shadow-md p-12 text-center">
    <p className="text-gray-600 text-lg">No members found</p>
    {searchTerm && (
      <button
        onClick={onClearSearch}
        className="mt-4 text-primary-600 hover:text-primary-700 font-medium transition-colors"
      >
        Clear search
      </button>
    )}
  </div>
));

EmptyState.displayName = 'EmptyState';

// Memoized contact info row
const ContactRow = memo(({ icon: Icon, text }) => {
  if (!text) return null;
  
  return (
    <div className="flex items-center text-sm text-gray-600">
      <Icon className="h-4 w-4 mr-2 text-primary-500 flex-shrink-0" />
      <span className="truncate">{text}</span>
    </div>
  );
});

ContactRow.displayName = 'ContactRow';

// Memoized member card component
const MemberCard = memo(({ member, index }) => {
  const avatar = member.photoURL || 'https://via.placeholder.com/150';
  const communityRole = member?.roleInCommunity ? member.roleInCommunity : '';
  const jobOrUniversity = member?.universityOrRole ? member.universityOrRole : '';
  const bio = member.notes || '';
  
  const sinceYear = useMemo(() => 
    member.since || (member.joinedAt ? new Date(member.joinedAt).getFullYear() : ''),
    [member.since, member.joinedAt]
  );

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Avatar Section */}
      <div className="relative h-48 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
        <img
          src={avatar}
          alt={member.name}
          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Name and Roles */}
        <div className="text-center mb-4">
          {/* Name - bigger text */}
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{member.name}</h3>
          {/* Role in community - bold */}
          {communityRole && (
            <p className="text-sm font-semibold text-primary-700">{communityRole}</p>
          )}
          {/* Job role / University */}
          {jobOrUniversity && (
            <p className="text-sm text-black">{jobOrUniversity}</p>
          )}
        </div>

        {/* Bio */}
        {bio && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3 text-center">
            {bio}
          </p>
        )}

        {/* Contact Info */}
        <div className="space-y-2 mb-4 text-gray-600 text-xs">
          <ContactRow icon={Mail} text={member.email} />
          <ContactRow icon={Phone} text={member.phone} />
          <ContactRow icon={MapPin} text={member.address} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          {communityRole && (
            <div className="flex items-center space-x-1 text-gray-500 text-xs">
              <TrendingUp className="h-4 w-4" />
              <span>{communityRole}</span>
            </div>
          )}
          {sinceYear && (
            <div className="flex items-center space-x-1 text-gray-500 text-xs ml-auto">
              <Calendar className="h-4 w-4" />
              <span>Since {sinceYear}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

MemberCard.displayName = 'MemberCard';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch members on mount
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await memberAPI.getAll({ _ts: Date.now() });
        if (res?.success) {
          const list = (res.data || []).map(normalizeMember);
          console.debug('Members page: sample members', list.slice(0, 3));

          // If some items are missing roleInCommunity, enrich them via getById
          const indicesToFetch = [];
          list.forEach((member, index) => {
            if (member?._id && !member.roleInCommunity) {
              indicesToFetch.push(index);
            }
          });

          if (indicesToFetch.length === 0) {
            setMembers(list);
          } else {
            try {
              const detailResponses = await Promise.all(
                indicesToFetch.map((i) => memberAPI.getById(list[i]._id))
              );

              const updated = [...list];
              detailResponses.forEach((response, detailIndex) => {
                const listIndex = indicesToFetch[detailIndex];
                if (response?.success && response?.data) {
                  updated[listIndex] = normalizeMember({ ...updated[listIndex], ...response.data });
                }
              });

              setMembers(updated);
            } catch (e) {
              console.warn('Members page: enrichment failed, falling back to list only');
              setMembers(list);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch members:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Memoized filtered members
  const filteredMembers = useMemo(() => {
    let filtered = members;

    // Filter by search term
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(member =>
        member.name?.toLowerCase().includes(lowerSearch) ||
        member.universityOrRole?.toLowerCase().includes(lowerSearch) ||
        member.roleInCommunity?.toLowerCase().includes(lowerSearch) ||
        member.role?.toLowerCase().includes(lowerSearch) ||
        member.designation?.toLowerCase().includes(lowerSearch) ||
        member.position?.toLowerCase().includes(lowerSearch)
      );
    }

    // Filter by category (placeholder for future implementation)
    if (selectedCategory !== 'all') {
      // Add category filtering logic here if categories are added
      // filtered = filtered.filter(member => member.category === selectedCategory);
    }

    return filtered;
  }, [members, searchTerm, selectedCategory]);

  // Memoized search handler
  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Memoized category change handler
  const handleCategoryChange = useCallback((e) => {
    setSelectedCategory(e.target.value);
  }, []);

  // Memoized clear search handler
  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  // Memoized results text
  const resultsText = useMemo(
    () => `Showing ${filteredMembers.length} of ${members.length} members`,
    [filteredMembers.length, members.length]
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 animate-fade-in">
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Filter */}
            <div className="md:w-48">
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              >
                <option value="all">All Members</option>
                <option value="active">Active</option>
                <option value="alumni">Alumni</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            {resultsText}
          </div>
        </div>

        {/* Members Grid */}
        {loading ? (
          <LoadingState />
        ) : filteredMembers.length === 0 ? (
          <EmptyState searchTerm={searchTerm} onClearSearch={handleClearSearch} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMembers.map((member, index) => (
              <MemberCard 
                key={member._id || index} 
                member={member} 
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Members;