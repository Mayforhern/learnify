import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Course {
  id: number;
  title: string;
  progress: number;
  lastAccessed: string;
  nextLesson: string;
  instructor: string;
  totalLessons: number;
  completedLessons: number;
  thumbnail: string;
}

const MyCourses = () => {
  const [activeTab, setActiveTab] = useState('in-progress');
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      // In a real app, this would be an API call
      const mockCourses: Course[] = [
        {
          id: 1,
          title: 'Creative Writing for Beginners',
          progress: 65,
          lastAccessed: '2 days ago',
          nextLesson: 'Character Development',
          instructor: 'Sarah Johnson',
          totalLessons: 12,
          completedLessons: 8,
          thumbnail: '/course-thumbnails/creative-writing.jpg'
        },
        {
          id: 2,
          title: 'Public Speaking and Leadership',
          progress: 30,
          lastAccessed: '1 week ago',
          nextLesson: 'Voice Modulation',
          instructor: 'Michael Chen',
          totalLessons: 15,
          completedLessons: 5,
          thumbnail: '/course-thumbnails/public-speaking.jpg'
        },
        {
          id: 3,
          title: 'Data Visualization Techniques',
          progress: 100,
          lastAccessed: '1 month ago',
          nextLesson: 'Completed',
          instructor: 'David Smith',
          totalLessons: 10,
          completedLessons: 10,
          thumbnail: '/course-thumbnails/data-viz.jpg'
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCourses(mockCourses);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading courses:', error);
      setIsLoading(false);
    }
  };

  const getFilteredCourses = () => {
    return courses.filter(course => {
      if (activeTab === 'in-progress') {
        return course.progress < 100;
      } else {
        return course.progress === 100;
      }
    });
  };

  const handleContinueCourse = (courseId: number) => {
    // In a real app, this would navigate to the last viewed lesson
    navigate(`/course/${courseId}/learn`);
  };

  const handleReviewCourse = (courseId: number) => {
    // In a real app, this would navigate to the course review page
    navigate(`/course/${courseId}/review`);
  };

  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto px-8 py-12 flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading your courses...</div>
      </div>
    );
  }

  const filteredCourses = getFilteredCourses();

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('in-progress')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'in-progress'
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            In Progress ({courses.filter(c => c.progress < 100).length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === 'completed'
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            Completed ({courses.filter(c => c.progress === 100).length})
          </button>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-600 mb-4">
            {activeTab === 'in-progress' 
              ? "You don't have any courses in progress" 
              : "You haven't completed any courses yet"}
          </div>
          <button
            onClick={() => navigate('/courses')}
            className="bg-[#FF4D4D] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#ff3333] transition-colors"
          >
            Browse Courses
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredCourses.map((course) => (
            <div 
              key={course.id} 
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-gray-200 transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-medium mb-2">{course.title}</h2>
                  <p className="text-sm text-gray-600 mb-4">Instructor: {course.instructor}</p>
                  <div className="flex items-center gap-8 text-sm">
                    <div>
                      <span className="text-gray-600">Last accessed:</span>
                      <span className="ml-2 font-medium">{course.lastAccessed}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Lessons completed:</span>
                      <span className="ml-2 font-medium">
                        {course.completedLessons} of {course.totalLessons}
                      </span>
                    </div>
                    {course.progress < 100 && (
                      <div>
                        <span className="text-gray-600">Next lesson:</span>
                        <span className="ml-2 font-medium">{course.nextLesson}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold mb-1">{course.progress}%</div>
                    <div className="text-sm text-gray-600">Complete</div>
                  </div>
                  <button 
                    onClick={() => course.progress === 100 
                      ? handleReviewCourse(course.id)
                      : handleContinueCourse(course.id)
                    }
                    className="bg-[#FF4D4D] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#ff3333] transition-colors"
                  >
                    {course.progress === 100 ? 'Review' : 'Continue'}
                  </button>
                </div>
              </div>
              <div className="mt-6">
                <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-[#FF4D4D] rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span>{course.completedLessons} lessons completed</span>
                  <span>{course.totalLessons - course.completedLessons} remaining</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses; 