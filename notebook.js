class HTMLNotebook {
    constructor() {
        this.editor = document.getElementById('editor');
        this.currentSelection = null;
        
        this.initializeElements();
        this.bindEvents();
        this.loadFromStorage();
    }

    initializeElements() {
        // Основные элементы
        this.fontSizeInput = document.getElementById('font-size');
        this.boldBtn = document.getElementById('bold-btn');
        this.italicBtn = document.getElementById('italic-btn');
        this.underlineBtn = document.getElementById('underline-btn');
        this.strikethroughBtn = document.getElementById('strikethrough-btn');
        
        // Цвет текста
        this.textColorBtn = document.getElementById('text-color-btn');
        this.textColorPalette = document.getElementById('text-color-palette');
        this.textColorPreview = document.getElementById('text-color-preview');
        
        // Маркер
        this.highlightBtn = document.getElementById('highlight-btn');
        this.highlightColorPalette = document.getElementById('highlight-color-palette');
        this.highlightColorPreview = document.getElementById('highlight-color-preview');
        
        // Ссылки и медиа
        this.linkBtn = document.getElementById('link-btn');
        this.imageBtn = document.getElementById('image-btn');
        this.tableBtn = document.getElementById('table-btn');
        
        // Списки
        this.bulletListBtn = document.getElementById('bullet-list-btn');
        this.numberListBtn = document.getElementById('number-list-btn');
        this.checkListBtn = document.getElementById('check-list-btn');
        
        // Выравнивание
        this.alignBtn = document.getElementById('align-btn');
        this.alignMenu = document.getElementById('align-menu');
        
        // Очистка форматирования
        this.clearFormatBtn = document.getElementById('clear-format-btn');
        
        // Действия с файлами
        this.saveBtn = document.getElementById('save-btn');
        this.loadBtn = document.getElementById('load-btn');
        this.newBtn = document.getElementById('new-btn');
        this.fileInput = document.getElementById('file-input');
        
        // Модальные окна
        this.linkModal = document.getElementById('link-modal');
        this.imageModal = document.getElementById('image-modal');
        this.tableModal = document.getElementById('table-modal');
    }

    bindEvents() {
        // Размер шрифта
        this.fontSizeInput.addEventListener('change', () => this.changeFontSize());
        
        // Основное форматирование
        this.boldBtn.addEventListener('click', () => this.toggleFormat('bold'));
        this.italicBtn.addEventListener('click', () => this.toggleFormat('italic'));
        this.underlineBtn.addEventListener('click', () => this.toggleFormat('underline'));
        this.strikethroughBtn.addEventListener('click', () => this.toggleFormat('strikeThrough'));
        
        // Цвет текста
        this.textColorBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleColorPalette(this.textColorPalette);
        });
        
        this.textColorPalette.addEventListener('click', (e) => {
            if (e.target.classList.contains('color-option')) {
                this.changeTextColor(e.target.dataset.color);
                this.hideColorPalettes();
            }
        });
        
        // Маркер
        this.highlightBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleColorPalette(this.highlightColorPalette);
        });
        
        this.highlightColorPalette.addEventListener('click', (e) => {
            if (e.target.classList.contains('color-option')) {
                this.highlightText(e.target.dataset.color);
                this.hideColorPalettes();
            }
        });
        
        // Ссылки и медиа
        this.linkBtn.addEventListener('click', () => this.showLinkModal());
        this.imageBtn.addEventListener('click', () => this.showImageModal());
        this.tableBtn.addEventListener('click', () => this.showTableModal());
        
        // Списки
        this.bulletListBtn.addEventListener('click', () => this.toggleFormat('insertUnorderedList'));
        this.numberListBtn.addEventListener('click', () => this.toggleFormat('insertOrderedList'));
        this.checkListBtn.addEventListener('click', () => this.insertCheckList());
        
        // Выравнивание
        this.alignBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown(this.alignMenu);
        });
        
        this.alignMenu.addEventListener('click', (e) => {
            if (e.target.classList.contains('dropdown-item')) {
                this.alignText(e.target.dataset.align);
                this.hideDropdowns();
            }
        });
        
        // Очистка форматирования
        this.clearFormatBtn.addEventListener('click', () => this.clearFormatting());
        
        // Действия с файлами
        this.saveBtn.addEventListener('click', () => this.saveDocument());
        this.loadBtn.addEventListener('click', () => this.fileInput.click());
        this.newBtn.addEventListener('click', () => this.newDocument());
        this.fileInput.addEventListener('change', (e) => this.loadDocument(e));
        
        // Модальные окна
        this.setupModalEvents();
        
        // Обновление состояния кнопок
        this.editor.addEventListener('selectionchange', () => this.updateToolbarState());
        this.editor.addEventListener('keyup', () => this.updateToolbarState());
        this.editor.addEventListener('mouseup', () => this.updateToolbarState());
        
        // Автосохранение
        this.editor.addEventListener('input', () => this.autoSave());
        
        // Закрытие выпадающих меню при клике вне их
        document.addEventListener('click', () => {
            this.hideColorPalettes();
            this.hideDropdowns();
        });
        
        // Горячие клавиши
        this.editor.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Обработка списков с галочками
        this.editor.addEventListener('click', (e) => this.handleChecklistClick(e));
    }

    // Основные функции форматирования
    execCommand(command, value = null) {
        document.execCommand(command, false, value);
        this.updateToolbarState();
        this.editor.focus();
    }

    toggleFormat(command) {
        this.execCommand(command);
    }

    changeFontSize() {
        const size = this.fontSizeInput.value + 'px';
        this.execCommand('fontSize', '7'); // Используем размер 7 как базовый
        
        // Применяем стиль к выделенному тексту
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            if (!range.collapsed) {
                const span = document.createElement('span');
                span.style.fontSize = size;
                try {
                    range.surroundContents(span);
                } catch (e) {
                    // Если не удается обернуть, применяем к родительскому элементу
                    const parentElement = range.commonAncestorContainer.parentElement;
                    if (parentElement && parentElement !== this.editor) {
                        parentElement.style.fontSize = size;
                    }
                }
            }
        }
        this.editor.focus();
    }

    changeTextColor(color) {
        this.execCommand('foreColor', color);
        this.textColorPreview.style.backgroundColor = color;
    }

    highlightText(color) {
        if (color === 'transparent') {
            this.execCommand('hiliteColor', 'transparent');
            this.execCommand('backColor', 'transparent');
        } else {
            this.execCommand('hiliteColor', color);
        }
        this.highlightColorPreview.style.backgroundColor = color === 'transparent' ? '#fff' : color;
    }

    alignText(alignment) {
        const commands = {
            'left': 'justifyLeft',
            'center': 'justifyCenter',
            'right': 'justifyRight',
            'justify': 'justifyFull'
        };
        this.execCommand(commands[alignment]);
    }

    clearFormatting() {
        this.execCommand('removeFormat');
        // Дополнительная очистка стилей
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const contents = range.extractContents();
            const textContent = contents.textContent;
            range.insertNode(document.createTextNode(textContent));
        }
    }

    // Списки с галочками
    insertCheckList() {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        
        const ul = document.createElement('ul');
        ul.className = 'checklist';
        
        const li = document.createElement('li');
        li.textContent = 'Новый пункт';
        ul.appendChild(li);
        
        range.insertNode(ul);
        range.setStartAfter(ul);
        selection.removeAllRanges();
        selection.addRange(range);
        
        this.editor.focus();
    }

    handleChecklistClick(e) {
        if (e.target.tagName === 'LI' && e.target.parentElement.classList.contains('checklist')) {
            const rect = e.target.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            
            // Если клик в области чекбокса (первые 25px)
            if (clickX <= 25) {
                e.target.classList.toggle('checked');
                e.preventDefault();
            }
        }
    }

    // Модальные окна
    setupModalEvents() {
        // Ссылка
        document.getElementById('link-ok').addEventListener('click', () => this.insertLink());
        document.getElementById('link-cancel').addEventListener('click', () => this.hideModal(this.linkModal));
        
        // Изображение
        document.getElementById('image-ok').addEventListener('click', () => this.insertImage());
        document.getElementById('image-cancel').addEventListener('click', () => this.hideModal(this.imageModal));
        
        // Таблица
        document.getElementById('table-ok').addEventListener('click', () => this.insertTable());
        document.getElementById('table-cancel').addEventListener('click', () => this.hideModal(this.tableModal));
        
        // Закрытие модальных окон
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.hideModal(modal);
            });
        });
        
        // Закрытие по клику вне модального окна
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal);
                }
            });
        });
    }

    showLinkModal() {
        const selection = window.getSelection();
        const selectedText = selection.toString();
        
        document.getElementById('link-text').value = selectedText;
        document.getElementById('link-url').value = '';
        
        this.showModal(this.linkModal);
    }

    insertLink() {
        const text = document.getElementById('link-text').value;
        const url = document.getElementById('link-url').value;
        
        if (url) {
            const link = `<a href="${url}" target="_blank">${text || url}</a>`;
            this.execCommand('insertHTML', link);
        }
        
        this.hideModal(this.linkModal);
    }

    showImageModal() {
        document.getElementById('image-url').value = '';
        document.getElementById('image-alt').value = '';
        document.getElementById('image-width').value = '300';
        
        this.showModal(this.imageModal);
    }

    insertImage() {
        const url = document.getElementById('image-url').value;
        const alt = document.getElementById('image-alt').value;
        const width = document.getElementById('image-width').value;
        
        if (url) {
            const img = `<img src="${url}" alt="${alt}" style="max-width: ${width}px; height: auto; margin: 10px 0;">`;
            this.execCommand('insertHTML', img);
        }
        
        this.hideModal(this.imageModal);
    }

    showTableModal() {
        document.getElementById('table-rows').value = '3';
        document.getElementById('table-cols').value = '3';
        document.getElementById('table-header').checked = true;
        
        this.showModal(this.tableModal);
    }

    insertTable() {
        const rows = parseInt(document.getElementById('table-rows').value);
        const cols = parseInt(document.getElementById('table-cols').value);
        const hasHeader = document.getElementById('table-header').checked;
        
        let tableHTML = '<table style="border-collapse: collapse; width: 100%; margin: 10px 0;">';
        
        for (let i = 0; i < rows; i++) {
            tableHTML += '<tr>';
            for (let j = 0; j < cols; j++) {
                const cellTag = (i === 0 && hasHeader) ? 'th' : 'td';
                const cellContent = (i === 0 && hasHeader) ? `Заголовок ${j + 1}` : `Ячейка ${i + 1}-${j + 1}`;
                tableHTML += `<${cellTag} style="border: 1px solid #dee2e6; padding: 8px 12px;">${cellContent}</${cellTag}>`;
            }
            tableHTML += '</tr>';
        }
        
        tableHTML += '</table><p><br></p>';
        
        this.execCommand('insertHTML', tableHTML);
        this.hideModal(this.tableModal);
    }

    showModal(modal) {
        modal.classList.add('show');
        const firstInput = modal.querySelector('input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }

    hideModal(modal) {
        modal.classList.remove('show');
        this.editor.focus();
    }

    // Управление выпадающими меню
    toggleColorPalette(palette) {
        this.hideColorPalettes();
        palette.classList.toggle('show');
    }

    hideColorPalettes() {
        document.querySelectorAll('.color-palette').forEach(palette => {
            palette.classList.remove('show');
        });
    }

    toggleDropdown(dropdown) {
        this.hideDropdowns();
        dropdown.classList.toggle('show');
    }

    hideDropdowns() {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    }

    // Обновление состояния панели инструментов
    updateToolbarState() {
        // Обновляем состояние кнопок форматирования
        this.boldBtn.classList.toggle('active', document.queryCommandState('bold'));
        this.italicBtn.classList.toggle('active', document.queryCommandState('italic'));
        this.underlineBtn.classList.toggle('active', document.queryCommandState('underline'));
        this.strikethroughBtn.classList.toggle('active', document.queryCommandState('strikeThrough'));
        
        // Обновляем размер шрифта
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const element = range.commonAncestorContainer.nodeType === Node.TEXT_NODE 
                ? range.commonAncestorContainer.parentElement 
                : range.commonAncestorContainer;
            
            if (element && element.style && element.style.fontSize) {
                const fontSize = parseInt(element.style.fontSize);
                if (!isNaN(fontSize)) {
                    this.fontSizeInput.value = fontSize;
                }
            }
        }
    }

    // Горячие клавиши
    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'b':
                    e.preventDefault();
                    this.toggleFormat('bold');
                    break;
                case 'i':
                    e.preventDefault();
                    this.toggleFormat('italic');
                    break;
                case 'u':
                    e.preventDefault();
                    this.toggleFormat('underline');
                    break;
                case 's':
                    e.preventDefault();
                    this.saveDocument();
                    break;
            }
        }
    }

    // Работа с файлами
    saveDocument() {
        const content = this.editor.innerHTML;
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    loadDocument(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.editor.innerHTML = e.target.result;
                this.autoSave();
            };
            reader.readAsText(file);
        }
    }

    newDocument() {
        if (confirm('Создать новый документ? Несохраненные изменения будут потеряны.')) {
            this.editor.innerHTML = '<p>Начните печатать здесь...</p>';
            this.autoSave();
        }
    }

    // Автосохранение в localStorage
    autoSave() {
        try {
            localStorage.setItem('notebook-content', this.editor.innerHTML);
        } catch (e) {
            console.error('Ошибка автосохранения:', e);
        }
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('notebook-content');
            if (saved && saved !== '<p>Начните печатать здесь...</p>') {
                this.editor.innerHTML = saved;
            }
        } catch (e) {
            console.error('Ошибка загрузки из хранилища:', e);
        }
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    new HTMLNotebook();
});
