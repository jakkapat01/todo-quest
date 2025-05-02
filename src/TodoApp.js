import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Check, Plus, Save } from 'lucide-react';

// Sound effects
const playSound = (type) => {
  const sounds = {
    complete: new Audio('data:audio/wav;base64,UklGRl4TAABXQVZFZm10IBAAAAABAAEARKwAAESsAAABAAgAZGF0YToTAACAgICAgICAgICAgICAgICAgICAgICAgIBVk4o2Chsw1eHw8O/lzCAMFzJwmqioqKiomHExGxAh1e/w8PCvVQoLGy9ssqioqKiol3IzGxIjOT4+PjkxJQgQQLGvr6+vr69pOp4RakUXFxcXRWcRoXl/f39/f3+KTyoHT5S5ubm5ubmVTGkHOFgcHBwcHEgzDEGiuLi4uLi4m18RaH+EhISEhISEeRcJZ4ieYjw8PDxiUIlcSkpKSkpKSrIwOTk5OTk5OTk2MHnKysrKysrKypRixcXFxcXFxcWUZDo6Ojo6Ojo6OjrKysrKysrKyspq4uLi4uLi4uLLMDs7Ozs7Ozs7O8vLy8vLy8vLy2v/'),
    add: new Audio('data:audio/wav;base64,UklGRmYSAABXQVZFZm10IBAAAAABAAEARKwAAESsAAABAAgAZGF0YUISAAAxPJ3P8/Pzz5s8MSEsYoWOk5OTk46FYiwhrNvw8PDZrCE+aoqhqKioqKKJaj4hmcXo6Ojekkl+ioqKioqKioqKfopcTU1NTU1NTU1NTUpKSkpKSkpKSkpJSUlJSUlJSUlJSUhISEhISEhISEhIR0dHR0dHR0dHR0dGRkZGRkZGRkZGRkZFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRERERERERERERERERERERERERERERETFxMTExMTExMTExMTExMTExMTExMTExMTDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8LCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsHB'),
    delete: new Audio('data:audio/wav;base64,UklGRhwQAABXQVZFZm10IBAAAAABAAEARKwAAESsAAABAAgAZGF0YfgPAAD//////////////9ypoIuLqNvt7e3t7e3Ny4tVVVWLw+3t7e3t7e3t7e3t29uoi4uLi4uLi4tVSUlVc4vD2+3t7e3t7e3t7e3t7e3by4tVVVVVVVVVSUJCQklVc4vo7e3t7e3t7e3t7e3t7e3ty4tVVVVVVVVJQjw8PEJJVYvo7e3t7e3t7e3t7e3t7e3t24tVVVVVVUlCPDQvLzQ8QlWL6O3t7e3t7e3t7e3t7e3t7cuLVVVVVUlCPDQvKCgvNDxVc+jt7e3t7e3t7e3t7e3t7e3bi1VVVUlCPDQvKCMjKC80VYvt7e3t7e3t7e3t7e3t7e3ty4tVVUlCPDQvKCMdHSMoL0l67e3t7e3t7e3t7e3t7e3t7duLVVVCPDQvKCMdGRkdIzQ8eu3t7e3t7e3t7e3t7e3t7e3ci1VV')
  };
  
  if (sounds[type]) {
    sounds[type].play();
  }
};

// Format time remaining
const formatTimeRemaining = (deadline) => {
  if (!deadline) return null;
  
  const now = new Date();
  const targetDate = new Date(deadline);
  const timeDiff = targetDate - now;
  
  // If deadline has passed
  if (timeDiff <= 0) {
    return { text: "EXPIRED!", color: "text-red-500" };
  }
  
  // Calculate time units
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  
  // Format the display text
  let timeText = "";
  let colorClass = "text-green-400";
  
  if (days > 0) {
    timeText = `${days}d ${hours}h`;
    colorClass = "text-green-400";
  } else if (hours > 3) {
    timeText = `${hours}h ${minutes}m`;
    colorClass = "text-green-400";
  } else if (hours > 0) {
    timeText = `${hours}h ${minutes}m`;
    colorClass = "text-yellow-400";
  } else if (minutes > 30) {
    timeText = `${minutes}m`;
    colorClass = "text-yellow-400";
  } else {
    timeText = `${minutes}m`;
    colorClass = "text-red-500";
  }
  
  return { text: timeText, color: colorClass };
};

// Main TodoApp component
const TodoApp = () => {
  // State for tasks and new task input
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('8bitTasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [editingDeadline, setEditingDeadline] = useState('');
  const [timeNow, setTimeNow] = useState(new Date());
  const [fontLoaded, setFontLoaded] = useState(false);

  // Load the Press Start 2P font
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    // Add global styles
    const style = document.createElement('style');
    style.textContent = `
      * {
        font-family: 'Press Start 2P', monospace !important;
        image-rendering: pixelated;
        -webkit-font-smoothing: none;
      }
      
      body {
        margin: 0;
        background-color: #312e81;
      }
      
      input::placeholder {
        color: #93c5fd;
      }
      
      @keyframes twinkle {
        0% { opacity: 0.3; }
        50% { opacity: 1; }
        100% { opacity: 0.3; }
      }
      
      .shadow-text {
        text-shadow: 4px 4px 0px rgba(0, 0, 0, 0.8);
      }
      
      .text-green-400 { color: #4ade80; }
      .text-yellow-400 { color: #facc15; }
      .text-red-500 { color: #ef4444; }
    `;
    document.head.appendChild(style);
    
    // Check if font is loaded
    document.fonts.ready.then(() => {
      setFontLoaded(true);
    });
    
    return () => {
      document.head.removeChild(link);
      document.head.removeChild(style);
    };
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('8bitTasks', JSON.stringify(tasks));
  }, [tasks]);

  // Update time every minute for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeNow(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);

  // Add a new task
  const addTask = () => {
    if (newTaskText.trim() !== '') {
      const newTask = {
        id: Date.now(),
        text: newTaskText,
        completed: false,
        deadline: newTaskDeadline || null
      };
      setTasks([...tasks, newTask]);
      setNewTaskText('');
      setNewTaskDeadline('');
      playSound('add');
    }
  };

  // Toggle task completion
  const toggleComplete = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
    playSound('complete');
  };

  // Delete a task
  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
    playSound('delete');
  };

  // Start editing a task
  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
    setEditingDeadline(task.deadline || '');
  };

  // Save edited task
  const saveEditedTask = () => {
    if (editingText.trim() !== '') {
      setTasks(tasks.map(task => 
        task.id === editingTaskId ? 
        { 
          ...task, 
          text: editingText,
          deadline: editingDeadline || null
        } : task
      ));
      setEditingTaskId(null);
      playSound('add');
    }
  };

  // Handle key press events
  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      if (action === 'add') {
        addTask();
      } else if (action === 'save') {
        saveEditedTask();
      }
    }
  };

  const styles = {
    app: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: '#312e81',
      fontFamily: "'Press Start 2P', monospace",
      position: 'relative',
      overflow: 'hidden'
    },
    background: {
      position: 'absolute',
      inset: 0,
      zIndex: 0
    },
    star: {
      position: 'absolute',
      backgroundColor: 'white',
      width: '1px',
      height: '1px'
    },
    cloud: {
      position: 'absolute',
      backgroundColor: '#bfdbfe',
      borderRadius: '4px',
      opacity: 0.4
    },
    ground: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      height: '48px',
      backgroundColor: '#16a34a'
    },
    content: {
      position: 'relative',
      zIndex: 10,
      width: '100%',
      maxWidth: '448px',
      margin: '0 auto',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    header: {
      textAlign: 'center',
      marginBottom: '24px',
      marginTop: '16px',
      width: '100%'
    },
    title: {
      fontSize: '18px',
      color: '#fde047',
      fontWeight: 'bold',
      marginBottom: '8px',
      letterSpacing: '2px',
      textShadow: '4px 4px 0px rgba(0, 0, 0, 0.8)'
    },
    bar: {
      height: '8px',
      width: '100%',
      marginBottom: '4px'
    },
    inputContainer: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      marginBottom: '24px',
      backgroundColor: 'black',
      padding: '8px',
      border: '4px solid #6b7280'
    },
    input: {
      flexGrow: 1,
      padding: '8px 12px',
      backgroundColor: '#1e3a8a',
      color: 'white',
      border: '2px solid #9ca3af',
      fontSize: '10px',
      outline: 'none',
      marginBottom: '8px'
    },
    button: {
      padding: '8px 12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      transition: 'all 0.1s',
      border: '2px solid',
      fontSize: '10px',
      cursor: 'pointer'
    },
    taskItem: {
      width: '100%',
      padding: '8px',
      border: '4px solid',
      marginBottom: '12px',
      transition: 'all 0.3s'
    },
    checkbox: {
      width: '24px',
      height: '24px',
      marginRight: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '2px solid #d1d5db',
      cursor: 'pointer'
    },
    footer: {
      marginTop: 'auto',
      width: '100%',
      position: 'relative',
      zIndex: 10,
      textAlign: 'center',
      padding: '16px',
      backgroundColor: '#1e1b4b',
      borderTop: '4px solid #312e81'
    }
  };

  return (
    <div style={styles.app}>
      {/* Pixel Art Background Elements */}
      <div style={styles.background}>
        {/* Stars (random pattern) */}
        {Array.from({ length: 50 }).map((_, i) => (
          <div 
            key={i} 
            style={{
              ...styles.star,
              top: `${Math.random() * 30}%`, 
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
              animation: `twinkle ${Math.random() * 3 + 2}s infinite`
            }}
          />
        ))}
        
        {/* Clouds */}
        <div style={{...styles.cloud, top: '56px', left: '40px', width: '64px', height: '24px'}} />
        <div style={{...styles.cloud, top: '40px', left: '80px', width: '96px', height: '32px'}} />
        <div style={{...styles.cloud, top: '80px', left: '240px', width: '80px', height: '24px'}} />
        <div style={{...styles.cloud, top: '48px', right: '80px', width: '112px', height: '32px'}} />
        
        {/* Ground */}
        <div style={styles.ground} />
        <div style={{...styles.ground, height: '4px', bottom: '48px', backgroundColor: '#166534'}} />
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            8-BIT TO-DO QUEST
          </h1>
          <div style={{...styles.bar, backgroundColor: '#2563eb'}} />
          <div style={{...styles.bar, backgroundColor: '#7c3aed'}} />
        </div>

        {/* Task Input */}
        <div style={styles.inputContainer}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', marginBottom: '8px' }}>
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'add')}
                placeholder="Enter new quest..."
                style={styles.input}
              />
              <button
                onClick={addTask}
                style={{
                  ...styles.button,
                  marginLeft: '8px',
                  backgroundColor: '#16a34a',
                  borderColor: '#22c55e',
                  color: 'white'
                }}
              >
                <Plus size={16} style={{ marginRight: '4px' }} />
                ADD
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ color: 'white', marginRight: '8px', fontSize: '10px' }}>DEADLINE:</span>
              <input
                type="datetime-local"
                value={newTaskDeadline}
                onChange={(e) => setNewTaskDeadline(e.target.value)}
                style={{...styles.input, marginBottom: 0}}
              />
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div style={{ width: '100%' }}>
          {tasks.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '32px 16px',
              backgroundColor: '#1e3a8a',
              border: '4px solid #3b82f6',
              color: 'white'
            }}>
              <p style={{ fontSize: '14px', marginBottom: '8px' }}>No quests added yet!</p>
              <p style={{ fontSize: '10px' }}>Add a new quest to begin your adventure...</p>
            </div>
          ) : (
            tasks.map(task => (
              <div 
                key={task.id} 
                style={{
                  ...styles.taskItem,
                  backgroundColor: task.completed ? '#166534' : '#1e3a8a',
                  borderColor: task.completed ? '#16a34a' : '#3b82f6'
                }}
              >
                {editingTaskId === task.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <div style={{ display: 'flex', marginBottom: '8px' }}>
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, 'save')}
                        style={{...styles.input, backgroundColor: '#1e3a8a', marginBottom: 0}}
                        autoFocus
                      />
                      <button
                        onClick={saveEditedTask}
                        style={{
                          ...styles.button,
                          marginLeft: '8px',
                          backgroundColor: '#eab308',
                          borderColor: '#facc15',
                          color: 'white'
                        }}
                      >
                        <Save size={16} style={{ marginRight: '4px' }} />
                        SAVE
                      </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ color: 'white', marginRight: '8px', fontSize: '10px' }}>DEADLINE:</span>
                      <input
                        type="datetime-local"
                        value={editingDeadline}
                        onChange={(e) => setEditingDeadline(e.target.value)}
                        style={{...styles.input, padding: '4px 12px', marginBottom: 0}}
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <button
                        onClick={() => toggleComplete(task.id)}
                        style={{
                          ...styles.checkbox,
                          backgroundColor: task.completed ? '#16a34a' : '#374151'
                        }}
                      >
                        {task.completed && <Check size={16} color="white" />}
                      </button>
                      <p style={{
                        flexGrow: 1,
                        color: 'white',
                        textDecoration: task.completed ? 'line-through' : 'none',
                        opacity: task.completed ? 0.7 : 1,
                        fontSize: '12px'
                      }}>
                        {task.text}
                      </p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => startEditing(task)}
                          style={{
                            ...styles.button,
                            padding: '8px',
                            backgroundColor: '#eab308',
                            borderColor: '#facc15',
                            color: 'white',
                            opacity: task.completed ? 0.5 : 1,
                            cursor: task.completed ? 'not-allowed' : 'pointer'
                          }}
                          disabled={task.completed}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          style={{
                            ...styles.button,
                            padding: '8px',
                            backgroundColor: '#dc2626',
                            borderColor: '#ef4444',
                            color: 'white'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Deadline countdown display */}
                    {task.deadline && !task.completed && (
                      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center' }}>
                        <div style={{
                          marginRight: '8px',
                          padding: '4px 8px',
                          backgroundColor: '#111827',
                          border: '2px solid #4b5563',
                          fontSize: '8px',
                          color: 'white'
                        }}>TIME LEFT:</div>
                        <div style={{
                          padding: '4px 8px',
                          backgroundColor: '#312e81',
                          border: '2px solid #4f46e5',
                          fontSize: '8px',
                          color: formatTimeRemaining(task.deadline)?.color === 'text-green-400' ? '#4ade80' :
                                formatTimeRemaining(task.deadline)?.color === 'text-yellow-400' ? '#facc15' :
                                formatTimeRemaining(task.deadline)?.color === 'text-red-500' ? '#ef4444' : 'white'
                        }}>
                          {formatTimeRemaining(task.deadline)?.text || 'NONE'}
                        </div>
                      </div>
                    )}
                    
                    {/* Show deadline date/time if exists */}
                    {task.deadline && (
                      <div style={{
                        marginTop: '4px',
                        fontSize: '8px',
                        color: '#93c5fd'
                      }}>
                        DUE: {new Date(task.deadline).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p style={{ fontSize: '10px', color: '#93c5fd' }}>PRESS [ENTER] TO ADD/SAVE QUESTS</p>
      </div>
    </div>
  );
};

export default TodoApp;