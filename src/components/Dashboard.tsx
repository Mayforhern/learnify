import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DatabaseService from '../services/DatabaseService';

interface DashboardProps {
  userAddress: string;
}

interface UserProfile {
  id: number;
  display_name: string;
  attendance: number;
  total_attendance: number;
  homework_completed: number;
  total_homework: number;
  rating: number;
  max_rating: number;
  weekly_goal_progress: number;
}

interface Event {
  id: number;
  title: string;
  date: string;
  image: string;
}

interface Task {
  id: number;
  title: string;
  deadline: string;
  status: 'todo' | 'review' | 'completed';
  completion_date?: string;
}

interface TimeTableEntry {
  id: number;
  time: string;
  title: string;
  subject: string;
  subject_color: string;
  participants: number;
}

const Dashboard = ({ userAddress }: DashboardProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timetable, setTimetable] = useState<TimeTableEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!userAddress) {
        setError('Please connect your wallet to view the dashboard.');
        setIsLoading(false);
        return;
      }

      console.log('Loading dashboard data for address:', userAddress);
      setIsLoading(true);
      setError(null);
      
      try {
        const db = DatabaseService.getInstance();
        
        // Get saved name from localStorage first
        const savedProfile = localStorage.getItem(`profile-${userAddress}`);
        const savedName = savedProfile ? JSON.parse(savedProfile).displayName : null;
        
        // Load user profile from database
        const userProfiles = await db.query('user_profiles', { wallet_address: userAddress });
        
        if (userProfiles.length === 0) {
          // Create default profile with saved name
          const newProfile = await db.execute('INSERT', 'user_profiles', {
            wallet_address: userAddress,
            display_name: savedName || 'New User',
            attendance: 19,
            total_attendance: 20,
            homework_completed: 53,
            total_homework: 56,
            rating: 89,
            max_rating: 100,
            weekly_goal_progress: 70
          });
          
          setProfile(newProfile);
          
          // Add default tasks
          const defaultTasks = [
            { title: 'Rational Inequalities. AI Assessment #5', status: 'todo', deadline: '2024-03-30' },
            { title: 'All about Homostas. Quiz', status: 'todo', deadline: '2024-03-29' },
            { title: 'Historical Chronicles', status: 'review', deadline: '2024-03-30' },
            { title: 'Physics Phantoms', status: 'completed', completion_date: '2024-03-25' }
          ];
          
          for (const task of defaultTasks) {
            await db.execute('INSERT', 'tasks', {
              user_id: newProfile.id,
              ...task
            });
          }
          
          // Load tasks after creation
          const tasks = await db.query('tasks', { user_id: newProfile.id });
          setTasks(tasks);
        } else {
          // If we have a saved name, update the profile
          if (savedName && savedName !== userProfiles[0].display_name) {
            const updatedProfile = await db.execute('UPDATE', 'user_profiles', {
              id: userProfiles[0].id,
              display_name: savedName
            });
            setProfile(updatedProfile || userProfiles[0]);
          } else {
            setProfile(userProfiles[0]);
          }
          const tasks = await db.query('tasks', { user_id: userProfiles[0].id });
          setTasks(tasks);
        }
        
        // Set empty arrays for events and timetable for now
        setEvents([]);
        setTimetable([]);
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [userAddress]);

  const todoTasks = tasks.filter(task => task.status === 'todo');
  const reviewTasks = tasks.filter(task => task.status === 'review');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      {/* Left Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-[240px] bg-[#151313] py-6">
        <div className="px-6 mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#ff5734] rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold">L</span>
            </div>
            <span className="text-xl font-bold text-white">
              <span className="text-[#ff5734]">Learn</span>ify
            </span>
          </Link>
        </div>

        <nav className="space-y-1">
          <Link to="/" className="flex items-center gap-3 px-6 py-3 bg-[#be94f5] bg-opacity-20 text-[#be94f5] font-medium">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 10L10 3L17 10L17 17H13V12H7V17H3V10Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Home
          </Link>
          <Link to="/lessons" className="flex items-center gap-3 px-6 py-3 text-gray-600 hover:bg-gray-50">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 4H16V16H4V4Z M8 8H12M8 12H12" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Lessons
          </Link>
          <Link to="/timetable" className="flex items-center gap-3 px-6 py-3 text-gray-600 hover:bg-gray-50">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 4H16V16H4V4ZM4 8H16M8 8V16" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Timetable
          </Link>
          <Link to="/homework" className="flex items-center gap-3 px-6 py-3 text-gray-600 hover:bg-gray-50">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M6 4H14L17 7V16H3V7L6 4Z M7 8H13M7 12H13" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Homework
          </Link>
          <Link to="/messages" className="flex items-center gap-3 px-6 py-3 text-gray-600 hover:bg-gray-50">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 4H16V13H6L4 15V4Z M8 8H12M8 11H12" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Messages
          </Link>
          <Link to="/assessments" className="flex items-center gap-3 px-6 py-3 text-gray-600 hover:bg-gray-50">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 4H16V16H4V4Z M7 9L9 11L13 7" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Assessments
            <span className="ml-auto bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">1</span>
          </Link>
        </nav>

        <div className="absolute bottom-6 left-0 w-full px-6">
          <Link to="/support" className="flex items-center gap-3 text-gray-600 hover:text-gray-900">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 17C14.4183 17 18 13.4183 18 9C18 4.58172 14.4183 1 10 1C5.58172 1 2 4.58172 2 9C2 10.8214 2.48697 12.5291 3.33782 14L2.5 17.5L6 16.6622C7.47087 17.513 9.17855 18 11 18H17" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Support
          </Link>
          <Link to="/settings" className="flex items-center gap-3 text-gray-600 hover:text-gray-900 mt-4">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M8 4L8 2M8 8L8 16M12 4L12 12M12 16L12 14" stroke="currentColor" strokeWidth="2"/>
              <circle cx="8" cy="6" r="2" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="14" r="2" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Settings
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-[240px] p-8">
        {/* Welcome Banner */}
        <div className="bg-[#ff5734] rounded-[24px] p-6 text-white mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {profile?.display_name || 'User'} 👋
            </h1>
            <p className="text-white/80">
              You've learned <span className="font-semibold">{profile?.weekly_goal_progress || 0}%</span> of your goal this week!<br />
              Keep it up and improve your progress.
            </p>
          </div>
          <div className="absolute right-6 bottom-0">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
              {/* Add your mascot SVG here */}
            </svg>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-[24px] p-6 border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-[#be94f5] bg-opacity-20 rounded-full flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#be94f5" className="text-[#be94f5]">
                  <path d="M10 12C12.2091 12 14 10.2091 14 8C14 5.79086 12.2091 4 10 4C7.79086 4 6 5.79086 6 8C6 10.2091 7.79086 12 10 12Z" strokeWidth="2"/>
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-600">Attendance</div>
                <div className="text-2xl font-bold">{profile?.attendance || 0}/{profile?.total_attendance || 0}</div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {profile?.attendance === profile?.total_attendance 
                ? 'Perfect attendance! Keep it up!' 
                : 'Keep working on your attendance'}
            </p>
          </div>

          <div className="bg-white rounded-[24px] p-6 border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-[#fccc42] bg-opacity-20 rounded-full flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#fccc42" className="text-[#fccc42]">
                  <path d="M6 4H14L17 7V16H3V7L6 4Z M7 8H13M7 12H13" strokeWidth="2"/>
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-600">Homework</div>
                <div className="text-2xl font-bold">{profile?.homework_completed || 0}/{profile?.total_homework || 0}</div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {todoTasks.length > 0 
                ? `${todoTasks.length} tasks pending completion` 
                : 'All caught up with homework!'}
            </p>
          </div>

          <div className="bg-white rounded-[24px] p-6 border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-[#ff5734] bg-opacity-20 rounded-full flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#ff5734" className="text-[#ff5734]">
                  <path d="M10 15L4 9L10 3M16 15L10 9L16 3" strokeWidth="2"/>
                </svg>
              </div>
              <div>
                <div className="text-sm text-gray-600">Rating</div>
                <div className="text-2xl font-bold">{profile?.rating || 0}/{profile?.max_rating || 100}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block px-2 py-1 bg-[#be94f5] bg-opacity-20 text-[#be94f5] text-xs font-medium rounded-full">
                {(profile?.rating || 0) >= 80 ? 'Outstanding' : (profile?.rating || 0) >= 60 ? 'Good' : 'Needs Improvement'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Left Column */}
          <div>
            {/* Timetable Section */}
            <div className="bg-white rounded-[24px] p-6 border border-gray-100 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Timetable</h2>
                <div className="text-sm text-gray-600">
                  {new Date().toLocaleDateString('en-US', { 
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>
              
              <div className="space-y-4">
                {timetable.map(entry => (
                  <div key={entry.id} className={`border-l-2 border-[${entry.subject_color}] pl-4`}>
                    <div className="text-sm text-gray-600">{entry.time}</div>
                    <div className="font-medium">{entry.title}</div>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(entry.participants)].map((_, i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-gray-100 -ml-2 first:ml-0"></div>
                      ))}
                      <span className={`text-xs bg-[${entry.subject_color}] bg-opacity-10 text-[${entry.subject_color}] px-2 py-0.5 rounded-full ml-2`}>
                        {entry.subject}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-[24px] p-6 border border-gray-100">
              <h2 className="text-lg font-semibold mb-6">Upcoming events</h2>
              <div className="space-y-4">
                {events.map(event => (
                  <div key={event.id} className="group relative rounded-2xl overflow-hidden">
                    <img src={event.image} alt={event.title} className="w-full h-32 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex flex-col justify-end">
                      <h3 className="text-white font-medium">{event.title}</h3>
                      <p className="text-white/80 text-sm">{event.date}</p>
                    </div>
                    <button className="absolute top-4 right-4 bg-white/90 hover:bg-white text-[#151313] px-4 py-1 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      More details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Homework Progress */}
          <div className="bg-white rounded-[24px] p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Homework progress</h2>
              <select className="text-sm border-none bg-transparent">
                <option>All</option>
                <option>To do</option>
                <option>Completed</option>
              </select>
            </div>

            {/* To do */}
            <div className="mb-8">
              <h3 className="text-sm font-medium mb-4">To do ({todoTasks.length})</h3>
              <div className="space-y-4">
                {todoTasks.map(task => (
                  <div key={task.id} className="flex items-start gap-4">
                    <div className="w-4 h-4 mt-1 rounded-full border-2 border-[#be94f5]"></div>
                    <div>
                      <div className="font-medium">{task.title}</div>
                      <div className="text-sm text-gray-600">Deadline: {task.deadline}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* On review */}
            <div className="mb-8">
              <h3 className="text-sm font-medium mb-4">On review ({reviewTasks.length})</h3>
              <div className="space-y-4">
                {reviewTasks.map(task => (
                  <div key={task.id} className="flex items-start gap-4">
                    <div className="w-4 h-4 mt-1 rounded-full border-2 border-[#fccc42] bg-[#fccc42] bg-opacity-10"></div>
                    <div>
                      <div className="font-medium">{task.title}</div>
                      <div className="text-sm text-gray-600">Deadline: {task.deadline}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Completed */}
            <div>
              <h3 className="text-sm font-medium mb-4">Completed ({completedTasks.length})</h3>
              <div className="space-y-4">
                {completedTasks.map(task => (
                  <div key={task.id} className="flex items-start gap-4">
                    <div className="w-4 h-4 mt-1 rounded-full border-2 border-[#ff5734] bg-[#ff5734] bg-opacity-10">
                      <svg viewBox="0 0 16 16" className="w-full h-full text-[#ff5734]">
                        <path d="M4 8L7 11L12 5" stroke="currentColor" strokeWidth="2" fill="none"/>
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium">{task.title}</div>
                      <div className="text-sm text-gray-600">Completed: {task.completion_date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;