-- MySQL dump 10.13  Distrib 8.4.6, for Win64 (x86_64)
--
-- Host: localhost    Database: DBMS_Project
-- ------------------------------------------------------
-- Server version	8.4.6

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `passenger_id` int NOT NULL,
  `bus_id` int NOT NULL,
  `route_id` int NOT NULL,
  `seat_number` varchar(10) DEFAULT NULL,
  `booking_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('confirmed','pending','completed','cancelled') DEFAULT 'confirmed',
  `ticket_number` varchar(50) DEFAULT NULL,
  `payment_method` enum('cash','card','upi','netbanking') DEFAULT 'cash',
  `payment_status` enum('paid','pending','failed') DEFAULT 'paid',
  `schedule_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ticket_number` (`ticket_number`),
  KEY `passenger_id` (`passenger_id`),
  KEY `bus_id` (`bus_id`),
  KEY `route_id` (`route_id`),
  KEY `fk_schedule` (`schedule_id`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`passenger_id`) REFERENCES `passengers` (`id`),
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`bus_id`) REFERENCES `buses` (`id`),
  CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`),
  CONSTRAINT `fk_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `schedules` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,1,1,1,'A5','2025-10-12 05:00:00',450.00,'pending','KSRTC-10121030','upi','pending',NULL),(2,8,1,1,'A6','2025-10-12 05:45:00',450.00,'pending','KSRTC-10121115','card','pending',NULL),(3,15,2,2,'B1','2025-10-12 06:30:00',380.00,'pending','KSRTC-10121200','cash','pending',NULL),(4,22,5,3,'C3','2025-10-12 08:15:00',320.00,'pending','KSRTC-10121345','netbanking','pending',NULL),(5,5,1,1,'D9','2025-10-12 08:50:00',450.00,'pending','KSRTC-10121420','upi','pending',NULL),(6,12,2,2,'E7','2025-10-12 09:35:00',380.00,'pending','KSRTC-10121505','card','pending',NULL),(7,2,1,6,'B2','2025-10-11 03:00:00',250.00,'completed','KSRTC-10110830','cash','paid',NULL),(8,9,1,6,'B3','2025-10-11 03:40:00',250.00,'completed','KSRTC-10110910','card','paid',NULL),(9,16,2,2,'C8','2025-10-11 05:30:00',380.00,'completed','KSRTC-10111100','upi','paid',NULL),(10,23,5,5,'D1','2025-10-11 07:00:00',480.00,'completed','KSRTC-10111230','netbanking','paid',NULL),(11,3,1,6,'E5','2025-10-11 08:30:00',250.00,'completed','KSRTC-10111400','cash','paid',NULL),(12,10,2,2,'F2','2025-10-11 11:15:00',380.00,'completed','KSRTC-10111645','card','paid',NULL),(13,17,1,6,'G1','2025-10-11 12:50:00',250.00,'completed','KSRTC-10111820','upi','paid',NULL),(14,3,2,2,'C1','2025-10-10 03:30:00',380.00,'completed','KSRTC-10100900','card','paid',NULL),(15,11,2,2,'C2','2025-10-10 04:55:00',380.00,'completed','KSRTC-10101025','cash','paid',NULL),(16,18,5,3,'D10','2025-10-10 06:25:00',320.00,'completed','KSRTC-10101155','upi','paid',NULL),(17,25,1,1,'A11','2025-10-10 07:45:00',450.00,'completed','KSRTC-10101315','netbanking','paid',NULL),(18,4,2,2,'B6','2025-10-10 10:10:00',380.00,'completed','KSRTC-10101540','card','paid',NULL),(19,13,5,3,'C12','2025-10-10 12:00:00',320.00,'completed','KSRTC-10101730','cash','paid',NULL),(20,4,5,5,'D4','2025-10-09 00:30:00',480.00,'cancelled','KSRTC-10090600','upi','failed',NULL),(21,14,1,1,'E2','2025-10-09 03:15:00',450.00,'completed','KSRTC-10090845','card','paid',NULL),(22,21,2,2,'F8','2025-10-09 04:40:00',380.00,'cancelled','KSRTC-10091010','cash','failed',NULL),(23,7,5,5,'G5','2025-10-09 06:50:00',480.00,'completed','KSRTC-10091220','netbanking','paid',NULL),(24,19,1,1,'H4','2025-10-09 10:30:00',450.00,'completed','KSRTC-10091600','upi','paid',NULL),(25,5,2,2,'A8','2025-10-08 08:30:00',380.00,'pending','KSRTC-10081400','netbanking','pending',NULL),(26,20,1,6,'B10','2025-10-08 10:00:00',250.00,'completed','KSRTC-10081530','card','paid',NULL),(27,1,5,3,'C7','2025-10-08 10:45:00',320.00,'completed','KSRTC-10081615','cash','paid',NULL),(28,8,2,2,'D3','2025-10-08 12:30:00',380.00,'completed','KSRTC-10081800','upi','paid',NULL),(29,15,1,6,'E9','2025-10-08 14:15:00',250.00,'pending','KSRTC-10081945','card','pending',NULL),(30,22,5,3,'F6','2025-10-08 15:30:00',320.00,'completed','KSRTC-10082100','netbanking','paid',NULL),(31,6,1,1,'F12','2025-10-07 12:30:00',450.00,'pending','KSRTC-10071800','cash','pending',NULL),(32,23,2,2,'G8','2025-10-07 03:50:00',380.00,'completed','KSRTC-10070920','card','paid',NULL),(33,2,5,5,'H1','2025-10-07 06:00:00',480.00,'completed','KSRTC-10071130','upi','paid',NULL),(34,9,1,1,'I5','2025-10-07 08:20:00',450.00,'cancelled','KSRTC-10071350','netbanking','failed',NULL),(35,16,2,2,'J2','2025-10-07 10:40:00',380.00,'completed','KSRTC-10071610','cash','paid',NULL),(36,24,5,5,'K9','2025-10-07 13:30:00',480.00,'completed','KSRTC-10071900','card','paid',NULL),(37,7,1,6,'G3','2025-10-06 06:15:00',250.00,'completed','KSRTC-10061145','card','paid',NULL),(38,25,2,2,'H6','2025-10-06 04:20:00',380.00,'completed','KSRTC-10060950','upi','paid',NULL),(39,5,5,3,'I10','2025-10-06 07:00:00',320.00,'completed','KSRTC-10061230','cash','paid',NULL),(40,12,1,6,'J7','2025-10-06 08:45:00',250.00,'cancelled','KSRTC-10061415','netbanking','failed',NULL),(41,19,2,2,'K4','2025-10-06 11:30:00',380.00,'completed','KSRTC-10061700','card','paid',NULL),(42,1,5,3,'L2','2025-10-06 14:30:00',320.00,'completed','KSRTC-10062000','upi','paid',NULL);
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bus_stops`
--

DROP TABLE IF EXISTS `bus_stops`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bus_stops` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bus_stops`
--

LOCK TABLES `bus_stops` WRITE;
/*!40000 ALTER TABLE `bus_stops` DISABLE KEYS */;
INSERT INTO `bus_stops` VALUES (1,'Thiruvananthapuram Bus Stand','695001','Thiruvananthapuram'),(2,'Kollam Bus Stand','691001','Kollam'),(3,'Kochi Bus Stand','682001','Ernakulam'),(4,'Thrissur Bus Stand','680001','Thrissur'),(5,'Kozhikode Bus Stand','673001','Kozhikode'),(6,'Kannur Bus Stand','670001','Kannur'),(7,'Alappuzha Bus Stand','688001','Alappuzha'),(8,'Kottayam Bus Stand','686001','Kottayam'),(9,'Palakkad Bus Stand','678001','Palakkad'),(10,'Malappuram Bus Stand','676001','Malappuram');
/*!40000 ALTER TABLE `bus_stops` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `buses`
--

DROP TABLE IF EXISTS `buses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `buses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bus_number` varchar(20) NOT NULL,
  `capacity` int NOT NULL,
  `driver_id` int DEFAULT NULL,
  `bus_stop_id` int DEFAULT NULL,
  `status` enum('active','maintenance') DEFAULT 'active',
  `bus_type` enum('AC','Non-AC','Sleeper','Seater') DEFAULT 'Seater',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uc_bus_number` (`bus_number`),
  KEY `driver_id` (`driver_id`),
  KEY `bus_stop_id` (`bus_stop_id`),
  CONSTRAINT `buses_ibfk_1` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `buses_ibfk_2` FOREIGN KEY (`bus_stop_id`) REFERENCES `bus_stops` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `buses`
--

LOCK TABLES `buses` WRITE;
/*!40000 ALTER TABLE `buses` DISABLE KEYS */;
INSERT INTO `buses` VALUES (1,'KL-15-AB-1234',50,1,1,'active','AC'),(2,'KL-01-CD-5678',45,2,3,'active','Non-AC'),(3,'KL-07-EF-9012',55,NULL,5,'maintenance','Sleeper'),(4,'KL-05-GH-3456',40,6,7,'active','Seater'),(5,'KL-08-IJ-6789',50,5,9,'active','Sleeper'),(6,'KL-09-XY-1010',48,NULL,4,'maintenance','Non-AC');
/*!40000 ALTER TABLE `buses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `drivers`
--

DROP TABLE IF EXISTS `drivers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `drivers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `license_number` varchar(50) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `availability` enum('available','on_leave','on_trip') DEFAULT 'available',
  PRIMARY KEY (`id`),
  UNIQUE KEY `license_number` (`license_number`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `drivers`
--

LOCK TABLES `drivers` WRITE;
/*!40000 ALTER TABLE `drivers` DISABLE KEYS */;
INSERT INTO `drivers` VALUES (1,'Rajeev Menon','DL04201500001','9447000001','Trivandrum','available'),(2,'Suresh Kumar','DL05201800002','9447000002','Ernakulam','available'),(3,'Anitha Nair','DL03202200003','9447000003','Kozhikode','available'),(4,'Vijayan Pillai','DL06201900004','9447000004','Alappuzha','on_leave'),(5,'Latha Suresh','DL01202000005','9447000005','Palakkad','available'),(6,'Manoj Prabhakar','DL07202100006','9447000006','Thrissur','available');
/*!40000 ALTER TABLE `drivers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `passengers`
--

DROP TABLE IF EXISTS `passengers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `passengers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `passengers`
--

LOCK TABLES `passengers` WRITE;
/*!40000 ALTER TABLE `passengers` DISABLE KEYS */;
INSERT INTO `passengers` VALUES (1,'Aravind S','aravind@example.com','9447100001','Trivandrum'),(2,'Meera M','meera@example.com','9447100002','Kochi'),(3,'Santhosh P','santhosh@example.com','9447100003','Kozhikode'),(4,'Lakshmi V','lakshmi@example.com','9447100004','Alappuzha'),(5,'Vishnu R','vishnu@example.com','9447100005','Palakkad'),(6,'Anjali K','anjali@example.com','9447100006','Thrissur'),(7,'Ramesh P','ramesh@example.com','9447100007','Kannur'),(8,'Deepa S','deepa@example.com','9447100008','Malappuram'),(9,'Ajay N','ajay@example.com','9447100009','Kottayam'),(10,'Nithin R','nithin@example.com','9447100010','Ernakulam'),(11,'Priya V','priya@example.com','9447100011','Thrissur'),(12,'Rahul M','rahul@example.com','9447100012','Kollam'),(13,'Shalini P','shalini@example.com','9447100013','Trivandrum'),(14,'Vineeth K','vineeth@example.com','9447100014','Kozhikode'),(15,'Hemanth S','hemanth@example.com','9447100015','Palakkad'),(16,'Leena R','leena@example.com','9447100016','Alappuzha'),(17,'Manju N','manju@example.com','9447100017','Kannur'),(18,'Kiran P','kiran@example.com','9447100018','Thrissur'),(19,'Sowmya V','sowmya@example.com','9447100019','Ernakulam'),(20,'Ajith R','ajith@example.com','9447100020','Malappuram'),(21,'Nisha M','nisha@example.com','9447100021','Kottayam'),(22,'Vimal P','vimal@example.com','9447100022','Kollam'),(23,'Devika S','devika@example.com','9447100023','Trivandrum'),(24,'Arjun K','arjun@example.com','9447100024','Thrissur'),(25,'Fahad R','fahad@example.com','9447100025','Kochi');
/*!40000 ALTER TABLE `passengers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `routes`
--

DROP TABLE IF EXISTS `routes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `routes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `origin_bus_stop_id` int NOT NULL,
  `destination_bus_stop_id` int NOT NULL,
  `distance_km` decimal(6,2) NOT NULL,
  `duration_min` int DEFAULT NULL,
  `fare` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `origin_bus_stop_id` (`origin_bus_stop_id`),
  KEY `destination_bus_stop_id` (`destination_bus_stop_id`),
  CONSTRAINT `routes_ibfk_1` FOREIGN KEY (`origin_bus_stop_id`) REFERENCES `bus_stops` (`id`),
  CONSTRAINT `routes_ibfk_2` FOREIGN KEY (`destination_bus_stop_id`) REFERENCES `bus_stops` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `routes`
--

LOCK TABLES `routes` WRITE;
/*!40000 ALTER TABLE `routes` DISABLE KEYS */;
INSERT INTO `routes` VALUES (1,1,3,200.00,240,450.00),(2,3,5,170.00,200,380.00),(3,8,1,155.00,180,320.00),(4,7,4,130.00,150,280.00),(5,6,9,210.00,250,480.00),(6,1,2,65.50,90,250.00);
/*!40000 ALTER TABLE `routes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedules`
--

DROP TABLE IF EXISTS `schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bus_id` int NOT NULL,
  `route_id` int NOT NULL,
  `departure_time` datetime NOT NULL,
  `arrival_time` datetime NOT NULL,
  `driver_id` int DEFAULT NULL,
  `staff_id` int DEFAULT NULL,
  `status` enum('scheduled','cancelled') DEFAULT 'scheduled',
  PRIMARY KEY (`id`),
  KEY `bus_id` (`bus_id`),
  KEY `route_id` (`route_id`),
  KEY `driver_id` (`driver_id`),
  KEY `staff_id` (`staff_id`),
  CONSTRAINT `schedules_ibfk_1` FOREIGN KEY (`bus_id`) REFERENCES `buses` (`id`),
  CONSTRAINT `schedules_ibfk_2` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`),
  CONSTRAINT `schedules_ibfk_3` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`),
  CONSTRAINT `schedules_ibfk_4` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedules`
--

LOCK TABLES `schedules` WRITE;
/*!40000 ALTER TABLE `schedules` DISABLE KEYS */;
INSERT INTO `schedules` VALUES (1,1,1,'2025-10-13 08:00:00','2025-10-13 12:00:00',1,NULL,'scheduled'),(2,2,2,'2025-10-14 10:00:00','2025-10-14 13:20:00',2,NULL,'scheduled'),(3,5,3,'2025-10-15 14:00:00','2025-10-15 17:00:00',5,NULL,'scheduled'),(4,1,6,'2025-10-11 09:00:00','2025-10-11 10:30:00',1,NULL,'scheduled'),(5,2,2,'2025-10-10 11:00:00','2025-10-10 14:20:00',2,NULL,'scheduled'),(6,5,5,'2025-10-09 07:00:00','2025-10-09 11:10:00',5,NULL,'cancelled');
/*!40000 ALTER TABLE `schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS `staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `role` enum('admin','operator','conductor') DEFAULT 'operator',
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `salary` decimal(10,2) DEFAULT NULL,
  `date_joined` date NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff`
--

LOCK TABLES `staff` WRITE;
/*!40000 ALTER TABLE `staff` DISABLE KEYS */;
INSERT INTO `staff` VALUES (1,'Anil Kumar','admin','anil@ksrtc.com','9447010003','adminpass',50000.00,'2020-01-10','active'),(2,'Rekha Nair','operator','rekha@ksrtc.com','9447010002','hashed_pw2',30000.00,'2021-03-12','active'),(3,'Sajith R','conductor','sajith@ksrtc.com','9447010003','hashed_pw3',28000.00,'2021-05-15','active'),(4,'Vineetha P','operator','vineetha@ksrtc.com','9447010004','hashed_pw4',32000.00,'2022-02-20','active'),(5,'Manoj S','conductor','manoj@ksrtc.com','9447010005','hashed_pw5',29000.00,'2022-07-18','active');
/*!40000 ALTER TABLE `staff` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-12 18:30:10
