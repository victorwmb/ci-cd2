USE ynov_ci;

CREATE TABLE IF NOT EXISTS utilisateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    birthDate DATE,
    city VARCHAR(100),
    postalCode VARCHAR(20),
    password VARCHAR(255),
    is_admin BOOLEAN DEFAULT FALSE
);