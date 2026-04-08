# AI Diet Assistant 🥗

A comprehensive full-stack AI-powered nutrition coaching application with personalized meal planning, real-time food tracking, AI chatbot, and gamification features.

## 🌟 Features

### Authentication & Profile
- **Secure Registration/Login** - MongoDB-backed authentication with JWT tokens and bcrypt password hashing
- **Guided Onboarding** - Multi-step wizard to capture age, gender, height, weight, goals, activity level, dietary restrictions, allergies, and health conditions
- **Personalized Targets** - Automatic calorie and macro calculation using BMR and TDEE formulas

### AI-Powered Meal Planning
- **Smart Meal Generation** - OpenAI GPT-3.5 creates personalized daily meal plans
- **Recipe Integration** - Spoonacular API provides detailed recipes with ingredients and instructions
- **Nutrition Analysis** - Edamam API ensures accurate nutritional data
- **Meal Regeneration** - Regenerate individual meals you don't like
- **Favorites System** - Save your favorite meals for quick access
- **Grocery List PDF** - Auto-generate and download shopping lists

### Food Logging
- **Database Search** - Search 900,000+ foods via Edamam Nutrition API
- **Custom Entries** - Manually add foods with custom nutrition values
- **Image Recognition** - Upload food photos analyzed by Clarifai AI
- **Barcode Scanning** - Quick logging via barcode (camera access)
- **Real-time Tracking** - Dashboard updates instantly as you log

### AI Nutrition Coach
- **Personalized Chatbot** - OpenAI-powered coach with context from your profile and meal history
- **Smart Recommendations** - Get meal suggestions, substitutions, portion guidance, and post-workout nutrition advice
- **Conversation History** - All chats saved in MongoDB for continuous learning
- **Floating Chat** - Access the AI coach from any page

### Analytics & Gamification
- **Weekly Statistics** - Visualize calories, protein, carbs, fats, and hydration trends
- **Weight Progress** - Track weight changes with interactive charts (Chart.js)
- **Adherence Tracking** - See how well you're meeting your goals
- **Streak System** - Daily logging streaks with longest streak tracking
- **Achievements** - Unlock badges for milestones (7-day streak, 30-day streak, etc.)

### Location Services
- **Healthy Restaurants** - Find nearby healthy dining options via Google Places API
- **Grocery Stores** - Locate grocery stores with ratings and directions
- **Interactive Maps** - Click for Google Maps directions

## 🛠️ Technology Stack

### Backend
- **Node.js** + **Express** - RESTful API server
- **MongoDB** + **Mongoose** - Database and ODM
- **JWT** + **bcrypt** - Authentication and security
- **OpenAI API** - GPT-3.5 for meal planning and chatbot
- **Spoonacular API** - Recipe data and nutrition
- **Edamam API** - Nutrition database and analysis
- **Clarifai API** - Food image recognition
- **Google Places API** - Location services
- **PDFKit** - Grocery list PDF generation

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling with custom theme
- **React Router** - Client-side routing
- **Chart.js** + **react-chartjs-2** - Data visualization
- **Axios** - HTTP client with interceptors
- **React Icons** - Icon library

### Design
- **Glassmorphism** - Modern frosted glass effects
- **Gradient Backgrounds** - Vibrant purple/blue gradients
- **Custom Animations** - Smooth transitions and micro-interactions
- **Responsive Layout** - Mobile-first design
- **Inter Font** - Clean, modern typography

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm
- MongoDB (local or Atlas)
- API Keys (see below)

### 1. Clone the Repository
```bash
cd c:/Users/Desktop/Major
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in `backend/` directory:
```env
PORT=5000
MONGODB_URI=your_mongo_db_uri
JWT_SECRET=your_super_secret_jwt_key_change_this

OPENAI_API_KEY=sk-...
SPOONACULAR_API_KEY=...
EDAMAM_APP_ID=...
EDAMAM_APP_KEY=...
CLARIFAI_API_KEY=...
GOOGLE_PLACES_API_KEY=...

FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

### 4. Obtain API Keys

#### OpenAI (Required for AI features)
1. Visit https://platform.openai.com/api-keys
2. Create account and generate API key
3. Add to `.env` as `OPENAI_API_KEY`

#### Spoonacular (Required for recipes)
1. Visit https://spoonacular.com/food-api
2. Sign up for free tier (150 requests/day)
3. Get API key from dashboard
4. Add to `.env` as `SPOONACULAR_API_KEY`

#### Edamam (Required for nutrition data)
1. Visit https://developer.edamam.com/
2. Sign up and create "Nutrition Analysis API" application
3. Get App ID and App Key
4. Add to `.env` as `EDAMAM_APP_ID` and `EDAMAM_APP_KEY`

#### Clarifai (Optional for image recognition)
1. Visit https://www.clarifai.com/
2. Create account and get API key
3. Add to `.env` as `CLARIFAI_API_KEY`

#### Google Places (Optional for location features)
1. Visit https://console.cloud.google.com/
2. Enable Places API
3. Create credentials (API key)
4. Add to `.env` as `GOOGLE_PLACES_API_KEY`

## 🚀 Running the Application

### Start MongoDB
If using local MongoDB:
```bash
mongod
```

### Start Backend Server
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

### Start Frontend Dev Server
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

### Access the Application
Open browser to **http://localhost:5173**

## 📱 Usage Flow

1. **Register** - Create account with email and password
2. **Onboarding** - Complete 4-step profile setup
3. **Dashboard** - View daily calorie/macro progress, streaks, weight chart
4. **Generate Meal Plan** - AI creates personalized daily meals
5. **Log Food** - Search database, add custom foods, or upload images
6. **Chat with AI** - Get personalized nutrition advice
7. **View Analytics** - Weekly trends and adherence tracking
8. **Find Places** - Locate nearby healthy restaurants and stores
9. **Unlock Achievements** - Build streaks and earn badges

## 🗂️ Project Structure

```
Major/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth middleware
│   ├── server.js        # Express app
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Route pages
│   │   ├── utils/       # API utilities
│   │   ├── App.jsx      # Main app
│   │   └── index.css    # Global styles
│   ├── index.html
│   └── package.json
└── README.md
```

## 🔐 Security Features

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens with 7-day expiration
- Protected API routes with auth middleware
- CORS configuration for frontend-backend communication
- Input validation with express-validator

## 🎨 Design Highlights

- **Dark Mode** - Purple/slate gradient background
- **Glassmorphism** - Frosted glass cards with backdrop blur
- **Smooth Animations** - Fade-in, slide-up, hover effects
- **Progress Bars** - Gradient-filled with smooth transitions
- **Responsive Charts** - Interactive visualizations
- **Custom Scrollbars** - Styled for dark theme

## 📊 API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Profile
- `POST /api/profile/onboarding` - Complete onboarding
- `GET /api/profile/profile` - Get user profile
- `POST /api/profile/weight` - Update weight

### Food Logging
- `GET /api/food/search` - Search nutrition database
- `POST /api/food/log` - Log food entry
- `GET /api/food/today` - Get today's logs
- `POST /api/food/recognize-image` - AI image recognition

### Meal Planning
- `POST /api/meal-plan/generate` - Generate AI meal plan
- `POST /api/meal-plan/regenerate/:mealType` - Regenerate meal
- `GET /api/meal-plan/latest` - Get latest meal plan
- `GET /api/meal-plan/grocery-list/:id` - Download PDF

### Chatbot
- `POST /api/chatbot/chat` - Send message to AI
- `GET /api/chatbot/history` - Get chat history

### Analytics
- `GET /api/analytics/weekly` - Weekly statistics
- `GET /api/analytics/dashboard` - Dashboard summary

### Places
- `GET /api/places/restaurants` - Find nearby restaurants
- `GET /api/places/grocery-stores` - Find grocery stores

## 🐛 Troubleshooting

**MongoDB Connection Error**
- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URI` in `.env`

**API Key Errors**
- Verify all required API keys are in `.env`
- Check API key quotas and limits

**CORS Issues**
- Ensure `FRONTEND_URL` matches your frontend port
- Check backend CORS configuration

**Port Already in Use**
- Change `PORT` in backend `.env`
- Update Vite proxy in `frontend/vite.config.js`

## 📄 License

This project is open source and available for educational purposes.

## 🙏 Acknowledgments

- OpenAI for GPT-3.5 API
- Spoonacular for recipe data
- Edamam for nutrition database
- Clarifai for image recognition
- Google for Places API
- Chart.js for visualizations

---

**Built with ❤️ using React, Node.js, MongoDB, and AI**
