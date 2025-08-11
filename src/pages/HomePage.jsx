// src/pages/HomePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserRoundCog, BookOpen, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ForumCard = ({ forum }) => {
  const navigate = useNavigate();
  const roleIconColor =
    forum.role === "admin" ? "text-[#FFD700]" : "text-white";

  return (
    <div
      className="flex bg-white min-h-[100px] w-full mb-[3px] rounded-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={() => navigate(`/forums/${forum.forumId}`)}
    >
      <div className="nameLocation flex flex-4 md:flex-6 flex-col pl-1 md:pl-5">
        <div className="name flex flex-5 items-end text-sm break-words font-semibold">
          <h3>{forum.name}</h3>
          <UserRoundCog size={19} className={`pl-1 ${roleIconColor}`} />
        </div>
        <div className="location flex flex-5 items-start text-sm md:text-balance break-words text-black/75">
          <span>{forum.location}</span>
        </div>
      </div>
      <div className="others flex flex-6 md:flex-4">
        <div className="books flex-1/2 flex items-center justify-center gap-2 text-[17px]">
          <BookOpen size={15} className="mt-[2px]" /> {forum.membersBookCount}
        </div>
        <div className="members flex-1/2 flex items-center justify-center gap-2 text-[17px]">
          <Users size={15} /> {forum.memberCount}
        </div>
      </div>
    </div>
  );
};

export default function HomePage() {
  const { isAuthenticated, token, user, logout } = useAuth();
  const [forums, setForums] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchForums = async () => {
      try {
        if (!token) {
          throw new Error("Authentication required");
        }

        const response = await fetch("http://localhost:5000/api/user/me", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 401) {
          logout();
          throw new Error("Session expired. Please login again.");
        }

        if (!response.ok) {
          throw new Error("Failed to fetch forums");
        }

        const data = await response.json();
        console.log("User data:", data); // Debug log

        // Use forums from the response or fallback to user.joinedForums
        setForums(data.user?.forums || user?.joinedForums || []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      }
    };

    if (isAuthenticated) {
      // First try to use the forums from the user context
      if (user?.joinedForums) {
        setForums(user.joinedForums);
      } else {
        // Fallback to API call if not available in context
        fetchForums();
      }
    }
  }, [isAuthenticated, token, user, logout]);

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Please Login</h2>
          <p className="mb-4">You need to login to view forums</p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-red-600">Error</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
          >
            Try Again
          </button>
          <button
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Login Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full px-4 mb-10 mt-5">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Your Forums</h2>
          <button
            onClick={logout}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
        <div className="forum-list flex flex-col gap-1">
          {forums.length > 0 ? (
            forums.map((forum) => (
              <ForumCard
                key={forum.forumId || forum.id}
                forum={{
                  ...forum,
                  name: forum.name || "Unnamed Forum",
                  location: forum.location || "Unknown Location",
                  membersBookCount: forum.membersBookCount || 0,
                  memberCount: forum.memberCount || 1,
                  role: forum.role || "member",
                }}
              />
            ))
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                You haven't joined any forums yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
