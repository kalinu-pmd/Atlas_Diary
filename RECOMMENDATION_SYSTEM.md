# Content-Based Recommendation System

## Overview

This project now includes a sophisticated content-based recommendation system that provides personalized post recommendations to users based on their interaction history and content preferences.

## Features

### 1. User Interaction Tracking

The system tracks user interactions including:

- **Likes**: When users like posts
- **Views**: When users view post details
- **Comments**: When users comment on posts

### 2. Content Analysis

The recommendation engine analyzes:

- **Post titles and messages**: Using TF-IDF and string similarity
- **Tags**: Using Jaccard coefficient for tag similarity
- **User preferences**: Building profiles based on interaction history

### 3. Recommendation Algorithm

The system uses a multi-factor scoring algorithm:

- **Tag Similarity (40%)**: Matches user's preferred tags
- **Content Similarity (40%)**: Analyzes text content using NLP
- **Popularity Score (10%)**: Considers likes and comments
- **Recency Score (10%)**: Gives slight boost to newer posts

## API Endpoints

### Backend Routes

- `GET /posts/recommendations?limit=10` - Get personalized recommendations
- `GET /posts/:id/similar?limit=5` - Get similar posts for a specific post
- `POST /posts/:id/view` - Track post view

### Frontend Actions

- `getRecommendations(limit)` - Fetch user recommendations
- `getSimilarPosts(postId, limit)` - Fetch similar posts
- `trackPostView(postId)` - Track post view

## Components

### 1. Recommendations Page (`/recommendations`)

- Displays personalized recommendations for logged-in users
- Shows match scores for each recommended post
- Includes filtering by tags and content similarity

### 2. Similar Posts Component

- Shows on post detail pages
- Displays posts similar to the current post
- Uses content and tag analysis

### 3. Updated User Model

The user model now includes:

```javascript
{
  likedPosts: [ObjectId],
  viewedPosts: [ObjectId],
  commentedPosts: [ObjectId],
  preferredTags: [{ tag: String, score: Number }],
  lastRecommendationUpdate: Date
}
```

## How It Works

### 1. Data Collection

- Automatically tracks user interactions
- Builds user preference profiles
- Updates tag preferences based on interactions

### 2. Content Analysis

- Uses Natural Language Processing (NLP) with the `natural` library
- Implements TF-IDF for text similarity
- Uses string similarity algorithms for content matching

### 3. Recommendation Generation

- Combines multiple factors into a unified score
- Filters out already interacted posts
- Returns top recommendations sorted by relevance

### 4. Real-time Updates

- User preferences update automatically with interactions
- Recommendation scores recalculate based on latest data
- Similar posts update when viewing different posts

## Usage

### For Users

1. **Sign in** to access personalized recommendations
2. **Click "For You"** in the navbar to see recommendations
3. **Interact with posts** (like, view, comment) to improve recommendations
4. **View similar posts** on any post detail page

### For Developers

1. **User preferences** are automatically tracked
2. **Recommendation scores** are calculated server-side
3. **Similar posts** are generated using content analysis
4. **API calls** handle all recommendation logic

## Technical Implementation

### Dependencies

- **Backend**: `natural`, `string-similarity`, `mongoose`
- **Frontend**: `moment`, `@material-ui/core`, `react-router-dom`

### Files Modified/Created

- `backend/models/user.js` - Enhanced user model
- `backend/services/recommendationService.js` - Core recommendation logic
- `backend/controllers/posts.js` - Updated with recommendation endpoints
- `backend/routes/posts.js` - Added recommendation routes
- `frontend/src/components/Recommendations/` - Recommendations page
- `frontend/src/components/SimilarPosts/` - Similar posts component
- `frontend/src/actions/posts.js` - Added recommendation actions
- `frontend/src/api/index.js` - Added recommendation API calls

## Future Enhancements

1. **Collaborative filtering** - Recommend based on similar users
2. **Machine learning models** - More sophisticated content analysis
3. **Real-time recommendations** - WebSocket-based updates
4. **A/B testing** - Compare different recommendation algorithms
5. **Performance optimization** - Caching and background processing

## Getting Started

1. Start the backend server: `cd backend && npm start`
2. Start the frontend: `cd frontend && npm run dev`
3. Sign in to your account
4. Start interacting with posts to build your profile
5. Visit `/recommendations` to see personalized suggestions

The recommendation system will improve over time as users interact more with the platform, creating a more personalized and engaging experience.
