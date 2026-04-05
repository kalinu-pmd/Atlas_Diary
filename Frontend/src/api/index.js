import Axios from "axios";

// API base URL comes only from Vite env 

const API = Axios.create({ baseURL: import.meta.env.VITE_BASE_URL });

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

export const fetchPublicPostStats = () => {
	return API.get("/posts/stats/public");
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

// Post reporting & review
export const reportPost = (postId, payload) => {
	return API.post(`/posts/${postId}/report`, payload);
};

export const sendPostForReview = (postId, payload = {}) => {
	return API.post(`/posts/${postId}/send-for-review`, payload);
};

export const signIn = (formData) => {
	return API.post("/users/signIn", formData);
};

export const signUp = (formData) => {
	return API.post("/users/signUp", formData);
};

export const verifyOtp = (payload) => {
	return API.post("/users/verify-otp", payload);
};

export const resendOtp = (payload) => {
	return API.post("/users/resend-otp", payload);
};

// Password reset (user-facing)
export const requestPasswordReset = (payload) => {
	return API.post("/users/request-password-reset", payload);
};

export const resetPasswordWithOtp = (payload) => {
	return API.post("/users/reset-password", payload);
};

export const verifyResetOtp = (payload) => {
	return API.post("/users/verify-reset-otp", payload);
};

export const fetchPostsBySearch = (searchQuery) => {
	const { location, radius } = searchQuery || {};
	let locationQuery = "";
	if (location && location.lat != null && location.lng != null) {
		locationQuery += `&lat=${location.lat}&lng=${location.lng}`;
		if (radius) {
			locationQuery += `&radius=${radius}`;
		}
	}

	return API.get(
		`/posts/search?search=${searchQuery.search || "none"}&tags=${
			searchQuery.tags || "none"
		}${locationQuery}`,
	);
};

export const fetchPostById = (id) => {
	return API.get(`/posts/${id}`);
};

export const commentPost = (comment, postId) => {
	return API.post(`/posts/${postId}/commentPost`, { comment });
};

export const editComment = (postId, commentIndex, payload) => {
	return API.patch(`/posts/${postId}/comments/${commentIndex}`, payload);
};

export const deleteComment = (postId, commentIndex) => {
	return API.delete(`/posts/${postId}/comments/${commentIndex}`);
};

// Admin / user management
export const getAllUsers = (page) => {
	let url = "/users";
	if (page) {
		url += `?page=${page}`;
	}
	return API.get(url);
};

export const deleteUser = (userId) => {
	return API.delete(`/users/${userId}`);
};

export const editUser = (userId, userData) => {
	return API.patch(`/users/${userId}`, userData);
};

export const createUserByAdmin = (userData) => {
	return API.post("/users/admin/create", userData);
};

export const getUserStats = (userId) => {
  return API.get(`/users/${userId}/stats`);
};

export const fetchUserProfile = (userId) => {
	return API.get(`/users/${userId}/profile`);
};

// Admin: reset a user's password and email it
export const adminResetUserPassword = (userId, payload = {}) => {
	return API.post(`/users/admin/${userId}/reset-password`, payload);
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

// Admin: post reports
export const fetchPostReports = (status) => {
	let url = "/posts/reports";
	if (status) {
		url += `?status=${encodeURIComponent(status)}`;
	}
	return API.get(url);
};

export const adminActOnReport = (reportId, payload) => {
	return API.patch(`/posts/reports/${reportId}/admin-action`, payload);
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
