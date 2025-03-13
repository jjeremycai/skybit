import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { format } from 'date-fns';

// Define types for our data
interface Task {
  id: string;
  name: string;
  instance_type: string;
  model_provider: string;
  enabled: boolean;
  last_run?: string;
  last_error?: any;
  last_result?: any;
  prompt: string;
  system_prompt?: string;
  schedule?: string;
  created_at?: string;
  updated_at?: string;
}

export default function TaskDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTask = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8000/api/tasks/${id}`);
        setTask(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching task:', err);
        setError('Failed to load task details. Please try again.');
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const handleRunTask = async () => {
    if (!id) return;
    
    try {
      await axios.post(`http://localhost:8000/api/tasks/${id}/run`);
      alert('Task started successfully!');
      
      // Refresh task data
      const response = await axios.get(`http://localhost:8000/api/tasks/${id}`);
      setTask(response.data);
    } catch (err) {
      console.error('Error running task:', err);
      alert('Failed to run task. Please try again.');
    }
  };

  const handleDeleteTask = async () => {
    if (!id) return;
    
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`http://localhost:8000/api/tasks/${id}`);
        alert('Task deleted successfully!');
        router.push('/');
      } catch (err) {
        console.error('Error deleting task:', err);
        alert('Failed to delete task. Please try again.');
      }
    }
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading task details...</div>;
  if (error) return <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>{error}</div>;
  if (!task) return <div style={{ padding: '20px', textAlign: 'center' }}>Task not found</div>;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#666' }}>
          &larr; Back to Dashboard
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#333', margin: 0 }}>{task.name}</h1>
        <div>
          <button 
            onClick={handleRunTask}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#2196F3', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Run Now
          </button>
          <Link href={`/tasks/${id}/edit`}>
            <button style={{ 
              padding: '8px 16px', 
              backgroundColor: '#FFC107', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              marginRight: '10px'
            }}>
              Edit
            </button>
          </Link>
          <button 
            onClick={handleDeleteTask}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#F44336', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer'
            }}
          >
            Delete
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginTop: 0 }}>Task Details</h2>
          <table style={{ width: '100%' }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px 0', fontWeight: 'bold' }}>ID:</td>
                <td style={{ padding: '8px 0' }}>{task.id}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', fontWeight: 'bold' }}>Instance Type:</td>
                <td style={{ padding: '8px 0', textTransform: 'capitalize' }}>{task.instance_type}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', fontWeight: 'bold' }}>Model Provider:</td>
                <td style={{ padding: '8px 0', textTransform: 'capitalize' }}>{task.model_provider}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', fontWeight: 'bold' }}>Status:</td>
                <td style={{ padding: '8px 0' }}>
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
              </tr>
              <tr>
                <td style={{ padding: '8px 0', fontWeight: 'bold' }}>Schedule:</td>
                <td style={{ padding: '8px 0' }}>{task.schedule || 'Not scheduled'}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', fontWeight: 'bold' }}>Created:</td>
                <td style={{ padding: '8px 0' }}>{task.created_at ? format(new Date(task.created_at), 'MMM d, yyyy HH:mm') : 'Unknown'}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', fontWeight: 'bold' }}>Last Updated:</td>
                <td style={{ padding: '8px 0' }}>{task.updated_at ? format(new Date(task.updated_at), 'MMM d, yyyy HH:mm') : 'Unknown'}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 0', fontWeight: 'bold' }}>Last Run:</td>
                <td style={{ padding: '8px 0' }}>{task.last_run ? format(new Date(task.last_run), 'MMM d, yyyy HH:mm') : 'Never'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginTop: 0 }}>Prompt</h2>
          <div style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '4px',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            maxHeight: '200px',
            overflow: 'auto'
          }}>
            {task.prompt}
          </div>
          
          {task.system_prompt && (
            <>
              <h3>System Prompt</h3>
              <div style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '15px', 
                borderRadius: '4px',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                maxHeight: '200px',
                overflow: 'auto'
              }}>
                {task.system_prompt}
              </div>
            </>
          )}
        </div>
      </div>

      {task.last_result && (
        <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
          <h2 style={{ marginTop: 0 }}>Last Result</h2>
          <div style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '4px',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            maxHeight: '300px',
            overflow: 'auto'
          }}>
            {typeof task.last_result === 'object' 
              ? JSON.stringify(task.last_result, null, 2) 
              : task.last_result}
          </div>
        </div>
      )}

      {task.last_error && (
        <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginTop: 0, color: '#c62828' }}>Last Error</h2>
          <div style={{ 
            backgroundColor: '#fff8f8', 
            padding: '15px', 
            borderRadius: '4px',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            maxHeight: '300px',
            overflow: 'auto',
            color: '#c62828'
          }}>
            {typeof task.last_error === 'object' 
              ? JSON.stringify(task.last_error, null, 2) 
              : task.last_error}
          </div>
        </div>
      )}
    </div>
  );
}
