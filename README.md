# Disaster Risk Management System

## Overview
The **Barangay Disaster Risk Management System** is a simple yet efficient web application designed for barangay use. It allows barangay officials to record disaster incidents and maintain a detailed database of affected families. This system helps in quick response planning and resource allocation for local communities.

## Features
- **Incident Recording:**
  - Log disaster incidents within the barangay (e.g., typhoons, floods, fires).
  - Include details such as disaster type, date and location.

- **Family Tracking:**
  - Record and manage information about affected families.
  - Store details such as family name, number of members and address.

- **Reports:**
  - Generate printable reports of incidents and affected families for barangay meetings or relief coordination.

## Technologies Used
- **Frontend:** React.js with Material-UI for a simple and intuitive user interface.
- **Backend:** Node.js with Express.js for API handling.
- **Database:** MySQL (using XAMPP) for structured data storage.

## Installation

### Prerequisites
1. Install [XAMPP](https://www.apachefriends.org/index.html) and set up MySQL.
2. Ensure Node.js and npm are installed on your system.

### Steps

1. Clone the repository:
   ```bash
   git clone git@github.com:Adrian-Suson/DRMsystem.git
   ```

2. Navigate to the project directory:
   ```bash
   cd DRMsystem
   ```

3. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```

4. Install frontend dependencies:
   ```bash
   cd client
   npm install
   ```

5. Configure MySQL:
   - Start XAMPP and enable **Apache** and **MySQL**.
   - Import the provided `drms_database.sql` file into your database.

6. Configure environment variables:
   - Create a `.env` file in the `backend` directory.
   - Add the following:
     ```env
     Port=7777
     HOST='localhost'
     USER='root'
     PASSWORD=''
     DATABASE='drms_database'
     ```

7. Start the application:
   - Backend:
     ```bash
     cd server
     npm start
     ```
   - Frontend:
     ```bash
     cd client
     npm start
     ```

## Usage
1. Log in as a barangay official.
2. Navigate to the dashboard to:
   - Record new disaster incidents.
   - Add, update, or view details of affected families.
3. Generate reports for barangay disaster management meetings.

## Contributing
We welcome contributions to improve this project! Follow these steps:

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add your message here"
   ```
4. Push to the branch:
   ```bash
   git push origin feature-name
   ```
5. Submit a pull request.


## Acknowledgments
- [React.js](https://reactjs.org/)
- [Material-UI](https://mui.com/)
- [Node.js](https://nodejs.org/)
- [XAMPP](https://www.apachefriends.org/)
