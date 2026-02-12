
import { Workshop, WorkshopCategory } from './types';

export const INITIAL_WORKSHOPS: Workshop[] = [
  {
    id: '1',
    title: 'Nurturing the Soul: Spiritual Curriculum 2024',
    theme: 'Integrating meditation and ethics into daily teaching.',
    category: WorkshopCategory.SpiritualCurriculum,
    lead: 'Dr. Anita Sharma',
    date: '2024-03-15',
    venue: 'Darshan Academy, Delhi',
    frequency: 'Annual',
    agenda: [
      { particulars: 'Meditation Techniques for Students', startTime: '09:00', endTime: '10:00', speaker: 'Dr. Anita Sharma', remarks: 'Practical session', isActivity: true },
      { particulars: 'Storytelling in Ethics', startTime: '10:15', endTime: '11:30', speaker: 'Ms. Priya Rai', remarks: 'Resource material distributed', isActivity: false },
      { particulars: 'Curriculum Mapping', startTime: '11:45', endTime: '13:00', speaker: 'Panel', remarks: 'Group exercise', isActivity: true }
    ],
    speakers: [
      {
        name: 'Dr. Anita Sharma',
        designation: 'Director of Education',
        takeaways: 'Meditation is the bedrock of holistic student development.'
      },
      {
        name: 'Ms. Priya Rai',
        designation: 'Senior Faculty',
        takeaways: 'Stories bridge the gap between theory and morality.'
      }
    ],
    activities: ['Meditation Techniques for Students', 'Curriculum Mapping'],
    metrics: {
      participantCount: 450,
      demographic: 'Spiritual coordinators and teachers from 24 schools'
    },
    feedback: {
      averageRating: 4.8,
      qualitativeComments: ['Very peaceful and informative', 'Practical tools for the classroom']
    },
    budget: {
      allocated: 50000,
      expenses: [
        { description: 'Resource Kits', amount: 15000 },
        { description: 'Catering & Refreshments', amount: 20000 },
        { description: 'Venue Decoration', amount: 5000 }
      ]
    },
    actionPlan: [
      'Implement 5-minute silent meditation in all morning assemblies',
      'Update the Spiritual Curriculum handbook by June 2024'
    ]
  },
  {
    id: '2',
    title: 'AI in the Modern Classroom',
    theme: 'Leveraging Generative AI for lesson planning and assessment.',
    category: WorkshopCategory.AILiteracy,
    lead: 'Mr. Rohan Gupta',
    date: '2024-05-10',
    venue: 'Virtual (Zoom)',
    frequency: 'Bi-Annual',
    agenda: [
      { particulars: 'Intro to LLMs in Education', startTime: '14:00', endTime: '15:00', speaker: 'Mr. Rohan Gupta', remarks: 'Slide presentation', isActivity: false },
      { particulars: 'Prompt Engineering Workshop', startTime: '15:15', endTime: '16:30', speaker: 'Mr. Rohan Gupta', remarks: 'Live coding session', isActivity: true }
    ],
    speakers: [
      {
        name: 'Mr. Rohan Gupta',
        designation: 'Tech Innovation Lead',
        takeaways: 'AI should augment, not replace, the teacher\'s intuition.'
      }
    ],
    activities: ['Prompt Engineering Workshop'],
    metrics: {
      participantCount: 1200,
      demographic: 'Secondary and Senior Secondary Teachers'
    },
    feedback: {
      averageRating: 4.2,
      qualitativeComments: ['Eye-opening session', 'Need more advanced modules']
    },
    budget: {
      allocated: 10000,
      expenses: [
        { description: 'Zoom Webinar License', amount: 5000 },
        { description: 'Digital Certificates Service', amount: 3000 }
      ]
    },
    actionPlan: [
      'Roll out AI-Literacy certification for teachers',
      'Pilot AI assessment tools in 3 select schools'
    ]
  }
];
