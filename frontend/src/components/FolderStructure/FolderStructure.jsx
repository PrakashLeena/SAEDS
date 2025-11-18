import React, { useState } from "react";
import { Folder, FolderOpen, File } from "lucide-react";

// Recursive Folder Component
const FolderItem = ({ item, onFileClick }) => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (item.type === 'file' && onFileClick) {
      onFileClick(item);
    } else {
      setOpen(!open);
    }
  };

  return (
    <div className="ml-4 select-none">
      <div
        onClick={handleClick}
        className={`flex items-center gap-2 p-1 rounded-md w-fit ${item.type === 'file' ? 'hover:bg-blue-50 cursor-pointer' : 'cursor-pointer hover:bg-gray-100'}`}
      >
        {item.type === "folder" ? (
          open ? (
            <FolderOpen className="w-5 h-5 text-yellow-600" />
          ) : (
            <Folder className="w-5 h-5 text-yellow-600" />
          )
        ) : (
          <File className="w-5 h-5 text-gray-600" />
        )}
        <span className={`text-sm font-medium ${item.type === 'file' ? 'text-blue-600' : 'text-gray-800'}`}>
          {item.name}
        </span>
      </div>

      {open && item.children && (
        <div className="ml-4 border-l border-gray-200 pl-3 mt-1">
          {item.children.map((child, index) => (
            <FolderItem key={index} item={child} onFileClick={onFileClick} />
          ))}
        </div>
      )}
    </div>
  );
};

const FolderStructure = ({ data, onFileSelect, className = "" }) => {
  const [folderName, setFolderName] = useState("");
  const [folderData, setFolderData] = useState(data || []);

  const addFolder = () => {
    if (!folderName.trim()) return;

    const newFolder = {
      type: "folder",
      name: folderName,
      children: [],
    };

    setFolderData([...folderData, newFolder]);
    setFolderName("");
  };

  const handleFileClick = (file) => {
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium text-gray-800">Library Structure</h3>
        
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="New folder name..."
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addFolder()}
          />
          <button
            onClick={addFolder}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Folder
          </button>
        </div>
      </div>

      <div className="p-4 overflow-y-auto" style={{ maxHeight: '500px' }}>
        {folderData.length > 0 ? (
          folderData.map((item, index) => (
            <FolderItem 
              key={index} 
              item={item} 
              onFileClick={handleFileClick} 
            />
          ))
        ) : (
          <p className="text-gray-500 text-sm text-center py-4">
            No folders or files yet. Add a new folder to get started.
          </p>
        )}
      </div>
    </div>
  );
};

export default FolderStructure;
