const createSubjectNode = (prefix, subjectId, subjectTitle, sectionSuffixes) => ({
  id: `${prefix}-${subjectId}`,
  title: subjectTitle,
  sections: sectionSuffixes.map(({ key, title }) => ({
    id: `${prefix}-${subjectId}-${key}`,
    title,
  })),
});

const bioMathSectionTypes = [
  { key: 'pastpapers', title: 'Past Papers' },
  { key: 'notes', title: 'Notes' },
  { key: 'elaboration', title: 'Elaboration' },
  { key: 'model-papers', title: 'Model Papers' },
];

const technologySectionTypes = [
  { key: 'pastpapers', title: 'Past Papers' },
  { key: 'notes', title: 'Notes' },
  { key: 'elaboration', title: 'Elaboration' },
  { key: 'model-papers', title: 'Model Papers' },
];

module.exports = [
  {
    id: 'gce-al',
    title: 'GCE A/L',
    children: [
      {
        id: 'al-bio-maths',
        title: 'Bio/Math',
        children: [
          createSubjectNode('al-bio-maths', 'biology', 'Biology', bioMathSectionTypes),
          createSubjectNode('al-bio-maths', 'mathematics', 'Mathematics', bioMathSectionTypes),
          createSubjectNode('al-bio-maths', 'physics', 'Physics', bioMathSectionTypes),
          createSubjectNode('al-bio-maths', 'chemistry', 'Chemistry', bioMathSectionTypes),
        ],
      },
      {
        id: 'al-technology',
        title: 'Technology',
        children: [
          createSubjectNode('al-technology', 'e-tech', 'Engineering Tech', technologySectionTypes),
          createSubjectNode('al-technology', 'b-tech', 'Bio Tech', technologySectionTypes),
          createSubjectNode('al-technology', 'sft', 'SFT', technologySectionTypes),
          createSubjectNode('al-technology', 'it', 'ICT', technologySectionTypes),
          createSubjectNode('al-technology', 'agri', 'Agriculture', technologySectionTypes),
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

