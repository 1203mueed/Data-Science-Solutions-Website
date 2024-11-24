// src/components/FileTree.js

import React, { useState } from 'react';
import { FaFolder, FaFolderOpen, FaFile } from 'react-icons/fa';
import '../styles/FileTree.css';

const FileTree = ({ data }) => {
  return (
    <ul className="file-tree">
      {data.map((item) => (
        <FileTreeNode key={item.name} item={item} />
      ))}
    </ul>
  );
};

const FileTreeNode = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.type === 'folder' && item.children && item.children.length > 0;

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <li>
      <div className="file-tree-node">
        {item.type === 'folder' ? (
          <span onClick={toggleOpen} className="folder-icon">
            {isOpen ? <FaFolderOpen /> : <FaFolder />}
          </span>
        ) : (
          <span className="file-icon">
            <FaFile />
          </span>
        )}
        <span className="file-name">{item.name}</span>
      </div>
      {hasChildren && isOpen && <FileTree data={item.children} />}
    </li>
  );
};

export default FileTree;
