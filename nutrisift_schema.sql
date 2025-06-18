/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.13-MariaDB, for debian-linux-gnu (aarch64)
--
-- Host: localhost    Database: NUTRISIFT
-- ------------------------------------------------------
-- Server version	10.11.13-MariaDB-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `api_usage_logs`
--

DROP TABLE IF EXISTS `api_usage_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `api_usage_logs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `endpoint` varchar(50) NOT NULL,
  `usage_date` date NOT NULL,
  `count` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_endpoint_date` (`user_id`,`email`,`endpoint`,`usage_date`),
  KEY `fk_api_mail` (`email`),
  CONSTRAINT `fk_api_mail` FOREIGN KEY (`email`) REFERENCES `users` (`email`),
  CONSTRAINT `fk_api_uid` FOREIGN KEY (`user_id`) REFERENCES `users` (`userid`)
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `grocery_list`
--

DROP TABLE IF EXISTS `grocery_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `grocery_list` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `uid` varchar(100) NOT NULL,
  `mail` varchar(255) NOT NULL,
  `state` varchar(50) DEFAULT NULL,
  `item_name` varchar(255) NOT NULL,
  `quantity` varchar(50) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `creation_time` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `uid` (`uid`),
  KEY `mail` (`mail`),
  CONSTRAINT `grocery_list_ibfk_1` FOREIGN KEY (`uid`) REFERENCES `users` (`userid`),
  CONSTRAINT `grocery_list_ibfk_2` FOREIGN KEY (`mail`) REFERENCES `users` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=445 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `meal_plans`
--

DROP TABLE IF EXISTS `meal_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `meal_plans` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `uid` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `meal_plan` text NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_userid` (`uid`),
  KEY `fk_email` (`email`),
  CONSTRAINT `fk_email` FOREIGN KEY (`email`) REFERENCES `users` (`email`) ON DELETE CASCADE,
  CONSTRAINT `fk_userid` FOREIGN KEY (`uid`) REFERENCES `users` (`userid`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `profile`
--

DROP TABLE IF EXISTS `profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `profile` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `uid` varchar(100) DEFAULT NULL,
  `mail` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `weight` float DEFAULT NULL,
  `height` float DEFAULT NULL,
  `bmi` float DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `diet_pref` varchar(100) DEFAULT NULL,
  `body_goal` varchar(100) DEFAULT NULL,
  `allergies` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `pincode` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `mail` (`mail`),
  KEY `fk_profile_uid` (`uid`),
  CONSTRAINT `fk_profile_uid` FOREIGN KEY (`uid`) REFERENCES `users` (`userid`),
  CONSTRAINT `profile_ibfk_2` FOREIGN KEY (`mail`) REFERENCES `users` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `recipe_logs`
--

DROP TABLE IF EXISTS `recipe_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipe_logs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `uid` varchar(100) NOT NULL,
  `mail` varchar(255) NOT NULL,
  `prompt` text DEFAULT NULL,
  `ingredient` text DEFAULT NULL,
  `result` text DEFAULT NULL,
  `log_time` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_recipe_logs_uid` (`uid`),
  KEY `fk_recipe_logs_mail` (`mail`),
  CONSTRAINT `fk_recipe_logs_mail` FOREIGN KEY (`mail`) REFERENCES `users` (`email`),
  CONSTRAINT `fk_recipe_logs_uid` FOREIGN KEY (`uid`) REFERENCES `users` (`userid`)
) ENGINE=InnoDB AUTO_INCREMENT=215 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `saved_recipe`
--

DROP TABLE IF EXISTS `saved_recipe`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `saved_recipe` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `uid` varchar(36) NOT NULL,
  `mail` varchar(255) NOT NULL,
  `prompt` text DEFAULT NULL,
  `recipe_name` varchar(255) NOT NULL,
  `ingredients` text DEFAULT NULL,
  `steps` text DEFAULT NULL,
  `calories` varchar(255) DEFAULT NULL,
  `diet` varchar(100) DEFAULT NULL,
  `origin` varchar(100) DEFAULT NULL,
  `course` varchar(100) DEFAULT NULL,
  `cuisine` varchar(100) DEFAULT NULL,
  `saved_time_date` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `uid` (`uid`),
  KEY `mail` (`mail`),
  CONSTRAINT `saved_recipe_ibfk_1` FOREIGN KEY (`uid`) REFERENCES `users` (`userid`),
  CONSTRAINT `saved_recipe_ibfk_2` FOREIGN KEY (`mail`) REFERENCES `users` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transaction_records`
--

DROP TABLE IF EXISTS `transaction_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `transaction_records` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `uid` varchar(100) NOT NULL,
  `mail` varchar(255) NOT NULL,
  `purchase_date` date NOT NULL,
  `expiry_date` date NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `final_price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_tr_uid` (`uid`),
  KEY `fk_tr_mail` (`mail`),
  CONSTRAINT `fk_tr_mail` FOREIGN KEY (`mail`) REFERENCES `users` (`email`),
  CONSTRAINT `fk_tr_uid` FOREIGN KEY (`uid`) REFERENCES `users` (`userid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `time` timestamp NULL DEFAULT current_timestamp(),
  `date` date DEFAULT NULL,
  `userid` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `security_question` varchar(255) DEFAULT NULL,
  `answer` varchar(255) DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userid` (`userid`),
  UNIQUE KEY `uq_userid` (`userid`),
  UNIQUE KEY `uq_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-18 19:11:42
