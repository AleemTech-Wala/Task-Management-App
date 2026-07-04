// ===============================
// GLOBAL VARIABLES & STATE
// ===============================
let tasks = [];
let currentFilter = 'all';
let currentSort = 'date-desc';
let editingTaskId = null;
let taskToDelete = null;

// DOM ELEMENTS
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
    loadTaskFormStorage();
    renderTasks();
    updateStats();

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    taskDueDate.setAttribute('min', today);
});

// ===============================
// EVENT LISTENERS
// ===============================

// Form Submission
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
        btn.classList.add('active');
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