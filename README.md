# Complete Updated README.md File

Here's the fully updated README.md file with the new Database Setup section included:

```markdown
# NutriSift - AI-Powered Recipe Management Platform

![NutriSift Logo](https://chatgpt.com/s/m_68471b792ef88191bd4eb359a172bbab)

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
  - Calorie ranges (under 300, 300-500, 500-800, over 800 calories)
  - Diet types (vegetarian, vegan, gluten-free, keto, paleo, etc.)
  - Origins (Mediterranean, Asian, European, American, etc.)
  - Course types (breakfast, lunch, dinner, appetizer, dessert, etc.)
  - Cuisine styles (traditional, fusion, street food, gourmet, etc.)
- **Comprehensive Search**: Full-text search across recipe titles and ingredients
- **Visual Gallery**: Browse recipes with high-quality preview images
- **Sort Options**: Sort by popularity, calories, or alphabetically

### 📚 Recipe Management
- **Personal Library**: Save unlimited recipes to your personal collection
- **Custom Organization**: Categorize and tag recipes for easy retrieval
- **Favorites Marking**: Mark top recipes as favorites for quick access
- **Search & Filter**: Quickly find saved recipes with powerful search functionality
- **Bulk Operations**: Select multiple recipes for batch operations

### 📱 Multi-Platform Sharing
- **Native Share Integration**: Share directly via your device's native share menu
- **Email Sharing**: Send recipes via email with formatted content
- **Copy to Clipboard**: One-click copy for sharing in messaging apps
- **Social Media Integration**: Direct sharing to social platforms (where supported)

### 🖨️ Advanced Printing
- **Print-Optimized Formatting**: Beautifully formatted recipe printouts
- **Custom Print Options**: Choose what sections to include in prints
- **Printer-Friendly Styling**: Clear typography and layout for printed recipes
- **High-Resolution Images**: Quality image printing support

### 🛒 Smart Grocery List
- **One-Click Adding**: Add all ingredients from a recipe to your grocery list
- **Automatic Categorization**: Ingredients automatically sorted by food category
- Food categories include:
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
- **Serving Size Adjustment**: Automatically recalculate ingredient quantities
- **Cooking Timer Integration**: Built-in timers for cooking steps
- **Ingredient Checking**: Check off ingredients as you use them
- **Progress Tracking**: Keep track of completed steps

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
- **Offline Support**: Basic functionality available offline

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

### Backend
- **Spring Boot**: Java-based backend framework
- **Spring MVC**: RESTful API controllers
- **JDBC Template**: Database operations
- **BCrypt**: Password encryption
- **Spring Security**: Authentication handling
- **Cohere API Integration**: AI recipe generation with command-a-03-2025 model

### Database
- **MySQL**: Relational database for data persistence
- **Entity Tables**:
  - `users`: User account information and security questions
  - `saved_recipe`: Stored user recipes with nutritional data
  - `grocery_list`: User grocery items with categories

### External APIs
- **Cohere API**: AI-powered recipe generation
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
- **GitHub Pages**: Frontend static site hosting
- **Create React App**: Frontend build configuration
- **Maven**: Backend build tool
- **Spring Boot Embedded Server**: Backend deployment
- **Environment Variables**: Configuration management
- **HashRouter**: URL routing for static hosting

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)
- Java 17 or later
- Maven
- MySQL Database

### Frontend Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/nutri-sift.git
   cd nutri-sift/Frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment variables**:
   Create a .env file in the root directory with the following content:
   ```
   REACT_APP_PIXABAY_API_KEY=your_pixabay_api_key_here
   REACT_APP_API_BASE_URL=http://localhost:8080
   REACT_APP_RECIPE_SEARCH_ENDPOINT=/recipe/search
   ```

4. **Start the development server**:
   ```bash
   npm start
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

6. **Deploy to GitHub Pages**:
   ```bash
   npm run deploy
   ```

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd nutri-sift/Backend/demo
   ```

2. **Configure application properties**:
   Update `src/main/resources/application.properties` with your database connection details:
   ```
   spring.datasource.url=jdbc:mysql://localhost:3306/nutrisift
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
   ```

3. **Build the application**:
   ```bash
   mvn clean package
   ```

4. **Run the application**:
   ```bash
   java -jar target/demo-0.0.1-SNAPSHOT.jar
   ```

### Database Setup

1. **Install and Configure MariaDB/MySQL**:
   ```bash
   # For Ubuntu/Debian
   sudo apt update
   sudo apt install mariadb-server
   
   # For CentOS/RHEL
   sudo yum install mariadb-server
   sudo systemctl start mariadb
   
   # For Windows
   # Download and install from https://mariadb.org/download/
   ```

2. **Secure your installation**:
   ```bash
   sudo mysql_secure_installation
   ```

3. **Create the database and user**:
   ```sql
   CREATE DATABASE NUTRISIFT;
   CREATE USER 'nutrisift_user'@'localhost' IDENTIFIED BY 'your_strong_password';
   GRANT ALL PRIVILEGES ON NUTRISIFT.* TO 'nutrisift_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

4. **Create the required tables**:
   ```sql
   USE NUTRISIFT;
   
   CREATE TABLE users (
     id int(11) NOT NULL AUTO_INCREMENT,
     time timestamp DEFAULT current_timestamp(),
     date date DEFAULT NULL,
     userid varchar(100) NOT NULL,
     name varchar(255) NOT NULL,
     email varchar(255) NOT NULL,
     phone varchar(20) DEFAULT NULL,
     password varchar(255) NOT NULL,
     security_question varchar(255) DEFAULT NULL,
     answer varchar(255) DEFAULT NULL,
     last_login datetime DEFAULT NULL,
     PRIMARY KEY (id),
     UNIQUE KEY userid (userid),
     UNIQUE KEY email (email)
   );
   
   CREATE TABLE saved_recipe (
     id int(11) NOT NULL AUTO_INCREMENT,
     uid varchar(36) NOT NULL,
     mail varchar(255) NOT NULL,
     prompt text DEFAULT NULL,
     recipe_name varchar(255) NOT NULL,
     ingredients text DEFAULT NULL,
     steps text DEFAULT NULL,
     calories varchar(50) DEFAULT NULL,
     diet varchar(100) DEFAULT NULL,
     origin varchar(100) DEFAULT NULL,
     course varchar(100) DEFAULT NULL,
     cuisine varchar(100) DEFAULT NULL,
     saved_time_date datetime DEFAULT current_timestamp(),
     PRIMARY KEY (id),
     KEY uid (uid),
     KEY mail (mail)
   );
   
   CREATE TABLE grocery_list (
     id int(11) NOT NULL AUTO_INCREMENT,
     uid varchar(100) NOT NULL,
     mail varchar(255) NOT NULL,
     state varchar(50) DEFAULT NULL,
     item_name varchar(255) NOT NULL,
     quantity varchar(50) DEFAULT NULL,
     category varchar(100) DEFAULT NULL,
     creation_time timestamp DEFAULT current_timestamp(),
     PRIMARY KEY (id),
     KEY uid (uid),
     KEY mail (mail)
   );
   ```

5. **Update your application.properties**:
   ```
   # Database Configuration for MariaDB
   spring.datasource.url=jdbc:mariadb://localhost:3306/NUTRISIFT
   spring.datasource.username=nutrisift_user
   spring.datasource.password=your_strong_password
   spring.datasource.driver-class-name=org.mariadb.jdbc.Driver
   ```

### Database Schema

#### Users Table
Stores user authentication and profile information:

```
+-------------------+--------------+------+-----+---------------------+----------------+
| Field             | Type         | Null | Key | Default             | Extra          |
+-------------------+--------------+------+-----+---------------------+----------------+
| id                | int(11)      | NO   | PRI | NULL                | auto_increment |
| time              | timestamp    | YES  |     | current_timestamp() |                |
| date              | date         | YES  |     | NULL                |                |
| userid            | varchar(100) | NO   | UNI | NULL                |                |
| name              | varchar(255) | NO   |     | NULL                |                |
| email             | varchar(255) | NO   | UNI | NULL                |                |
| phone             | varchar(20)  | YES  |     | NULL                |                |
| password          | varchar(255) | NO   |     | NULL                |                |
| security_question | varchar(255) | YES  |     | NULL                |                |
| answer            | varchar(255) | YES  |     | NULL                |                |
| last_login        | datetime     | YES  |     | NULL                |                |
+-------------------+--------------+------+-----+---------------------+----------------+
```

#### Saved Recipe Table
Stores recipes saved by users:

```
+-----------------+--------------+------+-----+---------------------+----------------+
| Field           | Type         | Null | Key | Default             | Extra          |
+-----------------+--------------+------+-----+---------------------+----------------+
| id              | int(11)      | NO   | PRI | NULL                | auto_increment |
| uid             | varchar(36)  | NO   | MUL | NULL                |                |
| mail            | varchar(255) | NO   | MUL | NULL                |                |
| prompt          | text         | YES  |     | NULL                |                |
| recipe_name     | varchar(255) | NO   |     | NULL                |                |
| ingredients     | text         | YES  |     | NULL                |                |
| steps           | text         | YES  |     | NULL                |                |
| calories        | varchar(50)  | YES  |     | NULL                |                |
| diet            | varchar(100) | YES  |     | NULL                |                |
| origin          | varchar(100) | YES  |     | NULL                |                |
| course          | varchar(100) | YES  |     | NULL                |                |
| cuisine         | varchar(100) | YES  |     | NULL                |                |
| saved_time_date | datetime     | YES  |     | current_timestamp() |                |
+-----------------+--------------+------+-----+---------------------+----------------+
```

#### Grocery List Table
Stores grocery items for users:

```
+---------------+--------------+------+-----+---------------------+----------------+
| Field         | Type         | Null | Key | Default             | Extra          |
+---------------+--------------+------+-----+---------------------+----------------+
| id            | int(11)      | NO   | PRI | NULL                | auto_increment |
| uid           | varchar(100) | NO   | MUL | NULL                |                |
| mail          | varchar(255) | NO   | MUL | NULL                |                |
| state         | varchar(50)  | YES  |     | NULL                |                |
| item_name     | varchar(255) | NO   |     | NULL                |                |
| quantity      | varchar(50)  | YES  |     | NULL                |                |
| category      | varchar(100) | YES  |     | NULL                |                |
| creation_time | timestamp    | YES  |     | current_timestamp() |                |
+---------------+--------------+------+-----+---------------------+----------------+
```

## 📡 API Documentation

### User Authentication
- `POST /users` - Register new user
- `POST /users/login` - User login
- `GET /users/security-question?email={email}` - Get security question for password recovery
- `POST /users/verify-answer` - Verify security question answer
- `POST /users/reset-password` - Reset user password

### Recipe Management
- `POST /recipe` - Generate recipe from ingredients using AI
- `POST /recipe/search` - Search for recipes with filters
- `GET /recipes/{id}` - Get recipe by ID
- `GET /recipes/user/{uid}` - Get all recipes for a user
- `POST /recipes/save` - Save a recipe
- `DELETE /recipes/{id}` - Delete a recipe
- `POST /recipes/discover` - Discover recipes with filters

### Grocery List Management
- `GET /grocerylist/{userId}` - Get user's grocery list
- `POST /grocerylist/{userId}` - Save grocery list
- `DELETE /grocerylist/{userId}` - Delete grocery list
- `PUT /grocerylist/item/{itemId}` - Update grocery item
- `DELETE /grocerylist/item/{itemId}` - Delete grocery item

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
4. **Batch Operations**:
   - Select multiple recipes
   - Delete selected
   - Add all ingredients to grocery list
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

#### Frontend
- `npm start` - Run the development server on http://localhost:3000
- `npm test` - Launch the test runner in interactive watch mode
- `npm run build` - Build the app for production to the build folder
- `npm run deploy` - Deploy the build to GitHub Pages
- `npm run eject` - Eject from Create React App (one-way operation)

#### Backend
- `mvn spring-boot:run` - Run the Spring Boot application
- `mvn clean package` - Build the application
- `mvn test` - Run the tests

### Project Structure

```
nutri-sift/
├── Frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json
│   │   ├── favicon.ico
│   │   ├── logo192.png
│   │   ├── logo512.png
│   │   └── 404.html (for GitHub Pages)
│   ├── src/
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   ├── icons/
│   │   │   └── sounds/
│   │   │       └── success.mp3
│   │   ├── components/
│   │   │   ├── AnimatedBackground.js
│   │   │   ├── HamburgerMenu.js
│   │   │   ├── HamburgerMenu.css
│   │   │   ├── RecipeCard.js
│   │   │   ├── RecipeCard.css
│   │   │   ├── FilterBar.js
│   │   │   ├── FilterBar.css
│   │   │   └── ... (other components)
│   │   ├── contexts/
│   │   │   ├── AuthContext.js
│   │   │   └── RecipeContext.js
│   │   ├── hooks/
│   │   │   ├── useLocalStorage.js
│   │   │   └── useRecipes.js
│   │   ├── pages/
│   │   │   ├── DiscoverRecipePage.js
│   │   │   ├── DiscoverRecipePage.css
│   │   │   ├── GroceryListPage.js
│   │   │   ├── GroceryListPage.css
│   │   │   ├── LoginSignup.js
│   │   │   ├── LoginSignup.css
│   │   │   ├── RecipeChatPage.js
│   │   │   ├── RecipeChatPage.css
│   │   │   ├── RecipeDetailPage.js
│   │   │   ├── RecipeDetailPage.css
│   │   │   ├── SavedRecipesPage.js
│   │   │   ├── SavedRecipesPage.css
│   │   │   ├── RestaurantMapPage.js
│   │   │   └── RestaurantMapPage.css
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── recipeService.js
│   │   │   ├── authService.js
│   │   │   └── imageService.js
│   │   ├── utils/
│   │   │   ├── formatters.js
│   │   │   └── validators.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── .env
│   ├── .env.sample
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   └── README.md
│
├── Backend/
│   └── demo/
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/
│       │   │   │   └── com/
│       │   │   │       └── shubhodip/
│       │   │   │           └── nutrisift/
│       │   │   │               ├── ChatController.java
│       │   │   │               ├── GroceryItem.java
│       │   │   │               ├── GroceryListController.java
│       │   │   │               ├── GroceryListDAO.java
│       │   │   │               ├── GroceryListDAOImpl.java
│       │   │   │               ├── GroceryListRequest.java
│       │   │   │               ├── GroceryListResponse.java
│       │   │   │               ├── NutrisiftApplication.java
│       │   │   │               ├── RecipeController.java
│       │   │   │               ├── RecipeFilterRequest.java
│       │   │   │               ├── SavedRecipe.java
│       │   │   │               ├── SavedRecipeDAO.java
│       │   │   │               ├── SavedRecipeDAOImpl.java
│       │   │   │               ├── SaveRecipeRequest.java
│       │   │   │               ├── User.java
│       │   │   │               ├── UserController.java
│       │   │   │               └── UserDAO.java
│       │   │   └── resources/
│       │   │       └── application.properties
│       │   └── test/
│       │       └── java/
│       │           └── com/
│       │               └── shubhodip/
│       │                   └── nutrisift/
│       │                       └── NutrisiftApplicationTests.java
│       ├── pom.xml
│       ├── mvnw
│       ├── mvnw.cmd
│       └── .mvn/
└── README.md
```

### Environment Variables

#### Frontend
Create a .env file with the following variables:

```
# API Keys
REACT_APP_PIXABAY_API_KEY=your_pixabay_api_key_here

# API Endpoints
REACT_APP_API_BASE_URL=http://localhost:8080
REACT_APP_RECIPE_SEARCH_ENDPOINT=/recipe/search
REACT_APP_RECIPE_DETAIL_ENDPOINT=/recipes
REACT_APP_USER_ENDPOINT=/users
REACT_APP_LOGIN_ENDPOINT=/users/login
REACT_APP_REGISTER_ENDPOINT=/users/register

# Configuration
REACT_APP_MAX_RECIPE_RESULTS=20
REACT_APP_ENABLE_DEBUG_LOGGING=false
```

#### Backend
Update application.properties:

```
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/nutrisift
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# Server Configuration
server.port=8080
server.servlet.context-path=/

# Logging Configuration
logging.level.root=INFO
logging.level.com.shubhodip.nutrisift=DEBUG
```

## 🚀 Project Status

NutriSift is now **complete and fully functional**. The application has been thoroughly tested and optimized for both desktop and mobile use. All planned features have been implemented, including:

- ✅ User registration and authentication with security questions
- ✅ AI-powered recipe generation with nutritional information
- ✅ Comprehensive recipe discovery with advanced filtering
- ✅ Complete recipe management functionality
- ✅ Grocery list management with server synchronization
- ✅ Restaurant finder with map integration
- ✅ Responsive design for all screen sizes
- ✅ HashRouter implementation for GitHub Pages compatibility

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

For major changes, please open an issue first to discuss what you would like to change.

## ⚠️ Disclaimer

Recipe images are provided for reference only and may not exactly match the actual dish. Nutritional information is approximate and should not be used for medical purposes. Always verify ingredients for allergens and dietary restrictions. NutriSift is not responsible for any adverse reactions to recipes or cooking mishaps.
```