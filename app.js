// ===============================
// GLOBAL VARIABLES & STATE
// ===============================
let tasks = [];
let currentFilter = 'all';
let currentSort = 'date-desc';
let editingTaskId = null;
let taskToDelete = null;

// DOM Elements
const taskForm = document.getElementById('taskForm');
const taskTitle = document.getElementById('taskTitle');
const taskDescription = document.getElementById('taskDescription');
const taskPriority = document.getElementById('taskPriority');
const taskDueDate = document.getElementById('taskDueDate');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');

const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');
const sortSelect = document.getElementById('sortSelect');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');

const tasksList = document.getElementById('tasksList');
const emptyState = document.getElementById('emptyState');

const totalCount = document.getElementById('totalCount');
const activeCount = document.getElementById('activeCount');
const completedCount = document.getElementById('completedCount');

const deleteModal = document.getElementById('deleteModal');
const confirmDelete = document.getElementById('confirmDelete');
const cancelDelete = document.getElementById('cancelDelete');

const descCharCount = document.getElementById('descCharCount');
const titleError = document.getElementById('titleError');

// ===============================
// INITIALIZATION
// ===============================
document.addEventListener('DOMContentLoaded', () => {
    loadTasksFromStorage();
    renderTasks();
    updateStats();
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    taskDueDate.setAttribute('min', today);
});

// ===============================
// EVENT LISTENERS
// ===============================

// Form submission
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (validateForm()) {
        if (editingTaskId) {
            updateTask();
        } else {
            addTask();
        }
    }
});

// Character counter for description
taskDescription.addEventListener('input', (e) => {
    const length = e.target.value.length;
    descCharCount.textContent = `${length}/300`;
    
    if (length > 250) {
        descCharCount.style.color = 'var(--warning-color)';
    } else {
        descCharCount.style.color = 'var(--text-secondary)';
    }
});

// Search functionality
searchInput.addEventListener('input', (e) => {
    renderTasks();
});

// Filter buttons
filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterButtons.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.getAttribute('data-filter');
        renderTasks();
    });
});

// Sort select
sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderTasks();
});

// Clear completed tasks
clearCompletedBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all completed tasks?')) {
        tasks = tasks.filter(task => !task.completed);
        saveTasksToStorage();
        renderTasks();
        updateStats();
    }
});

// Modal events
cancelDelete.addEventListener('click', () => {
    deleteModal.classList.remove('show');
    taskToDelete = null;
});

confirmDelete.addEventListener('click', () => {
    if (taskToDelete) {
        deleteTask(taskToDelete);
        deleteModal.classList.remove('show');
        taskToDelete = null;
    }
});

// Close modal on outside click
deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) {
        deleteModal.classList.remove('show');
        taskToDelete = null;
    }
});

// Event delegation for task actions
tasksList.addEventListener('click', (e) => {
    const taskCard = e.target.closest('.task-card');
    if (!taskCard) return;
    
    const taskId = taskCard.dataset.taskId;
    
    // Toggle completion
    if (e.target.classList.contains('task-checkbox')) {
        toggleTaskCompletion(taskId);
    }
    
    // Edit task
    if (e.target.classList.contains('edit-btn')) {
        startEditTask(taskId);
    }
    
    // Delete task
    if (e.target.classList.contains('delete-btn')) {
        taskToDelete = taskId;
        deleteModal.classList.add('show');
    }
    
    // Save edit
    if (e.target.classList.contains('save-btn')) {
        saveEditTask(taskId);
    }
    
    // Cancel edit
    if (e.target.classList.contains('cancel-btn')) {
        cancelEditTask();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Escape key - cancel edit or close modal
    if (e.key === 'Escape') {
        if (editingTaskId) {
            cancelEditTask();
        }
        if (deleteModal.classList.contains('show')) {
            deleteModal.classList.remove('show');
            taskToDelete = null;
        }
    }
    
    // Ctrl/Cmd + Enter - submit form
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (document.activeElement === taskTitle || 
            document.activeElement === taskDescription) {
            taskForm.dispatchEvent(new Event('submit'));
        }
    }
});

// ===============================
// FORM VALIDATION
// ===============================
function validateForm() {
    let isValid = true;
    
    // Validate title
    if (taskTitle.value.trim() === '') {
        titleError.textContent = 'Task title is required';
        taskTitle.classList.add('error');
        isValid = false;
    } else if (taskTitle.value.trim().length < 3) {
        titleError.textContent = 'Task title must be at least 3 characters';
        taskTitle.classList.add('error');
        isValid = false;
    } else {
        titleError.textContent = '';
        taskTitle.classList.remove('error');
    }
    
    return isValid;
}

// Clear form errors on input
taskTitle.addEventListener('input', () => {
    if (taskTitle.value.trim().length >= 3) {
        titleError.textContent = '';
        taskTitle.classList.remove('error');
    }
});

// ===============================
// TASK CRUD OPERATIONS
// ===============================

// Add new task
function addTask() {
    const task = {
        id: Date.now().toString(),
        title: taskTitle.value.trim(),
        description: taskDescription.value.trim(),
        priority: taskPriority.value,
        dueDate: taskDueDate.value,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.unshift(task); // Add to beginning
    saveTasksToStorage();
    renderTasks();
    updateStats();
    
    // Reset form
    taskForm.reset();
    descCharCount.textContent = '0/300';
    taskTitle.focus();
    
    // Show success animation
    const firstCard = tasksList.querySelector('.task-card');
    if (firstCard) {
        firstCard.classList.add('fade-in');
    }
}

// Toggle task completion
function toggleTaskCompletion(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasksToStorage();
        renderTasks();
        updateStats();
    }
}

// Start editing task
function startEditTask(taskId) {
    if (editingTaskId) {
        cancelEditTask();
    }
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    editingTaskId = taskId;
    
    // Update form
    taskTitle.value = task.title;
    taskDescription.value = task.description;
    taskPriority.value = task.priority;
    taskDueDate.value = task.dueDate;
    
    // Update button
    btnText.textContent = '💾 Update Task';
    submitBtn.classList.add('btn-success');
    
    // Scroll to form
    taskForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    taskTitle.focus();
    
    // Highlight card being edited
    renderTasks();
}

// ===============================
// UPDATE & DELETE OPERATIONS
// ===============================

// Update existing task
function updateTask() {
    const task = tasks.find(t => t.id === editingTaskId);
    if (!task) return;
    
    task.title = taskTitle.value.trim();
    task.description = taskDescription.value.trim();
    task.priority = taskPriority.value;
    task.dueDate = taskDueDate.value;
    task.updatedAt = new Date().toISOString();
    
    saveTasksToStorage();
    renderTasks();
    updateStats();
    
    // Reset form
    cancelEditTask();
    
    // Flash updated card
    const updatedCard = document.querySelector(`[data-task-id="${editingTaskId}"]`);
    if (updatedCard) {
        updatedCard.classList.add('shake');
        setTimeout(() => updatedCard.classList.remove('shake'), 300);
    }
}

// Save inline edit
function saveEditTask(taskId) {
    const taskCard = document.querySelector(`[data-task-id="${taskId}"]`);
    const titleInput = taskCard.querySelector('.task-title-input');
    const descInput = taskCard.querySelector('.task-description-input');
    
    if (titleInput && titleInput.value.trim().length >= 3) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.title = titleInput.value.trim();
            task.description = descInput ? descInput.value.trim() : task.description;
            task.updatedAt = new Date().toISOString();
            
            saveTasksToStorage();
            taskCard.classList.remove('editing');
            renderTasks();
            updateStats();
        }
    } else {
        alert('Task title must be at least 3 characters');
    }
}

// Cancel inline edit
function cancelEditTask() {
    editingTaskId = null;
    
    // Reset form
    taskForm.reset();
    descCharCount.textContent = '0/300';
    btnText.textContent = '➕ Add Task';
    submitBtn.classList.remove('btn-success');
    
    renderTasks();
}

// Delete task
function deleteTask(taskId) {
    const taskCard = document.querySelector(`[data-task-id="${taskId}"]`);
    
    if (taskCard) {
        taskCard.classList.add('removing');
        
        setTimeout(() => {
            tasks = tasks.filter(t => t.id !== taskId);
            saveTasksToStorage();
            renderTasks();
            updateStats();
        }, 300);
    }
}

// ===============================
// FILTERING & SORTING
// ===============================

// Get filtered tasks
function getFilteredTasks() {
    let filtered = [...tasks];
    
    // Apply filter
    switch (currentFilter) {
        case 'active':
            filtered = filtered.filter(task => !task.completed);
            break;
        case 'completed':
            filtered = filtered.filter(task => task.completed);
            break;
        // 'all' - no filtering needed
    }
    
    // Apply search
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(task => 
            task.title.toLowerCase().includes(searchTerm) ||
            task.description.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
        switch (currentSort) {
            case 'date-desc':
                return new Date(b.createdAt) - new Date(a.createdAt);
            
            case 'date-asc':
                return new Date(a.createdAt) - new Date(b.createdAt);
            
            case 'priority':
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            
            case 'alpha':
                return a.title.localeCompare(b.title);
            
            default:
                return 0;
        }
    });
    
    return filtered;
}

// ===============================
// RENDERING
// ===============================

// Render all tasks
function renderTasks() {
    const filteredTasks = getFilteredTasks();
    
    // Show/hide empty state
    if (filteredTasks.length === 0) {
        emptyState.classList.add('show');
        tasksList.innerHTML = '';
        return;
    } else {
        emptyState.classList.remove('show');
    }
    
    // Render tasks
    tasksList.innerHTML = filteredTasks.map(task => createTaskHTML(task)).join('');
    initDragAndDrop();
}

// Create HTML for single task
function createTaskHTML(task) {
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
    const isEditing = task.id === editingTaskId;
    
    return `
        <li class="task-card priority-${task.priority} ${task.completed ? 'completed' : ''} ${isEditing ? 'editing' : ''}" 
            data-task-id="${task.id}" draggable="true">
            <div class="drag-handle">⠿</div>
            <div class="task-header">
                <input 
                    type="checkbox" 
                    class="task-checkbox"
                    ${task.completed ? 'checked' : ''}
                >
                <div class="task-content">
                    <div class="task-title">${escapeHTML(task.title)}</div>
                    ${task.description ? `<div class="task-description">${escapeHTML(task.description)}</div>` : ''}
                    
                    <div class="task-meta">
                        <span class="task-badge badge-priority ${task.priority}">
                            ${getPriorityIcon(task.priority)} ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                        ${task.dueDate ? `
                            <span class="task-badge badge-date ${isOverdue ? 'overdue' : ''}">
                                📅 ${formatDate(task.dueDate)}
                            </span>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            <div class="task-actions">
                <button class="task-btn edit-btn">✏️ Edit</button>
                <button class="task-btn delete-btn">🗑️ Delete</button>
            </div>
        </li>
    `;
}

// Update statistics
function updateStats() {
    const total = tasks.length;
    const active = tasks.filter(t => !t.completed).length;
    const completed = tasks.filter(t => t.completed).length;
    
    totalCount.textContent = total;
    activeCount.textContent = active;
    completedCount.textContent = completed;
    
    // Update clear completed button
    if (completed === 0) {
        clearCompletedBtn.disabled = true;
        clearCompletedBtn.style.opacity = '0.5';
        clearCompletedBtn.style.cursor = 'not-allowed';
    } else {
        clearCompletedBtn.disabled = false;
        clearCompletedBtn.style.opacity = '1';
        clearCompletedBtn.style.cursor = 'pointer';
    }
}

// ===============================
// LOCAL STORAGE
// ===============================

// Save tasks to localStorage
function saveTasksToStorage() {
    try {
        localStorage.setItem('taskManagerTasks', JSON.stringify(tasks));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        alert('Failed to save tasks. Your browser may have disabled localStorage.');
    }
}

// Load tasks from localStorage
function loadTasksFromStorage() {
    try {
        const storedTasks = localStorage.getItem('taskManagerTasks');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        tasks = [];
    }
}

// ===============================
// UTILITY FUNCTIONS
// ===============================

// Escape HTML to prevent XSS
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Get priority icon
function getPriorityIcon(priority) {
    switch (priority) {
        case 'high':
            return '🔴';
        case 'medium':
            return '🟡';
        case 'low':
            return '🟢';
        default:
            return '⚪';
    }
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const taskDate = new Date(dateString);
    taskDate.setHours(0, 0, 0, 0);
    
    const diffTime = taskDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    if (diffDays < 7) return `In ${diffDays} days`;
    
    // Format as MMM DD, YYYY
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// ===============================
// EXPORT (for debugging)
// ===============================
window.taskManager = {
    tasks,
    addTask,
    deleteTask,
    toggleTaskCompletion,
    clearAll: () => {
        if (confirm('Are you sure you want to delete ALL tasks?')) {
            tasks = [];
            saveTasksToStorage();
            renderTasks();
            updateStats();
        }
    }
};

// ===============================
// DRAG & DROP
// ===============================

let draggedTaskId = null;  // konsa task drag ho raha hai

function initDragAndDrop() {
    const cards = tasksList.querySelectorAll('.task-card');

    cards.forEach(card => {

        // Drag shuru hua
        card.addEventListener('dragstart', (e) => {
            draggedTaskId = card.dataset.taskId;
            card.classList.add('dragging');

            // Firefox ke liye zaruri
            e.dataTransfer.effectAllowed = 'move';
        });

        // Drag khatam hua
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
            // Saare drag-over classes hatao
            tasksList.querySelectorAll('.drag-over')
                .forEach(c => c.classList.remove('drag-over'));
        });

        // Doosre card ke upar aaya
        card.addEventListener('dragover', (e) => {
            e.preventDefault(); // Drop allow karo
            card.classList.add('drag-over');
        });

        // Card ke bahar gaya
        card.addEventListener('dragleave', () => {
            card.classList.remove('drag-over');
        });

        // Drop hua
        card.addEventListener('drop', (e) => {
            e.preventDefault();
            card.classList.remove('drag-over');

            const droppedOnId = card.dataset.taskId;

            // Same card pe drop? Kuch mat karo
            if (draggedTaskId === droppedOnId) return;

            // Tasks array mein order badlo
            const draggedIndex = tasks.findIndex(t => t.id === draggedTaskId);
            const droppedIndex = tasks.findIndex(t => t.id === droppedOnId);

            // Dragged task nikalo
            const [draggedTask] = tasks.splice(draggedIndex, 1);

            // Nai jagah daalo
            tasks.splice(droppedIndex, 0, draggedTask);

            // Save aur render
            saveTasksToStorage();
            tasksList.innerHTML = tasks.map(task => createTaskHTML(task)).join('');
            initDragAndDrop();
        });
    });
}

console.log('✅ Task Manager initialized!');
console.log('💡 Tip: Use window.taskManager for debugging');