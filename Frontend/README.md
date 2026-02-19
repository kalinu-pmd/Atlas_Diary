Atlas Diary

A dedicated social journaling platform for adventure and travel enthusiasts.

Atlas Diary allows users to document, organize, and relive their travel experiences in a structured and secure environment. Unlike generic social platforms, this application focuses specifically on travel storytelling, memory preservation, and personalized content discovery.

 *** Problem It Solves ***

Traditional social media platforms mix travel content with unrelated posts, making it difficult for adventure lovers to:

1. Organize travel memories

2. Discover similar travel experiences

3. Connect through shared adventure interests

4. Maintain privacy and ownership of their journals

Atlas Diary provides a focused ecosystem built specifically for travel documentation and exploration.

***Tech Stack ***

Frontend

React.js

Axios

Backend

Node.js

Express.js

Database

MongoDB (Mongoose ODM)

Authentication & Security

JWT (JSON Web Tokens)

bcrypt password hashing

*** Core Features ***

1. Authentication & Authorization

- Secure user registration and login

- Encrypted password storage using bcrypt

- JWT-based session management

- Role-based access (Admin / User)

2. Journal Management

- Create, edit, delete travel journal entries

- Upload images with entries

- Add location, date, and description

- Private ownership of entries

3. Search & Filtering

Search journals by:

- Keywords

- Location

- Date

3. Social Interaction

- Comment system

- User profiles

- Public exploration of shared posts

4. Recommendation System

- Content-based filtering

Uses tags and user interaction history

5. Admin Moderation

- Content monitoring

- User management

*** System Architecture ***

Atlas Diary follows a structured Waterfall development methodology:

1. Requirement Analysis

2. System Design

3. Implementation

4. Testing

5. Deployment & Maintenance

Architecture is based on the MERN stack with RESTful APIs.

*** Algorithms Used ***

1. Content-Based Filtering

- Builds user interest profile

- Matches journal tags and keywords

- Uses similarity scoring (Jaccard coefficient)

- Dynamically updates based on interaction

2. Password Encryption

- bcrypt hashing

- Salted hash storage

- Secure login comparison mechanism
