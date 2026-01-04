# WELCOME TO COFFEE BOT ☕

---

# CoffeeBot ☕

An AI-Powered Coffee Recommendation Web Application

## Overview

CoffeeBot is a web-based AI coffee recommendation system designed to provide personalised coffee suggestions based on user preferences. The system combines a modern front-end interface with a Python back-end and integrates AI logic to simulate an intelligent coffee assistant. Users can sign up, log in, manage their profiles, and receive tailored coffee recommendations through an interactive dashboard.

The project demonstrates the integration of web technologies, user authentication, AI-driven logic, and clean UI/UX design in a full-stack application.

---

## Key Features

- User authentication (Sign-up, Login, Logout)
- Personalised dashboard with welcome message
- AI-based coffee recommendation logic
- User profile editing and account deletion
- Dark mode support
- Local user session handling
- Python back-end API support

---

## Technology Stack

### Front-End

- HTML5
- CSS3
- JavaScript (ES Modules)

### Back-End

- Python
- Flask (via `server.py`)

### Authentication & Data Handling

- Firebase Authentication
- Firebase Firestore
- LocalStorage (client-side caching)

---

## Project Structure

```
CoffeeBot/
│
├── css/                  # Styling and themes (including dark mode)
├── dashboardJs/          # Dashboard logic
├── loginJs/              # Login functionality
├── signupJs/             # Sign-up functionality
├── firebase/             # Firebase configuration and helpers
│
├── index.html            # Landing page
├── coffeeSignup.html     # User registration page
├── dashboard.html        # User dashboard
├── editUserInfo.html     # Edit user information
│
├── server.py              # Python backend server
├── requirements.txt      # Python dependencies
├── .gitignore             # Git ignore rules
└── README.md              # Project documentation
```

---

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/syamxm/CoffeeBot.git
cd CoffeeBot
```

### 2. Set Up Python Environment

Ensure Python 3.9+ is installed.

```bash
pip install -r requirements.txt
```

### 3. Configure Firebase

- Create a Firebase project
- Enable Authentication (Email/Password)
- Enable Firestore Database
- Replace Firebase configuration values in the `firebase/` directory

### 4. put 3 separate API Gemini keys in a .env file. The variable should be called

- GOOGLE_API_KEY_1
- GOOGLE_API_KEY_2
- GOOGLE_API_KEY_3

### 5. Run the Backend Server

```bash
python server.py
```

### 6. Launch the Front-End (Use Live Server extension in VS Code)

Click the Go Live button on the bottom right of the VS Code window.Then, open `index.html` in a web browser or serve it using a local development server. (Ensure the localhost URL is 127.0.0.1:5500)

---

## Usage Flow

1. User registers via the sign-up page
2. User logs in using authenticated credentials
3. Dashboard displays a personalised welcome message
4. User interacts with CoffeeBot to receive coffee recommendations
5. User may edit profile details or delete the account
6. Dark mode can be toggled for improved usability

---

## Contributors

- **Ahmad Syamim bin Mohd Nizam**
- **Mohamad Hateem bin Nazamid**
- **Razfan Syabil**

---

## License

This project is developed for academic and learning purposes. Redistribution or commercial use is not permitted without author permission.

---
