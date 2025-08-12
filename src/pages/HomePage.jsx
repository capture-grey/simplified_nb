// src/pages/HomePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserRoundCog,
  BookOpen,
  Users,
  User,
  Plus,
  LogOut,
  Settings,
  Trash2,
  Edit,
  ArrowLeft,
} from "lucide-react";
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

const BookRow = ({ book, onEdit, onDelete }) => {
  return (
    <div className="flex justify-between items-center p-3 border-b">
      <div>
        <h4 className="font-medium">{book.title}</h4>
        <p className="text-sm text-gray-600">
          by {book.author} • {book.genre}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(book)}
          className="p-1 text-blue-500 hover:text-blue-700"
        >
          <Edit size={16} />
        </button>
        <button
          onClick={() => onDelete(book.id)}
          className="p-1 text-red-500 hover:text-red-700"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

const ProfileModal = ({ onClose }) => {
  const { user, setUser, token, logout } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        currentPassword: "",
        newPassword: "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Only include fields that have values
      const updateData = {
        name: formData.name,
        ...(formData.email && { email: formData.email }),
        ...(formData.currentPassword && {
          currentPassword: formData.currentPassword,
        }),
        ...(formData.newPassword && { newPassword: formData.newPassword }),
      };

      const response = await fetch("http://localhost:5000/api/user/me", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const data = await response.json();
      setUser({
        ...user,
        name: data.data.name,
        ...(data.data.email && { email: data.data.email }),
      });

      setEditMode(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/user/me", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      logout();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Profile</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        {editMode ? (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name*</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  placeholder="Add your email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  placeholder="Required for password changes"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  placeholder="Leave blank to keep current"
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : showDeleteConfirm ? (
          <div>
            <p className="mb-4 text-red-600">
              Are you sure you want to delete your account? This action cannot
              be undone.
            </p>
            <div className="flex justify-between">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gray-200 rounded-full p-6">
                <User size={32} className="text-gray-600" />
              </div>
            </div>
            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{user.name}</p>
              </div>
              {user.email && (
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              )}
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
              >
                <Edit size={16} /> Edit Profile
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2"
              >
                <Trash2 size={16} /> Delete Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const BookModal = ({ book, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: book?.title || "",
    author: book?.author || "",
    genre: book?.genre || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {book ? "Edit Book" : "Add New Book"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Author</label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Genre</label>
              <input
                type="text"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Save Book"}
          </button>
        </form>
      </div>
    </div>
  );
};

const JoinForumModal = ({ onClose, onJoin }) => {
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onJoin(inviteCode);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Join Forum</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Invite Code
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter forum invite code"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Joining..." : "Join Forum"}
          </button>
        </form>
      </div>
    </div>
  );
};

const CreateForumModal = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onCreate(formData);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Create New Forum</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Forum Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                rows="3"
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Forum"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default function HomePage() {
  const { isAuthenticated, token, logout, user, setUser } = useAuth();
  const navigate = useNavigate();
  const [forums, setForums] = useState([]);
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("forums");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);
  const [showJoinForumModal, setShowJoinForumModal] = useState(false);
  const [showCreateForumModal, setShowCreateForumModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) {
          throw new Error("Authentication required");
        }

        setLoading(true);

        // Fetch user data with forums
        const userResponse = await fetch("http://localhost:5000/api/user/me", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (userResponse.status === 401) {
          logout();
          throw new Error("Session expired. Please login again.");
        }

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await userResponse.json();
        setForums(userData.user.forums || []);

        // Fetch user's books
        const booksResponse = await fetch(
          "http://localhost:5000/api/user/me/books",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (booksResponse.ok) {
          const booksData = await booksResponse.json();
          setBooks(booksData.books || []);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, token, logout]);

  const handleUpdateProfile = async (updateData) => {
    try {
      const response = await fetch("http://localhost:5000/api/user/me", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const data = await response.json();

      // Update user context with new data
      setUser((prev) => ({
        ...prev,
        name: data.data.name,
        ...(data.data.email && { email: data.data.email }),
      }));

      return data;
    } catch (err) {
      throw err;
    }
  };
  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/user/me", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      logout();
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddBook = async (bookData) => {
    try {
      const response = await fetch("http://localhost:5000/api/book/add", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookData),
      });

      if (!response.ok) {
        throw new Error("Failed to add book");
      }

      const data = await response.json();
      setBooks((prev) => [
        ...prev,
        {
          id: data.id,
          title: data.title,
          author: data.author,
          genre: bookData.genre,
        },
      ]);
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateBook = async (bookData) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/book/${currentBook.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update book");
      }

      setBooks((prev) =>
        prev.map((book) =>
          book.id === currentBook.id ? { ...book, ...bookData } : book
        )
      );
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteBook = async (bookId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/book/${bookId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete book");
      }

      setBooks((prev) => prev.filter((book) => book.id !== bookId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleJoinForum = async (inviteCode) => {
    try {
      const response = await fetch("http://localhost:5000/api/forum/join", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inviteCode }),
      });

      if (!response.ok) {
        throw new Error("Failed to join forum");
      }

      const data = await response.json();
      setForums((prev) => [...prev, data.forum]);
    } catch (err) {
      throw err;
    }
  };

  const handleCreateForum = async (forumData) => {
    try {
      const response = await fetch("http://localhost:5000/api/forum", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(forumData),
      });

      if (!response.ok) {
        throw new Error("Failed to create forum");
      }

      const data = await response.json();
      setForums((prev) => [
        ...prev,
        {
          forumId: data.data.forumId,
          name: data.data.name,
          location: data.data.location,
          memberCount: 1,
          membersBookCount: 0,
          role: "admin",
        },
      ]);
    } catch (err) {
      throw err;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Please Login</h2>
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("forums")}
              className={`px-4 py-2 ${
                activeTab === "forums"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              Your Forums
            </button>
            <button
              onClick={() => setActiveTab("books")}
              className={`px-4 py-2 ${
                activeTab === "books" ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              Your Books
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowProfileModal(true)}
              className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
              title="Profile"
            >
              <User size={20} />
            </button>
            <button
              onClick={logout}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>

        {activeTab === "forums" ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg">Your Forums</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowJoinForumModal(true)}
                  className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Join Forum
                </button>
                <button
                  onClick={() => setShowCreateForumModal(true)}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Create Forum
                </button>
              </div>
            </div>
            <div className="forum-list flex flex-col gap-1">
              {forums.length > 0 ? (
                forums.map((forum) => (
                  <ForumCard key={forum.forumId} forum={forum} />
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
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-lg">
                Your Books ({books.length})
              </h2>
              <button
                onClick={() => {
                  setCurrentBook(null);
                  setShowBookModal(true);
                }}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
              >
                <Plus size={16} />
                Add Book
              </button>
            </div>
            <div className="bg-white rounded-lg shadow">
              {books.length > 0 ? (
                <div className="divide-y">
                  {books.map((book) => (
                    <BookRow
                      key={book.id}
                      book={book}
                      onEdit={(book) => {
                        setCurrentBook(book);
                        setShowBookModal(true);
                      }}
                      onDelete={handleDeleteBook}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">
                    You haven't added any books yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          user={user} // Make sure this is coming from useAuth()
          onClose={() => setShowProfileModal(false)}
          onUpdate={handleUpdateProfile}
          onDelete={handleDeleteAccount}
        />
      )}

      {/* Book Modal */}
      {showBookModal && (
        <BookModal
          book={currentBook}
          onClose={() => setShowBookModal(false)}
          onSubmit={currentBook ? handleUpdateBook : handleAddBook}
        />
      )}

      {/* Join Forum Modal */}
      {showJoinForumModal && (
        <JoinForumModal
          onClose={() => setShowJoinForumModal(false)}
          onJoin={handleJoinForum}
        />
      )}

      {/* Create Forum Modal */}
      {showCreateForumModal && (
        <CreateForumModal
          onClose={() => setShowCreateForumModal(false)}
          onCreate={handleCreateForum}
        />
      )}
    </div>
  );
}
