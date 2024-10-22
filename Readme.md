# Elite Project

Welcome to the **Elite** project repository. This project is a high-end social networking platform tailored for self-made millionaires and second-generation wealthy individuals of the 21st century, focusing on meaningful relationships with a secure and verified user base.

## Project Structure

```
/elite-project
  ├── /backend      # NodeJS and ExpressJS server
  ├── /frontend     # ReactJS frontend
  ├── /database     # MongoDB schema definitions
  ├── package.json  # Scripts and dependencies
  └── README.md     # Project information
```

## Features

- **User Profiles**: Customizable profiles for wealthy individuals.
- **Third-party Verification**: Verified accounts to ensure authenticity and transparency.
- **Event Management**: Users can create and join exclusive events.
- **Advanced Matching System**: AI-driven pairing to foster meaningful connections.

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- npm or [Yarn](https://yarnpkg.com/)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/NguyenDuyPhuongDeveloper/Elite.git
   cd Elite
   ```

2. Install dependencies for both backend and frontend:
   ```sh
   cd backend
   npm install
   cd ../frontend
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```sh
   cd backend
   npm start
   ```

2. Start the frontend application:
   ```sh
   cd frontend
   npm start
   ```

### Environment Variables

Create `.env` files in the `/backend` and `/frontend` directories to set up environment variables. For example:

**Backend (`/backend/.env`):**
```
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret
```

**Frontend (`/frontend/.env`):**
```
REACT_APP_API_URL=http://localhost:5000
```

## Scripts

- **Backend:**
  - `npm start` - Start the backend server
  - `npm run dev` - Start the backend server in development mode

- **Frontend:**
  - `npm start` - Start the React frontend

## License

This project is licensed under the MIT License.
