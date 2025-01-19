-- Create the database
CREATE DATABASE IF NOT EXISTS drms_database;

USE drms_database;

-- --------------------------------------------------------
-- Table structure for `family`
CREATE TABLE
    `family` (
        `id` INT (11) NOT NULL AUTO_INCREMENT,
        `representative` VARCHAR(255) NOT NULL,
        `age` TINYINT UNSIGNED DEFAULT NULL,
        `gender` ENUM ('Male', 'Female', 'Other') NOT NULL,
        `birthDate` DATE DEFAULT NULL,
        `status` ENUM ('Single', 'Married', 'Widowed', 'Divorced') NOT NULL,
        `purok` VARCHAR(255) DEFAULT NULL, -- Community area
        `phone` VARCHAR(15) DEFAULT NULL, -- Optional phone number
        `residencyType` ENUM ('Boarder', 'Resident') NOT NULL DEFAULT 'Resident',
        `ownerName` VARCHAR(255) DEFAULT NULL,
        PRIMARY KEY (`id`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for `disaster`
CREATE TABLE
    `disaster` (
        `id` INT (11) NOT NULL AUTO_INCREMENT,
        `disasterType` VARCHAR(255) NOT NULL, -- Type of disaster
        `disasterDate` DATE DEFAULT NULL, -- Date of the disaster
        PRIMARY KEY (`id`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for `family_member`
CREATE TABLE
    `family_member` (
        `id` INT (11) NOT NULL AUTO_INCREMENT,
        `familyId` INT (11) NOT NULL,
        `name` VARCHAR(255) NOT NULL,
        `age` TINYINT UNSIGNED DEFAULT NULL, -- Age of the family member
        `gender` ENUM ('Male', 'Female', 'Other') NOT NULL, -- Gender of the family member
        `status` ENUM ('Single', 'Married', 'Widowed', 'Divorced') NOT NULL, -- Marital status
        `image` VARCHAR(255) DEFAULT NULL, -- URL or path to image
        `birthDate` DATE DEFAULT NULL, -- Date of birth for accurate age calculation
        `phone` VARCHAR(15) DEFAULT NULL, -- Optional phone number
        `residencyType` ENUM ('Boarder', 'Resident') NOT NULL DEFAULT 'Resident',
        `ownerName` VARCHAR(255) DEFAULT NULL,
        PRIMARY KEY (`id`),
        KEY `family_member_fk` (`familyId`),
        CONSTRAINT `family_member_fk` FOREIGN KEY (`familyId`) REFERENCES `family` (`id`) ON DELETE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for `affected_family`
CREATE TABLE
    `affected_family` (
        `id` INT (11) NOT NULL AUTO_INCREMENT,
        `familyId` INT (11) NOT NULL,
        `disasterId` INT (11) NOT NULL,
        PRIMARY KEY (`id`),
        KEY `family_fk` (`familyId`),
        KEY `disaster_fk` (`disasterId`),
        CONSTRAINT `family_fk` FOREIGN KEY (`familyId`) REFERENCES `family` (`id`) ON DELETE CASCADE,
        CONSTRAINT `disaster_fk` FOREIGN KEY (`disasterId`) REFERENCES `disaster` (`id`) ON DELETE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for `users`
CREATE TABLE
    `users` (
        `id` INT (11) NOT NULL AUTO_INCREMENT,
        `username` VARCHAR(255) NOT NULL,
        `password` VARCHAR(255) NOT NULL,
        `name` VARCHAR(255) NOT NULL,
        `profile_picture` VARCHAR(255) DEFAULT NULL,
        `role` ENUM ('admin', 'user') NOT NULL DEFAULT 'user',
        PRIMARY KEY (`id`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for `user_activity_log`
CREATE TABLE
    `user_activity_log` (
        `id` INT (11) NOT NULL AUTO_INCREMENT,
        `user_id` INT (11) NOT NULL,
        `activity_type` VARCHAR(50) NOT NULL,
        `description` TEXT NOT NULL,
        `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`),
        KEY `user_activity_fk` (`user_id`),
        CONSTRAINT `user_activity_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

COMMIT;