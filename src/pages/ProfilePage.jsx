// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit2, Trash, Plus, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { token, logout } = useAuth();
  const [profile, setProfile] = useState({ id: "", name: "", email: "" });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [error, setError] = useState(null);

  // edit profile form
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
  });

  // book modal states
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [currentEditBook, setCurrentEditBook] = useState(null);
  const [bookForm, setBookForm] = useState({
    title: "",
    author: "",
    genre: "",
  });

  const navigate = useNavigate();

  // fetch profile
  useEffect(() => {
    const loadProfile = async () => {
      setLoadingProfile(true);
      try {
        const res = await fetch("http://localhost:5000/api/user/me", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (res.status === 401) {
          logout();
          return;
        }
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || "Failed to load profile");
        }
        const data = await res.json();
        setProfile({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email || "",
        });
        setProfileForm({
          name: data.user.name || "",
          email: data.user.email || "",
          currentPassword: "",
          newPassword: "",
        });
        setError(null);
      } catch (err) {
        console.error("loadProfile error:", err);
        setError(err.message || "Unknown error");
      } finally {
        setLoadingProfile(false);
      }
    };

    if (token) loadProfile();
  }, [token, logout]);

  // fetch books
  useEffect(() => {
    const loadBooks = async () => {
      setLoadingBooks(true);
      try {
        const res = await fetch("http://localhost:5000/api/user/me/books", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || "Failed to load books");
        }
        const data = await res.json();
        setBooks(data.books || []);
      } catch (err) {
        console.error("loadBooks error:", err);
      } finally {
        setLoadingBooks(false);
      }
    };
    if (token) loadBooks();
  }, [token]);

  // update profile
  const updateProfile = async () => {
    try {
      const payload = { name: profileForm.name };
      if (profileForm.email) payload.email = profileForm.email;
      if (profileForm.currentPassword && profileForm.newPassword) {
        payload.currentPassword = profileForm.currentPassword;
        payload.newPassword = profileForm.newPassword;
      }
      const res = await fetch("http://localhost:5000/api/user/me", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      setProfile((p) => ({
        ...p,
        name: data.data?.name || profileForm.name,
        email: data.data?.email || profileForm.email,
      }));
      setEditingProfile(false);
      alert("Profile updated");
    } catch (err) {
      console.error(err);
      alert(err.message || "Update failed");
    }
  };

  // delete account
  const deleteAccount = async () => {
    if (!confirm("Delete account? This cannot be undone.")) return;
    try {
      const res = await fetch("http://localhost:5000/api/user/me", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");
      alert("Account deleted");
      logout();
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert(err.message || "Delete failed");
    }
  };

  // add book
  const addBook = async () => {
    try {
      if (!bookForm.title || !bookForm.author)
        return alert("Title & author required");
      const res = await fetch("http://localhost:5000/api/book/add", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Add book failed");
      setBooks((b) => [
        ...b,
        {
          id: data.id,
          title: data.title,
          author: data.author,
          genre: bookForm.genre,
        },
      ]);
      setAddOpen(false);
      setBookForm({ title: "", author: "", genre: "" });
      alert("Book added");
    } catch (err) {
      console.error(err);
      alert(err.message || "Add failed");
    }
  };

  // open edit modal for book
  const openEditBook = (book) => {
    setCurrentEditBook(book);
    setBookForm({
      title: book.title,
      author: book.author,
      genre: book.genre || "",
    });
    setEditOpen(true);
  };

  // save edited book
  const saveEditedBook = async () => {
    try {
      if (!currentEditBook) return;
      const res = await fetch(
        `http://localhost:5000/api/book/${currentEditBook.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookForm),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update book failed");
      setBooks((b) =>
        b.map((x) => (x.id === currentEditBook.id ? { ...x, ...bookForm } : x))
      );
      setEditOpen(false);
      setCurrentEditBook(null);
      setBookForm({ title: "", author: "", genre: "" });
      alert("Book updated");
    } catch (err) {
      console.error(err);
      alert(err.message || "Update failed");
    }
  };

  // delete book
  const deleteBook = async (bookId) => {
    if (!confirm("Delete this book?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/book/${bookId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");
      setBooks((b) => b.filter((x) => x.id !== bookId));
      alert("Book deleted");
    } catch (err) {
      console.error(err);
      alert(err.message || "Delete failed");
    }
  };

  return (
    <div className="flex justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 rounded-full p-3">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{profile.name || "—"}</h2>
              <div className="text-sm text-gray-600">
                {profile.email || "No email"}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditingProfile((s) => !s)}
              className="px-3 py-1 bg-blue-600 text-white rounded flex items-center gap-2"
            >
              <Edit2 size={14} /> Edit Profile
            </button>
            <button
              onClick={deleteAccount}
              className="px-3 py-1 bg-red-500 text-white rounded flex items-center gap-2"
            >
              <Trash size={14} /> Delete Account
            </button>
          </div>
        </div>

        {/* Edit profile form */}
        {editingProfile && (
          <div className="mb-6 bg-white border rounded p-4 shadow-sm">
            <h3 className="font-semibold mb-3">Update Profile</h3>
            <div className="grid grid-cols-1 gap-3">
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Name"
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, name: e.target.value })
                }
              />
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Email"
                value={profileForm.email}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, email: e.target.value })
                }
              />
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Current password (required to change password)"
                type="password"
                value={profileForm.currentPassword}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    currentPassword: e.target.value,
                  })
                }
              />
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="New password"
                type="password"
                value={profileForm.newPassword}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    newPassword: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setEditingProfile(false)}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={updateProfile}
                className="px-3 py-1 bg-green-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Books list */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">
              Your Books ({books.length})
            </h3>
            <button
              onClick={() => setAddOpen(true)}
              className="px-3 py-1 bg-blue-600 text-white rounded flex items-center gap-2"
            >
              <Plus size={14} /> Add Book
            </button>
          </div>

          <div className="bg-white border rounded">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-sm">Title</th>
                    <th className="p-3 text-sm">Author</th>
                    <th className="p-3 text-sm">Genre</th>
                    <th className="p-3 text-sm w-40">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingBooks ? (
                    <tr>
                      <td colSpan="4" className="p-4 text-center">
                        Loading...
                      </td>
                    </tr>
                  ) : books.length ? (
                    books.map((b) => (
                      <tr key={b.id} className="border-b last:border-b-0">
                        <td className="p-3 align-top">{b.title}</td>
                        <td className="p-3 align-top">{b.author}</td>
                        <td className="p-3 align-top">{b.genre}</td>
                        <td className="p-3 align-top">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditBook(b)}
                              title="Edit"
                              className="px-2 py-1 bg-yellow-100 rounded flex items-center gap-1 text-sm"
                            >
                              <Edit2 size={14} /> Edit
                            </button>
                            <button
                              onClick={() => deleteBook(b.id)}
                              title="Delete"
                              className="px-2 py-1 bg-red-100 rounded flex items-center gap-1 text-sm"
                            >
                              <Trash size={14} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-4 text-center text-gray-500">
                        No books found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add Book Modal */}
        {addOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setAddOpen(false)}
            />
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6 z-10">
              <h4 className="text-lg font-semibold mb-3">Add Book</h4>
              <input
                className="w-full border rounded px-3 py-2 mb-2"
                placeholder="Title"
                value={bookForm.title}
                onChange={(e) =>
                  setBookForm({ ...bookForm, title: e.target.value })
                }
              />
              <input
                className="w-full border rounded px-3 py-2 mb-2"
                placeholder="Author"
                value={bookForm.author}
                onChange={(e) =>
                  setBookForm({ ...bookForm, author: e.target.value })
                }
              />
              <input
                className="w-full border rounded px-3 py-2 mb-3"
                placeholder="Genre"
                value={bookForm.genre}
                onChange={(e) =>
                  setBookForm({ ...bookForm, genre: e.target.value })
                }
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setAddOpen(false)}
                  className="px-3 py-1 bg-gray-200 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={addBook}
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Book Modal */}
        {editOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setEditOpen(false)}
            />
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6 z-10">
              <h4 className="text-lg font-semibold mb-3">Edit Book</h4>
              <input
                className="w-full border rounded px-3 py-2 mb-2"
                placeholder="Title"
                value={bookForm.title}
                onChange={(e) =>
                  setBookForm({ ...bookForm, title: e.target.value })
                }
              />
              <input
                className="w-full border rounded px-3 py-2 mb-2"
                placeholder="Author"
                value={bookForm.author}
                onChange={(e) =>
                  setBookForm({ ...bookForm, author: e.target.value })
                }
              />
              <input
                className="w-full border rounded px-3 py-2 mb-3"
                placeholder="Genre"
                value={bookForm.genre}
                onChange={(e) =>
                  setBookForm({ ...bookForm, genre: e.target.value })
                }
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditOpen(false)}
                  className="px-3 py-1 bg-gray-200 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEditedBook}
                  className="px-3 py-1 bg-green-600 text-white rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
