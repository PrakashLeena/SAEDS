// Nested folder structure for the E-Library section
// This file provides the folder hierarchy requested by the user.

export const elibraryFolders = [
  {
    id: 'gce-al',
    title: 'GCE A/L',
    children: [
      {
        id: 'al-bio-maths',
        title: 'Bio/Maths',
        sections: [
          { id: 'al-bio-maths-papers', title: 'Papers' },
          { id: 'al-bio-maths-notes', title: 'Notes' },
        ],
      },
      {
        id: 'al-technology',
        title: 'Technology',
        sections: [
          { id: 'al-technology-papers', title: 'Papers' },
          { id: 'al-technology-notes', title: 'Notes' },
        ],
      },
      {
        id: 'al-commerce',
        title: 'Commerce',
        sections: [
          { id: 'al-commerce-papers', title: 'Papers' },
          { id: 'al-commerce-notes', title: 'Notes' },
        ],
      },
      {
        id: 'al-arts',
        title: 'Arts',
        sections: [
          { id: 'al-arts-papers', title: 'Papers' },
          { id: 'al-arts-notes', title: 'Notes' },
        ],
      },
    ],
  },
  {
    id: 'gce-ol',
    title: 'GCE O/L',
    children: [
      {
        id: 'ol-general',
        title: 'General',
        sections: [
          { id: 'ol-general-papers', title: 'Papers' },
          { id: 'ol-general-notes', title: 'Notes' },
        ],
      },
    ],
  },
];

export default elibraryFolders;
