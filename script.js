class AIChat {
    constructor() {
        this.messages = [];
        this.currentModel = 'gpt-4';
        this.currentTemperature = 0.7;
        this.useRandomSeed = true;
        this.fixedSeed = null;
        
        this.initializeElements();
        this.loadHistory();
        this.bindEvents();
        this.autoResizeTextarea();
    }

    initializeElements() {
        this.chatMessages = document.getElementById('chat-messages');
        this.messageInput = document.getElementById('message-input');
        this.sendButton = document.getElementById('send-button');
        this.modelSelect = document.getElementById('model-select');
        this.temperatureSlider = document.getElementById('temperature-slider');
        this.temperatureValue = document.getElementById('temperature-value');
        this.seedToggle = document.getElementById('seed-toggle');
        this.seedInput = document.getElementById('seed-input');
        this.clearHistoryBtn = document.getElementById('clear-history');
        this.loading = document.getElementById('loading');
    }

    bindEvents() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        this.modelSelect.addEventListener('change', (e) => {
            this.currentModel = e.target.value;
            this.saveSettings();
        });

        this.temperatureSlider.addEventListener('input', (e) => {
            this.currentTemperature = parseFloat(e.target.value);
            this.temperatureValue.textContent = this.currentTemperature;
            this.saveSettings();
        });

        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());

        this.seedToggle.addEventListener('change', (e) => {
            this.useRandomSeed = e.target.checked;
            this.seedInput.disabled = this.useRandomSeed;
            if (!this.useRandomSeed) {
                this.seedInput.focus();
            }
            this.saveSettings();
        });

        this.seedInput.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            if (!isNaN(value) && value >= 0 && value <= 999999999999999) {
                this.fixedSeed = value;
            } else {
                this.fixedSeed = null;
            }
            this.saveSettings();
        });
    }

    autoResizeTextarea() {
        this.messageInput.addEventListener('input', () => {
            this.messageInput.style.height = 'auto';
            this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
        });
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        // Добавляем сообщение пользователя
        this.addMessage('user', message);
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';
        
        // Показываем индикатор загрузки
        this.showLoading(true);
        this.sendButton.disabled = true;

        try {
            // Отправляем запрос к API
            const response = await this.callAPI(message);
            this.addMessage('ai', response.text, response.seed);
        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
            this.addMessage('ai', 'Извините, произошла ошибка при обработке вашего запроса. Попробуйте еще раз.');
        } finally {
            this.showLoading(false);
            this.sendButton.disabled = false;
            this.messageInput.focus();
        }
    }

    async callAPI(message) {
        // Формируем контекст из последних сообщений для лучшего понимания
        const context = this.getContextMessages();
        const fullMessage = context + message;
        
        // Генерируем случайный сид или используем фиксированный
        const seed = this.useRandomSeed ? 
            Math.floor(Math.random() * 999999999999999) : 
            (this.fixedSeed || Math.floor(Math.random() * 999999999999999));
        
        // Кодируем сообщение для URL
        const encodedMessage = encodeURIComponent(fullMessage);
        
        // Формируем URL с параметрами
        const url = `https://text.pollinations.ai/${encodedMessage}?model=${this.currentModel}&temperature=${this.currentTemperature}&seed=${seed}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        return { text, seed };
    }

    getContextMessages() {
        // Берем последние 5 сообщений для контекста
        const recentMessages = this.messages.slice(-10);
        let context = '';
        
        recentMessages.forEach(msg => {
            if (msg.type === 'user') {
                context += `Пользователь: ${msg.content}\n`;
            } else if (msg.type === 'ai') {
                context += `Ассистент: ${msg.content}\n`;
            }
        });
        
        if (context) {
            context += '\nПользователь: ';
        }
        
        return context;
    }

    addMessage(type, content, seed = null) {
        const message = {
            type,
            content,
            timestamp: new Date().toISOString(),
            model: type === 'ai' ? this.currentModel : null,
            temperature: type === 'ai' ? this.currentTemperature : null,
            seed: type === 'ai' ? seed : null
        };

        this.messages.push(message);
        this.renderMessage(message);
        this.saveHistory();
        this.scrollToBottom();
    }

    renderMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.type}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = message.content;

        const infoDiv = document.createElement('div');
        infoDiv.className = 'message-info';
        
        const time = new Date(message.timestamp).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });

        if (message.type === 'ai') {
            const seedInfo = message.seed ? ` • Seed=${message.seed}` : '';
            infoDiv.textContent = `${time} • ${message.model} • T=${message.temperature}${seedInfo}`;
        } else {
            infoDiv.textContent = time;
        }

        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(infoDiv);
        this.chatMessages.appendChild(messageDiv);
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    showLoading(show) {
        if (show) {
            this.loading.classList.remove('hidden');
        } else {
            this.loading.classList.add('hidden');
        }
    }

    clearHistory() {
        if (confirm('Вы уверены, что хотите очистить всю историю чата?')) {
            this.messages = [];
            this.chatMessages.innerHTML = `
                <div class="message system-message">
                    <div class="message-content">
                        История чата очищена. Начните новый разговор!
                    </div>
                </div>
            `;
            this.saveHistory();
        }
    }

    saveHistory() {
        try {
            localStorage.setItem('ai-chat-history', JSON.stringify(this.messages));
        } catch (error) {
            console.error('Ошибка при сохранении истории:', error);
        }
    }

    loadHistory() {
        try {
            const saved = localStorage.getItem('ai-chat-history');
            if (saved) {
                this.messages = JSON.parse(saved);
                this.renderHistory();
            }
            
            // Загружаем настройки
            this.loadSettings();
        } catch (error) {
            console.error('Ошибка при загрузке истории:', error);
            this.messages = [];
        }
    }

    renderHistory() {
        // Очищаем контейнер, оставляя только системное сообщение
        const systemMessage = this.chatMessages.querySelector('.system-message');
        this.chatMessages.innerHTML = '';
        if (systemMessage) {
            this.chatMessages.appendChild(systemMessage);
        }

        // Рендерим все сообщения из истории
        this.messages.forEach(message => {
            this.renderMessage(message);
        });

        this.scrollToBottom();
    }

    saveSettings() {
        const settings = {
            model: this.currentModel,
            temperature: this.currentTemperature,
            useRandomSeed: this.useRandomSeed,
            fixedSeed: this.fixedSeed
        };
        
        try {
            localStorage.setItem('ai-chat-settings', JSON.stringify(settings));
        } catch (error) {
            console.error('Ошибка при сохранении настроек:', error);
        }
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('ai-chat-settings');
            if (saved) {
                const settings = JSON.parse(saved);
                
                if (settings.model) {
                    this.currentModel = settings.model;
                    this.modelSelect.value = settings.model;
                }
                
                if (settings.temperature !== undefined) {
                    this.currentTemperature = settings.temperature;
                    this.temperatureSlider.value = settings.temperature;
                    this.temperatureValue.textContent = settings.temperature;
                }

                if (settings.useRandomSeed !== undefined) {
                    this.useRandomSeed = settings.useRandomSeed;
                    this.seedToggle.checked = settings.useRandomSeed;
                    this.seedInput.disabled = settings.useRandomSeed;
                }

                if (settings.fixedSeed !== undefined) {
                    this.fixedSeed = settings.fixedSeed;
                    if (settings.fixedSeed !== null) {
                        this.seedInput.value = settings.fixedSeed;
                    }
                }
            }
        } catch (error) {
            console.error('Ошибка при загрузке настроек:', error);
        }
    }
}

// Инициализируем чат когда страница загружена
document.addEventListener('DOMContentLoaded', () => {
    new AIChat();
});
