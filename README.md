# 🍽️ Essenteil

**Share food, reduce waste, build community**

Essenteil is a community-driven food sharing platform that helps reduce food waste by connecting neighbors who have excess food with those who need it. Built with modern web technologies for a seamless, beautiful user experience.

## ✨ Features

### 🍎 Food Sharing

- **Share food items** with detailed descriptions, categories, and images
- **Browse available items** in your community with beautiful card layouts
- **Contact food sharers** directly via WhatsApp, phone, or email
- **Smart expiry tracking** with color-coded badges and natural language dates

### 🏠 Community Focus

- **Location-based listings** with Google Places autocomplete
- **Geo-spatial search** with radius-based filtering
- **Food-specific categories** (Fresh Produce, Dairy & Eggs, Meat & Seafood, etc.)
- **Time-sensitive sharing** with shelf life management
- **Beautiful, responsive design** optimized for mobile and desktop

### 🔐 Authentication & Security

- **Firebase Authentication** with phone number verification
- **User-based listings** with secure user identification
- **Protected routes** ensuring only authenticated users can create listings

### 📱 Modern UI/UX

- **Responsive design** that works on all devices
- **Beautiful animations** and smooth transitions
- **Intuitive forms** with React Hook Form validation
- **Smart date formatting** using date-fns
- **Image uploads** with Firebase Storage integration

## 🛠️ Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Modern utility-first styling
- **React Hook Form** - Performant form handling with validation

### Backend & Database

- **PostgreSQL** - Robust relational database
- **Redis** - Geo-spatial indexing for location-based searches
- **Next.js API Routes** - Serverless API endpoints
- **Custom SQL queries** - Direct database operations

### Authentication & Storage

- **Firebase Auth** - Phone number authentication
- **Firebase Storage** - Image upload and management
- **Context API** - Global authentication state

### Date & Time

- **date-fns** - Modern date manipulation and formatting
- **Natural language** relative time display

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Redis server (for geo-location features)
- Firebase project with Auth and Storage enabled

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd essenteil
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:

   ```env
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/essenteil

   # Redis
   REDIS_URL=redis://localhost:6379

   # Firebase
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Google Maps (optional, for address autocomplete)
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. **Set up the database**

   ```bash
   # Run the SQL schema from sql/listings.sql
   psql -d essenteil -f sql/listings.sql
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Home page with listings
│   ├── login/             # Authentication pages
│   ├── listings/
│   │   └── new/           # Create new listing
│   └── api/               # API routes
│       └── listings/      # Listings CRUD operations
├── components/            # Reusable components
│   ├── Listings.tsx       # Beautiful listings grid
│   └── PhoneLogin.tsx     # Phone authentication
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication state
└── lib/                   # Utilities and types
    ├── database.ts        # Database operations
    ├── firebase.ts        # Firebase configuration
    └── types.ts           # TypeScript types
```

## 🎨 Key Components

### Listings Component

- **Grid layout** with responsive design
- **Smart category icons** and visual indicators
- **Contact integration** with direct communication
- **Image handling** with fallback states
- **Expiry management** with color-coded badges

### New Listing Form

- **React Hook Form** with comprehensive validation
- **Firebase image uploads** with progress handling
- **Google Places** address autocomplete
- **Food-specific categories** and shelf life options
- **Responsive design** with beautiful UI

## 🔧 Development

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database Schema

The application uses a PostgreSQL database with the following main table:

```sql
CREATE TABLE listings (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  categories TEXT[] NOT NULL,
  location JSONB NOT NULL,
  contact JSONB NOT NULL,
  image_url VARCHAR(255),
  active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### API Endpoints

#### GET /api/listings

Retrieve listings with optional filtering:

**Query Parameters:**

- `user_id` - Filter by specific user
- `lat` - Latitude for geo-search (requires lng and radius)
- `lng` - Longitude for geo-search (requires lat and radius)
- `radius` - Search radius in kilometers (requires lat and lng)
- `limit` - Maximum number of results (default: 50)
- `offset` - Number of results to skip (default: 0)

**Examples:**

```bash
# Get all active listings
GET /api/listings

# Get listings from specific user
GET /api/listings?user_id=abc123

# Get listings within 5km of location
GET /api/listings?lat=40.7128&lng=-74.0060&radius=5

# Combine filters
GET /api/listings?lat=40.7128&lng=-74.0060&radius=5&limit=20
```

## 🌟 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Next.js team** for the amazing framework
- **Firebase** for authentication and storage
- **Tailwind CSS** for the beautiful styling system
- **date-fns** for elegant date handling
- **React Hook Form** for seamless form management

---

**Built with ❤️ for communities that care about reducing food waste**
