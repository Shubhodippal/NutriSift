# NutriSift - AI-Powered Recipe Management Platform

![NutriSift Logo](https://via.placeholder.com/200x200/1a2235/ffffff?text=NutriSift)

## 📋 Overview

NutriSift is a comprehensive AI-powered recipe management application designed to revolutionize how users discover, create, organize, and share recipes. Built with a focus on reducing food waste and promoting healthy eating habits, NutriSift leverages artificial intelligence to generate personalized recipes based on available ingredients while providing detailed nutritional information and comprehensive recipe management tools.

## ✨ Key Features

### 🤖 AI Recipe Generation
- **Ingredient-Based Recipe Creation**: Enter ingredients you have on hand and receive complete recipe suggestions
- **Nutritional Analysis**: Get comprehensive nutrition information for every recipe
- **Dietary Awareness**: All recipes include diet type classifications (keto, vegan, etc.)
- **Origin & Classification**: Recipes include details about cuisine origin and course type
- **Conversational Interface**: Chat-like experience for requesting and refining recipes

### 🔍 Recipe Discovery System
- **Advanced Filtering**: Find recipes based on:
  - Calorie ranges (under 300, 300-500, 500-700, 700+ calories)
  - Diet types (vegetarian, vegan, gluten-free, keto, paleo, etc.)
  - Origins (Mediterranean, Asian, European, American, etc.)
  - Course types (breakfast, lunch, dinner, appetizer, dessert, etc.)
  - Cuisine styles (traditional, fusion, street food, gourmet, etc.)
- **Comprehensive Search**: Full-text search across recipe titles and ingredients
- **Visual Gallery**: Browse recipes with high-quality preview images

### 📚 Recipe Management
- **Personal Library**: Save unlimited recipes to your personal collection
- **Custom Organization**: Categorize and tag recipes for easy retrieval
- **Favorites Marking**: Mark top recipes as favorites for quick access
- **Search & Filter**: Quickly find saved recipes with powerful search functionality

### 📱 Multi-Platform Sharing
- **Native Share Integration**: Share directly via your device's native share menu

### 🖨️ Advanced Printing
- **Print-Optimized Formatting**: Beautifully formatted recipe printouts
- **Printer-Friendly Styling**: Clear typography and layout for printed recipes
- **High-Resolution Images**: Quality image printing support

### 🛒 Smart Grocery List
- **One-Click Adding**: Add all ingredients from a recipe to your grocery list
- - Food categories include:
    - Fruits
    - Vegetables
    - Dairy
    - Meat & Seafood
    - Pantry Items
    - Spices & Herbs
    - Other
- **Quantity Adjustment**: Adjust quantities based on serving sizes
- **Checklist Functionality**: Check off items while shopping
- **Persistence**: List saves between sessions
- **Cloud Synchronization**: Access your grocery list across devices
- **Print & Share**: Print your grocery list or share it with others

### 👨‍🍳 Interactive Cooking Experience
- **Step-by-Step Mode**: Follow recipes with intuitive step-by-step guidance
- **Cooking Timer Integration**: Built-in timers for cooking steps
- **Ingredient Checking**: Check off ingredients as you use them

### 🗺️ Restaurant Discovery
- **Nearby Restaurants**: Find restaurants near your location
- **Cuisine Matching**: Discover restaurants serving similar cuisines to your favorite recipes
- **Interactive Map**: Visual map interface with restaurant markers
- **Restaurant Details**: View hours, contact information, and website links
- **Directions**: Get directions to selected restaurants

### 🔐 User Authentication & Profile
- **Secure Authentication**: Email and password-based login/signup
- **Security Questions**: Account recovery via security questions
- **User Profiles**: Customizable user profiles with preferences
- **Password Recovery**: Secure password reset functionality
- **Data Synchronization**: Sync your data across devices when logged in

### 💾 Data Persistence & Backup
- **Local Storage**: Recipe and grocery data persists between sessions
- **Cloud Backup**: User data is backed up to the server
- **Cross-Device Access**: Access your data from any device

## 🛠️ Technology Stack

### Frontend
- **React.js**: Core UI library for building component-based interfaces
- **React Router**: Advanced routing with HashRouter for GitHub Pages compatibility
- **Context API**: Global state management for user data and preferences
- **React Hooks**: Functional component state and lifecycle management
- **LocalStorage API**: Client-side data persistence
- **SessionStorage API**: Temporary session data management

### Styling & UI
- **Custom CSS**: Hand-crafted stylesheets for precise design control
- **Responsive Design**: Mobile-first approach for all screen sizes
- **CSS Grid & Flexbox**: Modern layout techniques
- **CSS Animations**: Smooth transitions and interactive elements
- **Media Queries**: Device-specific styling

### Backend Integration
- **RESTful API**: Communication with backend services
- **HTTP Interceptors**: Request/response handling

### External APIs
- **Pixabay API**: High-quality recipe images
- **OpenStreetMap**: Restaurant location data
- **Leaflet.js**: Interactive map rendering
- **Geolocation API**: User location detection

### Content & Rendering
- **ReactMarkdown**: Markdown parsing and rendering
- **rehype-raw**: HTML content rendering within Markdown
- **Web Share API**: Native sharing capabilities
- **Clipboard API**: Copy functionality with fallbacks

### Deployment & Build
- **GitHub Pages**: Static site hosting
- **Create React App**: Build configuration and optimization
- **Environment Variables**: Configuration management
- **HashRouter**: URL routing for static hosting

## 📱 Detailed Usage Guide

### Home Page

The home page serves as the central hub for navigating the application:

- **Navigation Cards**: Large, visual cards for accessing key features
- **Quick Actions**: Shortcuts to frequently used functions
- **Recent Recipes**: View recently accessed recipes
- **User Status**: Login/logout and account management

### Recipe Chat

The AI-powered recipe generation interface:

1. **Start a Conversation**: Begin by entering ingredients you have available
2. **AI Response**: Receive a complete recipe with:
   - Recipe title and description
   - Ingredient list with quantities
   - Step-by-step instructions
   - Nutritional information (calories, diet classification)
   - Origin and cuisine type
3. **Recipe Actions**:
   - Save the recipe to your collection
   - Add ingredients to your grocery list
   - Print the recipe
   - Share the recipe
4. **Conversation History**: View and reference previous recipe suggestions
5. **Suggested Prompts**: Get inspiration with pre-defined ingredient combinations

### Discover Recipes

The comprehensive recipe browsing experience:

1. **Search Bar**: Enter keywords to find specific recipes
2. **Filter Panel**:
   - Calorie Range: Select from predefined ranges
   - Diet Type: Choose vegetarian, vegan, etc.
   - Origin: Filter by regional cuisine
   - Course: Select meal type
   - Cuisine Style: Choose cooking style
3. **Results Display**:
   - Grid view of recipe cards
   - Each card shows:
     - Recipe image
     - Title
     - Key nutritional information
     - Diet type
     - Origin
4. **Recipe Actions**:
   - View full recipe details
   - Save to collection
   - Add to grocery list
   - Share
5. **No Results Handling**: Helpful suggestions when searches return no results

### Saved Recipes

Your personal recipe library:

1. **Collection View**: Grid or list view of saved recipes
2. **Search & Filter**:
   - Search by title or ingredients
   - Filter by diet, course, or cuisine
   - Sort by name, date saved, or calories
3. **Organization**:
   - Categorize recipes by tags
   - Mark favorites
5. **Recipe Actions**: Same actions as Discover page
6. **Sync Status**: Indicator showing cloud sync status

### Recipe Details

Comprehensive single recipe view:

1. **Overview Mode**:
   - High-quality recipe image
   - Recipe title and description
   - Serving size adjustment (with quantity recalculation)
   - Nutritional information panel
   - Ingredient list with quantities
   - Instruction steps
   - Tags and categories
2. **Cooking Mode**:
   - Step-by-step interface
   - Current step highlighted
   - Ingredient checklist
   - Built-in timers
   - Progress tracking
3. **Action Bar**:
   - Save/unsave toggle
   - Add to grocery list
   - Print
   - Share
   - Edit (for user-created recipes)

### Grocery List

Intelligent shopping assistant:

1. **Category View**:
   - Ingredients organized by food category
   - Clear visual separation between categories
2. **Item Management**:
   - Check/uncheck items
   - Delete individual items
   - Edit quantities
   - Add custom items
3. **Batch Operations**:
   - Clear completed items
   - Clear all items
   - Select multiple for deletion
4. **Recipe Association**:
   - See which recipes ingredients are from
   - Jump to recipe details
5. **Print & Share**:
   - Print formatted grocery list
   - Share list via messaging apps
6. **Persistence**:
   - List saves between sessions
   - Syncs across devices when logged in

### Restaurant Map

Discover dining options near you:

1. **Interactive Map**:
   - Current location indicator
   - Restaurant markers
   - Zoom and pan controls
2. **Restaurant List**:
   - Side panel with scrollable list
   - Quick info (cuisine, rating, distance)
3. **Filtering**:
   - Filter by cuisine type
   - Filter by distance
   - Search by restaurant name
4. **Restaurant Details**:
   - Name and address
   - Hours of operation
   - Contact information
   - Website link
   - Rating and reviews summary
5. **Actions**:
   - Get directions (opens in maps app)
   - Call restaurant
   - Visit website
   - Save as favorite

### User Authentication

Secure account management:

1. **Login**:
   - Email and password fields
   - "Remember me" option
   - Forgot password link
2. **Signup**:
   - Name, email, and password fields
   - Phone number (optional)
   - Security question selection
   - Password strength indicator
3. **Password Recovery**:
   - Email verification
   - Security question challenge
   - New password creation
4. **Profile Management**:
   - View and edit profile information
   - Change password
   - Update security question

## 💻 Development Guide

### Available Scripts

- `npm start` - Run the development server on http://localhost:3000
- `npm test` - Launch the test runner in interactive watch mode
- `npm run build` - Build the app for production to the build folder
- `npm run deploy` - Deploy the build to GitHub Pages
- `npm run eject` - Eject from Create React App (one-way operation)

### Project Structure

```
nutri-sift/
├── public/
│   ├── index.html
│   ├── manifest.json
│   ├── favicon.ico
│   ├── logo192.png
│   ├── logo512.png
│   └── 404.html (for GitHub Pages)
├── src/
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── sounds/
│   │       └── success.mp3
│   ├── components/
│   │   ├── AnimatedBackground.js
│   │   ├── HamburgerMenu.js
│   │   ├── HamburgerMenu.css
│   │   ├── RecipeCard.js
│   │   ├── RecipeCard.css
│   │   ├── FilterBar.js
│   │   ├── FilterBar.css
│   │   └── ... (other components)
│   ├── contexts/
│   │   ├── AuthContext.js
│   │   └── RecipeContext.js
│   ├── hooks/
│   │   ├── useLocalStorage.js
│   │   └── useRecipes.js
│   ├── pages/
│   │   ├── DiscoverRecipePage.js
│   │   ├── DiscoverRecipePage.css
│   │   ├── GroceryListPage.js
│   │   ├── GroceryListPage.css
│   │   ├── LoginSignup.js
│   │   ├── LoginSignup.css
│   │   ├── RecipeChatPage.js
│   │   ├── RecipeChatPage.css
│   │   ├── RecipeDetailPage.js
│   │   ├── RecipeDetailPage.css
│   │   ├── SavedRecipesPage.js
│   │   ├── SavedRecipesPage.css
│   │   ├── RestaurantMapPage.js
│   │   └── RestaurantMapPage.css
│   ├── services/
│   │   ├── api.js
│   │   ├── recipeService.js
│   │   ├── authService.js
│   │   └── imageService.js
│   ├── utils/
│   │   ├── formatters.js
│   │   └── validators.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── .env
├── .env.sample
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## ⚠️ Disclaimer

Recipe images are provided for reference only and may not exactly match the actual dish. Nutritional information is approximate and should not be used for medical purposes. Always verify ingredients for allergens and dietary restrictions. NutriSift is not responsible for any adverse reactions to recipes or cooking mishaps.
