const ElibraryFolder = require('../models/ElibraryFolder');
const defaultStructure = require('../config/elibraryStructure');

const flattenStructure = (nodes, parentId = null, orderOffset = 0) => {
  const entries = [];
  nodes.forEach((node, index) => {
    const currentOrder = orderOffset + index;
    entries.push({
      _id: node.id,
      title: node.title,
      parentId,
      order: currentOrder,
    });

    if (node.sections && node.sections.length > 0) {
      node.sections.forEach((section, secIndex) => {
        entries.push({
          _id: section.id,
          title: section.title,
          parentId: node.id,
          order: secIndex,
        });

        if (section.subjects && section.subjects.length > 0) {
          section.subjects.forEach((subject, subjectIndex) => {
            entries.push({
              _id: subject.id,
              title: subject.title,
              parentId: section.id,
              order: subjectIndex,
            });
          });
        }
      });
    }

    if (node.children && node.children.length > 0) {
      entries.push(...flattenStructure(node.children, node.id));
    }
  });
  return entries;
};

async function ensureDefaultFolders() {
  const count = await ElibraryFolder.countDocuments();
  if (count > 0) return;

  const docs = flattenStructure(defaultStructure);
  if (docs.length === 0) return;

  try {
    await ElibraryFolder.insertMany(
      docs.map(doc => ({
        ...doc,
        description: '',
      })),
      { ordered: false }
    );
  } catch (err) {
    console.error('Failed seeding default e-library folders', err.message);
  }
}

function buildTree(folders, parentId = null) {
  return folders
    .filter(folder => folder.parentId === parentId)
    .sort((a, b) => {
      if (a.order === b.order) return a.title.localeCompare(b.title);
      return a.order - b.order;
    })
    .map(folder => ({
      id: folder._id,
      title: folder.title,
      description: folder.description || '',
      parentId: folder.parentId,
      type: 'folder',
      children: buildTree(folders, folder._id),
    }));
}

function collectDescendants(folders, targetId) {
  const ids = new Set([targetId]);
  const traverse = (parent) => {
    folders.forEach(folder => {
      if (folder.parentId === parent) {
        ids.add(folder._id);
        traverse(folder._id);
      }
    });
  };
  traverse(targetId);
  return Array.from(ids);
}

module.exports = {
  ensureDefaultFolders,
  buildTree,
  collectDescendants,
};

