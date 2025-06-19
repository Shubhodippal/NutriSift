package com.shubhodip.nutrisift.recipe;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/recipe")
public class ChatController {

    @Autowired
    private ApiUsageDAO apiUsageDAO;

    private static final String COHERE_API_URL = "https://api.cohere.com/v2/chat";
    @Value("${cohere.api.key}")
    private String COHERE_API_KEY;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping
    public ResponseEntity<Object> generateRecipe(@RequestBody RecipeRequest request) {
        try {
            apiUsageDAO.trackApiUsage(request.getUid(), request.getMail(), "generate-recipe");
            
            List<String> possibleRecipes = savedRecipeDAO.findRecipesByIngredients(request.getIngredients());
            
            if (possibleRecipes != null && !possibleRecipes.isEmpty()) {
                String recipeJson = possibleRecipes.get(0);
                Map<String, Object> recipeMap = objectMapper.readValue(recipeJson, Map.class);
                
                if (!recipeMap.containsKey("calories")) recipeMap.put("calories", "Not available");
                if (!recipeMap.containsKey("diet")) recipeMap.put("diet", "Not specified");
                if (!recipeMap.containsKey("origin")) recipeMap.put("origin", "Not specified");
                if (!recipeMap.containsKey("course")) recipeMap.put("course", "Not specified");
                if (!recipeMap.containsKey("cuisine")) recipeMap.put("cuisine", "Not specified");
                
                savedRecipeDAO.saveRecipelogs(
                    request.getUid(), 
                    request.getMail(), 
                    "Retrieved from logs", 
                    request.getIngredients(), 
                    objectMapper.writeValueAsString(recipeMap)
                );
                
                return ResponseEntity.ok(recipeMap);
            }
            
            String prompt = String.format(
                "Suggest a creative recipe using only these ingredients: %s. " +
                "Respond in this JSON format: " +
                "{" +
                "\"title\": \"Recipe Name\", " +
                "\"ingredients\": [\"ingredient 1\", \"ingredient 2\", ...], " +
                "\"steps\": [\"step 1\", \"step 2\", ...(in detail instructions)], " +
                "\"calories\": \"approximate calories per serving\", " +
                "\"diet\": \"dietary category (e.g., vegetarian, keto, vegan)\", " +
                "\"origin\": \"specific geographical origin of the recipe\", " +
                "\"course\": \"type of meal (e.g., appetizer, main dish, dessert)\", " +
                "\"cuisine\": \"type of cuisine (e.g., Indian, Italian, Mexican)\"" +
                "}",
                request.getIngredients()
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + COHERE_API_KEY);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("stream", false);
            requestBody.put("model", "command-a-03-2025");
            
            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", prompt);
            
            requestBody.put("messages", List.of(message));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<String> response = restTemplate.exchange(
                COHERE_API_URL, 
                HttpMethod.POST, 
                entity, 
                String.class
            );
            
            String responseBody = response.getBody();
            Map<String, Object> responseMap = objectMapper.readValue(responseBody, Map.class);
            
            String content = "";
            if (responseMap.containsKey("message")) {
                Map<String, Object> messageObj = (Map<String, Object>) responseMap.get("message");
                if (messageObj.containsKey("content")) {
                    List<Map<String, Object>> contentList = (List<Map<String, Object>>) messageObj.get("content");
                    if (!contentList.isEmpty()) {
                        content = (String) contentList.get(0).get("text");
                    }
                }
            }
            
            Pattern pattern = Pattern.compile("\\{.*\\}", Pattern.DOTALL);
            Matcher matcher = pattern.matcher(content);

            if (matcher.find()) {
                String recipeJson = matcher.group();
                Map<String, Object> recipeMap = objectMapper.readValue(recipeJson, Map.class);
                
                if (!recipeMap.containsKey("calories")) recipeMap.put("calories", "Not available");
                if (!recipeMap.containsKey("diet")) recipeMap.put("diet", "Not specified");
                if (!recipeMap.containsKey("origin")) recipeMap.put("origin", "Not specified");
                if (!recipeMap.containsKey("course")) recipeMap.put("course", "Not specified");
                if (!recipeMap.containsKey("cuisine")) recipeMap.put("cuisine", "Not specified");
                
                savedRecipeDAO.saveRecipelogs(request.getUid(), request.getMail(), prompt, request.getIngredients(), objectMapper.writeValueAsString(recipeMap));
        
                return ResponseEntity.ok(recipeMap);
            } else {
                Map<String, Object> errorRecipe = new HashMap<>();
                errorRecipe.put("title", "Recipe Not Found");
                errorRecipe.put("ingredients", List.of());
                errorRecipe.put("steps", List.of("Sorry, I couldn't generate a recipe."));
                errorRecipe.put("calories", "Not available");
                errorRecipe.put("diet", "Not specified");
                errorRecipe.put("origin", "Not specified");
                errorRecipe.put("course", "Not specified");
                errorRecipe.put("cuisine", "Not specified");
                return ResponseEntity.ok(errorRecipe);
            }

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("title", "Error");
            errorResponse.put("ingredients", List.of());
            errorResponse.put("steps", List.of("Sorry, there was an error generating your recipe: " + e.getMessage()));
            errorResponse.put("calories", "Not available");
            errorResponse.put("diet", "Not specified");
            errorResponse.put("origin", "Not specified");
            errorResponse.put("course", "Not specified");
            errorResponse.put("cuisine", "Not specified");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/search")
    public ResponseEntity<Object> searchRecipes(@RequestBody RecipeSearchRequest request) {
        try {
            if (!apiUsageDAO.checkAndUpdateApiUsage(request.getUid(), request.getMail(), "search", 3)) {
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body("Rate Limit Exceeded, You have reached the daily limit (3) for recipe searches. Please try again tomorrow.");
            }
            
            StringBuilder promptBuilder = new StringBuilder();
            long timestamp = System.currentTimeMillis();
            
            promptBuilder.append("Find me 8-10 unique and different recipes (IMPORTANT: ensure variety and avoid repeating recipes from previous requests). ");
            promptBuilder.append("This is request timestamp: ").append(timestamp).append(". ");
            
            if (request.getQuery() != null && !request.getQuery().trim().isEmpty()) {
                promptBuilder.append("Matching the search query: ").append(request.getQuery()).append(". ");
            }
            
            if (request.getDiet() != null && !request.getDiet().equals("any")) {
                promptBuilder.append("Recipes should be ").append(request.getDiet()).append(". ");
            }
            
            if (request.getCuisine() != null && !request.getCuisine().equals("any")) {
                promptBuilder.append("From ").append(request.getCuisine()).append(" cuisine. ");
            }
            
            if (request.getCourse() != null && !request.getCourse().equals("any")) {
                promptBuilder.append("For ").append(request.getCourse()).append(". ");
            }
            
            if (request.getCalorieRange() != null && !request.getCalorieRange().equals("any")) {
                switch (request.getCalorieRange()) {
                    case "under300":
                        promptBuilder.append("Under 300 calories. ");
                        break;
                    case "300-500":
                        promptBuilder.append("Between 300-500 calories. ");
                        break;
                    case "500-800":
                        promptBuilder.append("Between 500-800 calories. ");
                        break;
                    case "over800":
                        promptBuilder.append("Over 800 calories. ");
                        break;
                }
            }
            
            if (request.getOrigin() != null && !request.getOrigin().equals("any")) {
                promptBuilder.append("From ").append(request.getOrigin()).append(" origin. ");
            }
            
            promptBuilder.append("IMPORTANT: Each recipe should be creative and different from one another. ");
            promptBuilder.append("Respond with an array of recipe objects in this JSON format: ");
            promptBuilder.append("[{");
            promptBuilder.append("\"title\": \"Recipe Name\", ");
            promptBuilder.append("\"ingredients\": [\"ingredient 1\", \"ingredient 2\", ...], ");
            promptBuilder.append("\"steps\": [\"step 1\", \"step 2\", ...], ");
            promptBuilder.append("\"calories\": \"approximate calories per serving\", ");
            promptBuilder.append("\"diet\": \"dietary category\", ");
            promptBuilder.append("\"origin\": \"geographical origin\", ");
            promptBuilder.append("\"course\": \"type of meal\", ");
            promptBuilder.append("\"cuisine\": \"type of cuisine\", ");
            promptBuilder.append("\"prepTime\": \"preparation time in minutes\", ");
            promptBuilder.append("\"cookTime\": \"cooking time in minutes\"");
            promptBuilder.append("}]");
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + COHERE_API_KEY);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("stream", false);
            requestBody.put("model", "command-a-03-2025");
            requestBody.put("temperature", 0.9); 
            requestBody.put("p", 0.75); 
            
            requestBody.put("seed", timestamp % 1000000);
            
            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", promptBuilder.toString());
            
            requestBody.put("messages", List.of(message));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<String> response = restTemplate.exchange(
                COHERE_API_URL, 
                HttpMethod.POST, 
                entity, 
                String.class
            );
            
            String responseBody = response.getBody();
            Map<String, Object> responseMap = objectMapper.readValue(responseBody, Map.class);
            
            String content = "";
            if (responseMap.containsKey("message")) {
                Map<String, Object> messageObj = (Map<String, Object>) responseMap.get("message");
                if (messageObj.containsKey("content")) {
                    List<Map<String, Object>> contentList = (List<Map<String, Object>>) messageObj.get("content");
                    if (!contentList.isEmpty()) {
                        content = (String) contentList.get(0).get("text");
                    }
                }
            }
            
            Pattern pattern = Pattern.compile("\\[\\s*\\{.*\\}\\s*\\]", Pattern.DOTALL);
            Matcher matcher = pattern.matcher(content);
            
            if (matcher.find()) {
                String recipesJson = matcher.group();
                List<Map<String, Object>> recipes = objectMapper.readValue(recipesJson, List.class);
                
                for (Map<String, Object> recipe : recipes) {
                    if (!recipe.containsKey("calories")) recipe.put("calories", "Not available");
                    if (!recipe.containsKey("diet")) recipe.put("diet", "Not specified");
                    if (!recipe.containsKey("origin")) recipe.put("origin", "Not specified");
                    if (!recipe.containsKey("course")) recipe.put("course", "Not specified");
                    if (!recipe.containsKey("cuisine")) recipe.put("cuisine", "Not specified");
                    if (!recipe.containsKey("prepTime")) recipe.put("prepTime", 30);
                    if (!recipe.containsKey("cookTime")) recipe.put("cookTime", 45);
                    
                    recipe.put("id", System.nanoTime() + recipes.indexOf(recipe));
                    
                    savedRecipeDAO.saveRecipelogs(request.getUid(), request.getMail(), promptBuilder.toString(), objectMapper.writeValueAsString(recipe.get("ingredients")), objectMapper.writeValueAsString(recipe));
                }
                return ResponseEntity.ok(recipes);
            } else {
                List<Map<String, Object>> fallbackRecipes = new ArrayList<>();
                Map<String, Object> errorRecipe = new HashMap<>();
                errorRecipe.put("id", 1);
                errorRecipe.put("title", "No Recipes Found");
                errorRecipe.put("ingredients", List.of("Please try a different search query"));
                errorRecipe.put("steps", List.of("Sorry, I couldn't find any recipes matching your criteria."));
                errorRecipe.put("calories", "Not available");
                errorRecipe.put("diet", "Not specified");
                errorRecipe.put("origin", "Not specified");
                errorRecipe.put("course", "Not specified");
                errorRecipe.put("cuisine", "Not specified");
                errorRecipe.put("prepTime", 0);
                errorRecipe.put("cookTime", 0);
                fallbackRecipes.add(errorRecipe);
                
                return ResponseEntity.ok(fallbackRecipes);
            }

        } catch (Exception e) {
            e.printStackTrace();
            List<Map<String, Object>> errorResponse = new ArrayList<>();
            Map<String, Object> errorRecipe = new HashMap<>();
            errorRecipe.put("id", 0);
            errorRecipe.put("title", "Error");
            errorRecipe.put("ingredients", List.of());
            errorRecipe.put("steps", List.of("Sorry, there was an error searching for recipes: " + e.getMessage()));
            errorRecipe.put("calories", "Not available");
            errorRecipe.put("diet", "Not specified");
            errorRecipe.put("origin", "Not specified");
            errorRecipe.put("course", "Not specified");
            errorRecipe.put("cuisine", "Not specified");
            errorRecipe.put("prepTime", 0);
            errorRecipe.put("cookTime", 0);
            errorResponse.add(errorRecipe);
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @Autowired
    private RecipeDAO savedRecipeDAO;

    @PostMapping("/save")
    public ResponseEntity<?> saveRecipe(@RequestBody SavedRecipe request) {
        try {
            SavedRecipe recipe = new SavedRecipe();
            recipe.setUid(request.getUid());
            recipe.setMail(request.getMail());
            recipe.setPrompt(request.getPrompt());
            recipe.setRecipeName(request.getRecipeName());
            recipe.setIngredients(request.getIngredients());
            recipe.setSteps(request.getSteps());
            recipe.setCalories(request.getCalories());
            recipe.setDiet(request.getDiet());
            recipe.setOrigin(request.getOrigin());
            recipe.setCourse(request.getCourse());
            recipe.setCuisine(request.getCuisine());
            
            int rows = savedRecipeDAO.saveRecipe(recipe);
            if (rows > 0) {
                return ResponseEntity.ok("Recipe saved successfully");
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to save recipe");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while saving recipe: " + e.getMessage());
        }
    }

    @GetMapping("/user/{uid}")
    public ResponseEntity<?> getUserRecipes(@PathVariable String uid) {
        try {
            List<SavedRecipe> recipes = savedRecipeDAO.getRecipesByUserId(uid);
            return ResponseEntity.ok(recipes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while retrieving recipes: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRecipeById(@PathVariable long id) {
        try {
            SavedRecipe recipe = savedRecipeDAO.getRecipeById(id);
            if (recipe != null) {
                return ResponseEntity.ok(recipe);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Recipe not found");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while retrieving recipe: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRecipe(@PathVariable long id) {
        try {
            
            boolean deleted = savedRecipeDAO.deleteRecipe(id);
            if (deleted) {
                return ResponseEntity.ok("Recipe deleted successfully");
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Recipe not found");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while deleting recipe: " + e.getMessage());
        }
    }

    @PostMapping("/meal-plan")
    public ResponseEntity<?> generateWeeklyMealPlan(@RequestBody MealPlanRequest request) {
        try {
            if (!apiUsageDAO.checkAndUpdateApiUsage(request.getUid(), request.getMail(), "meal-plan", 2)) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Rate Limit Exceeded, You have reached the daily limit (2) for generating meal plans. Please try again tomorrow.");
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(errorResponse);
            }
            
            UserProfile userProfile = savedRecipeDAO.getUserProfile(request.getUid(), request.getMail());
            
            if (userProfile == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User profile not found. Please complete your profile first.");
            }
            
            StringBuilder promptBuilder = new StringBuilder();
            promptBuilder.append("Create a personalized 7-day meal plan (breakfast, morning snack, lunch, afternoon snack, dinner) for a user with these preferences: ");
            
            if (userProfile.getDietaryPreference() != null) {
                promptBuilder.append("Diet: ").append(userProfile.getDietaryPreference()).append(". ");
            }
            
            if (userProfile.getAllergies() != null && !userProfile.getAllergies().isEmpty()) {
                promptBuilder.append("Allergies: ").append(userProfile.getAllergies()).append(". ");
            }
            
            if (userProfile.getCalorieGoal() > 0) {
                promptBuilder.append("Daily calorie goal: ").append(userProfile.getCalorieGoal()).append(". ");
            }
            
            if (userProfile.getHealthGoals() != null) {
                promptBuilder.append("Health goals: ").append(userProfile.getHealthGoals()).append(". ");
            }
            
            if (userProfile.getCuisinePreferences() != null) {
                promptBuilder.append("Preferred cuisines: ").append(userProfile.getCuisinePreferences()).append(". ");
            }
            
            String userCity = userProfile.getCity() != null ? userProfile.getCity() : "Kolkata";
            String userCountry = userProfile.getCountry() != null ? userProfile.getCountry() : "India";
            
            promptBuilder.append("User lives in ").append(userCity).append(", ").append(userCountry).append(". ");
            promptBuilder.append("Include local and regional dishes popular in ").append(userCity);
            promptBuilder.append("Include two healthy snacks each day between main meals. ");
            promptBuilder.append("IMPORTANT: Ensure there is significant variety in meals across the week - don't repeat the same meals on different days. ");
            promptBuilder.append("For example, if oatmeal is suggested for Monday breakfast, don't suggest it for any other breakfast that week. ");
            promptBuilder.append("For each meal and snack, include a title, brief description, detailed cooking instructions, approximate calories, country of origin, and key ingredients. ");
            promptBuilder.append("Respond with a JSON object in this exact format: ");
            promptBuilder.append("{");
            promptBuilder.append("\"weeklyPlan\": [");
            promptBuilder.append("{");
            promptBuilder.append("\"day\": \"Monday\",");
            promptBuilder.append("\"meals\": [");
            promptBuilder.append("{\"type\": \"Breakfast\", \"title\": \"Recipe name\", \"description\": \"Brief description\", \"instructions\": [\"step 1\", \"step 2\", \"step 3\"], \"calories\": \"300\", \"origin\": {\"country\": \"Country name\", \"region\": \"Regional cuisine style\"}, \"ingredients\": [\"ingredient1\", \"ingredient2\"]},");
            promptBuilder.append("{\"type\": \"Morning Snack\", \"title\": \"Snack name\", \"description\": \"Brief description\", \"instructions\": [\"step 1\", \"step 2\"], \"calories\": \"150\", \"origin\": {\"country\": \"Country name\", \"region\": \"Regional cuisine style\"}, \"ingredients\": [\"ingredient1\", \"ingredient2\"]},");
            promptBuilder.append("{\"type\": \"Lunch\", \"title\": \"Recipe name\", \"description\": \"Brief description\", \"instructions\": [\"step 1\", \"step 2\", \"step 3\", \"step 4\"], \"calories\": \"500\", \"origin\": {\"country\": \"Country name\", \"region\": \"Regional cuisine style\"}, \"ingredients\": [\"ingredient1\", \"ingredient2\"]},");
            promptBuilder.append("{\"type\": \"Afternoon Snack\", \"title\": \"Snack name\", \"description\": \"Brief description\", \"instructions\": [\"step 1\", \"step 2\"], \"calories\": \"150\", \"origin\": {\"country\": \"Country name\", \"region\": \"Regional cuisine style\"}, \"ingredients\": [\"ingredient1\", \"ingredient2\"]},");
            promptBuilder.append("{\"type\": \"Dinner\", \"title\": \"Recipe name\", \"description\": \"Brief description\", \"instructions\": [\"step 1\", \"step 2\", \"step 3\", \"step 4\", \"step 5\"], \"calories\": \"600\", \"origin\": {\"country\": \"Country name\", \"region\": \"Regional cuisine style\"}, \"ingredients\": [\"ingredient1\", \"ingredient2\"]}");
            promptBuilder.append("]");
            promptBuilder.append("},");
            promptBuilder.append("... (repeat for all 7 days)");
            promptBuilder.append("]");
            promptBuilder.append("}");
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + COHERE_API_KEY);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("stream", false);
            requestBody.put("model", "command-a-03-2025");
            requestBody.put("temperature", 0.7);
            
            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", promptBuilder.toString());
            
            requestBody.put("messages", List.of(message));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<String> response = restTemplate.exchange(
                COHERE_API_URL, 
                HttpMethod.POST, 
                entity, 
                String.class
            );
            
            String responseBody = response.getBody();
            Map<String, Object> responseMap = objectMapper.readValue(responseBody, Map.class);
            
            String content = "";
            if (responseMap.containsKey("message")) {
                Map<String, Object> messageObj = (Map<String, Object>) responseMap.get("message");
                if (messageObj.containsKey("content")) {
                    List<Map<String, Object>> contentList = (List<Map<String, Object>>) messageObj.get("content");
                    if (!contentList.isEmpty()) {
                        content = (String) contentList.get(0).get("text");
                    }
                }
            }
            
            Pattern pattern = Pattern.compile("\\{.*\\}", Pattern.DOTALL);
            Matcher matcher = pattern.matcher(content);

            if (matcher.find()) {
                String mealPlanJson = matcher.group();
                Map<String, Object> mealPlanMap = objectMapper.readValue(mealPlanJson, Map.class);
                
                if (mealPlanMap.containsKey("weeklyPlan")) {
                    validateMealPlanVariety(mealPlanMap);
                    ensureCompleteInstructions(mealPlanMap);
                    
                    List<Map<String, Object>> weeklyPlan = (List<Map<String, Object>>) mealPlanMap.get("weeklyPlan");
                    for (Map<String, Object> dayPlan : weeklyPlan) {
                        String day = (String) dayPlan.get("day");
                        List<Map<String, Object>> meals = (List<Map<String, Object>>) dayPlan.get("meals");
                        
                        for (Map<String, Object> meal : meals) {
                            String mealType = (String) meal.get("type");
                            String mealTitle = (String) meal.get("title");
                            
                            String mealPrompt = "Meal plan: " + mealType + " for " + day + " - " + mealTitle;
                            
                            List<String> ingredientsList = (List<String>) meal.get("ingredients");
                            String ingredientsString = String.join(", ", ingredientsList);
                            
                            savedRecipeDAO.saveRecipelogs(
                                request.getUid(),
                                request.getMail(),
                                mealPrompt,
                                ingredientsString,
                                objectMapper.writeValueAsString(meal)
                            );
                        }
                    }
                }
                
                savedRecipeDAO.saveMealPlan(
                    request.getUid(), 
                    request.getMail(), 
                    objectMapper.writeValueAsString(mealPlanMap)
                );
                
                return ResponseEntity.ok(mealPlanMap);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Failed to generate meal plan");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "An error occurred: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    private void validateMealPlanVariety(Map<String, Object> mealPlanMap) {
        try {
            List<Map<String, Object>> weeklyPlan = (List<Map<String, Object>>) mealPlanMap.get("weeklyPlan");
            Map<String, Integer> breakfastCounts = new HashMap<>();
            Map<String, Integer> lunchCounts = new HashMap<>();
            Map<String, Integer> dinnerCounts = new HashMap<>();
            
            for (Map<String, Object> dayPlan : weeklyPlan) {
                List<Map<String, Object>> meals = (List<Map<String, Object>>) dayPlan.get("meals");
                for (Map<String, Object> meal : meals) {
                    String type = (String) meal.get("type");
                    String title = (String) meal.get("title");
                    
                    if ("Breakfast".equals(type)) {
                        breakfastCounts.put(title, breakfastCounts.getOrDefault(title, 0) + 1);
                    } else if ("Lunch".equals(type)) {
                        lunchCounts.put(title, lunchCounts.getOrDefault(title, 0) + 1);
                    } else if ("Dinner".equals(type)) {
                        dinnerCounts.put(title, dinnerCounts.getOrDefault(title, 0) + 1);
                    }
                }
            }
            
            double breakfastVariety = calculateVarietyScore(breakfastCounts);
            double lunchVariety = calculateVarietyScore(lunchCounts);
            double dinnerVariety = calculateVarietyScore(dinnerCounts);
            double overallVariety = (breakfastVariety + lunchVariety + dinnerVariety) / 3.0;
            
            mealPlanMap.put("varietyScore", Math.round(overallVariety * 100) / 100.0);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private double calculateVarietyScore(Map<String, Integer> mealCounts) {
        if (mealCounts.isEmpty()) return 1.0;
        
        int totalMeals = mealCounts.values().stream().mapToInt(Integer::intValue).sum();
        int uniqueMeals = mealCounts.size();
        
        return Math.min(1.0, uniqueMeals / 7.0);
    }

    private void ensureCompleteInstructions(Map<String, Object> mealPlanMap) {
        try {
            List<Map<String, Object>> weeklyPlan = (List<Map<String, Object>>) mealPlanMap.get("weeklyPlan");
            for (Map<String, Object> dayPlan : weeklyPlan) {
                List<Map<String, Object>> meals = (List<Map<String, Object>>) dayPlan.get("meals");
                for (Map<String, Object> meal : meals) {
                    if (!meal.containsKey("instructions") || ((List<?>)meal.get("instructions")).isEmpty()) {
                        List<String> basicInstructions = new ArrayList<>();
                        basicInstructions.add("Gather all ingredients");
                        basicInstructions.add("Prepare ingredients as needed (wash, chop, measure)");
                        basicInstructions.add("Cook according to conventional methods for this dish");
                        basicInstructions.add("Serve and enjoy");
                        meal.put("instructions", basicInstructions);
                    }
                    
                    if (!meal.containsKey("origin")) {
                        Map<String, String> origin = new HashMap<>();
                        origin.put("country", "International");
                        origin.put("region", "Various");
                        meal.put("origin", origin);
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    @GetMapping("/meal-plans/{uid}/{mail}")
    public ResponseEntity<?> getUserMealPlans(@PathVariable String uid, @PathVariable String mail) {
        try {
            List<Map<String, Object>> mealPlans = savedRecipeDAO.getUserMealPlans(uid, mail);
            
            if (mealPlans.isEmpty()) {
                return ResponseEntity.ok(
                    Map.of("message", "No meal plans found for this user")
                );
            }
            
            return ResponseEntity.ok(mealPlans);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "An error occurred retrieving meal plans: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @DeleteMapping("/del_meal-plan/{id}")
    public ResponseEntity<?> deleteMealPlan(@PathVariable long id) {
        try {
            boolean deleted = savedRecipeDAO.deleteMealPlan(id);
            if (deleted) {
                return ResponseEntity.ok(
                    Map.of("message", "Meal plan deleted successfully")
                );
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    Map.of("message", "Meal plan not found")
                );
            }
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "An error occurred deleting meal plan: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}