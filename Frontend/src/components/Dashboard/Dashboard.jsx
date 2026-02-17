import { useEffect, useState, useCallback } from "react";
import "./styles.css";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { useMediaQuery } from "@material-ui/core";

const Dashboard = () => {
  const isMobile = useMediaQuery('(max-width:960px)');
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  const token = localStorage.getItem("traveller-profile")
    ? JSON.parse(localStorage.getItem("traveller-profile")).token
    : null;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersResponse, postsResponse] = await Promise.all([
        fetch("http://127.0.0.1:3000/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("http://127.0.0.1:3000/posts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);
      const usersData = await usersResponse.json();
      const postsData = await postsResponse.json();
      setUsers(usersData.users);
      setPosts(postsData.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      history.push("/login");
    } else {
      fetchData();
    }
  }, [token, history, fetchData]);

  const deletePost = async (id) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      setLoading(true);
      try {
        const res = await fetch(`http://127.0.0.1:3000/posts/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) toast.success("Post deleted successfully");
        else toast.error("Error");
        await fetchData();
      } catch (error) {
        console.log(error);
        toast.error("Error");
      } finally {
        setLoading(false);
      }
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setLoading(true);
      try {
        const res = await fetch(`http://127.0.0.1:3000/users/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) toast.success("User deleted successfully");
        else toast.error("Error");
        await fetchData();
      } catch (error) {
        toast.error("Error");
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const editPost = async (id) => {
    const newTitle = prompt("Enter new title");
    if (newTitle) {
      setLoading(true);
      try {
        const res = await fetch(`http://127.0.0.1:3000/posts/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title: newTitle }),
        });

        if (res.ok) {
          toast.success("Post updated successfully!");
        } else {
          toast.error("Failed to update post");
        }
        await fetchData();
      } catch (error) {
        console.log(error);
        toast.error("Error updating post");
      } finally {
        setLoading(false);
      }
    }
  };

  const editUser = async (id) => {
    const newName = prompt("Enter new name");
    if (newName) {
      setLoading(true);
      try {
        const res = await fetch(`http://127.0.0.1:3000/users/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: newName }),
        });

        if (res.ok) {
          toast.success("User updated successfully!");
        } else {
          toast.error("Failed to update user");
        }
        await fetchData();
      } catch (error) {
        console.log(error);
        toast.error("Error updating user");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="dashboard" style={{ marginTop: isMobile ? 56 : 64 }}>
      {isMobile && (
        <button
          className="dashboard-nav-mobile"
          style={{
            position: 'fixed',
            top: 8,
            left: 8,
            zIndex: 1000,
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: 8,
            padding: '8px 16px',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Dashboard
        </button>
      )}
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <div className="dashboard-panel">
            <h2>Posts</h2>
            <table>
              <thead>
                <tr>
                  <th>Tags</th>
                  <th>Likes</th>
                  <th>Comments</th>
                  <th>Title</th>
                  <th>Message</th>
                  <th>Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post._id}>
                    <td>{Array.isArray(post.tags) ? post.tags.join(' ') : post.tags}</td>
                    <td>{Array.isArray(post.likes) ? post.likes.length : 0}</td>
                    <td>{Array.isArray(post.comments) ? post.comments.length : 0}</td>
                    <td>{post.title}</td>
                    <td>{post.message}</td>
                    <td>{post.name}</td>
                    <td>
                      <button className="edit" onClick={() => editPost(post._id)}>Edit</button>
                      <button className="delete" onClick={() => deletePost(post._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="dashboard-panel">
            <h2>Users</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <button className="edit" onClick={() => editUser(user._id)}>Edit</button>
                      <button className="delete" onClick={() => deleteUser(user._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
