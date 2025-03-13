from fastapi import FastAPI, HTTPException, Depends, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import os
import json
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger
from apscheduler.executors.pool import ThreadPoolExecutor
from dotenv import load_dotenv
from scrapybara import Scrapybara
from scrapybara.openai import OpenAI, UBUNTU_SYSTEM_PROMPT as OPENAI_UBUNTU_PROMPT, BROWSER_SYSTEM_PROMPT as OPENAI_BROWSER_PROMPT
from scrapybara.anthropic import Anthropic, UBUNTU_SYSTEM_PROMPT as ANTHROPIC_UBUNTU_PROMPT, BROWSER_SYSTEM_PROMPT as ANTHROPIC_BROWSER_PROMPT
from scrapybara.tools import BashTool, ComputerTool, EditTool

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("skybit.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("skybit")

# Initialize FastAPI app
app = FastAPI(
    title="Skybit API",
    description="API for managing Skybit agents and tasks",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure APScheduler
jobstores = {
    'default': SQLAlchemyJobStore(url='sqlite:///skybit_jobs.sqlite')
}
executors = {
    'default': ThreadPoolExecutor(20)
}
job_defaults = {
    'coalesce': False,
    'max_instances': 3
}

# Initialize scheduler
scheduler = BackgroundScheduler(
    jobstores=jobstores,
    executors=executors,
    job_defaults=job_defaults,
    timezone='UTC'
)

# Initialize Scrapybara client
SCRAPYBARA_API_KEY = os.getenv("SCRAPYBARA_API_KEY")
if not SCRAPYBARA_API_KEY:
    logger.warning("SCRAPYBARA_API_KEY environment variable not set")

scrapybara_client = None
if SCRAPYBARA_API_KEY:
    scrapybara_client = Scrapybara(api_key=SCRAPYBARA_API_KEY)

# Task registry to store task configurations
TASK_REGISTRY = {}

# Pydantic models
class ToolConfig(BaseModel):
    name: str
    enabled: bool = True

class TaskBase(BaseModel):
    name: str
    description: str
    prompt: str
    instance_type: str = "ubuntu"  # ubuntu or browser
    model_provider: str = "openai"  # openai or anthropic
    system_prompt: Optional[str] = None
    schedule_type: str = "interval"  # interval or cron
    interval_minutes: Optional[int] = 60
    cron_expression: Optional[str] = None
    tools: List[ToolConfig] = []
    enabled: bool = True
    schema: Optional[Dict[str, Any]] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    prompt: Optional[str] = None
    instance_type: Optional[str] = None
    model_provider: Optional[str] = None
    system_prompt: Optional[str] = None
    schedule_type: Optional[str] = None
    interval_minutes: Optional[int] = None
    cron_expression: Optional[str] = None
    tools: Optional[List[ToolConfig]] = None
    enabled: Optional[bool] = None
    schema: Optional[Dict[str, Any]] = None

class TaskResponse(TaskBase):
    id: str
    created_at: str
    updated_at: str
    last_run: Optional[str] = None
    last_result: Optional[Dict[str, Any]] = None
    last_error: Optional[Dict[str, Any]] = None
    next_run: Optional[str] = None

class TaskListResponse(BaseModel):
    tasks: List[TaskResponse]

class TaskRunResponse(BaseModel):
    task_id: str
    status: str
    message: str
    result: Optional[Dict[str, Any]] = None

class StepInfo(BaseModel):
    text: str
    timestamp: str
    tool_calls: Optional[List[Dict[str, Any]]] = None

# Helper functions
def load_task_registry():
    """Load task registry from disk"""
    try:
        if os.path.exists('task_registry.json'):
            with open('task_registry.json', 'r') as f:
                global TASK_REGISTRY
                TASK_REGISTRY = json.load(f)
                logger.info(f"Loaded {len(TASK_REGISTRY)} tasks from registry")
    except Exception as e:
        logger.error(f"Error loading task registry: {str(e)}")

def save_task_registry():
    """Save task registry to disk"""
    try:
        with open('task_registry.json', 'w') as f:
            json.dump(TASK_REGISTRY, f, indent=2)
        logger.info(f"Saved {len(TASK_REGISTRY)} tasks to registry")
    except Exception as e:
        logger.error(f"Error saving task registry: {str(e)}")

def get_next_run_time(task_id: str) -> Optional[str]:
    """Get the next run time for a task"""
    job = scheduler.get_job(task_id)
    if job and job.next_run_time:
        return job.next_run_time.isoformat()
    return None

def execute_task(task_id: str, task_config: Dict[str, Any]):
    """Execute a scheduled task using Scrapybara"""
    logger.info(f"Executing task: {task_id}")
    
    if not scrapybara_client:
        error_msg = "Scrapybara client not initialized. Check SCRAPYBARA_API_KEY."
        logger.error(error_msg)
        task_config['last_error'] = {
            'message': error_msg,
            'timestamp': datetime.utcnow().isoformat()
        }
        return {"status": "error", "message": error_msg}
    
    try:
        # Extract task configuration
        instance_type = task_config.get('instance_type', 'ubuntu')
        model_provider = task_config.get('model_provider', 'openai')
        prompt = task_config.get('prompt', '')
        system_prompt = task_config.get('system_prompt')
        schema = task_config.get('schema')
        
        # Start the appropriate instance
        if instance_type == 'ubuntu':
            instance = scrapybara_client.start_ubuntu(timeout_hours=1)
            if model_provider == 'openai':
                default_system_prompt = OPENAI_UBUNTU_PROMPT
            else:
                default_system_prompt = ANTHROPIC_UBUNTU_PROMPT
            tools = []
            
            # Add tools based on configuration
            for tool_config in task_config.get('tools', []):
                if tool_config.get('enabled', True):
                    if tool_config['name'] == 'bash':
                        tools.append(BashTool(instance))
                    elif tool_config['name'] == 'computer':
                        tools.append(ComputerTool(instance))
                    elif tool_config['name'] == 'edit':
                        tools.append(EditTool(instance))
            
            # Ensure at least computer tool is available
            if not tools:
                tools = [ComputerTool(instance)]
                
        elif instance_type == 'browser':
            instance = scrapybara_client.start_browser(timeout_hours=1)
            if model_provider == 'openai':
                default_system_prompt = OPENAI_BROWSER_PROMPT
            else:
                default_system_prompt = ANTHROPIC_BROWSER_PROMPT
            tools = [ComputerTool(instance)]
        else:
            logger.error(f"Invalid instance type: {instance_type}")
            return {"status": "error", "message": f"Invalid instance type: {instance_type}"}
        
        # Use provided system prompt or default
        system = system_prompt if system_prompt else default_system_prompt
        
        # Select the model
        if model_provider == 'openai':
            model = OpenAI()
        elif model_provider == 'anthropic':
            model = Anthropic()
        else:
            logger.error(f"Invalid model provider: {model_provider}")
            return {"status": "error", "message": f"Invalid model provider: {model_provider}"}
        
        # Execute the task
        try:
            # Define a callback for handling steps
            def handle_step(step):
                logger.info(f"Task {task_id} step: {step.text[:100]}...")
                
                # Store step information in task results
                if 'steps' not in task_config:
                    task_config['steps'] = []
                
                step_info = {
                    'text': step.text,
                    'timestamp': datetime.utcnow().isoformat(),
                }
                
                if step.tool_calls:
                    step_info['tool_calls'] = []
                    for call in step.tool_calls:
                        step_info['tool_calls'].append({
                            'tool_name': call.tool_name,
                            'args': call.args
                        })
                
                task_config['steps'].append(step_info)
            
            # Execute the task with Scrapybara
            response = scrapybara_client.act(
                model=model,
                tools=tools,
                system=system,
                prompt=prompt,
                schema=schema,
                on_step=handle_step
            )
            
            # Store the results
            task_config['last_run'] = datetime.utcnow().isoformat()
            task_config['last_result'] = {
                'text': response.text,
                'timestamp': datetime.utcnow().isoformat(),
            }
            
            if schema and hasattr(response, 'output'):
                try:
                    task_config['last_result']['output'] = response.output.dict()
                except:
                    task_config['last_result']['output'] = str(response.output)
            
            # Update the task registry
            TASK_REGISTRY[task_id] = task_config
            
            # Save task registry to disk
            save_task_registry()
            
            logger.info(f"Task {task_id} completed successfully")
            return {"status": "success", "task_id": task_id, "result": task_config['last_result']}
            
        except Exception as e:
            logger.error(f"Error executing task {task_id}: {str(e)}")
            task_config['last_error'] = {
                'message': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }
            return {"status": "error", "message": str(e)}
        
        finally:
            # Always stop the instance
            try:
                instance.stop()
                logger.info(f"Instance for task {task_id} stopped")
            except Exception as e:
                logger.error(f"Error stopping instance for task {task_id}: {str(e)}")
    
    except Exception as e:
        logger.error(f"Error in execute_task for {task_id}: {str(e)}")
        return {"status": "error", "message": str(e)}

def schedule_task(task_id: str, task_config: Dict[str, Any]):
    """Schedule a task with APScheduler"""
    try:
        # Extract scheduling information
        schedule_type = task_config.get('schedule_type', 'interval')
        
        if schedule_type == 'interval':
            # Schedule as interval (every X minutes/hours)
            interval_minutes = task_config.get('interval_minutes', 60)
            trigger = IntervalTrigger(minutes=interval_minutes)
            
        elif schedule_type == 'cron':
            # Schedule as cron expression
            cron_expression = task_config.get('cron_expression', '0 * * * *')
            # Parse cron expression into components
            minute, hour, day, month, day_of_week = cron_expression.split()
            trigger = CronTrigger(
                minute=minute,
                hour=hour,
                day=day,
                month=month,
                day_of_week=day_of_week
            )
        else:
            logger.error(f"Invalid schedule type: {schedule_type}")
            return False
        
        # Check if job already exists
        if scheduler.get_job(task_id):
            # Update existing job
            scheduler.reschedule_job(
                task_id,
                trigger=trigger
            )
            logger.info(f"Rescheduled task: {task_id}")
        else:
            # Add new job
            scheduler.add_job(
                execute_task,
                trigger=trigger,
                id=task_id,
                args=[task_id, task_config],
                replace_existing=True
            )
            logger.info(f"Scheduled new task: {task_id}")
        
        return True
    
    except Exception as e:
        logger.error(f"Error scheduling task {task_id}: {str(e)}")
        return False

# API Routes
@app.get("/", tags=["Root"])
async def read_root():
    """Root endpoint"""
    return {
        "name": "Skybit API",
        "version": "1.0.0",
        "description": "API for managing Skybit agents and tasks"
    }

@app.get("/api/tasks", response_model=TaskListResponse, tags=["Tasks"])
async def get_tasks():
    """Get all tasks"""
    tasks = []
    for task_id, task_config in TASK_REGISTRY.items():
        task_config['id'] = task_id
        task_config['next_run'] = get_next_run_time(task_id)
        tasks.append(task_config)
    
    return {"tasks": tasks}

@app.get("/api/tasks/{task_id}", response_model=TaskResponse, tags=["Tasks"])
async def get_task(task_id: str):
    """Get a specific task"""
    if task_id not in TASK_REGISTRY:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
    
    task_config = TASK_REGISTRY[task_id].copy()
    task_config['id'] = task_id
    task_config['next_run'] = get_next_run_time(task_id)
    
    return task_config

@app.post("/api/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED, tags=["Tasks"])
async def create_task(task: TaskCreate):
    """Create a new task"""
    try:
        # Generate task ID from name
        task_id = task.name.lower().replace(" ", "_")
        
        # Check if task already exists
        if task_id in TASK_REGISTRY:
            raise HTTPException(
                status_code=409, 
                detail=f"Task with ID {task_id} already exists"
            )
        
        # Create task configuration
        task_config = task.dict()
        task_config['created_at'] = datetime.utcnow().isoformat()
        task_config['updated_at'] = datetime.utcnow().isoformat()
        
        # Add task to registry
        TASK_REGISTRY[task_id] = task_config
        
        # Schedule task if enabled
        if task_config['enabled']:
            success = schedule_task(task_id, task_config)
            if not success:
                raise HTTPException(
                    status_code=500, 
                    detail=f"Failed to schedule task {task_id}"
                )
        
        # Save task registry
        save_task_registry()
        
        # Return response
        response = task_config.copy()
        response['id'] = task_id
        response['next_run'] = get_next_run_time(task_id)
        
        return response
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating task: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error creating task: {str(e)}"
        )

@app.put("/api/tasks/{task_id}", response_model=TaskResponse, tags=["Tasks"])
async def update_task(task_id: str, task: TaskUpdate):
    """Update an existing task"""
    try:
        if task_id not in TASK_REGISTRY:
            raise HTTPException(
                status_code=404, 
                detail=f"Task {task_id} not found"
            )
        
        task_config = TASK_REGISTRY[task_id]
        
        # Update task configuration
        update_data = task.dict(exclude_unset=True)
        for key, value in update_data.items():
            if key not in ['created_at', 'last_run', 'last_result', 'last_error', 'steps']:
                task_config[key] = value
        
        task_config['updated_at'] = datetime.utcnow().isoformat()
        
        # Reschedule task if enabled
        if task_config.get('enabled', True):
            success = schedule_task(task_id, task_config)
            if not success:
                raise HTTPException(
                    status_code=500, 
                    detail=f"Failed to reschedule task {task_id}"
                )
        else:
            # Remove job if disabled
            if scheduler.get_job(task_id):
                scheduler.remove_job(task_id)
                logger.info(f"Removed scheduled job for task: {task_id}")
        
        # Save task registry
        save_task_registry()
        
        # Return response
        response = task_config.copy()
        response['id'] = task_id
        response['next_run'] = get_next_run_time(task_id)
        
        return response
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating task {task_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error updating task {task_id}: {str(e)}"
        )

@app.delete("/api/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Tasks"])
async def delete_task(task_id: str):
    """Delete a task"""
    try:
        if task_id not in TASK_REGISTRY:
            raise HTTPException(
                status_code=404, 
                detail=f"Task {task_id} not found"
            )
        
        # Remove job from scheduler
        if scheduler.get_job(task_id):
            scheduler.remove_job(task_id)
            logger.info(f"Removed scheduled job for task: {task_id}")
        
        # Remove task from registry
        del TASK_REGISTRY[task_id]
        
        # Save task registry
        save_task_registry()
        
        return None
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting task {task_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting task {task_id}: {str(e)}"
        )

@app.post("/api/tasks/{task_id}/run", response_model=TaskRunResponse, tags=["Tasks"])
async def run_task(task_id: str, background_tasks: BackgroundTasks):
    """Run a task immediately"""
    try:
        if task_id not in TASK_REGISTRY:
            raise HTTPException(
                status_code=404, 
                detail=f"Task {task_id} not found"
            )
        
        task_config = TASK_REGISTRY[task_id]
        
        # Execute task in background
        background_tasks.add_task(execute_task, task_id, task_config)
        
        return {
            "task_id": task_id,
            "status": "success",
            "message": f"Task {task_id} execution started"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error running task {task_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error running task {task_id}: {str(e)}"
        )

@app.post("/api/tasks/{task_id}/enable", response_model=TaskResponse, tags=["Tasks"])
async def enable_task(task_id: str):
    """Enable a task"""
    try:
        if task_id not in TASK_REGISTRY:
            raise HTTPException(
                status_code=404, 
                detail=f"Task {task_id} not found"
            )
        
        task_config = TASK_REGISTRY[task_id]
        task_config['enabled'] = True
        task_config['updated_at'] = datetime.utcnow().isoformat()
        
        # Schedule task
        success = schedule_task(task_id, task_config)
        if not success:
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to schedule task {task_id}"
            )
        
        # Save task registry
        save_task_registry()
        
        # Return response
        response = task_config.copy()
        response['id'] = task_id
        response['next_run'] = get_next_run_time(task_id)
        
        return response
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error enabling task {task_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error enabling task {task_id}: {str(e)}"
        )

@app.post("/api/tasks/{task_id}/disable", response_model=TaskResponse, tags=["Tasks"])
async def disable_task(task_id: str):
    """Disable a task"""
    try:
        if task_id not in TASK_REGISTRY:
            raise HTTPException(
                status_code=404, 
                detail=f"Task {task_id} not found"
            )
        
        task_config = TASK_REGISTRY[task_id]
        task_config['enabled'] = False
        task_config['updated_at'] = datetime.utcnow().isoformat()
        
        # Remove job from scheduler
        if scheduler.get_job(task_id):
            scheduler.remove_job(task_id)
            logger.info(f"Removed scheduled job for task: {task_id}")
        
        # Save task registry
        save_task_registry()
        
        # Return response
        response = task_config.copy()
        response['id'] = task_id
        response['next_run'] = None
        
        return response
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error disabling task {task_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error disabling task {task_id}: {str(e)}"
        )

@app.get("/api/tasks/{task_id}/steps", response_model=List[StepInfo], tags=["Tasks"])
async def get_task_steps(task_id: str):
    """Get steps for a specific task"""
    if task_id not in TASK_REGISTRY:
        raise HTTPException(
            status_code=404, 
            detail=f"Task {task_id} not found"
        )
    
    task_config = TASK_REGISTRY[task_id]
    steps = task_config.get('steps', [])
    
    return steps

# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Initialize the application on startup"""
    # Load task registry
    load_task_registry()
    
    # Schedule all enabled tasks
    for task_id, task_config in TASK_REGISTRY.items():
        if task_config.get('enabled', True):
            schedule_task(task_id, task_config)
    
    # Start the scheduler
    if not scheduler.running:
        scheduler.start()
        logger.info("Scheduler started")

@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown the application"""
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Scheduler shutdown")

# Main entry point
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
