const STORAGE_KEY = 'retro-task-manager-v1';
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const prioritySelect = document.getElementById('priority-select');
const taskList = document.getElementById('task-list');
const totalCount = document.getElementById('total-count');
const doneCount = document.getElementById('done-count');
const leftCount = document.getElementById('left-count');
const filters = document.getElementById('filters');

let tasks = loadTasks();
let currentFilter = 'all';

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function createTask(text, priority) {
  return {
    id: crypto.randomUUID(),
    text,
    priority,
    completed: false,
    createdAt: Date.now()
  };
}

function updateStats() {
  const completed = tasks.filter((task) => task.completed).length;
  totalCount.textContent = tasks.length;
  doneCount.textContent = completed;
  leftCount.textContent = tasks.length - completed;
}

function getFilteredTasks() {
  if (currentFilter === 'active') {
    return tasks.filter((task) => !task.completed);
  }
  if (currentFilter === 'completed') {
    return tasks.filter((task) => task.completed);
  }
  return tasks;
}

function renderTasks() {
  const filtered = getFilteredTasks();
  if (!filtered.length) {
    taskList.innerHTML = '<li class="empty">No missions here yet. Add one and start the quest.</li>';
    updateStats();
    return;
  }

  taskList.innerHTML = filtered
    .map((task) => `
      <li class="task-item ${task.completed ? 'completed' : ''}">
        <div class="task-main">
          <button class="checkbox" data-action="toggle" data-id="${task.id}" aria-label="toggle task"></button>
          <div class="task-text">
            <div>${task.text}</div>
          </div>
        </div>
        <div class="task-main">
          <span class="badge ${task.priority}">${task.priority}</span>
          <button class="delete-btn" data-action="delete" data-id="${task.id}">x</button>
        </div>
      </li>
    `)
    .join('');

  updateStats();
}

function handleSubmit(event) {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  tasks.unshift(createTask(text, prioritySelect.value));
  saveTasks();
  taskInput.value = '';
  renderTasks();
}

function handleListClick(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const { action, id } = button.dataset;
  if (action === 'toggle') {
    tasks = tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task));
    saveTasks();
    renderTasks();
  }

  if (action === 'delete') {
    tasks = tasks.filter((task) => task.id !== id);
    saveTasks();
    renderTasks();
  }
}

function handleFilterClick(event) {
  const button = event.target.closest('.filter');
  if (!button) return;

  document.querySelectorAll('.filter').forEach((item) => item.classList.remove('active'));
  button.classList.add('active');
  currentFilter = button.dataset.filter;
  renderTasks();
}

taskForm.addEventListener('submit', handleSubmit);
taskList.addEventListener('click', handleListClick);
filters.addEventListener('click', handleFilterClick);

renderTasks();
