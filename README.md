# Socials

Socials is a real-time social media application that allows users to create, view, edit, and delete posts. The application is built with a RESTful API and a modern web frontend, with a focus on real-time data updates and secure user authentication.

## Features

  - **User Authentication**: Secure user registration and login with password hashing using `bcryptjs` and token-based authentication with `jsonwebtoken`.
  - **User Status**: Authenticated users can set and update their personal status.
  - **Post Management**: Users can create, update, and delete their posts, which consist of a title, content, and an image.
  - **Real-time Updates**: Posts are automatically updated across all connected clients in real-time using WebSocket technology via `Socket.IO`.
  - **Dynamic Post Feed**: The application displays a paginated feed of posts from all users.
  - **Single Post View**: Users can view the full details of a single post on its own page.

## Technical Stack

This project is built using a modern JavaScript stack with separate backend and frontend services.

### Backend

  - **Framework**: Node.js, Express.js
  - **Database**: MongoDB via `mongoose` for data modeling.
  - **Authentication**: JSON Web Tokens (JWT) for secure, stateless authentication.
  - **Password Security**: `bcryptjs` for hashing and salting user passwords.
  - **File Uploads**: `multer` for handling image uploads.
  - **Real-time Communication**: `Socket.IO` for live updates on the post feed.
  - **API Validation**: `express-validator` to ensure data integrity.

### Frontend

  - **Framework**: React.js
  - **Routing**: `react-router-dom` for client-side navigation without page reloads.
  - **Real-time Communication**: `socket.io-client` to connect to the backend's WebSocket server.
  - **State Management**: Component state management is used to handle UI updates and user authentication flow.

## Getting Started

### Prerequisites

  - Node.js (LTS version recommended)
  - MongoDB instance (local or cloud-hosted)

### Installation

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/your-username/socials.git
    cd socials
    ```

2.  **Set up the Backend**:

    ```bash
    cd backend
    npm install
    ```

      - Update the MongoDB connection string in `app.js` and the JWT secret key in `middleware/is-auth.js` and `controllers/auth.js` with your own values.
      - Start the backend server: `npm start`

3.  **Set up the Frontend**:

    ```bash
    cd frontend
    npm install
    ```

      - Ensure the API endpoints in `src/pages/Feed/Feed.js` match your backend server's URL (e.g., `http://localhost:8080`).
      - Start the frontend development server: `npm start`

You should now have the application running, with the frontend available at `http://localhost:3000` and the backend API running on `http://localhost:8080`.
