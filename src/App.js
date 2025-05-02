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

  return (
    <div className="flex flex-col min-h-screen bg-indigo-900 font-sans relative overflow-hidden">
      {/* Pixel Art Background Elements */}
      <div className="absolute inset-0 z-0">
        {/* Sky with stars */}
        <div className="absolute top-0 left-0 w-full h-full bg-indigo-900"></div>
        
        {/* Stars (random pattern) */}
        {Array.from({ length: 50 }).map((_, i) => (
          <div 
            key={i} 
            className="absolute bg-white w-1 h-1" 
            style={{ 
              top: `${Math.random() * 30}%`, 
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
              animation: `twinkle ${Math.random() * 3 + 2}s infinite`
            }}
          />
        ))}
        
        {/* Clouds */}
        <div className="absolute top-14 left-10 w-16 h-6 bg-blue-200 rounded opacity-40"></div>
        <div className="absolute top-10 left-20 w-24 h-8 bg-blue-200 rounded opacity-40"></div>
        <div className="absolute top-20 left-60 w-20 h-6 bg-blue-200 rounded opacity-40"></div>
        <div className="absolute top-12 right-20 w-28 h-8 bg-blue-200 rounded opacity-40"></div>
        
        {/* Ground */}
        <div className="absolute bottom-0 left-0 w-full h-12 bg-green-600"></div>
        <div className="absolute bottom-12 left-0 w-full h-1 bg-green-700"></div>
        
        {/* Grid */}
        <div className="absolute bottom-0 left-0 w-full h-36 grid grid-cols-12" style={{ pointerEvents: 'none' }}>
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i} className="border-t border-l border-green-700 opacity-30"></div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md mx-auto p-4 flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-6 mt-4 w-full">
          <h1 className="text-lg md:text-xl text-yellow-300 font-bold mb-2 tracking-wider shadow-text break-all">
            8-BIT TO-DO QUEST
          </h1>
          <div className="h-2 w-full bg-blue-600 mb-1"></div>
          <div className="h-2 w-full bg-purple-600"></div>
        </div>

        {/* Task Input */}
        <div className="flex flex-col w-full mb-6 bg-black p-2 border-4 border-gray-500">
          <div className="flex flex-col sm:flex-row mb-2">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, 'add')}
              placeholder="Enter new quest..."
              className="flex-grow px-3 py-2 bg-blue-900 text-white border-2 border-gray-400 placeholder-blue-300 focus:outline-none text-xs mb-2 sm:mb-0"
            />
            <button
              onClick={addTask}
              className="sm:ml-2 px-3 py-2 flex items-center justify-center bg-green-600 hover:bg-green-500 text-white font-bold transition-all duration-100 active:translate-y-1 border-2 border-green-400 text-xs"
            >
              <Plus size={16} className="mr-1" />
              ADD
            </button>
          </div>
          <div className="flex items-center">
            <span className="text-white mr-2 text-xs">DEADLINE:</span>
            <input
              type="datetime-local"
              value={newTaskDeadline}
              onChange={(e) => setNewTaskDeadline(e.target.value)}
              className="flex-grow px-3 py-1 bg-blue-900 text-white border-2 border-gray-400 focus:outline-none text-xs"
            />
          </div>
        </div>

        {/* Tasks List */}
        <div className="w-full space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-8 px-4 bg-blue-800 border-4 border-blue-600 text-white">
              <p className="text-lg mb-2">No quests added yet!</p>
              <p className="text-sm">Add a new quest to begin your adventure...</p>
            </div>
          ) : (
            tasks.map(task => (
              <div 
                key={task.id} 
                className={`w-full p-2 ${task.completed ? 'bg-green-800' : 'bg-blue-800'} border-4 ${task.completed ? 'border-green-600' : 'border-blue-600'} transition-all duration-300`}
              >
                {editingTaskId === task.id ? (
                  <div className="flex flex-col w-full">
                    <div className="flex flex-col sm:flex-row mb-2">
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, 'save')}
                        className="flex-grow px-3 py-2 bg-blue-900 text-white border-2 border-gray-400 text-xs mb-2 sm:mb-0"
                        autoFocus
                      />
                      <button
                        onClick={saveEditedTask}
                        className="sm:ml-2 px-3 py-2 bg-yellow-500 hover:bg-yellow-400 text-white flex items-center justify-center font-bold active:translate-y-1 border-2 border-yellow-400 text-xs"
                      >
                        <Save size={16} className="mr-1" />
                        SAVE
                      </button>
                    </div>
                    <div className="flex items-center">
                      <span className="text-white mr-2 text-xs">DEADLINE:</span>
                      <input
                        type="datetime-local"
                        value={editingDeadline}
                        onChange={(e) => setEditingDeadline(e.target.value)}
                        className="flex-grow px-3 py-1 bg-blue-900 text-white border-2 border-gray-400 focus:outline-none text-xs"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <button
                        onClick={() => toggleComplete(task.id)}
                        className={`w-6 h-6 mr-3 flex items-center justify-center ${task.completed ? 'bg-green-500' : 'bg-gray-700'} border-2 border-gray-300`}
                      >
                        {task.completed && <Check size={16} className="text-white" />}
                      </button>
                      <p className={`flex-grow text-white ${task.completed ? 'line-through text-gray-300' : ''}`}>
                        {task.text}
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEditing(task)}
                          className="p-2 bg-yellow-500 hover:bg-yellow-400 text-white active:translate-y-1 border-2 border-yellow-400"
                          disabled={task.completed}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-2 bg-red-600 hover:bg-red-500 text-white active:translate-y-1 border-2 border-red-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Deadline countdown display */}
                    {task.deadline && !task.completed && (
                      <div className="mt-2 flex items-center">
                        <div className="mr-2 px-2 py-1 bg-gray-900 border-2 border-gray-600 text-xs">TIME LEFT:</div>
                        <div className={`px-2 py-1 bg-indigo-900 border-2 border-indigo-600 ${formatTimeRemaining(task.deadline)?.color || 'text-white'} text-xs`}>
                          {formatTimeRemaining(task.deadline)?.text || 'NONE'}
                        </div>
                      </div>
                    )}
                    
                    {/* Show deadline date/time if exists */}
                    {task.deadline && (
                      <div className="mt-1 text-xs text-blue-300">
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
      <div className="mt-auto w-full relative z-10 text-center p-4 bg-indigo-950 border-t-4 border-indigo-800">
        <p className="text-sm text-blue-300">PRESS [ENTER] TO ADD/SAVE QUESTS</p>
      </div>

      {/* CSS for pixel font and animations */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        
        * {
          font-family: 'Press Start 2P', monospace !important;
        }
        
        .pixel-font {
          font-family: 'Press Start 2P', monospace;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        
        .shadow-text {
          text-shadow: 4px 4px 0px rgba(0, 0, 0, 0.8);
        }
        
        @keyframes twinkle {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }
        
        button {
          transition: all 0.1s;
          image-rendering: pixelated;
        }
        
        button:hover {
          transform: scale(1.05);
        }
        
        input {
          font-family: 'Press Start 2P', monospace !important;
          letter-spacing: 1px;
          font-size: 0.6rem;
        }
        
        input::placeholder {
          font-family: 'Press Start 2P', monospace !important;
          font-size: 0.6rem;
        }
        
        button {
          font-family: 'Press Start 2P', monospace !important;
          font-size: 0.6rem;
        }
        
        @media (max-width: 640px) {
          h1 {
            font-size: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TodoApp;