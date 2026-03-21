import Axios from "axios";
const API = Axios.create({ baseURL: "http://localhost:5000" });

API.interceptors.request.use((req) => {
	if (localStorage.getItem("traveller-profile")) {
		req.headers.Authorization = `Bearer ${
			JSON.parse(localStorage.getItem("traveller-profile")).token
		}`;
	}

	return req;
});

export const fetchPosts = (page, options = {}) => {
	let url = `/posts?page=${page}`;
	if (options.summary) url += `&summary=true`;
	return API.get(url);
};

export const createPost = (newPost) => {
	return API.post("/posts", newPost);
};

export const verifyPostLocation = (payload) => {
	return API.post("/posts/verify-location", payload);
};

export const updatePost = (postId, post) => {
	return API.patch(`/posts/${postId}`, post);
};

export const deletePost = (postId) => {
	return API.delete(`/posts/${postId}`);
};

export const likePost = (postId) => {
	return API.patch(`/posts/${postId}/likePost`);
};

export const signIn = (formData) => {
	return API.post("/users/signIn", formData);
};

export const signUp = (formData) => {
	return API.post("/users/signUp", formData);
};

export const fetchPostsBySearch = (searchQuery) => {
	return API.get(
		`/posts/search?search=${searchQuery.search || "none"}&tags=${
			searchQuery.tags || "none"
		}`,
	);
};

export const fetchPostById = (id) => {
	return API.get(`/posts/${id}`);
};

export const commentPost = (comment, postId) => {
	return API.post(`/posts/${postId}/commentPost`, { comment });
};

// Admin / user management
export const getAllUsers = () => {
	return API.get("/users");
};

export const deleteUser = (userId) => {
	return API.delete(`/users/${userId}`);
};

export const editUser = (userId, userData) => {
	return API.patch(`/users/${userId}`, userData);
};

export const getUserStats = (userId) => {
  return API.get(`/users/${userId}/stats`);
};

export const fetchUserProfile = (userId) => {
	return API.get(`/users/${userId}/profile`);
};

// Recommendation system APIs
// options can include { location: { lat, lng }, radius } where radius is in meters
export const fetchRecommendations = (limit = 10, options = {}) => {
	const { location, radius } = options || {};
	let url = `/posts/recommendations?limit=${limit}`;
	if (location && location.lng != null && location.lat != null) {
		url += `&lng=${location.lng}&lat=${location.lat}`;
		if (radius) {
			url += `&radius=${radius}`;
		}
	}
	return API.get(url);
};

export const fetchSimilarPosts = (postId, limit = 5) => {
	return API.get(`/posts/${postId}/similar?limit=${limit}`);
};

export const trackPostView = (postId) => {
	return API.post(`/posts/${postId}/view`);
};

// Notifications APIs
export const fetchNotifications = () => {
	return API.get("/notifications");
};

export const markNotificationRead = (id) => {
	return API.patch(`/notifications/${id}/read`);
};

export const markAllNotificationsRead = () => {
	return API.patch("/notifications/mark-all-read");
};

export const deleteNotification = (id) => {
	return API.delete(`/notifications/${id}`);
};

export const clearNotifications = () => {
	return API.delete("/notifications");
};
