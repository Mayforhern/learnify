import React from 'react';

const Certificates = () => {
  const certificates = [
    {
      id: 1,
      course: 'Data Visualization Techniques',
      issueDate: 'March 15, 2024',
      instructor: 'David Smith',
      credential: 'CERT-123-456-789',
      skills: ['Data Analysis', 'Visualization', 'D3.js', 'Tableau']
    },
    {
      id: 2,
      course: 'Creative Writing Masterclass',
      issueDate: 'February 28, 2024',
      instructor: 'Sarah Johnson',
      credential: 'CERT-987-654-321',
      skills: ['Storytelling', 'Character Development', 'Plot Structure', 'Editing']
    }
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Certificates</h1>
        <button className="text-gray-700 flex items-center gap-2 hover:text-black transition-colors">
          Download All
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 3V13M10 13L6 9M10 13L14 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 17H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="grid gap-6">
        {certificates.map((cert) => (
          <div key={cert.id} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#FF4D4D] rounded-full flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M12 15L12 3M12 15L8 11M12 15L16 11" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 21H16" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-medium">{cert.course}</h2>
                    <p className="text-sm text-gray-600">Instructor: {cert.instructor}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Issue Date</div>
                    <div className="font-medium">{cert.issueDate}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Credential ID</div>
                    <div className="font-medium">{cert.credential}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-2">Skills</div>
                  <div className="flex flex-wrap gap-2">
                    {cert.skills.map((skill, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end justify-between ml-8">
                <button className="text-gray-700 hover:text-black transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 3V13M12 13L8 9M12 13L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 17H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
                <button className="bg-[#FF4D4D] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#ff3333] transition-colors">
                  View Certificate
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Certificates; 