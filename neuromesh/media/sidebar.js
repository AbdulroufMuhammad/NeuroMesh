(function () {
  const vscode = acquireVsCodeApi();

  document.getElementById('hideSidebar').addEventListener('click', () => {
    vscode.postMessage({ command: 'hideSidebar' });
  });

  document.getElementById('toggleSize').addEventListener('click', () => {
    vscode.postMessage({ command: 'toggleSize' });
  });

  document.getElementById('openSettings').addEventListener('click', () => {
    vscode.postMessage({ command: 'openSettings' });
  });

  const dynamicActionArea = document.getElementById('dynamicActionArea');

  vscode.postMessage({ command: 'checkWorkspaceState' });

  window.addEventListener('message', (event) => {
    const message = event.data;

    if (message.command === 'updateWorkspaceState') {
      dynamicActionArea.innerHTML = '';

      if (message.state === 'active') {
        const indexButton = document.createElement('button');
        indexButton.textContent = 'Index Workspace';
        indexButton.addEventListener('click', () => {
          vscode.postMessage({ command: 'indexWorkspace' });
        });
        dynamicActionArea.appendChild(indexButton);
      } else {
        ['Create New Project', 'Open Project', 'Clone Repository'].forEach((text, index) => {
          const button = document.createElement('button');
          button.textContent = text;
          button.addEventListener('click', () => {
            const commands = ['createProject', 'openProject', 'cloneRepository'];
            vscode.postMessage({ command: commands[index] });
          });
          dynamicActionArea.appendChild(button);
        });
      }
    }
  });
})();
