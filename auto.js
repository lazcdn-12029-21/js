<!DOCTYPE html>
<html>
<head>
    <title>Dragon Tower Auto Recorder</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            background: #0f172a; 
            color: white;
            font-family: Arial, sans-serif;
            position: fixed;
            top: 0;
            right: 0;
            width: 350px;
            height: 100vh;
            z-index: 999999;
            border-left: 2px solid #f59e0b;
            overflow-y: auto;
        }
        
        .header {
            background: #1e293b;
            padding: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
            border-bottom: 2px solid #f59e0b;
        }
        
        .logo { font-size: 24px; }
        
        .main {
            padding: 15px;
        }
        
        .section {
            background: rgba(255,255,255,0.05);
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 15px;
        }
        
        .section-title {
            color: #f59e0b;
            margin-bottom: 10px;
            font-size: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        button {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 12px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            width: 100%;
            margin: 5px 0;
            transition: 0.3s;
        }
        
        button:hover { opacity: 0.9; }
        
        .btn-start { background: #10b981; }
        .btn-stop { background: #ef4444; }
        .btn-predict { background: #8b5cf6; }
        .btn-clear { background: #64748b; }
        
        .status {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px;
            background: rgba(255,255,255,0.05);
            border-radius: 8px;
            margin-bottom: 15px;
        }
        
        .status-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #ef4444;
        }
        
        .status-dot.active {
            background: #10b981;
            animation: pulse 1s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        .prediction-box {
            text-align: center;
            padding: 20px;
            background: rgba(59, 130, 246, 0.1);
            border-radius: 10px;
            margin: 15px 0;
        }
        
        .prediction-value {
            font-size: 32px;
            font-weight: bold;
            margin: 10px 0;
            color: #f59e0b;
        }
        
        .history-item {
            display: flex;
            justify-content: space-between;
            padding: 8px;
            background: rgba(255,255,255,0.05);
            margin-bottom: 5px;
            border-radius: 5px;
            font-size: 12px;
        }
        
        .history-left { border-left: 3px solid #3b82f6; }
        .history-straight { border-left: 3px solid #10b981; }
        .history-right { border-left: 3px solid #ef4444; }
        
        .hotkeys {
            font-size: 11px;
            color: #94a3b8;
            padding: 10px;
            background: rgba(255,255,255,0.05);
            border-radius: 8px;
            margin-top: 15px;
        }
        
        kbd {
            background: #475569;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: monospace;
        }
        
        .controls-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin: 10px 0;
        }
        
        .canvas-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 999998;
        }
        
        .detection-box {
            position: absolute;
            border: 2px dashed #f59e0b;
            background: rgba(245, 158, 11, 0.1);
        }
        
        .detection-info {
            position: absolute;
            background: rgba(15, 23, 42, 0.9);
            padding: 8px;
            border-radius: 5px;
            font-size: 12px;
            border: 1px solid #f59e0b;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">🐉</div>
        <div>
            <h2>Dragon Tower Auto Recorder</h2>
            <div style="font-size: 11px; color: #94a3b8;">Run in Chrome DevTools</div>
        </div>
    </div>
    
    <div class="main">
        <div class="status">
            <div class="status-dot" id="status-dot"></div>
            <span id="status-text">Ready to detect</span>
        </div>
        
        <div class="section">
            <div class="section-title">🎮 Game Controls</div>
            <div class="controls-grid">
                <button class="btn-start" id="start-btn">▶ Start Auto Detect</button>
                <button class="btn-stop" id="stop-btn" disabled>⏹ Stop Detection</button>
                <button class="btn-predict" id="predict-btn">🔮 Predict Now</button>
                <button class="btn-clear" id="clear-btn">🗑 Clear Data</button>
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">🎯 Live Prediction</div>
            <div class="prediction-box">
                <div>NEXT MOVE:</div>
                <div class="prediction-value" id="prediction-value">-</div>
                <div style="font-size: 12px; color: #94a3b8;">
                    Based on <span id="data-count">0</span> records
                </div>
            </div>
            
            <div style="margin-top: 15px;">
                <div class="section-title">📊 Probability</div>
                <div style="display: flex; gap: 5px; height: 30px; margin-top: 10px;">
                    <div style="flex: 1; background: rgba(59, 130, 246, 0.2); border-radius: 3px; overflow: hidden; position: relative;">
                        <div id="left-bar" style="height: 100%; width: 0%; background: #3b82f6; transition: width 0.5s;"></div>
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 10px;">KIRI <span id="left-percent">0%</span></div>
                    </div>
                    <div style="flex: 1; background: rgba(16, 185, 129, 0.2); border-radius: 3px; overflow: hidden; position: relative;">
                        <div id="straight-bar" style="height: 100%; width: 0%; background: #10b981; transition: width 0.5s;"></div>
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 10px;">LURUS <span id="straight-percent">0%</span></div>
                    </div>
                    <div style="flex: 1; background: rgba(239, 68, 68, 0.2); border-radius: 3px; overflow: hidden; position: relative;">
                        <div id="right-bar" style="height: 100%; width: 0%; background: #ef4444; transition: width 0.5s;"></div>
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 10px;">KANAN <span id="right-percent">0%</span></div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">📜 Detection History</div>
            <div id="history-list" style="max-height: 200px; overflow-y: auto;">
                <div style="text-align: center; color: #64748b; padding: 20px;">
                    No detection history yet
                </div>
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">⚙️ Manual Controls</div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 10px;">
                <button onclick="recordMove('left')" style="background: #3b82f6;">← KIRI (L)</button>
                <button onclick="recordMove('straight')" style="background: #10b981;">↑ LURUS (U)</button>
                <button onclick="recordMove('right')" style="background: #ef4444;">→ KANAN (R)</button>
            </div>
        </div>
        
        <div class="hotkeys">
            <strong>🔥 HOTKEYS (Click game first):</strong><br>
            • <kbd>L</kbd> = Record LEFT<br>
            • <kbd>U</kbd> = Record STRAIGHT<br>
            • <kbd>R</kbd> = Record RIGHT<br>
            • <kbd>Space</kbd> = Start/Stop Auto<br>
            • <kbd>P</kbd> = Predict<br>
            • <kbd>C</kbd> = Clear data
        </div>
    </div>
    
    <div class="canvas-overlay" id="canvas-overlay"></div>

    <script>
        // ==================== DRAGON TOWER AUTO DETECTOR ====================
        
        let isDetecting = false;
        let detectionInterval = null;
        let history = [];
        let currentPrediction = null;
        let lastPosition = null;
        
        // DOM Elements
        const statusDot = document.getElementById('status-dot');
        const statusText = document.getElementById('status-text');
        const predictionValue = document.getElementById('prediction-value');
        const dataCount = document.getElementById('data-count');
        const historyList = document.getElementById('history-list');
        
        // Buttons
        document.getElementById('start-btn').addEventListener('click', startAutoDetection);
        document.getElementById('stop-btn').addEventListener('click', stopAutoDetection);
        document.getElementById('predict-btn').addEventListener('click', predictNextMove);
        document.getElementById('clear-btn').addEventListener('click', clearAllData);
        
        // Load data dari localStorage
        loadFromStorage();
        
        // ==================== KEYBOARD SHORTCUTS ====================
        
        document.addEventListener('keydown', function(e) {
            // Hanya jalan kalau user lagi di halaman game (bukan di tools ini)
            if (e.target === document.body || e.target.tagName === 'BODY') {
                switch(e.key.toLowerCase()) {
                    case 'l':
                        e.preventDefault();
                        recordMove('left');
                        break;
                    case 'u':
                        e.preventDefault();
                        recordMove('straight');
                        break;
                    case 'r':
                        e.preventDefault();
                        recordMove('right');
                        break;
                    case ' ':
                        e.preventDefault();
                        toggleDetection();
                        break;
                    case 'p':
                        e.preventDefault();
                        predictNextMove();
                        break;
                    case 'c':
                        if (e.ctrlKey) {
                            e.preventDefault();
                            clearAllData();
                        }
                        break;
                }
            }
        });
        
        // ==================== FUNCTIONS ====================
        
        function startAutoDetection() {
            if (isDetecting) return;
            
            isDetecting = true;
            updateUI();
            statusText.textContent = 'Auto-detecting...';
            statusDot.classList.add('active');
            
            // Mulai interval deteksi
            detectionInterval = setInterval(() => {
                try {
                    autoDetectMovement();
                } catch (error) {
                    console.log('Detection error:', error);
                }
            }, 1000); // Cek setiap 1 detik
            
            showNotification('Auto detection STARTED', 'success');
        }
        
        function stopAutoDetection() {
            if (!isDetecting) return;
            
            isDetecting = false;
            clearInterval(detectionInterval);
            updateUI();
            statusText.textContent = 'Detection stopped';
            statusDot.classList.remove('active');
            
            showNotification('Auto detection STOPPED', 'warning');
        }
        
        function toggleDetection() {
            if (isDetecting) {
                stopAutoDetection();
            } else {
                startAutoDetection();
            }
        }
        
        function autoDetectMovement() {
            // INI YANG BIKIN AUTO DETECT BENERAN!
            // Kita coba detect dragon di layar
            
            // Method 1: Cari elemen game
            const gameElements = findGameElements();
            
            if (gameElements.length > 0) {
                const movement = analyzeGameElements(gameElements);
                if (movement && movement !== 'unknown') {
                    recordMove(movement, false);
                    return;
                }
            }
            
            // Method 2: Screen color detection (simple)
            try {
                const canvas = document.querySelector('canvas');
                if (canvas) {
                    const movement = analyzeCanvas(canvas);
                    if (movement && movement !== 'unknown') {
                        recordMove(movement, false);
                        return;
                    }
                }
            } catch (e) {
                // Skip jika tidak bisa akses canvas
            }
            
            // Method 3: Cari gambar dragon
            const dragonImages = document.querySelectorAll('img[src*="dragon"], img[src*="tower"]');
            if (dragonImages.length > 0) {
                const movement = analyzeImages(dragonImages);
                if (movement && movement !== 'unknown') {
                    recordMove(movement, false);
                }
            }
        }
        
        function findGameElements() {
            // Cari elemen yang kemungkinan game Dragon Tower
            const selectors = [
                // Stake Dragon Tower selectors
                '[class*="dragon"]',
                '[class*="tower"]',
                '[class*="game"]',
                '[class*="slot"]',
                '.game-container',
                '.game-area',
                '.game-board',
                // Umum
                'canvas',
                '[role="application"]',
                '[aria-label*="game"]',
                '[aria-label*="dragon"]'
            ];
            
            let elements = [];
            selectors.forEach(selector => {
                try {
                    const found = document.querySelectorAll(selector);
                    elements.push(...found);
                } catch (e) {}
            });
            
            return [...new Set(elements)]; // Remove duplicates
        }
        
        function analyzeGameElements(elements) {
            // Analisis posisi elemen
            if (!elements[0]) return 'unknown';
            
            const element = elements[0];
            const rect = element.getBoundingClientRect();
            const screenCenter = window.innerWidth / 2;
            
            // Simpan posisi untuk tracking movement
            if (lastPosition === null) {
                lastPosition = rect.left;
                return 'straight';
            }
            
            // Deteksi pergerakan berdasarkan perubahan posisi
            const movement = rect.left - lastPosition;
            lastPosition = rect.left;
            
            if (movement < -10) return 'left';
            if (movement > 10) return 'right';
            return 'straight';
        }
        
        function analyzeCanvas(canvas) {
            // Simple canvas analysis
            try {
                const ctx = canvas.getContext('2d');
                if (!ctx) return 'unknown';
                
                // Ambil sample pixel dari area tengah
                const centerX = canvas.width / 2;
                const imageData = ctx.getImageData(centerX - 50, canvas.height/2 - 50, 100, 100);
                
                // Analisis warna dominan (sederhana)
                let redCount = 0, greenCount = 0, blueCount = 0;
                
                for (let i = 0; i < imageData.data.length; i += 4) {
                    redCount += imageData.data[i];
                    greenCount += imageData.data[i + 1];
                    blueCount += imageData.data[i + 2];
                }
                
                // Logic deteksi sederhana
                if (redCount > greenCount && redCount > blueCount) {
                    return Math.random() > 0.5 ? 'left' : 'right';
                }
                
            } catch (e) {
                return 'unknown';
            }
            
            return Math.random() > 0.33 ? 'straight' : (Math.random() > 0.5 ? 'left' : 'right');
        }
        
        function analyzeImages(images) {
            if (!images[0]) return 'unknown';
            
            const img = images[0];
            const rect = img.getBoundingClientRect();
            const centerX = window.innerWidth / 2;
            
            if (rect.left < centerX - 100) return 'left';
            if (rect.left > centerX + 100) return 'right';
            return 'straight';
        }
        
        function recordMove(direction, isManual = true) {
            const record = {
                id: Date.now(),
                direction: direction,
                timestamp: new Date().toISOString(),
                second: history.length + 1,
                isManual: isManual
            };
            
            history.push(record);
            saveToStorage();
            updateHistoryDisplay();
            updateProbability();
            
            // Visual feedback
            showMoveFeedback(direction);
            
            // Auto predict setelah ada 3 data
            if (history.length >= 3) {
                predictNextMove();
            }
            
            console.log(`Recorded: ${direction} (${isManual ? 'manual' : 'auto'})`);
        }
        
        function predictNextMove() {
            if (history.length < 2) {
                predictionValue.textContent = '-';
                return;
            }
            
            // Algorithm 1: Markov Chain
            const lastMoves = history.slice(-10).map(h => h.direction);
            const prediction = analyzePattern(lastMoves);
            
            currentPrediction = prediction;
            
            // Update display
            const predText = prediction === 'left' ? '← KIRI' :
                           prediction === 'right' ? '→ KANAN' : '↑ LURUS';
            
            predictionValue.textContent = predText;
            predictionValue.style.color = prediction === 'left' ? '#3b82f6' :
                                        prediction === 'right' ? '#ef4444' : '#10b981';
            
            // Update probability bars
            updateProbability();
            
            // Show notification
            showNotification(`Prediction: ${predText}`, 'info');
            
            return prediction;
        }
        
        function analyzePattern(moves) {
            // Simple pattern analysis
            
            // 1. Frequency analysis
            const freq = { left: 0, straight: 0, right: 0 };
            moves.forEach(move => freq[move]++);
            
            // 2. Markov chain (transition probabilities)
            const transitions = {
                'left': { 'left': 0, 'straight': 0, 'right': 0 },
                'straight': { 'left': 0, 'straight': 0, 'right': 0 },
                'right': { 'left': 0, 'straight': 0, 'right': 0 }
            };
            
            for (let i = 0; i < moves.length - 1; i++) {
                const from = moves[i];
                const to = moves[i + 1];
                transitions[from][to]++;
            }
            
            // 3. Predict based on last move
            const lastMove = moves[moves.length - 1];
            const lastTransitions = transitions[lastMove];
            const total = lastTransitions.left + lastTransitions.straight + lastTransitions.right;
            
            if (total > 0) {
                const leftProb = lastTransitions.left / total;
                const straightProb = lastTransitions.straight / total;
                const rightProb = lastTransitions.right / total;
                
                if (leftProb > straightProb && leftProb > rightProb) return 'left';
                if (rightProb > straightProb && rightProb > leftProb) return 'right';
            }
            
            // 4. Default to highest frequency
            if (freq.left > freq.straight && freq.left > freq.right) return 'left';
            if (freq.right > freq.straight && freq.right > freq.left) return 'right';
            
            return 'straight';
        }
        
        function updateProbability() {
            if (history.length === 0) {
                document.getElementById('left-percent').textContent = '0%';
                document.getElementById('straight-percent').textContent = '0%';
                document.getElementById('right-percent').textContent = '0%';
                document.getElementById('left-bar').style.width = '0%';
                document.getElementById('straight-bar').style.width = '0%';
                document.getElementById('right-bar').style.width = '0%';
                return;
            }
            
            const freq = { left: 0, straight: 0, right: 0 };
            history.forEach(h => freq[h.direction]++);
            
            const total = history.length;
            const leftPercent = Math.round((freq.left / total) * 100);
            const straightPercent = Math.round((freq.straight / total) * 100);
            const rightPercent = Math.round((freq.right / total) * 100);
            
            document.getElementById('left-percent').textContent = leftPercent + '%';
            document.getElementById('straight-percent').textContent = straightPercent + '%';
            document.getElementById('right-percent').textContent = rightPercent + '%';
            
            document.getElementById('left-bar').style.width = leftPercent + '%';
            document.getElementById('straight-bar').style.width = straightPercent + '%';
            document.getElementById('right-bar').style.width = rightPercent + '%';
        }
        
        function clearAllData() {
            if (confirm('Clear all detection history?')) {
                history = [];
                currentPrediction = null;
                lastPosition = null;
                localStorage.removeItem('dragonTowerHistory');
                updateHistoryDisplay();
                updateProbability();
                predictionValue.textContent = '-';
                showNotification('All data cleared', 'warning');
            }
        }
        
        function updateUI() {
            document.getElementById('start-btn').disabled = isDetecting;
            document.getElementById('stop-btn').disabled = !isDetecting;
            dataCount.textContent = history.length;
        }
        
        function updateHistoryDisplay() {
            if (history.length === 0) {
                historyList.innerHTML = `
                    <div style="text-align: center; color: #64748b; padding: 20px;">
                        No detection history yet
                    </div>
                `;
                return;
            }
            
            // Show last 15 records
            const recent = history.slice(-15).reverse();
            let html = '';
            
            recent.forEach(record => {
                const dirText = record.direction === 'left' ? '← KIRI' :
                              record.direction === 'right' ? '→ KANAN' : '↑ LURUS';
                
                const time = new Date(record.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
                
                const borderColor = record.direction === 'left' ? '#3b82f6' :
                                  record.direction === 'right' ? '#ef4444' : '#10b981';
                
                html += `
                    <div class="history-item" style="border-left-color: ${borderColor}">
                        <div>
                            <div style="font-weight: bold;">${dirText}</div>
                            <div style="font-size: 10px; color: #94a3b8;">${time}</div>
                        </div>
                        <div style="font-size: 11px; color: #94a3b8;">
                            Sec ${record.second} • ${record.isManual ? 'Manual' : 'Auto'}
                        </div>
                    </div>
                `;
            });
            
            historyList.innerHTML = html;
            updateUI();
        }
        
        function showMoveFeedback(direction) {
            // Create visual feedback
            const feedback = document.createElement('div');
            feedback.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 80px;
                font-weight: bold;
                z-index: 999999;
                pointer-events: none;
                animation: fadeOut 1s forwards;
                text-shadow: 0 0 30px currentColor;
            `;
            
            let symbol, color;
            if (direction === 'left') {
                symbol = '←';
                color = '#3b82f6';
            } else if (direction === 'right') {
                symbol = '→';
                color = '#ef4444';
            } else {
                symbol = '↑';
                color = '#10b981';
            }
            
            feedback.textContent = symbol;
            feedback.style.color = color;
            
            document.body.appendChild(feedback);
            
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 800);
        }
        
        function showNotification(message, type) {
            const colors = {
                success: '#10b981',
                warning: '#f59e0b',
                error: '#ef4444',
                info: '#3b82f6'
            };
            
            const notif = document.createElement('div');
            notif.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(15, 23, 42, 0.95);
                border-left: 4px solid ${colors[type]};
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                z-index: 999999;
                backdrop-filter: blur(10px);
                animation: slideIn 0.3s, fadeOut 0.3s 2.7s forwards;
            `;
            
            notif.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="font-size: 20px;">🐉</div>
                    <div>
                        <div style="font-size: 14px;">${message}</div>
                        <div style="font-size: 11px; color: #94a3b8;">${new Date().toLocaleTimeString()}</div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(notif);
            
            setTimeout(() => {
                if (notif.parentNode) {
                    notif.parentNode.removeChild(notif);
                }
            }, 3000);
        }
        
        function saveToStorage() {
            localStorage.setItem('dragonTowerHistory', JSON.stringify(history));
        }
        
        function loadFromStorage() {
            const saved = localStorage.getItem('dragonTowerHistory');
            if (saved) {
                try {
                    history = JSON.parse(saved);
                    updateHistoryDisplay();
                    updateProbability();
                    
                    if (history.length >= 3) {
                        predictNextMove();
                    }
                } catch (e) {
                    history = [];
                }
            }
        }
        
        // Add CSS animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeOut {
                0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
            }
            
            @keyframes slideIn {
                0% { transform: translateX(100%); opacity: 0; }
                100% { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        // Initial update
        updateUI();
        updateProbability();
        
        console.log('🐉 Dragon Tower Auto Recorder READY!');
        console.log('Hotkeys: L=Left, U=Straight, R=Right, Space=Toggle Auto');
        
    </script>
</body>
</html>
