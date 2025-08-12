// src/pages/ForumPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Users,
  MessageSquare,
  Copy,
  Settings,
  ArrowLeft,
  User,
  Shield,
  Trash2,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const MemberRow = ({
  member,
  currentUserRole,
  forumId,
  token,
  onMemberAction,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showBooks, setShowBooks] = useState(false);
  const [memberBooks, setMemberBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(false);

  const fetchMemberBooks = async () => {
    try {
      setBooksLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/forum/${forumId}/users/${member.userId._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch member's books");
      }

      setMemberBooks(data.data.books || []);
    } catch (err) {
      console.error("Error fetching member books:", err);
      setError("Failed to load member's books");
    } finally {
      setBooksLoading(false);
    }
  };

  const handleShowBooks = () => {
    if (!showBooks && memberBooks.length === 0) {
      fetchMemberBooks();
    }
    setShowBooks(!showBooks);
  };

  const handleMakeAdmin = async (e) => {
    e.stopPropagation();
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/forum/${forumId}/users/${member.userId._id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update member role");
      }

      onMemberAction();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (e) => {
    e.stopPropagation();
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/forum/${forumId}/users/${member.userId._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove member");
      }

      onMemberAction();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // REPLACE YOUR EXISTING RETURN STATEMENT WITH THIS:
  return (
    <div className="border-b">
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
        onClick={handleShowBooks}
      >
        <div className="flex items-center">
          <User className="mr-2" size={18} />
          <span>{member.userId.username}</span>
          {member.role === "admin" && (
            <Shield className="ml-2 text-yellow-500" size={16} />
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {showBooks ? "Hide books" : "Show books"}
          </span>
          {currentUserRole === "admin" && member.role !== "admin" && (
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={handleMakeAdmin}
                disabled={loading}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Make Admin"}
              </button>
              <button
                onClick={handleRemoveMember}
                disabled={loading}
                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Remove"}
              </button>
            </div>
          )}
        </div>
      </div>

      {showBooks && (
        <div className="bg-gray-50 p-3 pl-10">
          <h4 className="font-medium mb-2 flex items-center">
            <BookOpen className="mr-2" size={16} />
            {member.userId.username}'s Books
          </h4>
          {booksLoading ? (
            <div className="flex justify-center py-2">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : memberBooks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {memberBooks.map((book) => (
                <div key={book._id} className="p-2 bg-white rounded border">
                  <p className="font-medium">{book.title}</p>
                  <p className="text-sm text-gray-600">by {book.author}</p>
                  {book.genre && (
                    <p className="text-xs text-gray-500">Genre: {book.genre}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No books found</p>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 p-2 text-red-500 text-sm">{error}</div>
      )}
    </div>
  );
};

const BookRow = ({ book, forumId, token, isAdmin, onBookAction }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showOwners, setShowOwners] = useState(false);
  const [owners, setOwners] = useState([]);
  const [ownersLoading, setOwnersLoading] = useState(false);

  const fetchOwners = async () => {
    try {
      setOwnersLoading(true);
      // First get all members in the forum
      const forumResponse = await fetch(
        `http://localhost:5000/api/forum/${forumId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const forumData = await forumResponse.json();
      if (!forumResponse.ok)
        throw new Error(forumData.message || "Failed to fetch forum members");

      // For each member, check if they own this book
      const ownersList = [];
      for (const member of forumData.data.members) {
        const memberResponse = await fetch(
          `http://localhost:5000/api/forum/${forumId}/users/${member._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const memberData = await memberResponse.json();
        if (!memberResponse.ok) continue;

        // Check if this member has the current book
        const hasBook = memberData.data.books.some((b) => b._id === book._id);
        if (hasBook) {
          ownersList.push({
            _id: member._id,
            username: member.name,
            email: member.email,
          });
        }
      }

      setOwners(ownersList);
    } catch (err) {
      console.error("Error fetching owners:", err);
      setError("Failed to load book owners");
    } finally {
      setOwnersLoading(false);
    }
  };

  const handleShowOwners = () => {
    if (!showOwners && owners.length === 0) {
      fetchOwners();
    }
    setShowOwners(!showOwners);
  };

  const handleUnhideBook = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/forum/${forumId}/books/${book._id}/unhide`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to unhide book");
      }

      onBookAction();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-b p-3">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-medium">{book.title}</h4>
          <p className="text-sm text-gray-600">by {book.author}</p>
          {book.genre && (
            <p className="text-xs text-gray-500">Genre: {book.genre}</p>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={handleShowOwners}
            className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
            disabled={ownersLoading}
          >
            {ownersLoading
              ? "Loading..."
              : showOwners
              ? "Hide Owners"
              : "Show Owners"}
          </button>
          {isAdmin &&
            (book.hidden ? (
              <button
                onClick={handleUnhideBook}
                disabled={loading}
                className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Unhide"}
              </button>
            ) : (
              <button
                onClick={handleHideBook}
                disabled={loading}
                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Hide"}
              </button>
            ))}
        </div>
      </div>
      {showOwners && (
        <div className="mt-2 pl-4 border-l-2 border-gray-200">
          <h5 className="font-medium text-sm mb-1">Owners:</h5>
          {ownersLoading ? (
            <p className="text-sm text-gray-500">Loading owners...</p>
          ) : owners.length > 0 ? (
            <ul className="text-sm">
              {owners.map((owner) => (
                <li key={owner._id} className="flex items-center py-1">
                  <User className="mr-2" size={14} />
                  {owner.username}
                  {owner.role === "admin" && (
                    <Shield className="ml-2 text-yellow-500" size={14} />
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No owners found</p>
          )}
        </div>
      )}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};
const ForumDetailsForm = ({ forum, token, onUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: forum.name,
    location: forum.location,
    description: forum.description || "",
    inviteCode: forum.inviteCode || "",
    featured: forum.featured || { book: "", quote: "" },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFeaturedChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      featured: {
        ...prev.featured,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/forum/${forum._id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update forum details");
      }

      const data = await response.json();
      onUpdate(data.data);
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Forum Details</h3>
        <button
          onClick={() => setEditMode(!editMode)}
          className="flex items-center gap-1 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          <Settings size={16} />
          {editMode ? "Cancel" : "Edit"}
        </button>
      </div>

      {editMode ? (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
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
            <div className="md:col-span-2">
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
            <div>
              <label className="block text-sm font-medium mb-1">
                Messenger Link
              </label>
              <input
                type="url"
                name="messengerLink"
                value={formData.messengerLink}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Invite Code
              </label>
              <div className="flex">
                <input
                  type="text"
                  name="inviteCode"
                  value={formData.inviteCode}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-l"
                  readOnly
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(formData.inviteCode)}
                  className="px-3 bg-gray-200 border-t border-r border-b rounded-r hover:bg-gray-300"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Featured Book
              </label>
              <input
                type="text"
                name="book"
                value={formData.featured.book}
                onChange={handleFeaturedChange}
                className="w-full p-2 border rounded mb-2"
                placeholder="Book title"
              />
              <textarea
                name="quote"
                value={formData.featured.quote}
                onChange={handleFeaturedChange}
                className="w-full p-2 border rounded"
                rows="2"
                placeholder="Featured quote"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
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
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{forum.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{forum.location || "-"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Description</p>
              <p className="font-medium">{forum.description || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Messenger Link</p>
              {forum.messengerLink ? (
                <a
                  href={forum.messengerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-500 hover:underline flex items-center gap-1"
                >
                  <MessageSquare size={16} /> Join Chat
                </a>
              ) : (
                <p className="font-medium">-</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Invite Code</p>
              <div className="flex">
                <p className="font-medium bg-gray-100 p-2 rounded-l flex-1">
                  {forum.inviteCode}
                </p>
                <button
                  onClick={() => copyToClipboard(forum.inviteCode)}
                  className="px-3 bg-gray-200 rounded-r hover:bg-gray-300"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
          </div>
          {forum.featured && (forum.featured.book || forum.featured.quote) && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded">
              <h4 className="font-medium text-yellow-800 mb-1">Featured</h4>
              {forum.featured.book && (
                <p className="text-yellow-700">
                  <span className="font-semibold">Book:</span>{" "}
                  {forum.featured.book}
                </p>
              )}
              {forum.featured.quote && (
                <p className="text-yellow-700 mt-1 italic">
                  "{forum.featured.quote}"
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function ForumPage() {
  const { forumId } = useParams();
  const { token, logout, user } = useAuth();
  const navigate = useNavigate();
  const [forum, setForum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("books");
  const [currentUserRole, setCurrentUserRole] = useState("member");
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchForumDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/forum/${forumId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (response.status === 401) {
          logout();
          throw new Error("Session expired. Please login again.");
        }

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch forum details");
        }

        // Transform the API response to match our expected format
        const transformedData = {
          ...data.data.forumInfo,
          _id: forumId,
          members: data.data.members.map((member) => ({
            userId: {
              _id: member._id,
              username: member.name,
              email: member.email,
            },
            role: member.role,
          })),
          books: data.data.books.map((book) => ({
            ...book,
            owners: [], // Add owners if available in your API
          })),
          hiddenBooks: data.data.hiddenBooks,
        };

        setForum(transformedData);

        // Find current user's role in this forum
        if (user && transformedData.members) {
          const currentUserMember = transformedData.members.find(
            (member) => member.userId._id === user._id
          );
          if (currentUserMember) {
            setCurrentUserRole(currentUserMember.role);
          }
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message || "An error occurred while loading the forum");
      } finally {
        setLoading(false);
      }
    };

    fetchForumDetails();
  }, [forumId, token, logout, user]);

  const handleLeaveForum = async () => {
    try {
      setActionLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/forum/${forumId}/leave`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to leave forum");
      }

      navigate("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
      setShowLeaveModal(false);
    }
  };

  const handleDeleteForum = async () => {
    try {
      setActionLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/forum/${forumId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete forum");
      }

      navigate("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  };

  const refreshForumData = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/forum/${forumId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to refresh forum data");
      }

      const data = await response.json();
      setForum(data.forum);
    } catch (err) {
      console.error("Refresh error:", err);
      setError(err.message);
    }
  };

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
            onClick={() => navigate("/home")}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!forum) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Forum Not Found</h2>
          <p className="mb-4">The requested forum could not be loaded.</p>
          <button
            onClick={() => navigate("/home")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft size={18} />
            Back to Forums
          </button>
          <div className="flex gap-2">
            {currentUserRole === "admin" && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                <Trash2 size={16} />
                Delete Forum
              </button>
            )}
            <button
              onClick={() => setShowLeaveModal(true)}
              className="flex items-center gap-1 px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              <LogOut size={16} />
              Leave Forum
            </button>
          </div>
        </div>

        <ForumDetailsForm
          forum={forum}
          token={token}
          onUpdate={(updatedData) => {
            setForum((prev) => ({
              ...prev,
              ...updatedData,
            }));
          }}
        />

        <div className="bg-white rounded-lg shadow overflow-hidden mt-4">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("books")}
              className={`flex-1 py-3 font-medium flex items-center justify-center gap-2 ${
                activeTab === "books"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <BookOpen size={16} />
              Books
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`flex-1 py-3 font-medium flex items-center justify-center gap-2 ${
                activeTab === "members"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Users size={16} />
              Members ({forum.members.length})
            </button>
          </div>

          <div className="p-4">
            {activeTab === "books" ? (
              <div>
                {forum.books && forum.books.length > 0 ? (
                  <div className="divide-y">
                    {forum.books.map((book) => (
                      <BookRow
                        key={book._id}
                        book={book}
                        forumId={forumId}
                        token={token}
                        isAdmin={currentUserRole === "admin"}
                        onBookAction={refreshForumData}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-500">
                      No books added to this forum yet.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {forum.members && forum.members.length > 0 ? (
                  <div className="divide-y">
                    {forum.members.map((member) => (
                      <MemberRow
                        key={member.userId._id}
                        member={member}
                        currentUserRole={currentUserRole}
                        forumId={forumId}
                        token={token}
                        onMemberAction={refreshForumData}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-500">No members in this forum.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Leave Forum Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Leave Forum</h3>
            <p className="mb-6">
              Are you sure you want to leave this forum? You'll need an invite
              code to join again.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLeaveModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleLeaveForum}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                {actionLoading ? "Leaving..." : "Leave Forum"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Forum Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Delete Forum</h3>
            <p className="mb-6">
              Are you sure you want to delete this forum? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteForum}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                {actionLoading ? "Deleting..." : "Delete Forum"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
