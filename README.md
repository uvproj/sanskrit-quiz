# Sanskrit Vocabulary Quiz

A modern, responsive web application for learning Sanskrit vocabulary with admin management features.

## Features

- **User Quiz Mode**: Take timed quizzes with instant feedback.
- **Admin Dashboard**: View all quiz sessions and user performance.
- **Question Management**: Add and manage quiz questions.
- **Responsive Design**: Works seamlessly on desktop and mobile.

## Tech Stack

- **Backend**: ASP.NET Core 8 (Minimal APIs)
- **Database**: SQLite
- **Frontend**: React 18
- **Styling**: Tailwind CSS

## Setup

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (v18+ recommended)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd SanskritQuiz.Api
   ```

2. Restore dependencies:
   ```bash
   dotnet restore
   ```

3. Run the application:
   ```bash
   dotnet run
   ```
   The API will be available at `http://localhost:5064`.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd SanskritQuiz.UI
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## Usage

### Playing the Quiz
1. Open [http://localhost:5173](http://localhost:5173) in your browser.
2. Enter your name and select a mode (Easy/Hard).
3. Click "Start Quiz".
4. Answer the questions within the time limit.
5. View your results at the end.

### Admin Access
1. Open [http://localhost:5173/admin/login](http://localhost:5173/admin/login).
2. Access the dashboard to view sessions or add new questions.
