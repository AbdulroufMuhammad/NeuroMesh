(function () {
  const vscode = acquireVsCodeApi();

  // State management
  let currentState = 'loading'; // 'loading', 'empty', 'index', 'chat'
  let isIndexed = false;

  // Initialize UI elements
  const loadingState = document.getElementById('loadingState');
  const emptyState = document.getElementById('emptyState');
  const indexState = document.getElementById('indexState');
  const chatState = document.getElementById('chatState');
  const messageInput = document.getElementById('messageInput');
  const sendButton = document.getElementById('sendMessage');
  const messagesContainer = document.getElementById('messages');
  const fileChangesList = document.getElementById('fileChangesList');

  // Header button handlers
  document.getElementById('openSettings').addEventListener('click', () => {
    vscode.postMessage({ command: 'openSettings' });
  });

  // Action button handlers
  document.getElementById('createProject').addEventListener('click', () => {
    vscode.postMessage({ command: 'createProject' });
  });

  document.getElementById('openProject').addEventListener('click', () => {
    vscode.postMessage({ command: 'openProject' });
  });

  document.getElementById('cloneRepository').addEventListener('click', () => {
    vscode.postMessage({ command: 'cloneRepository' });
  });

  document.getElementById('indexWorkspace').addEventListener('click', () => {
    vscode.postMessage({ command: 'indexWorkspace' });
    showState('chat');
    isIndexed = true;
    addWelcomeMessage();
    addSampleFileChanges();
  });

  // Auto-resize textarea
  if (messageInput) {
    messageInput.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
  }

  // Send message functionality
  function sendMessage() {
    if (!messageInput) return;

    const message = messageInput.value.trim();
    if (message) {
      addMessage('user', message);
      messageInput.value = '';
      messageInput.style.height = 'auto';

      // Simulate AI response (replace with actual AI integration)
      setTimeout(() => {
        const responses = [
          'I can help you with that! Let me analyze your codebase...',
          'Based on your code structure, I recommend...',
          'I found some interesting patterns in your project. Would you like me to explain?',
          'Let me check the recent changes and provide suggestions.',
          'I can help you refactor this code or add new features. What would you prefer?'
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addMessage('assistant', randomResponse);
      }, 1000);
    }
  }

  if (sendButton) {
    sendButton.addEventListener('click', sendMessage);
  }

  if (messageInput) {
    messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  // Add message to chat
  function addMessage(sender, content) {
    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = content;

    const messageTime = document.createElement('div');
    messageTime.className = 'message-time';
    messageTime.textContent = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    messageDiv.appendChild(messageContent);
    messageDiv.appendChild(messageTime);
    messagesContainer.appendChild(messageDiv);

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // State management functions
  function showState(state) {
    currentState = state;

    // Hide all states
    loadingState.classList.add('hidden');
    emptyState.classList.add('hidden');
    indexState.classList.add('hidden');
    chatState.classList.add('hidden');

    // Show the requested state
    switch (state) {
      case 'loading':
        loadingState.classList.remove('hidden');
        break;
      case 'empty':
        emptyState.classList.remove('hidden');
        break;
      case 'index':
        indexState.classList.remove('hidden');
        break;
      case 'chat':
        chatState.classList.remove('hidden');
        break;
    }
  }

  // Add welcome message for chat state
  function addWelcomeMessage() {
    setTimeout(() => {
      addMessage('assistant', '🎉 Workspace indexed successfully! I can now help you with code analysis, refactoring, debugging, and more. What would you like to work on?');
    }, 500);
  }

  // Add sample file changes
  function addSampleFileChanges() {
    if (!fileChangesList) return;

    const sampleChanges = [
      { name: 'src/extension.ts', status: 'modified' },
      { name: 'media/sidebar.css', status: 'modified' },
      { name: 'package.json', status: 'modified' }
    ];

    fileChangesList.innerHTML = '';
    sampleChanges.forEach(change => {
      const item = document.createElement('div');
      item.className = 'file-change-item';

      const status = document.createElement('div');
      status.className = `file-change-status ${change.status}`;

      const name = document.createElement('span');
      name.className = 'file-change-name';
      name.textContent = change.name;

      item.appendChild(status);
      item.appendChild(name);
      fileChangesList.appendChild(item);
    });
  }

  // Request initial workspace state
  vscode.postMessage({ command: 'checkWorkspaceState' });

  // Handle messages from extension
  window.addEventListener('message', (event) => {
    const message = event.data;

    if (message.command === 'updateWorkspaceState') {
      updateWorkspaceUI(message.state);
    }
  });

  function updateWorkspaceUI(state) {
    if (state === 'active') {
      showState('index');
    } else {
      showState('empty');
    }
  }

  // Initialize with loading state
  showState('loading');
})();
