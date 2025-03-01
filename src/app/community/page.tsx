import Link from 'next/link';

export default function CommunityPage() {
  // Sample community photos
  const communityPhotos = [
    {
      id: 1,
      title: 'Mountain Sunrise',
      imageUrl: 'https://images.unsplash.com/photo-1544198365-f5d60b6d8190',
      userName: 'John Doe',
      userImage: 'https://randomuser.me/api/portraits/men/32.jpg',
      likes: 42,
      comments: 8,
    },
    {
      id: 2,
      title: 'Ocean View',
      imageUrl: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0',
      userName: 'Jane Smith',
      userImage: 'https://randomuser.me/api/portraits/women/44.jpg',
      likes: 29,
      comments: 5,
    },
    {
      id: 3,
      title: 'Urban Architecture',
      imageUrl: 'https://images.unsplash.com/photo-1534893502077-f4b931a2bb16',
      userName: 'Alex Johnson',
      userImage: 'https://randomuser.me/api/portraits/men/29.jpg',
      likes: 36,
      comments: 3,
    },
    {
      id: 4,
      title: 'Forest Path',
      imageUrl: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d',
      userName: 'Maria Garcia',
      userImage: 'https://randomuser.me/api/portraits/women/28.jpg',
      likes: 51,
      comments: 12,
    },
    {
      id: 5,
      title: 'Desert Sunset',
      imageUrl: 'https://images.unsplash.com/photo-1586531387048-81c4818b49f5',
      userName: 'Chris Wilson',
      userImage: 'https://randomuser.me/api/portraits/men/67.jpg',
      likes: 38,
      comments: 7,
    },
    {
      id: 6,
      title: 'City Lights',
      imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401',
      userName: 'Sarah Brown',
      userImage: 'https://randomuser.me/api/portraits/women/10.jpg',
      likes: 63,
      comments: 9,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Photography Community
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Share your photos, get feedback, and be inspired by other photographers.
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Recent Photos</h2>
              <p className="text-gray-500">Explore the latest uploads from our community</p>
            </div>
            
            <div className="flex space-x-4">
              <button className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md font-medium hover:bg-indigo-200 transition">
                Popular
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition">
                Recent
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition">
                Following
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communityPhotos.map((photo) => (
              <div key={photo.id} className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                <div className="relative pb-[75%] bg-gray-100">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg">{photo.title}</h3>
                    <div className="flex items-center text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-1 text-red-500">
                        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                      </svg>
                      <span>{photo.likes}</span>
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    <img
                      src={photo.userImage}
                      alt={photo.userName}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">{photo.userName}</span>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <div className="flex items-center text-gray-500 text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-1">
                        <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" />
                      </svg>
                      <span>{photo.comments} comments</span>
                    </div>
                    <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition duration-300">
              Load More Photos
            </button>
          </div>
        </div>
        
        <div className="bg-indigo-50 rounded-xl shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Share Your Photography</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join our community and showcase your best photos. Get feedback, give likes, and connect with other photographers.
          </p>
          <Link href="/tutorial" className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition duration-300">
            Try Our Tutorials First
          </Link>
        </div>
      </div>
    </div>
  );
} 