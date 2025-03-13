import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Link from 'next/link';

// Define types for our form data
interface TaskFormData {
  name: string;
  instance_type: string;
  model_provider: string;
  prompt: string;
  system_prompt: string;
  schedule: string;
  enabled: boolean;
}

export default function CreateTask() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TaskFormData>({
    name: '',
    instance_type: 'ubuntu',
    model_provider: 'openai',
    prompt: '',
    system_prompt: '',
    schedule: '',
    enabled: true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Prepare the data for API
      const apiData = {
        ...formData,
        schedule_type: formData.schedule.includes('*') ? 'cron' : 'interval',
        cron_expression: formData.schedule.includes('*') ? formData.schedule : undefined,
        interval_minutes: !formData.schedule.includes('*') && formData.schedule ? 
          parseInt(formData.schedule) : undefined
      };
      
      const response = await axios.post('http://localhost:8000/api/tasks', apiData);
      
      alert('Task created successfully!');
      router.push('/');
    } catch (err) {
      console.error('Error creating task:', err);
      alert('Failed to create task. Please check your inputs and try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#666' }}>
          &larr; Back to Dashboard
        </Link>
      </div>

      <h1 style={{ color: '#333', marginBottom: '20px' }}>Create New Task</h1>

      <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Task Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Instance Type *
          </label>
          <select
            name="instance_type"
            value={formData.instance_type}
            onChange={handleChange}
            required
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              backgroundColor: 'white',
              boxSizing: 'border-box'
            }}
          >
            <option value="ubuntu">Ubuntu</option>
            <option value="browser">Browser</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Model Provider *
          </label>
          <select
            name="model_provider"
            value={formData.model_provider}
            onChange={handleChange}
            required
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              backgroundColor: 'white',
              boxSizing: 'border-box'
            }}
          >
            <option value="openai">OpenAI (GPT-4o-2024-05-13)</option>
            <option value="anthropic">Anthropic (Claude-3-Opus)</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Prompt *
          </label>
          <textarea
            name="prompt"
            value={formData.prompt}
            onChange={handleChange}
            required
            rows={6}
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              fontFamily: 'inherit',
              boxSizing: 'border-box'
            }}
            placeholder="Enter the task instructions for the agent..."
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            System Prompt
          </label>
          <textarea
            name="system_prompt"
            value={formData.system_prompt}
            onChange={handleChange}
            rows={4}
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              fontFamily: 'inherit',
              boxSizing: 'border-box'
            }}
            placeholder="Optional: Override the default system prompt..."
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Schedule
          </label>
          <input
            type="text"
            name="schedule"
            value={formData.schedule}
            onChange={handleChange}
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
            placeholder="Cron expression (e.g., '*/30 * * * *') or interval in minutes (e.g., '60')"
          />
          <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
            Leave blank for manual execution only
          </small>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="enabled"
              checked={formData.enabled}
              onChange={handleCheckboxChange}
              style={{ marginRight: '10px' }}
            />
            <span>Enable task (will run on schedule if specified)</span>
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Link href="/">
            <button 
              type="button"
              style={{ 
                padding: '10px 16px', 
                backgroundColor: '#f5f5f5', 
                color: '#333', 
                border: '1px solid #ddd', 
                borderRadius: '4px', 
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              Cancel
            </button>
          </Link>
          <button 
            type="submit"
            disabled={loading}
            style={{ 
              padding: '10px 16px', 
              backgroundColor: '#4CAF50', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
}
