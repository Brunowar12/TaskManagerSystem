'use client'

import { useState } from 'react'
import Image from 'next/image'
import { BarChart, ListTodo, Calendar, Plus, Trash2 } from 'lucide-react'
import { useNotification } from '@/contexts/notification-context'

interface SidebarProps {
  isVisible: boolean;
  isCollapsed: boolean;
  currentView: 'tasks' | 'calendar' | 'stats' | 'profile';
  onChangeView: (view: 'tasks' | 'calendar' | 'stats' | 'profile') => void;
}

export default function Sidebar({ isVisible, isCollapsed, currentView, onChangeView }: SidebarProps) {
  const [categories, setCategories] = useState(['Work', 'Personal', 'Shopping']);
  const [newCategory, setNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempCategory, setTempCategory] = useState('');
  const { addNotification } = useNotification();

  const isValidCategoryName = (name: string) => {
    const isLatin = /^[a-zA-Z\s]+$/.test(name);
    return isLatin && name.trim().length > 0;
  };

  const addCategory = () => {
    if (!isValidCategoryName(newCategoryName)) {
      addNotification('error', 'Category name must contain only Latin letters and cannot be empty.');
      setNewCategory(false); // Close the input field
      return;
    }
    if (categories.includes(newCategoryName.trim())) {
      addNotification('error', 'This category already exists.');
      setNewCategory(false); // Close the input field
      return;
    }
    setCategories([...categories, newCategoryName.trim()]);
    addNotification('success', `Category "${newCategoryName.trim()}" added.`);
    setNewCategory(false);
    setNewCategoryName('');
  };

  const deleteCategory = (index: number) => {
    const categoryToDelete = categories[index];
    setCategories(categories.filter((_, i) => i !== index));
    addNotification('info', `Category "${categoryToDelete}" deleted.`);
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setTempCategory(categories[index]);
  };

  const saveEditing = (index: number) => {
    if (!isValidCategoryName(tempCategory)) {
      addNotification('error', 'Category name must contain only Latin letters and cannot be empty.');
      setEditingIndex(null); // Close the input field
      return;
    }
    if (categories[index] === tempCategory.trim()) {
      addNotification('info', 'No changes were made.');
      setEditingIndex(null); // Close the input field
      return;
    }
    if (categories.includes(tempCategory.trim())) {
      addNotification('error', 'This category already exists.');
      setEditingIndex(null); // Close the input field
      return;
    }
    const updatedCategories = [...categories];
    updatedCategories[index] = tempCategory.trim();
    setCategories(updatedCategories);
    addNotification('success', `Category "${tempCategory.trim()}" updated.`);
    setEditingIndex(null);
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex h-full flex-col bg-gradient-to-b from-[#e9e7e4] to-[#cdccc8] transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0' : '-translate-x-full'} 
        ${isCollapsed ? 'w-16' : 'w-64'}
        md:relative md:translate-x-0`}
    >
      <div className="flex h-16 shrink-0 items-center justify-center border-b border-gray-200 px-4">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start w-full'}`}>
          <div className="h-15 w-20 overflow-hidden rounded-full">
            <Image src="/logo.png?height=100&width=100" alt="Logo" width={80} height={80} />
          </div>
          {!isCollapsed && <h1 className="ml-3 text-xl font-bold">Plan My Day</h1>}
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        <button
          onClick={() => onChangeView('stats')}
          className={`flex w-full items-center rounded-md p-2 text-gray-700 hover:bg-white/50 transition-colors duration-200
            ${isCollapsed ? 'justify-center' : ''} 
            ${currentView === 'stats' ? 'bg-purple-100 text-purple-700' : ''}`}
        >
          <BarChart className={isCollapsed ? 'h-6 w-6' : 'mr-3 h-6 w-6'} />
          {!isCollapsed && <span>Stats</span>}
        </button>
        <button
          onClick={() => onChangeView('tasks')}
          className={`flex w-full items-center rounded-md p-2 text-gray-700 hover:bg-white/50 transition-colors duration-200
            ${isCollapsed ? 'justify-center' : ''} 
            ${currentView === 'tasks' ? 'bg-purple-100 text-purple-700' : ''}`}
        >
          <ListTodo className={isCollapsed ? 'h-6 w-6' : 'mr-3 h-6 w-6'} />
          {!isCollapsed && <span>All Tasks</span>}
        </button>
        <button
          onClick={() => onChangeView('calendar')}
          className={`flex w-full items-center rounded-md p-2 text-gray-700 hover:bg-white/50 transition-colors duration-200
            ${isCollapsed ? 'justify-center' : ''} 
            ${currentView === 'calendar' ? 'bg-purple-100 text-purple-700' : ''}`}
        >
          <Calendar className={isCollapsed ? 'h-6 w-6' : 'mr-3 h-6 w-6'} />
          {!isCollapsed && <span>Calendar</span>}
        </button>
      </nav>

      {!isCollapsed && (
        <div className="flex-1 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold">My Calendar Categories</h2>
            <button
              onClick={() => setNewCategory(true)}
              className="text-purple-600 hover:text-purple-800 transition-colors duration-200"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto">
            <ul className="space-y-1">
              {categories.map((category, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between rounded p-2 hover:bg-white/50 transition-colors duration-200"
                >
                  <div className="flex items-center flex-1">
                    <div className="h-4 w-4 rounded bg-purple-500"></div>
                    {editingIndex === index ? (
                      <input
                        type="text"
                        value={tempCategory}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^[a-zA-Z\s]*$/.test(value)) {
                            setTempCategory(value);
                          }
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && saveEditing(index)}
                        onBlur={() => saveEditing(index)}
                        className="ml-2 flex-1 rounded border border-gray-300 px-2 py-1"
                        autoFocus
                      />
                    ) : (
                      <span
                        onDoubleClick={() => startEditing(index)}
                        className="ml-2 cursor-pointer"
                      >
                        {category}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteCategory(index)}
                    className="text-gray-500 hover:text-red-500 transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
              {newCategory && (
                <li className="flex items-center rounded p-2 hover:bg-white/50 transition-colors duration-200">
                  <div className="h-4 w-4 rounded bg-purple-500"></div>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[a-zA-Z\s]*$/.test(value)) {
                        setNewCategoryName(value);
                      }
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                    onBlur={addCategory}
                    className="ml-2 flex-1 rounded border border-gray-300 px-2 py-1"
                    autoFocus
                  />
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </aside>
  );
}
