# Authentication Setup Guide

This guide will help you set up the complete authentication system with OTP-based login.

## Backend Setup

### 1. Install Dependencies
The required dependencies are already in `package.json`:
- `express` - Web framework
- `cors` - Cross-origin requests
- `postgres` - PostgreSQL client
- `dotenv` - Environment variables

### 2. Database Setup
Run the setup script to create the users table:

```bash
cd backend
node setup-auth.js
```

This will create:
- `users` table with all required fields
- Database indexes for performance

### 3. Environment Configuration
Make sure your `backend/.env` file has the correct `DATABASE_URL`:

```env
DATABASE_URL=postgresql://postgres.beztwsdalpogqwhcblyd:Supabase@DB1@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
```

### 4. Start the Backend Server
```bash
cd backend
node server.js
```

The server will run on `http://localhost:3001`

## Frontend Setup

### 1. Updated Components
- `frontend/src/pages/Login/Login.jsx` - Enhanced login with OTP
- `frontend/src/components/ProfileForm.jsx` - Integrated profile completion and address management
- `frontend/src/pages/UserProfile.jsx` - User profile page that uses ProfileForm

### 2. Usage Example
```jsx
import Login from './pages/Login/Login';
import UserProfile from './pages/UserProfile';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [userId, setUserId] = useState(null);

  const handleLogin = (page, id) => {
    setCurrentPage(page);
    setUserId(id);
  };

  return (
    <div>
      {currentPage === 'login' && <Login onLogin={handleLogin} />}
      {currentPage === 'user-profile' && <UserProfile />}
      {currentPage === 'home' && <div>Welcome to Home Page!</div>}
    </div>
  );
}
```

## API Endpoints

### POST `/api/auth/send-otp`
Send OTP to mobile number
```json
{
  "mobile": "9876543210"
}
```

### POST `/api/auth/verify-otp`
Verify OTP and login
```json
{
  "mobile": "9876543210",
  "otp": "123456"
}
```

### POST `/api/auth/complete-profile`
Complete user profile (for new users)
```json
{
  "userId": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "dob": "1990-01-01",
  "gender": "male"
}
```

### GET `/api/auth/profile/:userId`
Get user profile data
```json
{
  "success": true,
  "id": 1,
  "mobile": "9876543210",
  "name": "John Doe",
  "email": "john@example.com",
  "dob": "1990-01-01",
  "gender": "male",
  "profile_completed": true,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

## Database Schema

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  mobile VARCHAR(15) UNIQUE NOT NULL,
  otp VARCHAR(10),
  profile_completed BOOLEAN DEFAULT FALSE,
  name VARCHAR(100),
  email VARCHAR(100),
  dob DATE,
  gender VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Testing

### 1. Test Backend Endpoints
```bash
cd backend
node test-auth.js
```

### 2. Manual Testing
1. Start the backend server
2. Use the Login component in your frontend
3. Check server console for OTP (in development)
4. Complete the login flow

## Features

### Login Component
- ✅ Mobile number validation
- ✅ OTP generation and verification
- ✅ Loading states and error handling
- ✅ Responsive design
- ✅ Keyboard navigation (Enter key support)

### Enhanced ProfileForm Component
- ✅ Integrated profile completion for new users
- ✅ Address management for existing users
- ✅ Profile completion section appears at the top for new users
- ✅ Address management is disabled until profile is completed
- ✅ Form validation and error handling
- ✅ Loading states

### Backend API
- ✅ PostgreSQL integration
- ✅ Proper error handling
- ✅ Input validation
- ✅ Database transactions
- ✅ Security best practices

## Security Notes

1. **OTP Storage**: OTPs are stored temporarily and cleared after verification
2. **Input Validation**: All inputs are validated on both client and server
3. **Error Handling**: Proper error messages without exposing sensitive data
4. **Database**: Uses parameterized queries to prevent SQL injection

## Next Steps

1. **SMS Integration**: Replace console logging with actual SMS service (Twilio, AWS SNS, etc.)
2. **Rate Limiting**: Add rate limiting for OTP requests
3. **Session Management**: Implement JWT tokens for authenticated sessions
4. **Password Reset**: Add password reset functionality if needed
5. **Admin Panel**: Create admin interface for user management