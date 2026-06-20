export interface Opportunity {
  id: string;
  title: string;
  type: 'Hackathon' | 'Workshop' | 'Internship' | 'Research Opportunity' | 'General Event';
  organizer: string;
  matchScore: number;
  reason: string;
  deadlineHours: number; // hours remaining
  dateString: string;
  location: string;
  description: string;
  tags: string[];
  link?: string;
}

export const mockOpportunities: Opportunity[] = [
  {
    id: 'opp-1',
    title: 'AI DevFest Hackathon 2026',
    type: 'Hackathon',
    organizer: 'DAU AI Club & Google Student Developer Group',
    matchScore: 98,
    reason: 'Matches your interest in Machine Learning & React development',
    deadlineHours: 4,
    dateString: 'June 15, 2026',
    location: 'Engineering Block A, Aud-2',
    description: 'A 24-hour sprint to build AI-powered solutions. Mentorship from industry specialists and $5,000 in prizes.',
    tags: ['AI/ML', 'React', 'Hackathon', 'Prizes'],
    link: 'https://devfest.google/'
  },
  {
    id: 'opp-2',
    title: 'UI/UX Design Intensive Workshop',
    type: 'Workshop',
    organizer: 'Design Guild DAU',
    matchScore: 94,
    reason: 'Matches your profile skill "Figma" and interest in Product Design',
    deadlineHours: 18,
    dateString: 'June 16, 2026',
    location: 'Design Studio B, Room 102',
    description: 'Learn modern auto-layout, component states, and design system creation in Figma from a senior designer at Notion.',
    tags: ['UI/UX', 'Figma', 'Workshop', 'Portfolio'],
    link: 'https://figma.com/'
  },
  {
    id: 'opp-3',
    title: 'Deep Learning Research Fellowship',
    type: 'Research Opportunity',
    organizer: 'Department of Advanced Computing',
    matchScore: 92,
    reason: 'Matches your course B.Tech Computer Science & interest in NLP',
    deadlineHours: 48,
    dateString: 'June 17, 2026',
    location: 'AI Research Lab (Building C)',
    description: 'Work alongside Dr. Elena Rostova on training lightweight transformers for resource-constrained edge systems.',
    tags: ['Research', 'NLP', 'PyTorch', 'Stipend'],
    link: 'https://arxiv.org/'
  },
  {
    id: 'opp-4',
    title: 'Frontend Engineer Intern',
    type: 'Internship',
    organizer: 'Linear Tech (Remote)',
    matchScore: 89,
    reason: 'Matches your experience with TailwindCSS & TypeScript',
    deadlineHours: 120, // 5 days
    dateString: 'June 20, 2026',
    location: 'Remote',
    description: 'Join the product team to polish user interactions, build high-performance dashboard interfaces, and squash bugs.',
    tags: ['Internship', 'TypeScript', 'Tailwind', 'Remote'],
    link: 'https://linear.app/careers'
  },
  {
    id: 'opp-5',
    title: 'Campus Tech Speaker: OpenAI Engineer',
    type: 'General Event',
    organizer: 'DAU Tech Forum',
    matchScore: 87,
    reason: 'Recommended based on high trending interest in your department',
    deadlineHours: 168, // 7 days
    dateString: 'June 21, 2026',
    location: 'Main Auditorium',
    description: 'A fireside chat with an OpenAI Staff Engineer discussing the future of agentic workflows and API developer practices.',
    tags: ['Speaker', 'AI Agents', 'Networking'],
    link: 'https://openai.com/'
  },
  {
    id: 'opp-6',
    title: 'Product Management Summer Cohort',
    type: 'Internship',
    organizer: 'Next Ventures',
    matchScore: 85,
    reason: 'Matches your leadership roles in club activities',
    deadlineHours: 336, // 14 days
    dateString: 'June 28, 2026',
    location: 'Hybrid / Mumbai Office',
    description: '8-week intensive training program on product lifecycle management, user interviews, metrics definition, and PRD writing.',
    tags: ['Product Management', 'Internship', 'Mentorship'],
    link: 'https://productschool.com/'
  }
];

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  department: string;
  quote: string;
  avatarSeed: string; // for consistent generated avatar visual
}

export const mockTestimonials: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Akshay Purohit',
    role: 'B.Tech Computer Science, Year 3',
    department: 'Computer Science',
    quote: 'Announcements were always buried. CampusOS sent me a WhatsApp ping about the Deep Learning Research Fellowship 2 days before the deadline. I applied and got selected!',
    avatarSeed: 'akshay'
  },
  {
    id: 'test-2',
    name: 'Sarah Jenkins',
    role: 'M.S. Data Science, Year 1',
    department: 'Data Science',
    quote: 'I used the Campus AI Chat Assistant to search for AI hackathons and found the DevFest. Ended up forming a team through the dashboard, and we won the gold track!',
    avatarSeed: 'sarah'
  },
  {
    id: 'test-3',
    name: 'Liam Chen',
    role: 'B.Des Interaction Design, Year 2',
    department: 'Interaction Design',
    quote: 'The Figma workshop recommendations were spot-on. What really impressed me was the matches% system — it saved me hours of sifting through generic emails.',
    avatarSeed: 'liam'
  }
];

export const mockStats = [
  { value: '10,000+', label: 'Opportunities Matched' },
  { value: '3x', label: 'Increase in Registrations' },
  { value: '92%', label: 'Students Discovered New Opportunities' },
  { value: '12+', label: 'Active Clubs & Societies' }
];

export const mockRoadmap = [
  {
    quarter: 'Q3 2026',
    title: 'AI Career Mentor',
    description: 'Personalized interactive resume analyzer and AI-driven skill-gap recommendation engine integrated into the dashboard.',
    status: 'In Development'
  },
  {
    quarter: 'Q4 2026',
    title: 'WhatsApp & Telegram Bots',
    description: 'Interact with Campus AI directly via messaging apps: RSVP, search events, and get deadline alerts with native quick replies.',
    status: 'Planned'
  },
  {
    quarter: 'Q1 2027',
    title: 'Internship Predictor',
    description: 'Uses historical hire data and student engagement activity to predict and matches you to corporate internships with high fit score.',
    status: 'Planned'
  },
  {
    quarter: 'Q2 2027',
    title: 'Multi-University Federation',
    description: 'Cross-university hackathon grids and joint inter-college event discovery for regional tech networks.',
    status: 'Planned'
  }
];

// Simple Chatbot simulator
export function getBotResponse(userQuery: string): { responseText: string; matchedOpportunities: Opportunity[] } {
  const query = userQuery.toLowerCase();
  
  let matched: Opportunity[] = [];
  let responseText = '';

  if (query.includes('hackathon') || query.includes('competition') || query.includes('devfest') || query.includes('contest')) {
    matched = mockOpportunities.filter(o => o.type === 'Hackathon');
    responseText = "🚀 I found these active Hackathons on campus! The AI DevFest Hackathon has a strong match score of 98% and registration closes very soon.";
  } else if (query.includes('workshop') || query.includes('learn') || query.includes('figma') || query.includes('design') || query.includes('ux') || query.includes('ui')) {
    matched = mockOpportunities.filter(o => o.type === 'Workshop');
    responseText = "🎨 Here are workshops matching your skill tags: I highly recommend the UI/UX Design Intensive Workshop led by a senior Notion designer!";
  } else if (query.includes('intern') || query.includes('job') || query.includes('career') || query.includes('fellowship') || query.includes('work') || query.includes('stipend')) {
    matched = mockOpportunities.filter(o => o.type === 'Internship' || o.type === 'Research Opportunity');
    responseText = "💼 Here are internships and research opportunities matching your interests in software engineering and artificial intelligence:";
  } else if (query.includes('ai') || query.includes('machine learning') || query.includes('nlp') || query.includes('research') || query.includes('pytorch')) {
    matched = mockOpportunities.filter(o => o.tags.includes('AI/ML') || o.tags.includes('Research') || o.tags.includes('NLP'));
    responseText = "🤖 I scanned the campus database for artificial intelligence topics. Here are the top matches for research labs and dev events:";
  } else if (query.includes('deadline') || query.includes('soon') || query.includes('urgent') || query.includes('closes') || query.includes('time')) {
    // Sort by deadline
    matched = [...mockOpportunities].sort((a, b) => a.deadlineHours - b.deadlineHours).slice(0, 3);
    responseText = "⏳ Urgent alert! Here are the opportunities with deadlines closing within the next 48 hours:";
  } else {
    // Default response returning high match scoring events
    matched = mockOpportunities.slice(0, 3);
    responseText = "👋 Hi there! I'm Campus AI. I scan all college websites, notice boards, and club pings. Based on your interest profile, here are the top matching opportunities for you today:";
  }

  return { responseText, matchedOpportunities: matched };
}
