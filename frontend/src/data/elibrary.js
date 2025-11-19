// Nested folder structure for the E-Library section
// This file provides the folder hierarchy requested by the user.

const bioMathSubjects = [
  { id: 'al-bio-maths-subject-bio', title: 'Biology' },
  { id: 'al-bio-maths-subject-maths', title: 'Mathematics' },
  { id: 'al-bio-maths-subject-physics', title: 'Physics' },
  { id: 'al-bio-maths-subject-chemistry', title: 'Chemistry' },
];

const technologySubjects = [
  { id: 'al-technology-subject-e-tech', title: 'Engineering Tech' },
  { id: 'al-technology-subject-b-tech', title: 'Bio Tech' },
  { id: 'al-technology-subject-sft', title: 'SFT' },
  { id: 'al-technology-subject-it', title: 'ICT' },
  { id: 'al-technology-subject-agri', title: 'Agriculture' },
];

export const elibraryFolders = [
  {
    id: 'gce-al',
    title: 'GCE A/L',
    children: [
      {
        id: 'al-bio-maths',
        title: 'Bio/Math',
        sections: [
          { id: 'al-bio-maths-pastpapers', title: 'Past Papers', subjects: bioMathSubjects },
          { id: 'al-bio-maths-notes', title: 'Notes', subjects: bioMathSubjects },
          { id: 'al-bio-maths-elaboration', title: 'Elaboration', subjects: bioMathSubjects },
          { id: 'al-bio-maths-model-papers', title: 'Model Papers', subjects: bioMathSubjects },
        ],
      },
      {
        id: 'al-technology',
        title: 'Technology',
        sections: [
          { id: 'al-technology-pastpapers', title: 'Past Papers', subjects: technologySubjects },
          { id: 'al-technology-notes', title: 'Notes', subjects: technologySubjects },
          { id: 'al-technology-elaboration', title: 'Elaboration', subjects: technologySubjects },
          { id: 'al-technology-model-papers', title: 'Model Papers', subjects: technologySubjects },
        ],
      },
      {
        id: 'al-commerce',
        title: 'Commerce',
        sections: [
          { id: 'al-commerce-pastpapers', title: 'Past Papers' },
          { id: 'al-commerce-model-papers', title: 'Model Papers' },
          { id: 'al-commerce-notes', title: 'Notes' },
        ],
      },
      {
        id: 'al-arts',
        title: 'Arts',
        sections: [
          { id: 'al-arts-pastpapers', title: 'Past Papers' },
          { id: 'al-arts-model-papers', title: 'Model Papers' },
          { id: 'al-arts-notes', title: 'Notes' },
        ],
      },
    ],
  },
  {
    id: 'gce-ol',
    title: 'GCE O/L',
    sections: [
      { id: 'ol-pastpapers', title: 'Past Papers' },
      { id: 'ol-model-papers', title: 'Model Papers' },
      { id: 'ol-notes', title: 'Notes' },
    ],
  },
];

export default elibraryFolders;
