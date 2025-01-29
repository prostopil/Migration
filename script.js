document.addEventListener('DOMContentLoaded', () => {
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });

  // Tab functionality
  window.openTab = function(tabName) {
    // Hide all tab contents
    const tabContents = document.getElementsByClassName('tab-content');
    for (let content of tabContents) {
      content.classList.remove('active');
    }

    // Remove active class from all buttons
    const tabButtons = document.getElementsByClassName('tab-btn');
    for (let button of tabButtons) {
      button.classList.remove('active');
    }

    // Show the selected tab content and activate the button
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[onclick="openTab('${tabName}')"]`).classList.add('active');
  };

  // Checklist persistence
  const checkboxes = document.querySelectorAll('.checklist input[type="checkbox"]');
  
  // Load saved state
  checkboxes.forEach((checkbox, index) => {
    const checked = localStorage.getItem(`checkbox_${index}`);
    if (checked === 'true') {
      checkbox.checked = true;
    }
  });

  // Save state on change
  checkboxes.forEach((checkbox, index) => {
    checkbox.addEventListener('change', () => {
      localStorage.setItem(`checkbox_${index}`, checkbox.checked);
    });
  });

  // Add animation to requirement cards on scroll
  const cards = document.querySelectorAll('.requirement-card');
  
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, index * 100); // Staggered animation
      }
    });
  }, observerOptions);

  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    observer.observe(card);
  });

  // Add hover animations to nav items
  document.querySelectorAll('nav.toc a').forEach(link => {
    link.addEventListener('mouseenter', () => {
      const icon = link.querySelector('.nav-icon');
      if (icon) {
        icon.style.transform = 'scale(1.2) rotate(5deg)';
      }
    });
  
    link.addEventListener('mouseleave', () => {
      const icon = link.querySelector('.nav-icon');
      if (icon) {
        icon.style.transform = 'scale(1) rotate(0deg)';
      }
    });
  });

  // Enhance timeline animations
  const timelineItems = document.querySelectorAll('.timeline-item');
  timelineItems.forEach((item, index) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
          }, index * 200);
        }
      });
    });
  
    item.style.opacity = '0';
    item.style.transform = 'translateX(-50px)';
    item.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    observer.observe(item);
  });

  // Add animation to checkboxes
  document.querySelectorAll('.check-item input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const span = this.nextElementSibling;
      if (this.checked) {
        span.style.transform = 'scale(0.95)';
        setTimeout(() => span.style.transform = 'scale(1)', 200);
      }
    });
  });

  // Edit mode functionality
  const editModeBtn = document.getElementById('editModeBtn');
  const saveChangesBtn = document.getElementById('saveChangesBtn');
  const cancelChangesBtn = document.getElementById('cancelChangesBtn');
  let originalContent = new Map();
  
  // Save initial content
  function saveInitialContent() {
    document.querySelectorAll('[data-editable="true"]').forEach(element => {
      originalContent.set(element, element.innerHTML);
    });
  }

  // Enable edit mode
  function enableEditMode() {
    saveInitialContent();
    document.querySelectorAll('[data-editable="true"]').forEach(element => {
      element.contentEditable = true;
      // Add special class for header/footer elements
      if (element.closest('header') || element.closest('footer')) {
        element.classList.add('editing-header');
      }
    });
    editModeBtn.style.display = 'none';
    saveChangesBtn.style.display = 'block';
    cancelChangesBtn.style.display = 'block';
    
    // Make code blocks editable
    document.querySelectorAll('.code-block').forEach(block => {
      block.classList.add('editable');
      const codeElement = block.querySelector('code');
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Редактировать код';
      editBtn.className = 'edit-code-btn';
      editBtn.onclick = () => openCodeEditor(codeElement);
      block.insertBefore(editBtn, block.firstChild);
    });
  }

  // Disable edit mode
  function disableEditMode() {
    document.querySelectorAll('[data-editable="true"]').forEach(element => {
      element.contentEditable = false;
      // Remove special header/footer editing class
      element.classList.remove('editing-header');
    });
    editModeBtn.style.display = 'block';
    saveChangesBtn.style.display = 'none';
    cancelChangesBtn.style.display = 'none';

    // Remove code block edit buttons
    document.querySelectorAll('.edit-code-btn').forEach(btn => btn.remove());
    document.querySelectorAll('.code-block').forEach(block => {
      block.classList.remove('editable');
    });
  }

  // Save changes
  function saveChanges() {
    const editableContent = {};
    document.querySelectorAll('[data-editable="true"]').forEach(element => {
      editableContent[element.dataset.id] = element.innerHTML;
    });
    localStorage.setItem('editableContent', JSON.stringify(editableContent));
    disableEditMode();
  }

  // Cancel changes
  function cancelChanges() {
    document.querySelectorAll('[data-editable="true"]').forEach(element => {
      element.innerHTML = originalContent.get(element);
    });
    disableEditMode();
  }

  // Code editor functionality
  function openCodeEditor(codeElement) {
    const overlay = document.createElement('div');
    overlay.className = 'edit-overlay';
    
    const textarea = document.createElement('textarea');
    textarea.value = codeElement.textContent;
    
    const controls = document.createElement('div');
    controls.className = 'edit-overlay-controls';
    
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Сохранить';
    saveBtn.className = 'save-btn';
    saveBtn.onclick = () => {
      codeElement.textContent = textarea.value;
      Prism.highlightElement(codeElement);
      overlay.remove();
    };
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Отмена';
    cancelBtn.className = 'cancel-btn';
    cancelBtn.onclick = () => overlay.remove();
    
    controls.appendChild(saveBtn);
    controls.appendChild(cancelBtn);
    overlay.appendChild(textarea);
    overlay.appendChild(controls);
    document.body.appendChild(overlay);
    
    setTimeout(() => overlay.classList.add('active'), 0);
    textarea.focus();
  }

  // Event listeners
  editModeBtn.addEventListener('click', enableEditMode);
  saveChangesBtn.addEventListener('click', saveChanges);
  cancelChangesBtn.addEventListener('click', cancelChanges);

  // Load saved content
  const savedContent = localStorage.getItem('editableContent');
  if (savedContent) {
    const content = JSON.parse(savedContent);
    Object.entries(content).forEach(([id, html]) => {
      const element = document.querySelector(`[data-id="${id}"]`);
      if (element) element.innerHTML = html;
    });
  }

  // Add unique IDs to editable elements
  document.querySelectorAll('[data-editable="true"]').forEach((element, index) => {
    element.dataset.id = `editable-${index}`;
  });

  // Add delete button to all requirement cards
  function addDeleteButtonToCard(card) {
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-card-btn';
    deleteBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="24" height="24">
        <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showDeleteConfirmation(card);
    });
    card.appendChild(deleteBtn);
  }

  // Add delete buttons to existing cards
  document.querySelectorAll('.requirement-card').forEach(addDeleteButtonToCard);

  // Show delete confirmation dialog
  function showDeleteConfirmation(card) {
    const backdrop = document.createElement('div');
    backdrop.className = 'confirm-dialog-backdrop';
    
    const dialog = document.createElement('div');
    dialog.className = 'confirm-dialog';
    dialog.innerHTML = `
      <h3>Удалить требование?</h3>
      <p>Это действие нельзя отменить.</p>
      <div class="confirm-dialog-buttons">
        <button class="cancel-btn">Отмена</button>
        <button class="save-btn">Удалить</button>
      </div>
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(dialog);

    dialog.querySelector('.cancel-btn').onclick = () => {
      backdrop.remove();
      dialog.remove();
    };

    dialog.querySelector('.save-btn').onclick = () => {
      card.remove();
      backdrop.remove();
      dialog.remove();
      saveChanges(); // Save the state after deletion
    };
  }

  // Add Prerequisite functionality
  const addPrerequisiteBtn = document.createElement('button');
  addPrerequisiteBtn.className = 'add-prerequisite-btn';
  addPrerequisiteBtn.innerHTML = `
    <svg class="icon" viewBox="0 0 24 24" width="24" height="24">
      <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
    </svg>
    Добавить требование
  `;

  const requirementsGrid = document.querySelector('.requirements-grid');
  requirementsGrid.parentNode.insertBefore(addPrerequisiteBtn, requirementsGrid.nextSibling);

  function createPrerequisiteForm() {
    const overlay = document.createElement('div');
    overlay.className = 'edit-overlay';
    
    const form = document.createElement('form');
    form.className = 'prerequisite-form';
    
    const iconOptions = [
      {
        name: 'Base System',
        svg: `<path d="M4 6h16M4 10h16M4 14h16M4 18h16" stroke="currentColor" stroke-linecap="round" stroke-width="2"/>`,
        color: '#2c3e50'
      },
      {
        name: 'Debian',
        svg: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>`,
        color: '#a80030'
      },
      {
        name: 'Zabbix',
        svg: `<path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm3 3h8v8H8V8z" fill="currentColor"/>`,
        color: '#d40000'
      },
      {
        name: 'PostgreSQL',
        svg: `<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="currentColor"/>`,
        color: '#336791'
      },
      {
        name: 'Nginx',
        svg: `<path d="M21 3H3v18h18V3zm-2 16H5V5h14v14z" fill="currentColor"/>`,
        color: '#009639'
      },
      {
        name: 'PHP',
        svg: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.14-7-7 3.14-7 7-7z" fill="currentColor"/>`,
        color: '#777BB3'
      },
      {
        name: 'TimescaleDB',
        svg: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.14-7-7 3.14-7 7-7z" fill="currentColor"/><path d="M12 7v5l3 3" stroke="currentColor" stroke-width="2"/>`,
        color: '#FDB515'
      },
      {
        name: 'Redis',
        svg: `<path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm3 3h8v8H8V8z" fill="currentColor"/>`,
        color: '#DC382D'
      },
      {
        name: 'Database',
        svg: `<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="currentColor"/>`,
        color: '#3498db'
      },
      {
        name: 'Server',
        svg: `<path d="M4 6h16M4 10h16M4 14h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
        color: '#27ae60'
      },
      {
        name: 'Network',
        svg: `<circle cx="12" cy="12" r="3" fill="currentColor"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>`,
        color: '#e67e22'
      },
      {
        name: 'Security',
        svg: `<path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" fill="currentColor"/>`,
        color: '#95a5a6'
      }
    ];
    
    form.innerHTML = `
      <h3>Добавить новое требование</h3>
      <div class="form-group">
        <label>Название:</label>
        <input type="text" name="title" required>
      </div>
      <div class="form-group">
        <label>Описание:</label>
        <textarea name="description" required></textarea>
      </div>
      <div class="form-group">
        <label>Иконка:</label>
        <div class="icon-select">
          ${iconOptions.map((icon, index) => `
            <label class="icon-option" style="--icon-color: ${icon.color}">
              <input type="radio" name="icon" value="${index}" ${index === 0 ? 'checked' : ''}>
              <svg class="icon" viewBox="0 0 24 24" width="24" height="24" style="color: ${icon.color}">
                ${icon.svg}
              </svg>
              <span>${icon.name}</span>
            </label>
          `).join('')}
        </div>
      </div>
      <div class="form-buttons">
        <button type="submit" class="save-btn">Добавить</button>
        <button type="button" class="cancel-btn">Отмена</button>
      </div>
    `;

    overlay.appendChild(form);
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('active'), 0);

    // Add click handlers for icon selection
    const iconOptionsElements = form.querySelectorAll('.icon-option');
    iconOptionsElements.forEach(option => {
      option.addEventListener('click', () => {
        // Remove selected class from all options
        iconOptionsElements.forEach(opt => opt.classList.remove('selected'));
        // Add selected class to clicked option
        option.classList.add('selected');
        // Check the radio button
        option.querySelector('input[type="radio"]').checked = true;
      });
    });

    form.querySelector('.cancel-btn').onclick = () => overlay.remove();
    
    form.onsubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const selectedIcon = iconOptions[parseInt(formData.get('icon'))];
      
      const newCard = document.createElement('div');
      newCard.className = 'requirement-card';
      newCard.setAttribute('data-editable', 'true');
      newCard.style.setProperty('--card-color', selectedIcon.color);
      newCard.innerHTML = `
        <svg class="icon" viewBox="0 0 24 24" width="24" height="24" style="color: ${selectedIcon.color}">
          ${selectedIcon.svg}
        </svg>
        <h3>${formData.get('title')}</h3>
        <p>${formData.get('description')}</p>
      `;
      
      addDeleteButtonToCard(newCard); 
      requirementsGrid.appendChild(newCard);
      overlay.remove();
      
      // Update editable elements
      newCard.dataset.id = `editable-${document.querySelectorAll('[data-editable="true"]').length}`;
      saveChanges();
    };
  }

  addPrerequisiteBtn.addEventListener('click', createPrerequisiteForm);

  // Add Timeline Item functionality
  const addTimelineItemBtn = document.createElement('button');
  addTimelineItemBtn.className = 'add-timeline-item-btn';
  addTimelineItemBtn.innerHTML = `
    <svg class="icon" viewBox="0 0 24 24" width="24" height="24">
      <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
    </svg>
    Добавить этап миграции
  `;

  const timeline = document.querySelector('.timeline');
  timeline.parentNode.insertBefore(addTimelineItemBtn, timeline.nextSibling);

  function createTimelineItemForm() {
    const overlay = document.createElement('div');
    overlay.className = 'edit-overlay';
    
    const form = document.createElement('form');
    form.className = 'timeline-item-form';
    
    form.innerHTML = `
      <h3>Добавить новый этап миграции</h3>
      <div class="form-group">
        <label>Заголовок этапа:</label>
        <input type="text" name="title" required>
      </div>
      <div class="form-group">
        <label>Описание этапа:</label>
        <textarea name="description" required></textarea>
      </div>
      <div class="form-buttons">
        <button type="submit" class="save-btn">Добавить</button>
        <button type="button" class="cancel-btn">Отмена</button>
      </div>
    `;

    overlay.appendChild(form);
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('active'), 0);

    form.querySelector('.cancel-btn').onclick = () => overlay.remove();
    
    form.onsubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      
      const newTimelineItem = document.createElement('div');
      newTimelineItem.className = 'timeline-item';
      newTimelineItem.innerHTML = `
        <div class="timeline-content" data-editable="true">
          <h3>${formData.get('title')}</h3>
          <p>${formData.get('description')}</p>
        </div>
      `;
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-card-btn';
      deleteBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `;
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showDeleteConfirmation(newTimelineItem);
      });
      newTimelineItem.querySelector('.timeline-content').appendChild(deleteBtn);
      
      timeline.appendChild(newTimelineItem);
      overlay.remove();
      
      // Update editable elements
      const timelineContent = newTimelineItem.querySelector('.timeline-content');
      timelineContent.dataset.id = `editable-${document.querySelectorAll('[data-editable="true"]').length}`;
      saveChanges();
    };
  }

  addTimelineItemBtn.addEventListener('click', createTimelineItemForm);

  // Add delete buttons to existing timeline items
  document.querySelectorAll('.timeline-content').forEach(content => {
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-card-btn';
    deleteBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="24" height="24">
        <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showDeleteConfirmation(content.closest('.timeline-item'));
    });
    content.appendChild(deleteBtn);
  });

  const addScriptTabBtn = document.createElement('button');
  addScriptTabBtn.className = 'add-script-tab-btn';
  addScriptTabBtn.innerHTML = `
    <svg class="icon" viewBox="0 0 24 24" width="24" height="24">
      <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
    </svg>
    Добавить новый скрипт
  `;

  const scriptsTabs = document.querySelector('#scripts .tabs');
  scriptsTabs.parentNode.insertBefore(addScriptTabBtn, scriptsTabs);

  function createScriptTabForm() {
    const overlay = document.createElement('div');
    overlay.className = 'edit-overlay';
    
    const form = document.createElement('form');
    form.className = 'script-tab-form';
    
    form.innerHTML = `
      <h3>Добавить новый скрипт</h3>
      <div class="form-group">
        <label>Название вкладки:</label>
        <input type="text" name="tabName" required>
      </div>
      <div class="form-group">
        <label>Заголовок скрипта:</label>
        <input type="text" name="scriptTitle" required>
      </div>
      <div class="form-group">
        <label>Код скрипта:</label>
        <textarea name="scriptCode" class="code-textarea" required></textarea>
      </div>
      <div class="form-buttons">
        <button type="submit" class="save-btn">Добавить</button>
        <button type="button" class="cancel-btn">Отмена</button>
      </div>
    `;

    overlay.appendChild(form);
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('active'), 0);

    form.querySelector('.cancel-btn').onclick = () => overlay.remove();
    
    form.onsubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      
      // Create unique ID for the new tab
      const tabId = 'script-' + Date.now();
      
      // Add new tab button
      const newTabBtn = document.createElement('button');
      newTabBtn.className = 'tab-btn';
      newTabBtn.textContent = formData.get('tabName');
      newTabBtn.onclick = () => openTab(tabId);
      
      // Add delete button to tab
      const deleteTabBtn = document.createElement('button');
      deleteTabBtn.className = 'delete-tab-btn';
      deleteTabBtn.innerHTML = '×';
      deleteTabBtn.onclick = (e) => {
        e.stopPropagation();
        if (confirm('Удалить эту вкладку?')) {
          newTabBtn.remove();
          document.getElementById(tabId).remove();
        }
      };
      newTabBtn.appendChild(deleteTabBtn);
      
      scriptsTabs.appendChild(newTabBtn);
      
      // Create new tab content
      const newTabContent = document.createElement('div');
      newTabContent.id = tabId;
      newTabContent.className = 'tab-content';
      newTabContent.setAttribute('data-editable', 'true');
      newTabContent.innerHTML = `
        <h3>${formData.get('scriptTitle')}</h3>
        <pre><code class="language-bash">${formData.get('scriptCode')}</code></pre>
      `;
      
      document.querySelector('#scripts').appendChild(newTabContent);
      
      // Highlight new code
      Prism.highlightElement(newTabContent.querySelector('code'));
      
      // Close form
      overlay.remove();
      
      // Update editable elements
      newTabContent.dataset.id = `editable-${document.querySelectorAll('[data-editable="true"]').length}`;
      saveChanges();
    };
  }

  addScriptTabBtn.addEventListener('click', createScriptTabForm);

  // Add delete buttons to existing tabs
  document.querySelectorAll('.tab-btn').forEach(tabBtn => {
    const deleteTabBtn = document.createElement('button');
    deleteTabBtn.className = 'delete-tab-btn';
    deleteTabBtn.innerHTML = '×';
    deleteTabBtn.onclick = (e) => {
      e.stopPropagation();
      const tabId = tabBtn.getAttribute('onclick').match(/'([^']+)'/)[1];
      if (confirm('Удалить эту вкладку?')) {
        tabBtn.remove();
        document.getElementById(tabId).remove();
        
        // Show first tab if exists
        const firstTab = document.querySelector('.tab-btn');
        if (firstTab) {
          firstTab.click();
        }
      }
    };
    tabBtn.appendChild(deleteTabBtn);
  });

  // Add Command Group functionality
  const addCommandGroupBtn = document.querySelector('.add-command-group-btn');
  
  function createCommandGroupForm() {
    const overlay = document.createElement('div');
    overlay.className = 'edit-overlay';
    
    const form = document.createElement('form');
    form.className = 'command-form';
    
    form.innerHTML = `
      <h3>Добавить группу команд</h3>
      <div class="form-group">
        <label>Название группы:</label>
        <input type="text" name="groupName" required>
      </div>
      <div class="form-buttons">
        <button type="submit" class="save-btn">Добавить</button>
        <button type="button" class="cancel-btn">Отмена</button>
      </div>
    `;

    overlay.appendChild(form);
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('active'), 0);

    form.querySelector('.cancel-btn').onclick = () => overlay.remove();
    
    form.onsubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      
      const newGroup = document.createElement('div');
      newGroup.className = 'command-group';
      newGroup.innerHTML = `
        <h3>${formData.get('groupName')}</h3>
        <div class="command-list"></div>
      `;
      
      document.querySelector('.command-groups').appendChild(newGroup);
      overlay.remove();
      saveChanges();
    };
  }

  addCommandGroupBtn.addEventListener('click', createCommandGroupForm);

  // Add Command functionality
  const addCommandBtn = document.querySelector('.add-command-btn');
  
  function createCommandForm() {
    const overlay = document.createElement('div');
    overlay.className = 'edit-overlay';
    
    const form = document.createElement('form');
    form.className = 'command-form';
    
    const commandGroups = Array.from(document.querySelectorAll('.command-group h3'))
      .map(h3 => h3.textContent);
    
    form.innerHTML = `
      <h3>Добавить команду</h3>
      <div class="form-group">
        <label>Группа команд:</label>
        <select name="commandGroup" required>
          ${commandGroups.map(group => `<option value="${group}">${group}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Команда:</label>
        <textarea name="command" required class="code-textarea"></textarea>
      </div>
      <div class="form-group">
        <label>Описание:</label>
        <input type="text" name="description" required>
      </div>
      <div class="form-buttons">
        <button type="submit" class="save-btn">Добавить</button>
        <button type="button" class="cancel-btn">Отмена</button>
      </div>
    `;

    overlay.appendChild(form);
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('active'), 0);

    form.querySelector('.cancel-btn').onclick = () => overlay.remove();
    
    form.onsubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      
      const groupName = formData.get('commandGroup');
      const commandGroup = Array.from(document.querySelectorAll('.command-group'))
        .find(group => group.querySelector('h3').textContent === groupName);
      
      const newCommand = document.createElement('div');
      newCommand.className = 'command-item';
      newCommand.innerHTML = `
        <pre><code class="language-bash">${formData.get('command')}</code></pre>
        <p class="command-description">${formData.get('description')}</p>
        <button type="button" class="delete-command-btn">
          <svg viewBox="0 0 24 24">
            <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" stroke-linecap="round"/>
          </svg>
        </button>
      `;
      
      // Add delete functionality
      const deleteBtn = newCommand.querySelector('.delete-command-btn');
      deleteBtn.onclick = () => {
        if (confirm('Удалить эту команду?')) {
          newCommand.remove();
          saveChanges();
        }
      };
      
      commandGroup.querySelector('.command-list').appendChild(newCommand);
      Prism.highlightElement(newCommand.querySelector('code'));
      overlay.remove();
      saveChanges();
    };
  }

  addCommandBtn.addEventListener('click', createCommandForm);

  // Update delete button HTML in command item
  document.querySelectorAll('.command-item .delete-command-btn').forEach(btn => {
    btn.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" stroke-linecap="round"/>
      </svg>
    `;
  });

  // Add delete functionality to existing commands
  document.querySelectorAll('.command-item').forEach(item => {
    const deleteBtn = item.querySelector('.delete-command-btn');
    deleteBtn.onclick = () => {
      if (confirm('Удалить эту команду?')) {
        item.remove();
        saveChanges();
      }
    };
  });

  // Add Checklist Item functionality
  const addChecklistItemBtn = document.createElement('button');
  addChecklistItemBtn.className = 'add-prerequisite-btn';
  addChecklistItemBtn.innerHTML = `
    <svg class="icon" viewBox="0 0 24 24" width="24" height="24">
      <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
    </svg>
    Добавить пункт проверки
  `;

  const checklist = document.querySelector('.checklist');
  checklist.parentNode.insertBefore(addChecklistItemBtn, checklist.nextSibling);

  function createChecklistItemForm() {
    const overlay = document.createElement('div');
    overlay.className = 'edit-overlay';
    
    const form = document.createElement('form');
    form.className = 'prerequisite-form';
    
    form.innerHTML = `
      <h3>Добавить пункт проверки</h3>
      <div class="form-group">
        <label>Текст проверки:</label>
        <input type="text" name="checkText" required>
      </div>
      <div class="form-buttons">
        <button type="submit" class="save-btn">Добавить</button>
        <button type="button" class="cancel-btn">Отмена</button>
      </div>
    `;

    overlay.appendChild(form);
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('active'), 0);

    form.querySelector('.cancel-btn').onclick = () => overlay.remove();
    
    form.onsubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      
      const newCheckItem = document.createElement('label');
      newCheckItem.className = 'check-item';
      newCheckItem.innerHTML = `
        <input type="checkbox">
        <span>${formData.get('checkText')}</span>
        <button type="button" class="delete-check-item-btn">×</button>
      `;
      
      // Add delete functionality to new check item
      const deleteBtn = newCheckItem.querySelector('.delete-check-item-btn');
      deleteBtn.onclick = () => {
        if (confirm('Удалить этот пункт проверки?')) {
          newCheckItem.remove();
          saveChanges();
        }
      };
      
      checklist.appendChild(newCheckItem);
      overlay.remove();
      saveChanges();
    };
  }

  addChecklistItemBtn.addEventListener('click', createChecklistItemForm);

  // Add delete buttons to existing checklist items
  document.querySelectorAll('.check-item').forEach(item => {
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-check-item-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.onclick = () => {
      if (confirm('Удалить этот пункт проверки?')) {
        item.remove();
        saveChanges();
      }
    };
    item.appendChild(deleteBtn);
  });

  // File Upload functionality
  const uploadZone = document.querySelector('.upload-zone');
  const fileInput = document.querySelector('#fileInput');
  const fileList = document.querySelector('.file-list');
  let files = [];

  // Load saved files from localStorage
  function loadSavedFiles() {
    const savedFiles = localStorage.getItem('uploadedFiles');
    if (savedFiles) {
      files = JSON.parse(savedFiles);
      renderFiles();
    }
  }

  // Save files to localStorage
  function saveFiles() {
    localStorage.setItem('uploadedFiles', JSON.stringify(files));
  }

  // Format file size
  function formatSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  // Render file list
  function renderFiles() {
    fileList.innerHTML = files.map((file, index) => `
      <div class="file-item" style="animation: slideIn 0.3s ease-out ${index * 0.1}s both;">
        <svg class="file-icon" viewBox="0 0 24 24">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" fill="none" stroke="currentColor" stroke-width="2"/>
          <path d="M13 2v7h7" fill="none" stroke="currentColor" stroke-width="2"/>
        </svg>
        <div class="file-info">
          <div class="file-name">${file.name}</div>
          <div class="file-meta">
            <span>${formatSize(file.size)}</span> • 
            <span>${new Date(file.lastModified).toLocaleDateString()}</span>
          </div>
        </div>
        <div class="file-actions">
          <button class="file-action-btn" onclick="downloadFile(${index})">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="file-action-btn" onclick="deleteFile(${index})">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    `).join('');
  }

  // Handle file upload
  function handleFiles(uploadedFiles) {
    Array.from(uploadedFiles).forEach(file => {
      const fileData = {
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
        type: file.type,
        content: null
      };
      
      const reader = new FileReader();
      reader.onload = function(e) {
        fileData.content = e.target.result;
        files.push(fileData);
        saveFiles();
        renderFiles();
      };
      reader.readAsDataURL(file);
    });
  }

  // Drag and drop handlers
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
  });

  uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
  });

  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
  });

  // Click to upload
  uploadZone.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
  });

  // Download file
  window.downloadFile = function(index) {
    const file = files[index];
    const link = document.createElement('a');
    link.href = file.content;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Delete file
  window.deleteFile = function(index) {
    if (confirm('Удалить этот файл?')) {
      files.splice(index, 1);
      saveFiles();
      renderFiles();
    }
  };

  // Enhance file upload animations
  uploadZone.addEventListener('dragenter', () => {
    uploadZone.style.transform = 'scale(1.02)';
  });

  uploadZone.addEventListener('dragleave', () => {
    uploadZone.style.transform = 'scale(1)';
  });

  uploadZone.addEventListener('drop', () => {
    uploadZone.style.transform = 'scale(0.98)';
    setTimeout(() => uploadZone.style.transform = 'scale(1)', 200);
  });

  // Add animation to command items
  document.querySelectorAll('.command-item').forEach(item => {
    item.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    item.addEventListener('mouseenter', () => {
      item.style.transform = 'translateX(10px)';
    });
    item.addEventListener('mouseleave', () => {
      item.style.transform = 'translateX(0)';
    });
  });

  // Initialize
  loadSavedFiles();
});