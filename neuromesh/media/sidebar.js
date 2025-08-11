(function () {
  const vscode = acquireVsCodeApi();

  // Initialize UI elements
  const dynamicActionArea = document.getElementById('dynamicActionArea');
  const messageInput = document.getElementById('messageInput');
  const sendButton = document.getElementById('sendMessage');
  const messagesContainer = document.getElementById('messages');

  // Header button handlers
  document.getElementById('openSettings').addEventListener('click', () => {
    vscode.postMessage({ command: 'openSettings' });
  });

  // Auto-resize textarea
  messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
  });

  // Send message functionality
  function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
      addMessage('user', message);
      messageInput.value = '';
      messageInput.style.height = 'auto';

      // Simulate AI response (replace with actual AI integration)
      setTimeout(() => {
        addMessage('assistant', 'I received your message: "' + message + '". This is a placeholder response. AI integration coming soon!');
      }, 1000);
    }
  }

  sendButton.addEventListener('click', sendMessage);

  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Add message to chat
  function addMessage(sender, content) {
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
    dynamicActionArea.innerHTML = '';

    if (state === 'active') {
      // Show index workspace section for active projects
      const indexSection = document.createElement('div');
      indexSection.className = 'index-section';

      const title = document.createElement('h3');
      title.textContent = 'Workspace Ready';
      title.style.marginBottom = '16px';
      title.style.color = 'var(--vscode-foreground)';

      const description = document.createElement('p');
      description.textContent = 'Your workspace contains code files. Index it to enable AI assistance.';
      description.style.marginBottom = '20px';
      description.style.color = 'var(--vscode-descriptionForeground)';
      description.style.fontSize = '14px';

      const indexButton = document.createElement('button');
      indexButton.className = 'index-button';
      indexButton.innerHTML = '<span class="icon">🔍</span>Index Workspace';
      indexButton.addEventListener('click', () => {
        vscode.postMessage({ command: 'indexWorkspace' });
      });

      indexSection.appendChild(title);
      indexSection.appendChild(description);
      indexSection.appendChild(indexButton);
      dynamicActionArea.appendChild(indexSection);

    } else {
      // Show action buttons for empty workspaces
      const title = document.createElement('h3');
      title.textContent = 'Get Started';
      title.style.marginBottom = '16px';
      title.style.color = 'var(--vscode-foreground)';
      title.style.textAlign = 'center';

      const description = document.createElement('p');
      description.textContent = 'Choose an option to start working with NeuroMesh:';
      description.style.marginBottom = '20px';
      description.style.color = 'var(--vscode-descriptionForeground)';
      description.style.fontSize = '14px';
      description.style.textAlign = 'center';

      const buttonsContainer = document.createElement('div');
      buttonsContainer.className = 'action-buttons';

      const actions = [
        { text: 'Create New Project', icon: '📁', command: 'createProject' },
        { text: 'Open Project', icon: '📂', command: 'openProject' },
        { text: 'Clone Repository', icon: '🔗', command: 'cloneRepository' }
      ];

      actions.forEach(action => {
        const button = document.createElement('button');
        button.className = 'action-button';
        button.innerHTML = `<span class="icon">${action.icon}</span>${action.text}`;
        button.addEventListener('click', () => {
          vscode.postMessage({ command: action.command });
        });
        buttonsContainer.appendChild(button);
      });

      dynamicActionArea.appendChild(title);
      dynamicActionArea.appendChild(description);
      dynamicActionArea.appendChild(buttonsContainer);
    }
  }

  // Add welcome message
  setTimeout(() => {
    addMessage('assistant', 'Welcome to NeuroMesh! I\'m your AI coding assistant. How can I help you today?');
  }, 500);
})();
