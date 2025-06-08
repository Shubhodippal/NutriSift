# NutriSift - AI-Powered Recipe Management

![NutriSift Logo](https://via.placeholder.com/200x200/1a2235/ffffff?text=NutriSift)

## 📋 Overview

NutriSift is an AI-powered recipe management application that helps users discover, create, and organize recipes. The application focuses on reducing food waste by suggesting recipes based on available ingredients, providing detailed nutritional information, and offering comprehensive recipe management tools.

## ✨ Key Features

- **🤖 AI Recipe Generation**: Get personalized recipe suggestions based on ingredients you have
- **🔍 Recipe Discovery**: Browse and filter recipes by diet, origin, cuisine, and more
- **📚 Recipe Management**: Save, organize, and customize your favorite recipes
- **📱 Easy Sharing**: Share recipes via system sharing, email, or directly copy to clipboard
- **🖨️ PDF Export**: Generate and download beautifully formatted recipe PDFs
- **🛒 Grocery List**: Add recipe ingredients to your shopping list
- **👨‍🍳 Step-by-Step Cooking**: Follow recipes with an intuitive step-by-step guide
- **🗺️ Restaurant Map**: Find restaurants with similar cuisines (feature in development)

## 🛠️ Technology Stack

- **Frontend**: React.js
- **Routing**: React Router
- **Styling**: Custom CSS
- **API Integration**: 
  - Recipe data API
  - Pixabay API for recipe images
- **PDF Generation**: jsPDF and html2canvas
- **Sharing**: Web Share API with clipboard fallbacks

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/nutri-sift.git
   cd nutri-sift
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file in the root directory with the following content:
   ```
   REACT_APP_PIXABAY_API_KEY=your_pixabay_api_key_here
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## 📱 Usage

### Recipe Chat

Input ingredients you have available, and the AI will generate a personalized recipe with nutritional information, step-by-step instructions, and dietary details.

### Discover Recipes

Browse recipes with advanced filtering options:
- Calorie ranges
- Diet types (vegetarian, vegan, etc.)
- Cuisine styles
- Origin/regional preferences
- Course types

### Saved Recipes

Manage your personal recipe collection:
- View all saved recipes
- Search and filter your recipes
- Print recipes to PDF
- Share recipes with friends
- Add recipe ingredients to your grocery list

### Recipe Details

View complete recipe information:
- Ingredients with quantity adjustments based on servings
- Step-by-step instructions
- Nutritional information
- Switch between overview and step-by-step cooking modes

### Grocery List

Manage your shopping needs:
- Add ingredients from recipes
- Organize by food categories
- Check off items as you shop

## 💻 Development

### Available Scripts

- `npm start` - Run the development server
- `npm test` - Run tests
- `npm run build` - Create production build
- `npm run eject` - Eject from Create React App

### Project Structure

```
nutri-sift/
├── public/
├── src/
│   ├── assets/
│   │   └── success.mp3
│   ├── components/
│   │   ├── AnimatedBackground.js
│   │   ├── HamburgerMenu.js
│   │   └── HamburgerMenu.css
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
│   │   └── SavedRecipesPage.css
│   ├── services/
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── .env
├── .env.sample
├── .gitignore
├── package.json
└── README.md
```

### Environment Variables

Create a .env file with the following variables:

```
REACT_APP_PIXABAY_API_KEY=your_pixabay_api_key_here
```

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🔗 Links

- [Repository](https://github.com/yourusername/nutri-sift)
- [Issue Tracker](https://github.com/yourusername/nutri-sift/issues)
- [Pixabay API](https://pixabay.com/api/docs/)

## ⚠️ Disclaimer

Recipe images are provided for reference only and may not exactly match the actual dish.