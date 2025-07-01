package com.shubhodip.nutrisift.user;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import java.util.Random;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shubhodip.nutrisift.Web_token_util.JwtUtil;

import jakarta.mail.Authenticator;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserDAO userDAO;

    @PostMapping("/register")
    public ResponseEntity<String> saveUser(@RequestBody User user) {
        if (userDAO.emailExists(user.getEmail())) {
            return ResponseEntity.status(409).body("Email already exists.");
        }

        String userid;
        do {
            userid = UUID.randomUUID().toString();
        } while (userDAO.isUserIdExists(userid));

        user.setUserid(userid);
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        String encryptedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encryptedPassword);

        int rows = userDAO.saveUser(user);
        if (rows > 0) {
            return ResponseEntity.ok("User saved successfully with userid: " + userid);
        } else {
            return ResponseEntity.status(500).body("Failed to save user");
        }
    }

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        User user = userDAO.getUserByEmail(loginRequest.getEmail());

        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        if (user == null || !passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }
        
        userDAO.updateLastLogin(user.getEmail());

        String accessToken = jwtUtil.generateToken(user.getUserid(), user.getEmail());
        String refreshToken = jwtUtil.generateRefreshToken(user.getUserid(), user.getEmail());
        
        Map<String, String> response = new HashMap<>();
        response.put("token", accessToken);
        response.put("refreshToken", refreshToken);
        response.put("message", "Login successful");
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/security-question")
    public ResponseEntity<?> getSecurityQuestion(@RequestParam String email) {
        try {
            User user = userDAO.getUserByEmail(email);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No account found with this email address.");
            }
            
            Map<String, String> response = new HashMap<>();
            response.put("securityQuestion", user.getSecurityQuestion());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while retrieving security question: " + e.getMessage());
        }
    }

    @PostMapping("/verify-answer")
    public ResponseEntity<?> verifySecurityAnswer(@RequestBody SecurityAnswerRequest request) {
        try {
            User user = userDAO.getUserByEmail(request.getEmail());
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
            
            if (user.getSecurityAnswer().equalsIgnoreCase(request.getAnswer())) {
                return ResponseEntity.ok().build(); 
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Incorrect answer");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while verifying answer: " + e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody PasswordResetRequest request) {
        try {
            User user = userDAO.getUserByEmail(request.getEmail());
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
            
            PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
            String encryptedPassword = passwordEncoder.encode(request.getNewPassword());
            
            boolean updated = userDAO.updatePassword(request.getEmail(), encryptedPassword);
            if (updated) {
                return ResponseEntity.ok("Password reset successful");
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to reset password");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while resetting password: " + e.getMessage());
        }
    }

    @PostMapping("/profile")
    public ResponseEntity<String> saveProfile(@RequestBody Profile profile) {
        if (profile.getMail() == null || profile.getMail().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email is required");
        }

        User user = userDAO.getUserByEmail(profile.getMail());
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        int rows = userDAO.saveProfile(profile);
        if (rows > 0) {
            return ResponseEntity.ok("Profile saved successfully for email: " + profile.getMail());
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to save profile");
        }
    }

    @GetMapping("/profile/{email}")
    public ResponseEntity<Profile> getProfile(@PathVariable String email) {
        try {
            User user = userDAO.getUserByEmail(email);
            if (user == null) {
                return ResponseEntity.ok(null);
            }
            Profile profile = userDAO.getProfileByEmail(email);            
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PutMapping("/profile/{email}")
    public ResponseEntity<String> updateProfile(@PathVariable String email, @RequestBody Profile profile) {
        try {
            User user = userDAO.getUserByEmail(email);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
            
            profile.setMail(email);
            
            Profile existingProfile = userDAO.getProfileByEmail(email);
            if (existingProfile == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Profile not found for user");
            }
            
            int rowsUpdated = userDAO.updateProfile(profile);
            if (rowsUpdated > 0) {
                return ResponseEntity.ok("Profile updated successfully");
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update profile");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while updating profile: " + e.getMessage());
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest refreshTokenRequest) {
        String refreshToken = refreshTokenRequest.getRefreshToken();
        
        if (!jwtUtil.validateRefreshToken(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired refresh token");
        }
        
        String userId = jwtUtil.extractUserIdFromRefreshToken(refreshToken);
        String email = jwtUtil.extractEmailFromRefreshToken(refreshToken);
        
        String newAccessToken = jwtUtil.generateToken(userId, email);
        
        Map<String, String> response = new HashMap<>();
        response.put("token", newAccessToken);
        response.put("message", "Token refreshed successfully");
        
        System.out.println("New access token: " + newAccessToken);
        return ResponseEntity.ok(response);
    }

    @Value("${email.host}")
    private String emailHost;

    @Value("${email.port}")
    private int emailPort;

    @Value("${email.username}")
    private String emailUsername;

    @Value("${email.password}")
    private String emailPassword;

    @Value("${email.ssl}")
    private boolean useSSL;
    @PostMapping("/otp")
    public ResponseEntity<Map<String, Object>> generateOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String type = request.get("type");
        Map<String, Object> response = new HashMap<>();
        
        if (email == null || email.isEmpty()) {
            response.put("status", "error");
            response.put("message", "Email is required");
            return ResponseEntity.badRequest().body(response);
        }
        
        if(type != null && type.equals("signup")){
            try {                
                String otp = generateOtp();
                
                PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
                String encodedOtp = passwordEncoder.encode(otp);
                
                Map<String, Object> claims = new HashMap<>();
                claims.put("email", email);
                claims.put("encodedOtp", encodedOtp);
                claims.put("type", type);
                
                String otpToken = jwtUtil.generateTokenWithExpiration(claims, 10 * 60 * 1000); 
                
                sendOtpEmail(email, otp);
                
                response.put("status", "success");
                response.put("otpToken", otpToken);
                
                return ResponseEntity.ok(response);
            } catch (Exception e) {
                response.put("status", "error");
                response.put("message", "Error: " + e.getMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
        } else if(type != null && type.equals("reset")){
            try {
                boolean userExists = userDAO.emailExists(email);
                if (!userExists) {
                    response.put("status", "error");
                    response.put("message", "User not found");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                }
                
                String otp = generateOtp();
                
                PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
                String encodedOtp = passwordEncoder.encode(otp);
                
                Map<String, Object> claims = new HashMap<>();
                claims.put("email", email);
                claims.put("encodedOtp", encodedOtp);
                claims.put("type", type);
                
                String otpToken = jwtUtil.generateTokenWithExpiration(claims, 10 * 60 * 1000); // 10 minutes in milliseconds
                
                sendOtpEmail(email, otp);
                
                response.put("status", "success");
                response.put("otpToken", otpToken);
                
                return ResponseEntity.ok(response);
                
            } catch (Exception e) {
                response.put("status", "error");
                response.put("message", "Error: " + e.getMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
        }
        response.put("status", "error");
        response.put("message", "Invalid request type");
        return ResponseEntity.badRequest().body(response);
    }

    private String generateOtp() {
        Random random = new Random();
        int otp = 10000000 + random.nextInt(90000000);
        return String.valueOf(otp);
    }

    private void sendOtpEmail(String to, String otp) throws MessagingException {
        Properties props = new Properties();
        
        if (useSSL) {
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.ssl.enable", "true");
            props.put("mail.smtp.host", emailHost);
            props.put("mail.smtp.port", emailPort);
        } else {
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.host", emailHost);
            props.put("mail.smtp.port", emailPort);
        }
        
        Session session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(emailUsername, emailPassword);
            }
        });
        
        Message message = new MimeMessage(session);
        message.setFrom(new InternetAddress(emailUsername));
        message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(to));
        message.setSubject("Your NutriSift OTP Code");
        message.setText("Your OTP code is: " + otp + "\n\nThis code is valid for 10 minutes.");
        
        Transport.send(message);
    }
}