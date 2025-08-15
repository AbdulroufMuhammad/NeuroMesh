(function() {
    const vscode = acquireVsCodeApi();
    let currentSection = null;
    let sections = [];
    let currentSettings = {};
    let editor = null;
    let isInitialized = false;

    // DOM elements
    const sectionsContainer = document.getElementById('sections');
    const sectionTitle = document.getElementById('section-title');
    const contentBody = document.getElementById('content');
    const resetButton = document.getElementById('reset-section');
    const saveButton = document.getElementById('save-settings');
    const placeholder = document.querySelector('.placeholder');
    const editorContainer = document.getElementById('editor-container');

    // Initialize Monaco Editor
    function initializeMonaco() {
        if (isInitialized) return;

        require.config({
            paths: {
                vs: 'https://unpkg.com/monaco-editor@0.44.0/min/vs'
            }
        });

        require(['vs/editor/editor.main'], function () {
            editor = monaco.editor.create(editorContainer, {
                value: '{}',
                language: 'json',
                theme: 'vs-dark',
                automaticLayout: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                formatOnPaste: true,
                formatOnType: true,
                tabSize: 2,
                insertSpaces: true
            });

            // Auto-save on content change (with debounce)
            let saveTimeout;
            editor.onDidChangeModelContent(() => {
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(() => {
                    saveCurrentSettings();
                }, 1000); // Save after 1 second of no changes
            });

            isInitialized = true;
        });
    }

    // Event listeners
    resetButton.addEventListener('click', () => {
        if (currentSection) {
            vscode.postMessage({
                command: 'resetSection',
                section: currentSection
            });
        }
    });

    saveButton.addEventListener('click', () => {
        saveCurrentSettings();
    });

    function saveCurrentSettings() {
        if (editor && currentSection) {
            try {
                const value = editor.getValue();
                const parsedSettings = JSON.parse(value);

                vscode.postMessage({
                    command: 'updateSectionSettings',
                    section: currentSection,
                    settings: parsedSettings
                });
            } catch (error) {
                vscode.postMessage({
                    command: 'showError',
                    message: 'Invalid JSON: ' + error.message
                });
            }
        }
    }

    // Message handler
    window.addEventListener('message', event => {
        const message = event.data;

        switch (message.command) {
            case 'setSections':
                setSections(message.sections);
                break;
            case 'setSettings':
                setSettings(message.section, message.settings);
                break;
            case 'sectionReset':
                handleSectionReset(message);
                break;
        }
    });

    function setSections(newSections) {
        sections = newSections;
        renderSections();
    }

    function renderSections() {
        sectionsContainer.innerHTML = '';

        sections.forEach(section => {
            const sectionElement = document.createElement('button');
            sectionElement.className = 'section-item';
            sectionElement.innerHTML = `
                <span class="section-icon">${section.icon}</span>
                <span class="section-name">${section.name}</span>
            `;

            sectionElement.addEventListener('click', () => {
                selectSection(section.id);
            });

            sectionsContainer.appendChild(sectionElement);
        });

        // Auto-select first section on load
        if (sections.length > 0 && !currentSection) {
            selectSection(sections[0].id);
        }
    }

    function selectSection(sectionId) {
        // Update active state
        document.querySelectorAll('.section-item').forEach(item => {
            item.classList.remove('active');
        });

        const selectedElement = Array.from(document.querySelectorAll('.section-item'))
            .find(item => item.querySelector('.section-name').textContent ===
                sections.find(s => s.id === sectionId)?.name);

        if (selectedElement) {
            selectedElement.classList.add('active');
        }

        currentSection = sectionId;

        // Request settings for this section
        vscode.postMessage({
            command: 'getSettings',
            section: sectionId
        });
    }

    function setSettings(section, settings) {
        if (section !== currentSection) return;

        currentSettings = settings;

        const sectionData = sections.find(s => s.id === section);
        sectionTitle.textContent = sectionData ? sectionData.name : section;
        resetButton.style.display = 'block';
        saveButton.style.display = 'block';

        placeholder.style.display = 'none';
        editorContainer.style.display = 'block';

        initializeMonaco();

        // Set editor content to the JSON representation of the section settings
        if (editor) {
            editor.setValue(JSON.stringify(currentSettings, null, 2));
            // Format the document
            setTimeout(() => {
                vscode.postMessage({ command: 'editorInitialized' });
            }, 0);
        }
    }

    function createSettingElement(key, config, value) {
        const container = document.createElement('div');
        container.className = 'setting-item';
        
        const label = document.createElement('label');
        label.className = 'setting-label';
        label.textContent = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
        
        const description = document.createElement('div');
        description.className = 'setting-description';
        description.textContent = config.description;
        
        const inputContainer = document.createElement('div');
        const input = createInput(key, config, value);
        inputContainer.appendChild(input);
        
        container.appendChild(label);
        container.appendChild(description);
        container.appendChild(inputContainer);
        
        return container;
    }

    function createInput(key, config, value) {
        switch (config.type) {
            case 'boolean':
                return createCheckboxInput(key, value);
            case 'number':
                return createNumberInput(key, config, value);
            case 'enum':
                return createSelectInput(key, config, value);
            case 'array':
                return createArrayInput(key, config, value);
            case 'string':
            default:
                return createTextInput(key, config, value);
        }
    }

    function createTextInput(key, config, value) {
        const input = document.createElement('input');
        input.type = config.secret ? 'password' : 'text';
        input.className = 'setting-input';
        input.value = value || '';
        input.placeholder = config.placeholder || '';
        
        input.addEventListener('change', () => {
            updateSetting(key, input.value);
        });
        
        return input;
    }

    function createNumberInput(key, config, value) {
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'setting-input';
        input.value = value || '';
        
        if (config.min !== undefined) input.min = config.min;
        if (config.max !== undefined) input.max = config.max;
        
        input.addEventListener('change', () => {
            updateSetting(key, parseInt(input.value) || 0);
        });
        
        return input;
    }

    function createCheckboxInput(key, value) {
        const container = document.createElement('div');
        
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.className = 'setting-checkbox';
        input.checked = value || false;
        
        const label = document.createElement('label');
        label.textContent = 'Enabled';
        
        input.addEventListener('change', () => {
            updateSetting(key, input.checked);
        });
        
        container.appendChild(input);
        container.appendChild(label);
        
        return container;
    }

    function createSelectInput(key, config, value) {
        const select = document.createElement('select');
        select.className = 'setting-select';
        
        config.options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            optionElement.selected = option === value;
            select.appendChild(optionElement);
        });
        
        select.addEventListener('change', () => {
            updateSetting(key, select.value);
        });
        
        return select;
    }

    function createArrayInput(key, config, value) {
        const container = document.createElement('div');
        container.className = 'array-input';
        
        const items = value || [];
        
        function renderArrayItems() {
            container.innerHTML = '';
            
            items.forEach((item, index) => {
                const itemContainer = document.createElement('div');
                itemContainer.className = 'array-item';
                
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'setting-input';
                input.value = item;
                
                input.addEventListener('change', () => {
                    items[index] = input.value;
                    updateSetting(key, items);
                });
                
                const removeButton = document.createElement('button');
                removeButton.className = 'array-remove';
                removeButton.textContent = 'Remove';
                removeButton.addEventListener('click', () => {
                    items.splice(index, 1);
                    updateSetting(key, items);
                    renderArrayItems();
                });
                
                itemContainer.appendChild(input);
                itemContainer.appendChild(removeButton);
                container.appendChild(itemContainer);
            });
            
            const addButton = document.createElement('button');
            addButton.className = 'array-add';
            addButton.textContent = 'Add Item';
            addButton.addEventListener('click', () => {
                items.push('');
                renderArrayItems();
            });
            
            container.appendChild(addButton);
        }
        
        renderArrayItems();
        return container;
    }

    function updateSetting(key, value) {
        const fullKey = `${currentSection}.${key}`;
        vscode.postMessage({
            command: 'updateSetting',
            key: fullKey,
            value: value
        });
    }

    function handleSettingUpdate(message) {
        // Show feedback to user
        const [section, setting] = message.key.split('.');
        if (section === currentSection) {
            // Update local state
            currentSettings[setting] = message.value;
            
            // Could show success/error feedback here
            if (!message.success && message.error) {
                console.error('Setting update failed:', message.error);
            }
        }
    }

    function handleSectionReset(message) {
        if (message.section === currentSection) {
            if (message.success) {
                // Settings will be refreshed via setSettings message
            } else if (message.error) {
                console.error('Section reset failed:', message.error);
            }
        }
    }

    // Initialize
    vscode.postMessage({ command: 'getSections' });
})();
