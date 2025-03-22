addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

// Main request handler
async function handleRequest(request) {
    try {
        if (request.method === 'GET') {
            return new Response(htmlForm(), {
                headers: { 
                    'Content-Type': 'text/html',
                    'Cache-Control': 'no-store' 
                }
            });
        } else if (request.method === 'POST') {
            const formData = await request.formData();
            if (!formData.get('file') || !formData.get('api_key')) {
                return new Response('Missing required fields', { status: 400 });
            }
            return new Response('Processing on client-side', { status: 200 });
        } else {
            return new Response('Method not allowed', { status: 405 });
        }
    } catch (error) {
        return new Response(`Error: ${error.message}`, { status: 500 });
    }
}

// HTML form with translation UI, progress bar, and chunk setting
function htmlForm() {
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SRT Translator to Any Language (Gemini)</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <!-- Add Dropzone CSS -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/dropzone/5.9.3/dropzone.min.css">
    <style>
        :root {
            --bg-gradient-dark: linear-gradient(135deg, #1e1e2f, #2a2a40);
            --bg-gradient-light: linear-gradient(135deg, #f0f2f5, #e2e6ea);
            --text-color-dark: #e0e0e0;
            --text-color-light: #2c3e50;
            --container-bg-dark: rgba(40, 40, 60, 0.9);
            --container-bg-light: rgba(255, 255, 255, 0.9);
            --input-bg-dark: rgba(255, 255, 255, 0.1);
            --input-bg-light: rgba(0, 0, 0, 0.05);
            --border-color-dark: rgba(255, 255, 255, 0.2);
            --border-color-light: rgba(0, 0, 0, 0.2);
            --accent-color: #007bff;
            --accent-hover: #0056b3;
            --error-color: #ff4444;
            --success-color: #44ff44;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: var(--bg-gradient-dark);
            color: var(--text-color-dark);
            line-height: 1.6;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            transition: background 0.3s ease, color 0.3s ease;
        }

        body.light-theme {
            background: var(--bg-gradient-light);
            color: var(--text-color-light);
        }

        body.rtl {
            direction: rtl;
        }

        .theme-toggle {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
        }

        .theme-toggle button {
            background: transparent;
            border: none;
            color: var(--text-color-dark);
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 50%;
            transition: transform 0.3s ease;
        }

        .theme-toggle button:hover {
            transform: rotate(45deg);
        }

        .light-theme .theme-toggle button {
            color: var(--text-color-light);
        }

        .container {
            background: var(--container-bg-dark);
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            max-width: 600px;
            width: 100%;
            margin: 0 auto;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        h1 {
            font-size: 2rem;
            margin-bottom: 1.5rem;
            color: var(--text-color-dark);
            text-align: center;
            font-weight: 600;
        }

        .light-theme h1 {
            color: var(--text-color-light);
        }

        p {
            margin-bottom: 1.5rem;
            text-align: center;
            color: var(--text-color-dark);
        }

        .light-theme p {
            color: var(--text-color-light);
        }

        form {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        label {
            font-weight: bold;
            margin-bottom: 0.5rem;
            color: var(--text-color-dark);
        }

        .light-theme label {
            color: var(--text-color-light);
        }

        .light-theme .remove-file {
            color: var(--text-color-light);
            background: rgba(255, 68, 68, 0.1);
            border: 1px solid rgba(255, 68, 68, 0.3);
            border-radius: 4px;
        }

        .light-theme .remove-file:hover {
            background: rgba(255, 68, 68, 0.2);
        }

        input[type="file"],
        input[type="text"],
        input[type="password"],
        input[type="number"] {
            padding: 0.75rem;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            font-size: 1rem;
            width: 100%;
            background: rgba(255, 255, 255, 0.1);
            color: var(--text-color-dark);
            transition: border-color 0.3s ease, background 0.3s ease;
            direction: ltr;
        }

        .drag-drop-zone {
            border: 2px dashed rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            padding: 2rem;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            background: rgba(255, 255, 255, 0.05);
            margin-bottom: 1rem;
        }

        .drag-drop-zone.dragover {
            border-color: #007bff;
            background: rgba(0, 123, 255, 0.1);
        }

        .drag-drop-zone i {
            font-size: 2rem;
            color: var(--text-color-dark);
            margin-bottom: 1rem;
        }

        .drag-drop-zone p {
            margin: 0;
        }

        .dropzone {
            background: var(--input-bg-dark);
            border: 1px solid var(--border-color-dark);
            border-radius: 8px;
            padding: 0.75rem;
            text-align: center;
            min-height: 150px;
            color: var(--text-color-dark);
            transition: border-color 0.3s ease, background 0.3s ease;
            margin-bottom: 1rem;
        }

        .light-theme .dropzone {
            background: var(--input-bg-light);
            border-color: var(--border-color-light);
            color: var(--text-color-light);
        }

        .dropzone.dz-drag-hover {
            border-color: var(--accent-color);
            background: rgba(0, 123, 255, 0.15);
        }

        .dropzone .dz-message {
            margin: 0;
            font-size: 1rem;
        }

        .dropzone .dz-message i {
            font-size: 2rem;
            margin-bottom: 0.5rem;
            color: var(--text-color-dark);
        }

        .light-theme .dropzone .dz-message i {
            color: var(--text-color-light);
        }

        /* Override Dropzone preview styles */
        .dropzone .dz-preview {
            background: transparent; /* Remove default white background */
            border: none; /* Remove any default border causing a 'round square' */
            margin: 0.5rem 0;
            padding: 0;
            text-align: center;
        }

        .dropzone .dz-preview .dz-details {
            background: var(--input-bg-dark);
            border: 1px solid var(--border-color-dark);
            border-radius: 4px;
            padding: 0.5rem;
            color: var(--text-color-dark);
            font-size: 1rem;
            display: inline-block; /* Prevent it from stretching too wide */
        }

        .light-theme .dropzone .dz-preview .dz-details {
            background: var(--input-bg-light);
            border-color: var(--border-color-light);
            color: var(--text-color-light);
        }

        /* Ensure file name is readable */
        .dropzone .dz-preview .dz-filename {
            color: var(--text-color-dark);
        }

        .light-theme .dropzone .dz-preview .dz-filename {
            color: var(--text-color-light);
        }

        .dropzone .dz-preview .dz-size {
            display: none; /* Hide file size for simplicity, optional */
        }

        .dropzone .dz-preview .dz-remove {
            display: inline-block;
            margin-top: 0.5rem;
            padding: 0.25rem 0.75rem;
            background: rgba(255, 68, 68, 0.1);
            border: 1px solid rgba(255, 68, 68, 0.3);
            border-radius: 4px;
            color: var(--error-color);
            text-decoration: none;
            font-size: 0.9rem;
            cursor: pointer;
            transition: background 0.3s ease, color 0.3s ease;
        }

        .dropzone .dz-preview .dz-remove:hover {
            background: rgba(255, 68, 68, 0.2);
            color: #ff6666;
        }

        .light-theme .dropzone .dz-preview .dz-remove {
            background: rgba(255, 68, 68, 0.05);
            border-color: rgba(255, 68, 68, 0.2);
            color: #cc3333;
        }

        .light-theme .dropzone .dz-preview .dz-remove:hover {
            background: rgba(255, 68, 68, 0.1);
            color: #ff4444;
        }

        .dropzone .dz-preview .dz-error-message {
            color: var(--error-color);
            background: rgba(255, 68, 68, 0.1);
            border: 1px solid rgba(255, 68, 68, 0.3);
            border-radius: 4px;
            padding: 0.5rem;
        }

        .dropzone:focus-within {
            border-color: var(--accent-color);
            background: rgba(255, 255, 255, 0.15);
            outline: none;
        }

        input[type="file"] {
            display: none;
        }

        input[type="text"]:focus,
        input[type="password"]:focus,
        input[type="number"]:focus {
            border-color: #007bff;
            background: rgba(255, 255, 255, 0.15);
            outline: none;
        }

        .api-key-container {
            position: relative;
            display: flex;
            align-items: center;
        }

        .api-key-container input {
            padding-right: 40px;
        }

        .toggle-password {
            position: absolute;
            right: 10px;
            background: none;
            border: none;
            cursor: pointer;
            color: var(--text-color-dark);
            font-size: 1.2rem;
            transition: color 0.3s ease;
        }

        .toggle-password:hover {
            color: #007bff;
        }

        .remember-me {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-top: 0.5rem;
        }

        .remember-me input {
            margin: 0;
        }

        .remember-me label {
            color: var(--text-color-dark);
        }

        .remember-me {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-top: 0.5rem;
        }

        .remember-me input {
            margin: 0;
        }

        .remember-me label {
            color: var(--text-color-dark);
        }

        .remember-me {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-top: 0.5rem;
        }

        .remember-me input {
            margin: 0;
        }

        .remember-me label {
            color: var(--text-color-dark);
        }

        button {
            padding: 0.75rem;
            background: linear-gradient(135deg, #007bff, #0056b3);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            transition: background 0.3s ease, transform 0.2s ease;
        }

        button:hover {
            background: linear-gradient(135deg, #0056b3, #007bff);
            transform: translateY(-2px);
        }

        button:active {
            transform: translateY(0);
        }

        .progress-container {
            margin-top: 1rem;
            display: none;
            animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .progress-details {
            display: flex;
            justify-content: space-between;
            margin-top: 0.5rem;
            font-size: 0.9rem;
            color: var(--text-color-dark);
        }

        .light-theme .progress-details {
            color: var(--text-color-light);
        }

        @media (max-width: 480px) {
            .progress-details {
                flex-direction: column;
                align-items: center;
                gap: 0.5rem;
            }

            .container {
                padding: 1rem;
            }

            input[type="number"],
            input[type="text"],
            input[type="password"],
            select {
                font-size: 16px;
            }
        }

        .progress-bar {
            width: 100%;
            height: 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            overflow: hidden;
        }

        .progress {
            height: 100%;
            background: linear-gradient(135deg, #007bff, #0056b3);
            width: 100%;
            transition: width 0.3s ease;
        }

        .progress-text {
            text-align: center;
            margin-top: 0.5rem;
            color: var(--text-color-dark);
        }

        .download-link {
            margin-top: 1rem;
            text-align: center;
            display: none;
        }

        .download-link a {
            color: #007bff;
            text-decoration: none;
            font-weight: bold;
        }

        .download-link a:hover {
            text-decoration: underline;
        }

        .error-message {
            color: #ff4444;
            text-align: center;
            margin-top: 1rem;
            display: none;
            font-size: 0.9rem;
            word-wrap: break-word;
        }

        .api-key-note {
            font-size: 0.875rem;
            color: #999999;
            text-align: center;
            margin-top: 1rem;
        }

        .api-key-note a {
            color: #007bff;
            text-decoration: none;
            transition: color 0.3s ease;
        }

        .api-key-note a:hover {
            color: #0056b3;
            text-decoration: underline;
        }

        @media (max-width: 768px) {
            h1 {
                font-size: 1.75rem;
            }

            .container {
                padding: 1.5rem;
            }
        }

select {
    padding: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    font-size: 1rem;
    width: 100%;
    background: rgba(255, 255, 255, 0.1);
    color: #e0e0e0;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    cursor: pointer;
    transition: border-color 0.3s ease, background 0.3s ease;
    direction: ltr;
}

select:focus {
    border-color: #007bff;
    background: rgba(255, 255, 255, 0.15);
    outline: none;
}

.advanced-settings {
    margin-top: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 1rem;
}

.advanced-settings summary {
    cursor: pointer;
    padding: 0.5rem;
    color: #ff4444;
    font-weight: bold;
    user-select: none;
}

.advanced-settings summary:hover {
    color: #ff6666;
}

.advanced-warning {
    background: rgba(255, 68, 68, 0.1);
    border: 1px solid rgba(255, 68, 68, 0.3);
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
}

.advanced-warning p {
    color: #ff4444;
    margin-bottom: 1rem;
}

.acknowledge-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #ff4444;
    font-size: 0.9rem;
}

.acknowledge-label input[type="checkbox"] {
    margin: 0;
}

select {
    background-image: url('data:image/svg+xml;utf8,<svg fill="%23e0e0e0" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1rem;
}
    </style>
</head>
<body>
    <div id="root">
        <div class="container">
            <div class="top-bar">
                <h1 id="page-title" class="page-title">SRT Translator to Any Language</h1>
                <button id="themeToggle" aria-label="Toggle theme" title="Click to toggle theme">
                    <i class="fas fa-moon"></i>
                </button>
                <button id="languageToggle" aria-label="Toggle language" title="Click to toggle language">
                    <i class="fas fa-language"></i>
                </button>
                <button id="clear-memory-button" aria-label="Clear translation memory" title="Click to clear translation memory">
                    <i class="fa fa-trash"></i>
                </button>
            </div>
            <br>
            <p id="warning-message" style="color: #ff4444; font-weight: bold; display: block;">⚠️ Please enable Use Proxy checkbox to access the Gemini API if you are in Iran, as Iran is currently under sanctions.</p>
            <p id="upload-instructions">Upload an SRT file or paste SRT content and provide your Gemini API key to translate the text to any language.</p>
            <form id="translate-form" onsubmit="return handleTranslate(event)">
                <label id="input-method-label">Input Method:</label>
                <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                    <label><input type="radio" name="input_method" value="file" checked> Upload File</label>
                    <label><input type="radio" name="input_method" value="text"> Paste Text</label>
                </div>
                
                <div id="file-input" class="input-section">
                    <label id="file-label">Upload SRT File:</label>
                    <div id="dropzone-upload" class="dropzone">
                        <div class="dz-message">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <p>Drag & drop your SRT file here<br>or click to browse</p>
                        </div>
                    </div>
                </div>
                
                <div id="text-input" class="input-section" style="display: none;">
                    <label id="text-label" for="srt_text">Paste SRT Content:</label>
                    <textarea id="srt_text" name="srt_text" rows="6" placeholder="Paste your SRT content here..." style="width: 100%; padding: 0.75rem; border-radius: 8px; background: rgba(255, 255, 255, 0.1); color: #e0e0e0; border: 1px solid rgba(255, 255, 255, 0.2); resize: vertical; direction: ltr;"></textarea>
                </div>

                <label id="api-key-label" for="api_key">Gemini API Key:</label>
                <div class="api-key-container">
                    <input type="password" id="api_key" name="api_key" placeholder="Enter your Gemini API key" required>
                    <button type="button" class="toggle-password" onclick="togglePasswordVisibility()">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>

                <div class="remember-me">
                    <input type="checkbox" id="remember_me" name="remember_me">
                    <label id="remember-me-label" for="remember_me">Remember my API key</label>
                </div>

                <div class="remember-me">
                    <input type="checkbox" id="useProxyCheckbox" name="useProxyCheckbox">
                    <label id="use-proxy-label" for="useProxyCheckbox">Use Proxy</label>
                </div>

                <details class="advanced-settings">
                    <summary id="advanced-settings-summary">Advanced Settings ⚠️</summary>
                    <div class="advanced-warning">
                        <p id="advanced-warning-message">⚠️ Warning: These settings are for advanced users only. Incorrect values may cause translation failures or API quota issues. Proceed with caution.</p>
                        <label class="acknowledge-label">
                            <input type="checkbox" id="acknowledge" name="acknowledge">
                            <span id="acknowledge-text">I understand the risks and know what I'm doing</span>
                        </label>
                    </div>
                    
                    <label id="model-label" for="model">Gemini Model:</label>
                    <select id="model" name="model">
                        <option value="gemini-2.0-flash" selected>Gemini 2.0 Flash</option>
                        <option value="gemma-3-27b-it">Gemma3 27B</option>
                        <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash-Lite</option>
                        <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                        <option value="gemini-1.5-flash-8b">Gemini 1.5 Flash-8B</option>
                        <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                    </select>
                    <label id="base-delay-label" for="base_delay">Base Delay (ms):</label>
                    <input type="number" id="base_delay" name="base_delay" min="100" value="4000" placeholder="Base delay in milliseconds" required>
                    <label id="quota-delay-label" for="quota_delay">Quota Delay (ms):</label>
                    <input type="number" id="quota_delay" name="quota_delay" min="1000" value="60000" placeholder="Quota delay in milliseconds" required>
                    <label id="chunk-count-label" for="chunk_count">Number of Chunks:</label>
                    <input type="number" id="chunk_count" name="chunk_count" min="1" value="20" placeholder="Number of chunks" required>
                    <label id="translation-prompt-label" for="translation_prompt">Translation Instructions:</label>
<textarea id="translation_prompt" name="translation_prompt" rows="4" style="width: 100%; padding: 0.75rem; border-radius: 8px; background: rgba(255, 255, 255, 0.1); color: #e0e0e0; border: 1px solid rgba(255, 255, 255, 0.2); resize: vertical; direction: ltr;">Translate the following subtitle text into the target language while maintaining:
1. Natural, conversational tone
2. Proper grammar and sentence structure
3. Contextual accuracy
4. Consistent terminology
5. Appropriate length for on-screen display
Avoid:
1. Literal translations
2. Overly formal or bookish language
3. Unnatural phrasing
4. Excessive wordiness</textarea>
                </details>

                <label id="lang-label" for="lang">Language:</label>
                <input type="text" id="lang-input" name="lang" value="Persian (Farsi)" placeholder="Language:" style="direction: ltr;">
                <button id="submit-button" type="submit">Translate</button>
            </form>
            <div class="progress-container" id="progress-container">
                <div class="progress-bar">
                    <div class="progress" id="progress"></div>
                </div>
                <div class="progress-text" id="progress-text">0% Complete</div>
                <div class="progress-details">
                    <span id="chunk-status">Processing chunk: 0/0</span>
                    <span id="time-estimate">Estimated time: calculating...</span>
                </div>
            </div>
            <div class="download-link" id="download-link"></div>
            <div class="error-message" id="error-message"></div>
            <p id="api-key-note" class="api-key-note"></p>
        </div>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/dropzone/5.9.3/dropzone.min.js"></script>
        <script>
            // Disable Dropzone auto-discovery
            Dropzone.autoDiscover = false;
            // Theme toggle functionality
            const themeToggle = document.getElementById('themeToggle');
            const themeIcon = themeToggle.querySelector('i');
            const savedTheme = localStorage.getItem('theme');

            function updateTheme(isLight) {
                document.body.classList.toggle('light-theme', isLight);
                themeIcon.classList.replace(isLight ? 'fa-moon' : 'fa-sun', isLight ? 'fa-sun' : 'fa-moon');
                
                // Update container background
                const container = document.querySelector('.container');
                container.style.background = isLight ? 'var(--container-bg-light)' : 'var(--container-bg-dark)';
                
                // Update text colors
                const labels = document.querySelectorAll('label:not(.acknowledge-label)');
                labels.forEach(label => label.style.color = isLight ? 'var(--text-color-light)' : '#ffffff');
                
                // Update input backgrounds and colors
                const inputs = document.querySelectorAll('input[type="text"], input[type="password"], input[type="number"], textarea, select');
                inputs.forEach(input => {
                    input.style.background = isLight ? 'var(--input-bg-light)' : 'var(--input-bg-dark)';
                    input.style.color = isLight ? 'var(--text-color-light)' : 'var(--text-color-dark)';
                    input.style.borderColor = isLight ? 'var(--border-color-light)' : 'var(--border-color-dark)';
                });
                
                // Update drag-drop zone
                const dropZone = document.querySelector('.drag-drop-zone');
                if (dropZone) {
                    dropZone.style.borderColor = isLight ? 'var(--border-color-light)' : 'var(--border-color-dark)';
                    dropZone.style.background = isLight ? 'var(--input-bg-light)' : 'var(--input-bg-dark)';
                }
                
                localStorage.setItem('theme', isLight ? 'light' : 'dark');
            }

            if (savedTheme === 'light') {
                updateTheme(true);
            }

            themeToggle.addEventListener('click', () => {
                const isLight = !document.body.classList.contains('light-theme');
                updateTheme(isLight);
            });

            // Language toggle functionality
            const languageToggle = document.getElementById('languageToggle');
            const savedLanguage = localStorage.getItem('language') || 'English';

            function updateLanguage(lang) {
                const body = document.body;
                const rtlClass = 'rtl';
                const inputs = document.querySelectorAll('input, select, textarea');
                if (lang === 'Persian') {
                    body.classList.add(rtlClass);
                    inputs.forEach(input => input.style.direction = 'ltr');
                    document.getElementById('page-title').textContent = 'مترجم SRT به هر زبانی';
                    document.getElementById('warning-message').textContent = '⚠️ اگر در ایران هستید لطفاً گزینه استفاده از پروکسی را فعال کنید تا به API Gemini دسترسی پیدا کنید ، زیرا ایران در حال حاضر تحت تحریم است.';
                    document.getElementById('upload-instructions').textContent = 'فایل SRT خود را بارگذاری کنید یا محتوای SRT را وارد کنید و کلید API Gemini خود را برای ترجمه متن به هر زبانی وارد کنید.';
                    document.getElementById('input-method-label').textContent = 'روش ورودی:';
                    document.getElementById('file-label').textContent = 'بارگذاری فایل SRT:';
                    document.getElementById('text-label').textContent = 'چسباندن محتوای SRT:';
                    document.getElementById('api-key-label').textContent = 'کلید API Gemini:';
                    document.getElementById('remember-me-label').textContent = 'یادآوری کلید API من';
                    document.getElementById('use-proxy-label').textContent = 'استفاده از پروکسی';
                    document.getElementById('advanced-settings-summary').textContent = 'تنظیمات پیشرفته ⚠️';
                    document.getElementById('advanced-warning-message').textContent = '⚠️ هشدار: این تنظیمات فقط برای کاربران حرفه ای‌تر است. مقادیر نادرست ممکن است باعث عدم ترجمه یا مشکلات در فرایند ترجمه شود. با احتیاط عمل کنید.';
                    document.getElementById('acknowledge-text').textContent = 'من ریسک ها را می فهمم و می دانم که دارم چه کاری انجام می دهم';
                    document.getElementById('model-label').textContent = 'مدل Gemini:';
                    document.getElementById('base-delay-label').textContent = 'تاخیر پایه (ms):';
                    document.getElementById('quota-delay-label').textContent = 'تاخیر کوئیت (ms):';
                    document.getElementById('chunk-count-label').textContent = 'تعداد تکه ها:';
                    document.getElementById('translation-prompt-label').textContent = 'دستورالعمل های ترجمه:';
                    document.getElementById('lang-label').textContent = 'زبان:';
                    document.getElementById('lang-input').placeholder = 'زبان:';
                    document.getElementById('submit-button').textContent = 'ترجمه';
                    document.getElementById('api-key-note').innerHTML = "کلید API خود را از <a href='https://aistudio.google.com/' target='_blank'>Google AI Studio</a> دریافت کنید.";
                } else {
                    body.classList.remove(rtlClass);
                    inputs.forEach(input => input.style.direction = 'ltr');
                    document.getElementById('page-title').textContent = 'SRT Translator to Any Language';
                    document.getElementById('warning-message').textContent = '⚠️ Please enable Use Proxy checkbox to access the Gemini API if you are in Iran, as Iran is currently under sanctions.';
                    document.getElementById('upload-instructions').textContent = 'Upload an SRT file or paste SRT content and provide your Gemini API key to translate the text to any language.';
                    document.getElementById('input-method-label').textContent = 'Input Method:';
                    document.getElementById('file-label').textContent = 'Upload SRT File:';
                    document.getElementById('text-label').textContent = 'Paste SRT Content:';
                    document.getElementById('api-key-label').textContent = 'Gemini API Key:';
                    document.getElementById('remember-me-label').textContent = 'Remember my API key';
                    document.getElementById('use-proxy-label').textContent = 'Use Proxy';
                    document.getElementById('advanced-settings-summary').textContent = 'Advanced Settings ⚠️';
                    document.getElementById('advanced-warning-message').textContent = '⚠️ Warning: These settings are for advanced users only. Incorrect values may cause translation failures or API quota issues. Proceed with caution.';
                    document.getElementById('acknowledge-text').textContent = 'I understand the risks and know what I\\'m doing';
                    document.getElementById('model-label').textContent = 'Gemini Model:';
                    document.getElementById('base-delay-label').textContent = 'Base Delay (ms):';
                    document.getElementById('quota-delay-label').textContent = 'Quota Delay (ms):';
                    document.getElementById('chunk-count-label').textContent = 'Number of Chunks:';
                    document.getElementById('translation-prompt-label').textContent = 'Translation Instructions:';
                    document.getElementById('lang-label').textContent = 'Language:';
                    document.getElementById('lang-input').placeholder = 'Language:';
                    document.getElementById('submit-button').textContent = 'Translate';
                    document.getElementById('api-key-note').innerHTML = "Get your API key from <a href='https://aistudio.google.com/' target='_blank'>Google AI Studio</a>.";
                }
                localStorage.setItem('language', lang);
            }

            if (savedLanguage === 'Persian') {
                updateLanguage('Persian');
            }

            languageToggle.addEventListener('click', () => {
                const currentLanguage = localStorage.getItem('language') === 'Persian' ? 'English' : 'Persian';
                updateLanguage(currentLanguage);
            });

            // Keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey || e.metaKey) {
                    switch(e.key.toLowerCase()) {
                        case 'b': // Toggle theme
                            e.preventDefault();
                            themeToggle.click();
                            break;
                        case 'enter': // Submit form
                            e.preventDefault();
                            document.getElementById('translate-form').requestSubmit();
                            break;
                    }
                }
            });

            let uploadedFile = null;
            const myDropzone = new Dropzone("#dropzone-upload", {
                url: "#",
                autoProcessQueue: false,
                acceptedFiles: ".srt",
                maxFiles: 1,
                dictDefaultMessage: "Drag & drop your SRT file here<br>or click to browse",
                addRemoveLinks: true,
                dictRemoveFile: "Remove File",
                init: function() {
                    this.on("addedfile", function(file) {
                        if (this.files.length > 1) {
                            this.removeFile(this.files[0]);
                        }
                        uploadedFile = file;
                        console.log("File added:", file.name);
                    });
                    this.on("removedfile", function(file) {
                        uploadedFile = null;
                        console.log("File removed:", file.name);
                    });
                    this.on("error", function(file, errorMessage) {
                        console.error("Dropzone error:", errorMessage);
                    });
                }
            });

            function togglePasswordVisibility() {
                const apiKeyInput = document.getElementById('api_key');
                const toggleButton = document.querySelector('.toggle-password i');
                if (apiKeyInput.type === 'password') {
                    apiKeyInput.type = 'text';
                    toggleButton.classList.remove('fa-eye');
                    toggleButton.classList.add('fa-eye-slash');
                } else {
                    apiKeyInput.type = 'password';
                    toggleButton.classList.remove('fa-eye-slash');
                    toggleButton.classList.add('fa-eye');
                }
            }

            function saveApiKey() {
                const apiKeyInput = document.getElementById('api_key');
                const rememberMeCheckbox = document.getElementById('remember_me');
                if (rememberMeCheckbox.checked && apiKeyInput.value) {
                    localStorage.setItem('savedApiKey', apiKeyInput.value);
                } else {
                    localStorage.removeItem('savedApiKey');
                }
            }

            function loadApiKey() {
                const apiKeyInput = document.getElementById('api_key');
                const rememberMeCheckbox = document.getElementById('remember_me');
                const savedApiKey = localStorage.getItem('savedApiKey');
                if (savedApiKey) {
                    apiKeyInput.value = savedApiKey;
                    rememberMeCheckbox.checked = true;
                }
            }

            window.addEventListener('load', () => {
                loadApiKey();
                //setupDragAndDrop();
            });

            function setupDragAndDrop() {
                const dropZone = document.getElementById('dropZone');
                const fileInput = document.getElementById('file');
                const fileInfo = document.getElementById('file-info');

                dropZone.addEventListener('click', () => fileInput.click());

                dropZone.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    dropZone.classList.add('dragover');
                });

                ['dragleave', 'dragend'].forEach(event => {
                    dropZone.addEventListener(event, () => {
                        dropZone.classList.remove('dragover');
                    });
                });

                dropZone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    dropZone.classList.remove('dragover');
                    const files = e.dataTransfer.files;
                    if (files.length) {
                        fileInput.files = files;
                        updateFileInfo(files[0]);
                    }
                });

                fileInput.addEventListener('change', () => {
                    if (fileInput.files.length) {
                        updateFileInfo(fileInput.files[0]);
                    }
                });

                document.querySelector('.remove-file').addEventListener('click', () => {
                    fileInput.value = '';
                    fileInfo.style.display = 'none';
                    dropZone.style.display = 'block';
                });
            }

            function updateFileInfo(file) {
                const fileInfo = document.getElementById('file-info');
                const dropZone = document.getElementById('dropZone');
                const fileNameSpan = fileInfo.querySelector('span');
                
                const MAX_FILENAME_LENGTH = 20;
                const truncatedFileName = file.name.length > MAX_FILENAME_LENGTH ? file.name.substring(0, MAX_FILENAME_LENGTH) + '...' : file.name;
                fileNameSpan.textContent = truncatedFileName;
                fileInfo.style.display = 'block';
                dropZone.style.display = 'none';
            }

            // Translation Memory store
            let translationMemory = JSON.parse(localStorage.getItem('translationMemory') || '{}');

            function updateTranslationMemory(sourceText, translatedText, lang) {
                if (!translationMemory[lang]) {
                    translationMemory[lang] = {};
                }
                translationMemory[lang][sourceText] = translatedText;
                localStorage.setItem('translationMemory', JSON.stringify(translationMemory));
            }

             function findInTranslationMemory(text, lang) {
                return translationMemory[lang]?.[text];
            }

        function parseSRT(srtContent) {
    // Log raw input for debugging
    console.log(\`Raw SRT content (length: \${srtContent.length}):\`, srtContent);

    // Handle potential encoding issues
    // Remove BOM (UTF-8: \uFEFF, UTF-16 LE/BE: \uFFFE or \uFEFF) and other control characters
    srtContent = srtContent.replace(/^[\uFEFF\uFFFE]|\\r/g, '');
    // Normalize all line endings to \\n and remove trailing whitespace
    const normalizedContent = srtContent.replace(/(\\r\\n|\\r|\\n)/g, '\\n').trim();
    console.log(\`Normalized content (length: \${normalizedContent.length}):\`, normalizedContent);

    // Split entries on one or more empty lines
    const entries = normalizedContent.split(/\\n\\s*\\n/);
    const parsedEntries = [];

    for (let entry of entries) {
        entry = entry.trim();
        if (!entry) {
            console.warn('Skipping empty entry');
            continue;
        }

        console.log(\`Processing entry: "\${entry}"\`);
        const lines = entry.split('\\n');
        if (lines.length < 2) {
            console.warn(\`Skipping malformed entry (too few lines): "\${entry}"\`);
            // Auto-fix single-line entries with timestamp
            if (lines.length === 1 && lines[0].includes('-->')) {
                console.log(\`Attempting to auto-fix single-line entry: "\${entry}"\`);
                const match = lines[0].match(/^(\\d+)\\s*(.+-->.*)\$/);
                if (match) {
                    const id = match[1].trim();
                    const timeStamp = match[2].trim();
                    parsedEntries.push({ id, timeStamp, text: '' });
                    console.log(\`Auto-fixed entry: ID=\${id}, Timestamp=\${timeStamp}, Text=''\`);
                }
            }
            continue;
        }

        let id = lines[0].trim();
        let timeStamp = lines[1].trim();
        let textLines = lines.slice(2).join('\\n').trim();

        // Auto-fix: If ID contains timestamp-like content, adjust lines
        if (id.includes('-->')) {
            console.log(\`Auto-fixing entry with misplaced timestamp: "\${entry}"\`);
            timeStamp = id;
            id = \`\${parsedEntries.length + 1}\`;
            textLines = lines.slice(1).join('\\n').trim();
        }

        // Validate ID (numeric with optional whitespace)
        if (!/^\\s*\\d+\\s*\$/.test(id)) {
            console.warn(\`Invalid ID in entry, attempting auto-fix: "\${entry}"\`);
            const timestampRegex = /^\\d{2}:\\d{2}:\\d{2}[,.:]\\d{3}\\s*-->\\s*\\d{2}:\\d{2}:\\d{2}[,.:]\\d{3}\$/;
            if (timestampRegex.test(timeStamp)) {
                id = \`\${parsedEntries.length + 1}\`;
                console.log(\`Generated new ID: \${id}\`);
            } else {
                console.warn(\`Cannot fix entry, skipping: "\${entry}"\`);
                continue;
            }
        }

        // Validate and auto-fix timestamp
        const timestampRegex = /^\\d{2}:\\d{2}:\\d{2}[,.:]\\d{3}\\s*-->\\s*\\d{2}:\\d{2}:\\d{2}[,.:]\\d{3}\$/;
        if (!timestampRegex.test(timeStamp)) {
            console.warn(\`Invalid timestamp in entry: "\${entry}"\`);
            // Auto-fix common timestamp issues
            const fixedTimestamp = timeStamp
                .replace(/\.(\\d{3})/g, ',\$1') // Replace dots with commas
                .replace(/\\s+/g, ' ') // Normalize spaces
                .replace(/(\\d{2}:\\d{2}:\\d{2},\\d{3})\\s*-->\\s*(\\d{2}:\\d{2}:\\d{2},\\d{3})/, '\$1 --> \$2');
            
            if (timestampRegex.test(fixedTimestamp)) {
                console.log(\`Auto-fixed timestamp: "\${timeStamp}" -> "\${fixedTimestamp}"\`);
                timeStamp = fixedTimestamp;
            } else {
                console.warn(\`Cannot fix timestamp, skipping: "\${entry}"\`);
                continue;
            }
        }

        parsedEntries.push({ id: id.trim(), timeStamp, text: textLines || '' });
        console.log(\`Parsed entry: ID=\${id}, Timestamp=\${timeStamp}, Text="\${textLines}"\`);
    }

    console.log(\`Parsed \${parsedEntries.length} entries from SRT content\`);
    if (parsedEntries.length === 0) {
        console.error('No valid SRT entries found in the file');
    }
    return parsedEntries;
}

                function splitIntoChunks(array, chunkCount) {
                    if (!array.length) {
                        console.warn('No entries to split into chunks');
                        return [[]]; // Return single empty chunk
                    }

                    // Ensure chunkCount is reasonable
                    const effectiveChunkCount = Math.min(Math.max(1, chunkCount), array.length);
                    const chunks = [];
                    const baseChunkSize = Math.floor(array.length / effectiveChunkCount);
                    let remainder = array.length % effectiveChunkCount;
                    let start = 0;

                    console.log(\`Splitting \${array.length} entries into \${effectiveChunkCount} chunks\`);

                    for (let i = 0; i < effectiveChunkCount; i++) {
                        const chunkSize = baseChunkSize + (remainder > 0 ? 1 : 0);
                        const chunk = array.slice(start, start + chunkSize);
                        chunks.push(chunk);
                        console.log(\`Chunk \${i + 1}: \${chunk.length} entries\`);
                        start += chunkSize;
                        if (remainder > 0) remainder--;
                    }

                    return chunks;
                }


        async function translateChunk(chunk, apiKey, baseDelay, quotaDelay, lang, chunkIndex, model) {
    // Check Translation Memory first
    const cachedTranslations = [];
    let needsTranslation = false;

    for (const entry of chunk) {
        const cached = findInTranslationMemory(entry.text, lang);
        if (cached) {
            cachedTranslations.push(cached);
        } else {
            needsTranslation = true;
            break;
        }
    }

    // If all translations were found in memory, return them
    if (!needsTranslation) {
        console.log(\`Chunk \${chunkIndex} retrieved from Translation Memory\`);
        return cachedTranslations;
    }

    const directUrl = \`https://generativelanguage.googleapis.com/v1beta/models/\${model}:generateContent?key=\${apiKey}\`;
    const proxyUrl = 'https://middleman.yebekhe.workers.dev'; // Replace with your Cloudflare Worker URL
    const headers = { 'Content-Type': 'application/json' };
    const combinedText = chunk.map(entry => entry.text).join('\\n---\\n');
    console.log(\`Chunk \${chunkIndex} input (length: \${combinedText.length}): \${combinedText}\`);
    const translationPrompt = document.getElementById('translation_prompt').value.trim();
    const promptPrefix = translationPrompt
        ?   \`Translate the following text to \${lang}.\\n\\n\${translationPrompt}\`
        :   \`Translate the following text to \${lang}.\\n\\nTranslate the following subtitle text into the target language while maintaining:\\n\\n1. Natural, conversational tone\\n2. Proper grammar and sentence structure\\n3. Contextual accuracy\n4. Consistent terminology\\n5. Appropriate length for on-screen display\\n\\nAvoid:\\n\\n1. Literal translations\\n2. Overly formal or bookish language\\n3. Unnatural phrasing\\n4. Excessive wordiness\`;

    const payload = {
        contents: [{
            parts: [{
                text: \`\${promptPrefix} Return only the translated text, maintaining the same number of lines separated by "---", nothing else:\\n\\n\${combinedText}\`
            }]
        }],
        endpoint: directUrl // Include the target endpoint for the proxy
    };

    let attempts = 0;
    const maxAttempts = 5;
    const useProxyCheckbox = document.getElementById('useProxyCheckbox'); 

    while (attempts < maxAttempts) {
        try {
            const targetUrl = (useProxyCheckbox && useProxyCheckbox.checked) ? proxyUrl : directUrl;
            if (targetUrl === directUrl) {
                delete payload.endpoint; // Remove the endpoint from the payload
            }
            const response = await fetch(targetUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                if (response.status === 503) {
                    throw new Error('Service unavailable (503) - Retrying...');
                } else if (response.status === 429) {
                    throw new Error('Quota exceeded (429) - Retrying...');
                }
                throw new Error(\`API error: \${response.status} - \${response.statusText}\`);
            }

            const data = await response.json();
            if (!data.candidates || !data.candidates[0].content || !data.candidates[0].content.parts[0].text) {
                throw new Error('Invalid response from API - Ensure your API key is valid');
            }

            await new Promise(resolve => setTimeout(resolve, baseDelay));
            const translatedText = data.candidates[0].content.parts[0].text.trim();
            console.log(\`Chunk \${chunkIndex} response: \${translatedText}\`);
            const translatedLines = translatedText.split('---');

            // Store translations in memory when successful
            chunk.forEach((entry, idx) => {
                if (translatedLines[idx]) {
                    updateTranslationMemory(entry.text, translatedLines[idx].trim(), lang);
                }
            });

            if (translatedLines.length !== chunk.length) {
                throw new Error(\`Translation response does not match chunk entry count (expected \${chunk.length}, got \${translatedLines.length})\`);
            }
            return translatedLines;

        } catch (error) {
            attempts++;
            if (attempts < maxAttempts) {
                let delay;
                if (error.message.includes('503')) {
                    delay = Math.pow(2, attempts) * baseDelay;
                    console.log(\`Retry attempt \${attempts} for 503 in chunk \${chunkIndex}: Waiting \${delay / 1000}s\`);
                } else if (error.message.includes('429')) {
                    delay = quotaDelay;
                    console.log(\`Retry attempt \${attempts} for 429 in chunk \${chunkIndex}: Waiting \${delay / 1000}s\`);
                } else if (error.message.includes('Translation response does not match chunk entry count')) {
                    delay = baseDelay;
                    console.log(\`Retry attempt \${attempts} for mismatched response in chunk \${chunkIndex}: Waiting \${delay / 1000}s\`);
                } else {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw error;
        }
    }
    throw new Error('Max retry attempts reached');
}

        function reconstructSRT(entries) {
                    let srtContent = '';
                    for (const entry of entries) {
                        srtContent += \`\${entry.id}\\n\${entry.timeStamp}\\n\${entry.text}\\n\\n\`;
                    }
                    return srtContent.trim();
                }

        // Add input method toggle
        document.addEventListener('change', (e) => {
            if (e.target.name === 'input_method') {
                const fileInput = document.getElementById('file-input');
                const textInput = document.getElementById('text-input');
                const fileElement = document.getElementById('file');
                const textElement = document.getElementById('srt_text');
                
                if (e.target.value === 'file') {
                    fileInput.style.display = 'block';
                    textInput.style.display = 'none';
                    fileElement.setAttribute('required', '');
                    textElement.removeAttribute('required');
                } else {
                    fileInput.style.display = 'none';
                    textInput.style.display = 'block';
                    fileElement.removeAttribute('required');
                    textElement.setAttribute('required', '');
                }
            }
        });

        // Modified handleTranslate function
        async function handleTranslate(event) {
                    event.preventDefault();

                    const inputMethod = document.querySelector('input[name="input_method"]:checked').value;
                    const srtText = document.getElementById('srt_text');
                    const apiKey = document.getElementById('api_key').value;
                    const lang = document.getElementById('lang-input').value;
                    const baseDelay = parseInt(document.getElementById('base_delay').value, 10);
                    const quotaDelay = parseInt(document.getElementById('quota_delay').value, 10);
                    let chunkCount = parseInt(document.getElementById('chunk_count').value, 10);
                    const progressContainer = document.getElementById('progress-container');
                    const progressBar = document.getElementById('progress');
                    const progressText = document.getElementById('progress-text');
                    const downloadLink = document.getElementById('download-link');
                    const errorMessage = document.getElementById('error-message');
                    const submitButton = document.querySelector('button[type="submit"]');
                    const model = document.getElementById('model').value;

                    // Validate inputs
                    if (isNaN(baseDelay) || baseDelay < 100) {
                        errorMessage.textContent = 'Base delay must be at least 100ms.';
                        errorMessage.style.display = 'block';
                        return false;
                    }
                    if (isNaN(quotaDelay) || quotaDelay < 1000) {
                        errorMessage.textContent = 'Quota delay must be at least 1000ms.';
                        errorMessage.style.display = 'block';
                        return false;
                    }
                    if (isNaN(chunkCount) || chunkCount < 1) {
                        errorMessage.textContent = 'Number of chunks must be at least 1.';
                        errorMessage.style.display = 'block';
                        return false;
                    }

                    let srtContent, fileName;
                    if (inputMethod === 'file') {
                        if (!uploadedFile) {
                            errorMessage.textContent = 'Please upload an SRT file.';
                            errorMessage.style.display = 'block';
                            return false;
                        }
                        srtContent = await uploadedFile.text();
                        fileName = uploadedFile.name;
                    } else {
                        if (!srtText.value.trim()) {
                            errorMessage.textContent = 'Please paste SRT content.';
                            errorMessage.style.display = 'block';
                            return false;
                        }
                        srtContent = srtText.value;
                        fileName = \`translated_\${new Date().getTime()}\`;
                    }

                    // Reset UI
                    progressContainer.style.display = 'none';
                    downloadLink.style.display = 'none';
                    errorMessage.style.display = 'none';
                    submitButton.disabled = true;

                    try {
                        const parsedEntries = parseSRT(srtContent);
                        if (parsedEntries.length === 0) {
                            throw new Error('No valid SRT entries found. Please check the file format.');
                        }

                        const totalEntries = parsedEntries.length;
                        // Adjust chunkCount if it exceeds the number of entries
                        chunkCount = Math.min(chunkCount, totalEntries);
                        const chunks = splitIntoChunks(parsedEntries, chunkCount);
                        if (chunks.length === 0 || chunks.every(chunk => chunk.length === 0)) {
                            throw new Error('Failed to split SRT entries into chunks.');
                        }

                        const translatedEntries = [];
                        const failedChunks = [];

                        progressContainer.style.display = 'block';

                        for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
                            let chunk = chunks[chunkIndex];
                            if (chunk.length === 0) {
                                console.warn(\`Chunk \${chunkIndex + 1} is empty, skipping\`);
                                continue;
                            }

                            progressText.textContent = \`Processing chunk \${chunkIndex + 1} of \${chunks.length} (\${Math.round(chunkIndex / chunks.length * 100)}% complete)\`;
                            const startTime = performance.now();
                            let retryCount = 0;
                            const maxRetries = 2;

                            const totalProgress = Math.round((chunkIndex / chunks.length) * 100);
                            progressBar.style.width = \`\${totalProgress}%\`;
                            progressText.textContent = \`\${totalProgress}% Complete\`;
                            document.getElementById('chunk-status').textContent = \`Processing chunk: \${chunkIndex + 1}/\${chunks.length}\`;

                            let remainingTime;
                            if (chunkIndex === 0) {
                                remainingTime = 0;
                                document.getElementById('time-estimate').textContent = 'Estimated time: calculating...';
                            } else {
                                const elapsedTime = (performance.now() - startTime) / 1000;
                                remainingTime = window.firstChunkTime * (chunks.length - (chunkIndex + 1));
                                const minutes = Math.floor(Math.max(0, remainingTime) / 60);
                                const seconds = Math.floor(Math.max(0, remainingTime) % 60);
                                const timeText = minutes > 0 ? \`\${minutes}m \${seconds}s remaining\` : \`\${seconds}s remaining\`;
                                document.getElementById('time-estimate').textContent = \`Estimated time: \${timeText}\`;
                            }

                            while (retryCount <= maxRetries) {
                                try {
                                    console.log(\`Translating chunk \${chunkIndex + 1} with \${chunk.length} entries (Attempt \${retryCount + 1})\`);
                                    const translatedLines = await translateChunk(chunk, apiKey, baseDelay, quotaDelay, lang, chunkIndex + 1, model);

                                    if (chunkIndex === 0) {
                                        window.firstChunkTime = (performance.now() - startTime) / 1000;
                                    }
                                    chunk.forEach((entry, index) => {
                                        translatedEntries.push({
                                            id: entry.id,
                                            timeStamp: entry.timeStamp,
                                            text: translatedLines[index].trim()
                                        });
                                    });
                                    console.log(\`Successfully translated chunk \${chunkIndex + 1}\`);
                                    break;
                                } catch (error) {
                                    console.error(\`Error on chunk \${chunkIndex + 1}: \${error.message}\`);
                                    if (error.message.includes('Quota exceeded')) {
                                        const waitTime = quotaDelay / 1000;
                                        let remainingTime = waitTime;
                                        progressText.textContent = \`Quota exceeded in chunk \${chunkIndex + 1}. Retrying in \${remainingTime}s...\`;
                                        const countdown = setInterval(() => {
                                            remainingTime--;
                                            progressText.textContent = \`Quota exceeded in chunk \${chunkIndex + 1}. Retrying in \${remainingTime}s...\`;
                                            if (remainingTime <= 0) clearInterval(countdown);
                                        }, 1000);
                                        await new Promise(resolve => setTimeout(resolve, quotaDelay));
                                        const translatedLines = await translateChunk(chunk, apiKey, baseDelay, quotaDelay, lang, chunkIndex + 1, model);
                                        chunk.forEach((entry, index) => {
                                            translatedEntries.push({
                                                id: entry.id,
                                                timeStamp: entry.timeStamp,
                                                text: translatedLines[index].trim()
                                            });
                                        });
                                        break;
                                    } else if (error.message.includes('Translation response does not match chunk entry count') && retryCount < maxRetries) {
                                        retryCount++;
                                        progressText.textContent = \`Mismatch in chunk \${chunkIndex + 1}. Retrying (Attempt \${retryCount + 1}/\${maxRetries + 1})...\`;
                                        await new Promise(resolve => setTimeout(resolve, baseDelay));
                                        if (chunkIndex === chunks.length - 1 && retryCount === maxRetries && chunk.length > 1) {
                                            console.log(\`Last chunk \${chunkIndex + 1} failing, splitting into smaller chunks\`);
                                            const newChunks = splitIntoChunks(chunk, 2);
                                            chunks.splice(chunkIndex, 1, ...newChunks);
                                            chunkIndex--;
                                            break;
                                        }
                                        continue;
                                    } else {
                                        failedChunks.push({ chunk: chunkIndex + 1, reason: error.message });
                                        errorMessage.textContent = \`Failed chunk \${chunkIndex + 1} after retries: \${error.message}. Continuing with original text...\`;
                                        errorMessage.style.display = 'block';
                                        chunk.forEach(entry => {
                                            translatedEntries.push({
                                                id: entry.id,
                                                timeStamp: entry.timeStamp,
                                                text: entry.text
                                            });
                                        });
                                        break;
                                    }
                                }
                            }
                        }

                        const translatedSRT = reconstructSRT(translatedEntries);
                        const blob = new Blob([translatedSRT], { type: 'application/octet-stream' });
                        const url = URL.createObjectURL(blob);
                        const MAX_FILENAME_LENGTH = 20;
                        const truncatedFileName = fileName.length > MAX_FILENAME_LENGTH ? fileName.substring(0, MAX_FILENAME_LENGTH) + '...' : fileName;
                        downloadLink.innerHTML = \`<a href="\${url}" download="\${truncatedFileName}-\${lang}.srt">Download Translated SRT (\${translatedEntries.length} entries, \${chunks.length - failedChunks.length} of \${chunks.length} chunks translated)</a>\`;
                        downloadLink.style.display = 'block';

                        if (failedChunks.length > 0) {
                            errorMessage.textContent = \`Translated \${chunks.length - failedChunks.length} of \${chunks.length} chunks. Failed: \${failedChunks.map(c => \`Chunk \${c.chunk} - \${c.reason}\`).join(', ')}\`;
                            errorMessage.style.display = 'block';
                        } else {
                            errorMessage.textContent = 'All chunks translated successfully!';
                            progressText.textContent = 'DONE';
                            document.getElementById('chunk-status').textContent = 'SRT translated successfully';
                            progressBar.style.width = '100%';
                            errorMessage.style.color = '#44ff44';
                            errorMessage.style.display = 'block';
                        }

                        saveApiKey();
                    } catch (error) {
                        errorMessage.textContent = \`Unexpected error: \${error.message}\`;
                        errorMessage.style.display = 'block';
                        console.error('Translation error:', error);
                    } finally {
                        submitButton.disabled = false;
                    }

                    return false;
                }

        // Function to clear translation memory
        function clearTranslationMemory() {
            console.log('Clear Translation Memory function called');
            console.log('Before setting to empty object:', localStorage.getItem('translationMemory'));
            localStorage.setItem('translationMemory', JSON.stringify({}));
            console.log('After setting to empty object:', localStorage.getItem('translationMemory'));
            alert('Translation memory cleared!');
        }

        // Add event listener for the clear memory button
        document.getElementById('clear-memory-button').addEventListener('click', clearTranslationMemory);
    </script>
</body>
</html>
    `;
}
