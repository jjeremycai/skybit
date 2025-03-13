# Skybit

Skybit is a platform for deploying and managing Computer Use Agents (CUA) to run recurring tasks. It leverages Scrapybara's infrastructure to execute tasks using either GPT-4o or Claude models.

## Features

- **Agent Management**: Deploy and manage agents for various tasks
- **Task Scheduling**: Schedule recurring tasks (interval or cron-based)
- **Model Selection**: Choose between GPT-4o (2024-05-13) or Claude-3-Opus models
- **Instance Types**: Support for Ubuntu and Browser instances
- **Simple Dashboard**: Clean, easy-to-navigate UI for monitoring and controlling agents
- **Task Execution**: Run tasks on demand or on schedule
- **Detailed Monitoring**: View task execution results and errors

## Project Structure

```
skybit/
├── backend/              # FastAPI backend
│   ├── main.py           # Main application file
│   └── requirements.txt  # Python dependencies
├── frontend/             # Next.js frontend with simple React components
│   ├── pages/            # Next.js pages
│   └── package.json      # JavaScript dependencies
└── README.md             # Project documentation
```

## Backend Setup

1. Install dependencies:

```bash
cd backend
pip install -r requirements.txt
```

2. Set environment variables:

```bash
# Create a .env file in the backend directory
echo "SCRAPYBARA_API_KEY=your_api_key_here" > .env
```

3. Run the backend:

```bash
cd backend
uvicorn main:app --reload
```

## Frontend Setup

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Run the frontend development server:

```bash
cd frontend
npm run dev
```

3. Access the dashboard at http://localhost:3000

## Usage

1. Create a new task by clicking "Create New Task" on the dashboard
2. Fill in the task details including name, instance type, model provider, and prompt
3. Set a schedule if you want the task to run automatically
4. View task details and results by clicking on a task name
5. Run tasks on demand using the "Run Now" button

## Deployment

This project is designed to be deployed to GitHub and Vercel:

1. Push the project to GitHub
2. Connect the repository to Vercel for automatic deployments
3. Set up environment variables in Vercel

## API Endpoints

- `GET /api/tasks`: Get all tasks
- `GET /api/tasks/{task_id}`: Get a specific task
- `POST /api/tasks`: Create a new task
- `PUT /api/tasks/{task_id}`: Update an existing task
- `DELETE /api/tasks/{task_id}`: Delete a task
- `POST /api/tasks/{task_id}/run`: Run a task immediately
- `POST /api/tasks/{task_id}/enable`: Enable a task
- `POST /api/tasks/{task_id}/disable`: Disable a task
- `GET /api/tasks/{task_id}/steps`: Get steps for a specific task

## License

MIT
