import React, { useState } from 'react';
import { Folder, FolderOpen, File } from 'lucide-react';

const FolderItem = ({ item }) => {
  const [open, setOpen] = useState(true);

  const hasChildren = Array.isArray(item.children) && item.children.length > 0;

  const handleClick = () => {
    if (item.type === 'folder' && hasChildren) {
      setOpen(!open);
    }
  };

  return (
    <div className="ml-4 select-none">
      <div
        onClick={handleClick}
        className="flex items-center gap-2 cursor-pointer p-1 hover:bg-gray-100 rounded-md w-fit"
      >
        {item.type === 'folder' ? (
          open && hasChildren ? (
            <FolderOpen className="w-4 h-4 text-yellow-600" />
          ) : (
            <Folder className="w-4 h-4 text-yellow-600" />
          )
        ) : (
          <File className="w-4 h-4 text-gray-600" />
        )}

        <span className="text-xs font-medium text-gray-800">{item.name}</span>
      </div>

      {open && hasChildren && (
        <div className="ml-4 border-l border-gray-200 pl-3 mt-1">
          {item.children.map((child, index) => (
            <FolderItem key={index} item={child} />
          ))}
        </div>
      )}
    </div>
  );
};

const initialData = [
  {
    type: 'folder',
    name: 'src',
    children: [
      {
        type: 'folder',
        name: 'components',
        children: [
          { type: 'file', name: 'Navbar.js' },
          { type: 'file', name: 'Footer.js' },
        ],
      },
      {
        type: 'folder',
        name: 'pages',
        children: [
          { type: 'file', name: 'Home.js' },
          { type: 'file', name: 'Browse.js' },
          { type: 'file', name: 'BookDetail.js' },
          { type: 'file', name: 'Contact.js' },
          {
            type: 'folder',
            name: 'admin',
            children: [
              { type: 'file', name: 'AdminDashboard.js' },
              { type: 'file', name: 'UserManagement.js' },
              { type: 'file', name: 'BookManagement.js' },
              { type: 'file', name: 'ActivityManagement.js' },
              { type: 'file', name: 'MemberManagement.js' },
              { type: 'file', name: 'AchievementManagement.js' },
              { type: 'file', name: 'GalleryManagement.js' },
              { type: 'file', name: 'ElibraryManagement.js' },
            ],
          },
        ],
      },
      { type: 'file', name: 'App.js' },
      { type: 'file', name: 'index.js' },
    ],
  },
  {
    type: 'folder',
    name: 'public',
    children: [{ type: 'file', name: 'index.html' }],
  },
];

const FolderStructureAdmin = () => {
  const [data] = useState(initialData);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Project Folder Structure</h1>
          <p className="mt-2 text-sm text-gray-600">
            Visual overview of the frontend folder structure, available only in the admin panel.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md border p-4">
          <div className="text-xs text-gray-500 mb-3">
            Click on folders to expand or collapse their contents.
          </div>

          <div className="text-xs">
            {data.map((item, index) => (
              <FolderItem key={index} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FolderStructureAdmin;
