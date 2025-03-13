# Skybit

Skybit is a platform for deploying and managing Computer Use Agents (CUA) to run recurring tasks. It leverages Scrapybara's infrastructure to execute tasks using either OpenAI CUA or Anthropic 3.7 models.

## Features

- **Agent Management**: Deploy and manage agents for various tasks
- **Task Scheduling**: Schedule recurring tasks (interval or cron-based)
- **Model Selection**: Choose between OpenAI CUA or Anthropic 3.7 models
- **Instance Types**: Support for Ubuntu and Browser instances
- **Tool Integration**: Use BashTool, ComputerTool, and EditTool
- **Structured Output**: Define schemas for structured data extraction
- **Dashboard**: Modern UI for monitoring and controlling agents

## Project Structure

```
skybit/
├── backend/              # FastAPI backend
│   ├── main.py           # Main application file
│   └── requirements.txt  # Python dependencies
├── frontend/             # Next.js frontend with shadcn UI
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
uvicorn main:app --reload
```

## Frontend Setup

The frontend will be implemented using Next.js with shadcn UI components for a modern dashboard interface.

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
