import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { TrendingUp, Mail, Phone, Calendar, Search } from 'lucide-react';
import { memberAPI } from '../services/api';

// Loading component
const LoadingState = memo(() => (
  <div className="text-center py-12">
    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
    <p className="mt-4 text-gray-600">Loading members...</p>
  </div>
));

const EmptyState = memo(({ searchTerm, onClearSearch }) => (
  <div className="bg-white rounded-lg shadow-md p-12 text-center">
    <p className="text-gray-600 text-lg">No members found</p>
    {searchTerm && (
      <button
        onClick={onClearSearch}
        className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
      >
        Clear search
      </button>
    )}
  </div>
));

// Member card
const MemberCard = memo(({ member }) => {
  const avatar = member.photoURL || 'https://via.placeholder.com/150';

  const sinceYear = useMemo(() => {
    return (
      member.since ||
      (member.joinedAt ? new Date(member.joinedAt).getFullYear() : '')
    );
  }, [member.since, member.joinedAt]);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden group">
      <div className="relative h-48 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
        <img
          src={avatar}
          alt={member.name}
          className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover group-hover:scale-110 transition-transform"
        />
      </div>

      <div className="p-6">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold">{member.name}</h3>
          {member.roleInCommunity && (
            <p className="text-lg font-bold text-black">
              {member.roleInCommunity}
            </p>
          )}
          {member.universityOrRole && (
            <p className="text-base text-gray-600">{member.universityOrRole}</p>
          )}
          {/* Debug: Show all member data */}
          <pre className="text-xs text-gray-400 mt-2 block">
            {JSON.stringify(member, null, 2)}
          </pre>
        </div>

        {member.notes && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3 text-center">
            {member.notes}
          </p>
        )}

        {/* Contact */}
        <div className="space-y-2 text-center">
          <div className="flex items-center justify-center text-xs text-gray-600">
            <Phone className="h-4 w-4 mr-2" />
            {member.phone || 'N/A'}
          </div>

          <div className="flex items-center justify-center text-xs text-gray-600">
            <Mail className="h-4 w-4 mr-2" />
            {member.email || 'N/A'}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 text-gray-500 text-xs border-t pt-3">
          <div className="flex items-center space-x-1">
            <TrendingUp className="h-4 w-4" />
            <span>Member</span>
          </div>

          {sinceYear && (
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>Since {sinceYear}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch members
  useEffect(() => {
    (async () => {
      try {
        const res = await memberAPI.getAll();
        if (res?.success) setMembers(res.data || []);
      } catch (err) {
        console.error('Failed to fetch members', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filtering logic
  const filteredMembers = useMemo(() => {
    let list = [...members];

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      list = list.filter(
        (m) =>
          m.name?.toLowerCase().includes(s) ||
          m.universityOrRole?.toLowerCase().includes(s) ||
          m.roleInCommunity?.toLowerCase().includes(s)
      );
    }

    return list;
  }, [members, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">

        <h1 className="text-3xl font-bold mb-2">Our Community Members</h1>
        <p className="text-gray-600 mb-6">Meet our amazing people</p>

        {/* Search Section */}
        <div className="bg-white shadow-md rounded-lg p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">

            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>
          </div>

          <p className="mt-3 text-sm text-gray-600">
            Showing {filteredMembers.length} of {members.length} members
          </p>
        </div>

        {/* Member Cards */}
        {loading ? (
          <LoadingState />
        ) : filteredMembers.length === 0 ? (
          <EmptyState searchTerm={searchTerm} onClearSearch={() => setSearchTerm('')} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMembers.map((m) => (
              <MemberCard key={m._id} member={m} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Members;
