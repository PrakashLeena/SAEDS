// Nested folder structure for the E-Library section
// This file provides the folder hierarchy requested by the user.

export const elibraryFolders = [
  {
    id: 'gce-al',
    title: 'GCE A/L',
    children: [
      {
        id: 'gce-al-pastpapers',
        title: 'Past Papers',
        sections: [
          { id: 'al-past-maths', title: 'Maths' },
          { id: 'al-past-bio', title: 'Biology' },
          { id: 'al-past-physics', title: 'Physics' },
          { id: 'al-past-chem', title: 'Chemistry' }
        ]
      },
      {
        id: 'gce-al-modelpapers',
        title: 'Model Papers',
        sections: [
          { id: 'al-model-maths', title: 'Maths' },
          { id: 'al-model-bio', title: 'Biology' },
          { id: 'al-model-physics', title: 'Physics' },
          { id: 'al-model-chem', title: 'Chemistry' }
        ]
      },
      {
        id: 'gce-al-elaboration',
        title: 'Elaboration',
        sections: []
      },
      {
        id: 'gce-al-guides',
        title: 'Guides & Resources',
        sections: []
      }
    ]
  },
  {
    id: 'gce-ol',
    title: 'GCE O/L',
    children: [
      {
        id: 'gce-ol-pastpapers',
        title: 'Past Papers',
        sections: [
          // If you want specific O/L subjects listed, add them here.
          { id: 'ol-past-maths', title: 'Maths' },
          { id: 'ol-past-science', title: 'Science' },
          { id: 'ol-past-english', title: 'English' }
        ]
      },
      {
        id: 'gce-ol-modelpapers',
        title: 'Model Papers',
        sections: [
          { id: 'ol-model-maths', title: 'Maths' },
          { id: 'ol-model-science', title: 'Science' },
          { id: 'ol-model-english', title: 'English' }
        ]
      }
    ]
  },
  {
    id: 'bio-maths',
    title: 'Bio / Maths',
    children: [
      {
        id: 'bio-area',
        title: 'Biology',
        sections: [
          { id: 'bio-gen', title: 'General Biology' },
          { id: 'bio-advanced', title: 'Advanced Biology' }
        ]
      },
      {
        id: 'maths-area',
        title: 'Mathematics',
        sections: [
          { id: 'maths-core', title: 'Core Maths' },
          { id: 'maths-applied', title: 'Applied Maths' }
        ]
      }
    ]
  },
  {
    id: 'technology',
    title: 'Technology',
    children: [
      {
        id: 'tech-general',
        title: 'General Technology',
        sections: [
          { id: 'tech-it', title: 'Information Technology' },
          { id: 'tech-engineering', title: 'Engineering Technology' }
        ]
      }
    ]
  },
  {
    id: 'arts',
    title: 'Arts',
    children: [
      {
        id: 'arts-general',
        title: 'General Arts',
        sections: [
          { id: 'arts-literature', title: 'Literature & Language' },
          { id: 'arts-visual', title: 'Visual & Performing Arts' }
        ]
      }
    ]
  }
];

export default elibraryFolders;
