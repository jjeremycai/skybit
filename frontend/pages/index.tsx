import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import Link from 'next/link';

// Define types for our data
interface Task {
  id: string;
  name: string;
  instance_type: string;
  model_provider: string;
  enabled: boolean;
  last_run?: string;
  last_error?: any;
  prompt: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch tasks on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/api/tasks');
        setTasks(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks. Please try again.');
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Count stats
  const totalTasks = tasks.length;
  const activeTasks = tasks.filter(task => task.enabled).length;
  const recentRuns = tasks.filter(task => task.last_run).length;

  // Handle run task
  const handleRunTask = async (taskId: string) => {
    try {
      await axios.post(`http://localhost:8000/api/tasks/${taskId}/run`);
      alert('Task started successfully!');
      
      // Refresh task list
      const response = await axios.get('http://localhost:8000/api/tasks');
      setTasks(response.data);
    } catch (err) {
      console.error('Error running task:', err);
      alert('Failed to run task. Please try again.');
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <header style={{ marginBottom: '20px' }}>
        <h1 style={{ color: '#333' }}>Skybit Dashboard</h1>
        <p>Manage your Computer Use Agents (CUA) tasks</p>
      </header>

      {/* Stats Cards */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={{ flex: 1, padding: '20px', backgroundColor: '#f0f9ff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Total Tasks</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{totalTasks}</p>
        </div>
        <div style={{ flex: 1, padding: '20px', backgroundColor: '#f0fff4', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Active Tasks</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{activeTasks}</p>
        </div>
        <div style={{ flex: 1, padding: '20px', backgroundColor: '#fff0f6', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Recent Executions</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{recentRuns}</p>
        </div>
      </div>

      {/* Actions */}
      <div style={{ marginBottom: '20px' }}>
        <Link href="/tasks/new">
          <button style={{ 
            padding: '10px 16px', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontSize: '16px'
          }}>
            Create New Task
          </button>
        </Link>
      </div>

      {/* Tasks Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <h2 style={{ padding: '20px', borderBottom: '1px solid #eee', margin: 0 }}>Tasks</h2>
        
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading tasks...</div>
        ) : error ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>{error}</div>
        ) : tasks.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>No tasks found. Create your first task!</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Name</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Instance Type</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Model</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Status</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Last Run</th>
                <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px 15px' }}>
                    <Link href={`/tasks/${task.id}`} style={{ color: '#0066cc', textDecoration: 'none' }}>
                      {task.name}
                    </Link>
                  </td>
                  <td style={{ padding: '12px 15px' }}>{task.instance_type}</td>
                  <td style={{ padding: '12px 15px' }}>{task.model_provider}</td>
                  <td style={{ padding: '12px 15px' }}>
                    <span style={{ 
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '14px',
                      backgroundColor: task.enabled ? '#e6f7e6' : '#f7e6e6',
                      color: task.enabled ? '#2e7d32' : '#c62828'
                    }}>
                      {task.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 15px' }}>
                    {task.last_run ? format(new Date(task.last_run), 'MMM d, yyyy HH:mm') : 'Never'}
                  </td>
                  <td style={{ padding: '12px 15px' }}>
                    <button 
                      onClick={() => handleRunTask(task.id)}
                      style={{ 
                        padding: '6px 12px', 
                        backgroundColor: '#2196F3', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: 'pointer',
                        marginRight: '8px'
                      }}
                    >
                      Run Now
                    </button>
                    <Link href={`/tasks/${task.id}/edit`}>
                      <button style={{ 
                        padding: '6px 12px', 
                        backgroundColor: '#FFC107', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: 'pointer'
                      }}>
                        Edit
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
