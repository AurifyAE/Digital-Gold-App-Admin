// data/mockData.js
export const mockData = {
  user: {
    name: 'Admin',
    email: 'admin@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b647?w=32&h=32&fit=crop&crop=face',
    status: '23h',
    notifications: 2
  },
  projects: [
    {
      id: 1,
      title: 'Web Development',
      tasks: 10,
      progress: 96,
      color: 'bg-purple-500',
      members: [
        'https://images.unsplash.com/photo-1494790108755-2616b612b647?w=32&h=32&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face'
      ],
      memberCount: 7
    },
    {
      id: 2,
      title: 'Mobile App Design',
      tasks: 12,
      progress: 40,
      color: 'bg-teal-400',
      members: [
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=32&h=32&fit=crop&crop=face'
      ],
      memberCount: 9
    },
    {
      id: 3,
      title: 'Facebook Brand UI Kit',
      tasks: 22,
      progress: 74,
      color: 'bg-orange-500',
      members: [
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop&crop=face'
      ],
      memberCount: 3
    }
  ],
  tasks: [
    {
      id: 1,
      title: 'Mobile App',
      subtitle: 'Prepare Figma file',
      category: 'Mobile App'
    },
    {
      id: 2,
      title: 'UX wireframes',
      subtitle: 'Design UX wireframes',
      category: 'Design',
      completed: false
    },
    {
      id: 3,
      title: 'Mobile App',
      subtitle: 'Research',
      category: 'Research',
      completed: true
    }
  ],
  calendarEvents: [
    { time: '10:00', title: 'Dribbble shot', subtitle: 'Facebook Brand', date: 'Oct 20, 2021' },
    { time: '13:20', title: 'Design', subtitle: 'Task Management', date: 'Oct 20, 2021' },
    { time: '10:00', title: 'UX Research', subtitle: 'Sleep App', date: 'Oct 21, 2021' },
    { time: '13:20', title: 'Design', subtitle: 'Task Management', date: 'Oct 21, 2021' },
    { time: '10:00', title: 'Dribbble Shot', subtitle: 'Meet Up', date: 'Oct 21, 2021' },
    { time: '10:00', title: 'Dribbble Shot', subtitle: 'Meet Up', date: 'Oct 22, 2021' },
    { time: '11:00', title: 'Design', subtitle: 'Mobile App', date: 'Oct 22, 2021' }
  ]
};