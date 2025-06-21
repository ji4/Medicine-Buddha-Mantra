// ===== 輔助功能 =====

// 顯示儲存狀態提示
function showStorageStatus() {
    const statusElement = document.getElementById('storageStatus');
    const statusTextElement = document.getElementById('statusText');
    
    if (!statusElement || !statusTextElement) return;
    
    if (storageManager.isStorageAvailable()) {
        // 延遲獲取摘要，等待儲存管理器初始化
        setTimeout(() => {
            const summary = storageManager.getStorageSummary();
            
            let message = '正在載入保存的進度...';
            
            if (summary.mantraCount > 0 || summary.videoTime > 0) {
                const parts = [];
                if (summary.mantraCount > 0) {
                    parts.push(`計數: ${summary.mantraCount}`);
                }
                if (summary.videoTime > 5) {
                    parts.push(`進度: ${summary.videoTime.toFixed(0)}秒`);
                }
                if (parts.length > 0) {
                    message = `已載入保存的 ${parts.join(', ')}`;
                }
            } else {
                message = '歡迎使用藥師咒助念器 🙏';
            }
            
            statusTextElement.textContent = message;
            statusElement.style.display = 'block';
            
            // 3秒後自動隱藏
            setTimeout(() => {
                statusElement.style.display = 'none';
            }, 3000);
        }, 100); // 等待 100ms 讓儲存管理器初始化
    }
}

// 清除所有資料（調試用）
function clearAllData() {
    if (confirm('確定要清除所有保存的資料嗎？這將重設計數器和影片進度。')) {
        storageManager.clearAll();
        
        // 重設應用狀態
        appState.mantraCount = 0;
        appState.currentTime = 0;
        counterManager.setCount(0);
        
        // 重設影片位置
        if (youtubePlayer.isReady()) {
            youtubePlayer.resetAndPlay();
        }
        
        alert('所有資料已清除！');
        console.log('所有儲存資料已清除');
    }
}

// 顯示儲存資訊（調試用）
function showStorageInfo() {
    const summary = storageManager.getStorageSummary();
    const lastSaveDate = summary.lastSaveTime ? new Date(parseInt(summary.lastSaveTime)).toLocaleString() : '無';
    
    const info = `
本機儲存狀態：

計數器：${summary.mantraCount}
影片時間：${summary.videoTime.toFixed(1)}秒
播放速度：${summary.playbackSpeed}x
最後儲存：${lastSaveDate}
儲存可用：${summary.isAvailable ? '是' : '否'}
    `;
    
    alert(info);
    console.log('儲存狀態摘要:', summary);
}

// ===== 本機儲存管理器 =====
class LocalStorageManager {
    constructor() {
        this.keys = {
            MANTRA_COUNT: 'buddhaMantraCount',
            VIDEO_TIME: 'buddhaVideoTime',
            LAST_SAVE_TIME: 'buddhaLastSaveTime',
            PLAYBACK_SPEED: 'buddhaPlaybackSpeed'
        };
    }

    // 儲存計數器數值
    saveMantraCount(count) {
        try {
            localStorage.setItem(this.keys.MANTRA_COUNT, count.toString());
            localStorage.setItem(this.keys.LAST_SAVE_TIME, Date.now().toString());
            console.log('計數器已儲存:', count);
        } catch (error) {
            console.warn('儲存計數器失敗:', error);
        }
    }

    // 讀取計數器數值
    loadMantraCount() {
        try {
            const count = localStorage.getItem(this.keys.MANTRA_COUNT);
            return count ? parseInt(count, 10) : 0;
        } catch (error) {
            console.warn('讀取計數器失敗:', error);
            return 0;
        }
    }

    // 儲存影片播放時間
    saveVideoTime(currentTime) {
        try {
            localStorage.setItem(this.keys.VIDEO_TIME, currentTime.toString());
            localStorage.setItem(this.keys.LAST_SAVE_TIME, Date.now().toString());
            console.log('影片時間已儲存:', currentTime.toFixed(1) + '秒');
        } catch (error) {
            console.warn('儲存影片時間失敗:', error);
        }
    }

    // 讀取影片播放時間
    loadVideoTime() {
        try {
            const time = localStorage.getItem(this.keys.VIDEO_TIME);
            return time ? parseFloat(time) : 0;
        } catch (error) {
            console.warn('讀取影片時間失敗:', error);
            return 0;
        }
    }

    // 儲存播放速度
    savePlaybackSpeed(speed) {
        try {
            localStorage.setItem(this.keys.PLAYBACK_SPEED, speed.toString());
            console.log('播放速度已儲存:', speed + 'x');
        } catch (error) {
            console.warn('儲存播放速度失敗:', error);
        }
    }

    // 讀取播放速度
    loadPlaybackSpeed() {
        try {
            const speed = localStorage.getItem(this.keys.PLAYBACK_SPEED);
            return speed ? parseFloat(speed) : 1.0;
        } catch (error) {
            console.warn('讀取播放速度失敗:', error);
            return 1.0;
        }
    }

    // 清除所有儲存資料
    clearAll() {
        try {
            Object.values(this.keys).forEach(key => {
                localStorage.removeItem(key);
            });
            console.log('所有儲存資料已清除');
        } catch (error) {
            console.warn('清除儲存資料失敗:', error);
        }
    }

    // 檢查儲存空間是否可用
    isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            console.warn('本機儲存不可用:', error);
            return false;
        }
    }

    // 獲取儲存資料的摘要
    getStorageSummary() {
        return {
            mantraCount: this.loadMantraCount(),
            videoTime: this.loadVideoTime(),
            playbackSpeed: this.loadPlaybackSpeed(),
            lastSaveTime: localStorage.getItem(this.keys.LAST_SAVE_TIME),
            isAvailable: this.isStorageAvailable()
        };
    }
}

// ===== 應用程式狀態管理 =====
class AppState {
    constructor() {
        this.isPlaying = false;
        this.currentTime = 0;
        this.playerReady = false;
        this.currentSpeedIndex = 3; // 預設 1x 速度
        this.speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
        // 計數器相關狀態
        this.mantraCount = 0;
        this.sessionStartTime = null;
        // 自動儲存相關
        this.autoSaveInterval = null;
        this.lastVideoTimeSave = 0;
        this.videoTimeSaveThreshold = 1; // 改為每1秒自動儲存一次影片時間
        // 新增：追蹤是否已經開始過播放
        this.hasStartedPlaying = false;
        this.initialLoadComplete = false;
    }

    // 初始化狀態（從本機儲存讀取）
    initializeFromStorage() {
        const savedCount = storageManager.loadMantraCount();
        const savedVideoTime = storageManager.loadVideoTime();
        const savedSpeed = storageManager.loadPlaybackSpeed();
        
        this.mantraCount = savedCount;
        this.currentTime = savedVideoTime;
        
        // 設定播放速度索引
        const speedIndex = this.speedOptions.indexOf(savedSpeed);
        if (speedIndex !== -1) {
            this.currentSpeedIndex = speedIndex;
        }
        
        console.log('已從本機儲存載入狀態:', {
            計數器: savedCount,
            影片時間: savedVideoTime.toFixed(1) + '秒',
            播放速度: savedSpeed + 'x'
        });
    }

    // 開始自動儲存
    startAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        this.autoSaveInterval = setInterval(() => {
            // 只有在已經開始過播放且目前正在播放時才自動儲存
            if (youtubePlayer && youtubePlayer.isReady() && this.hasStartedPlaying && this.isPlaying) {
                const currentTime = youtubePlayer.getCurrentTime();
                // 避免儲存0秒或太小的時間值（除非是重置後的0）
                if (currentTime > 0.5 && Math.abs(currentTime - this.lastVideoTimeSave) >= this.videoTimeSaveThreshold) {
                    storageManager.saveVideoTime(currentTime);
                    this.lastVideoTimeSave = currentTime;
                    console.log('自動儲存播放時間:', currentTime.toFixed(1) + '秒');
                }
            }
        }, 1000); // 改為每1秒檢查一次
        
        console.log('自動儲存已啟動（只在播放時儲存）');
    }

    // 停止自動儲存
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
            console.log('自動儲存已停止');
        }
    }
}

// ===== 配置常數 =====
const CONFIG = {
    VIDEO_ID: 'oayy63pHCAA',
    UPDATE_INTERVAL: 500,
    SEEK_SECONDS: 2,
    KEYBOARD_SHORTCUTS: {
        SPACE: 'Space',
        RESET: 'KeyR',
        SEEK_BACK: ['ArrowLeft', 'BracketLeft'],
        SEEK_FORWARD: ['ArrowRight', 'BracketRight'],
        SPEED_DOWN: ['Minus', 'NumpadSubtract'],
        SPEED_UP: ['Equal', 'NumpadAdd'],
        SPEED_NORMAL: ['Digit0', 'Numpad0']
    }
};

// ===== 全域變數 =====
const appState = new AppState();
let player;
let timeUpdateInterval;

// ===== YouTube 播放器管理 =====
class YouTubePlayerManager {
    constructor() {
        this.player = null;
    }

    init() {
        console.log('YouTube API 正在初始化...');
        this.player = new YT.Player('youtubePlayer', {
            height: '100%',
            width: '100%',
            videoId: CONFIG.VIDEO_ID,
            playerVars: {
                'enablejsapi': 1,
                'rel': 0,
                'modestbranding': 1,
                'controls': 0,
                'disablekb': 1,
                'playsinline': 1,
                'iv_load_policy': 3,
                'fs': 0,
            },
            events: {
                'onReady': this.onReady.bind(this),
                'onStateChange': this.onStateChange.bind(this),
                'onError': this.onError.bind(this)
            }
        });
        player = this.player; // 設定全域參考
    }

    onReady(event) {
        console.log('YouTube Player 已準備就緒');
        appState.playerReady = true;
        
        // 嘗試恢復上次的播放位置和速度
        this.restoreLastPosition();
        
        timeManager.start();
        uiManager.updateTimeDisplay();
    }
    
    // 恢復上次的播放位置和速度
    restoreLastPosition() {
        try {
            const savedTime = storageManager.loadVideoTime();
            const savedSpeed = storageManager.loadPlaybackSpeed();
            
            // 記錄保存的時間，但不立即跳轉（等待播放時再跳轉）
            if (savedTime > 5) {
                appState.lastVideoTimeSave = savedTime;
                console.log('已記錄上次播放位置:', savedTime.toFixed(1) + '秒，將在播放時自動跳轉');
            } else if (savedTime > 0) {
                // 如果時間小於5秒但大於0，記錄但不自動跳轉
                appState.lastVideoTimeSave = savedTime;
                console.log('檢測到較短的播放時間:', savedTime.toFixed(1) + '秒，不自動跳轉');
            } else {
                console.log('沒有有效的播放時間記錄，從頭開始播放');
            }
            
            // 恢復播放速度
            if (savedSpeed && savedSpeed !== 1.0) {
                // 使用延遲來確保播放器完全初始化
                setTimeout(() => {
                    this.player.setPlaybackRate(savedSpeed);
                    speedController.setSpeedFromStorage(savedSpeed);
                }, 500);
                console.log('將恢復播放速度至:', savedSpeed + 'x');
            }
        } catch (error) {
            console.warn('恢復播放狀態失敗:', error);
        }
    }

    onStateChange(event) {
        console.log('播放器狀態變化:', event.data);
        
        if (event.data == YT.PlayerState.PLAYING) {
            appState.isPlaying = true;
            appState.hasStartedPlaying = true; // 標記已經開始過播放
            uiManager.updatePlayPauseButton();
            console.log('開始播放');
            
            // 檢查是否需要恢復到上次的時間
            const currentTime = this.getCurrentTime();
            const savedTime = storageManager.loadVideoTime();
            
            // 如果當前時間接近0秒（小於1秒）且有保存的時間大於5秒，則跳轉到保存的時間
            if (currentTime < 1 && savedTime > 5) {
                console.log('檢測到從0秒開始播放，自動跳轉到上次位置:', savedTime.toFixed(1) + '秒');
                this.player.seekTo(savedTime, true);
                appState.lastVideoTimeSave = savedTime;
            } else if (appState.lastVideoTimeSave === 0) {
                // 如果是第一次播放，初始化lastVideoTimeSave
                appState.lastVideoTimeSave = currentTime;
            }
        } else if (event.data == YT.PlayerState.PAUSED) {
            appState.isPlaying = false;
            uiManager.updatePlayPauseButton();
            
            // 只有在已經開始過播放且時間大於0.5秒時才儲存
            if (appState.hasStartedPlaying) {
                const currentTime = this.getCurrentTime();
                if (currentTime > 0.5) {
                    storageManager.saveVideoTime(currentTime);
                    appState.lastVideoTimeSave = currentTime;
                    console.log('暫停播放，已儲存時間:', currentTime.toFixed(1) + '秒');
                }
            }
        } else if (event.data == YT.PlayerState.ENDED) {
            appState.isPlaying = false;
            uiManager.updatePlayPauseButton();
            console.log('播放結束');
        } else if (event.data == YT.PlayerState.CUED) {
            // 影片已載入但尚未播放
            appState.initialLoadComplete = true;
            console.log('影片已載入完成，等待播放');
        }
    }

    onError(event) {
        console.error('YouTube Player 錯誤:', event.data);
    }

    isReady() {
        return appState.playerReady && this.player;
    }

    togglePlayPause() {
        if (!this.isReady()) {
            console.log('播放器尚未準備就緒');
            return;
        }
        
        try {
            if (appState.isPlaying) {
                this.player.pauseVideo();
                console.log('執行暫停');
            } else {
                this.player.playVideo();
                console.log('執行播放');
            }
        } catch (error) {
            console.error('播放/暫停操作失敗:', error);
        }
    }

    seekRelative(seconds) {
        if (!this.isReady()) {
            console.log('播放器尚未準備就緒，無法跳轉');
            return;
        }
        
        try {
            const currentTime = this.player.getCurrentTime();
            const newTime = Math.max(0, currentTime + seconds);
            this.player.seekTo(newTime, true);
            
            // 跳轉後立即儲存新時間點（只有在已經開始過播放時）
            if (appState.hasStartedPlaying && newTime > 0.5) {
                storageManager.saveVideoTime(newTime);
                appState.lastVideoTimeSave = newTime;
                console.log(`跳轉到: ${newTime.toFixed(1)}秒 (${seconds > 0 ? '+' : ''}${seconds}秒)，已儲存`);
            } else {
                console.log(`跳轉到: ${newTime.toFixed(1)}秒 (${seconds > 0 ? '+' : ''}${seconds}秒)`);
            }
        } catch (error) {
            console.error('跳轉失敗:', error);
        }
    }

    resetAndPlay() {
        if (!this.isReady()) {
            console.log('播放器尚未準備就緒，無法重置');
            return;
        }
        
        try {
            this.player.seekTo(0, true);
            this.player.playVideo();
            
            // 重置時立即儲存時間點為0，並重置播放狀態
            storageManager.saveVideoTime(0);
            appState.lastVideoTimeSave = 0;
            appState.hasStartedPlaying = false; // 重置播放狀態
            console.log('重置並開始播放，已儲存時間點為0');
        } catch (error) {
            console.error('重置播放失敗:', error);
        }
    }

    setPlaybackRate(rate) {
        if (!this.isReady()) {
            console.log('播放器尚未準備就緒，無法改變速度');
            return;
        }
        
        try {
            this.player.setPlaybackRate(rate);
            // 儲存播放速度設定
            storageManager.savePlaybackSpeed(rate);
            console.log('播放速度已設為:', rate + 'x');
        } catch (error) {
            console.error('設定播放速度失敗:', error);
        }
    }

    getCurrentTime() {
        if (!this.isReady()) return 0;
        try {
            return this.player.getCurrentTime();
        } catch (error) {
            return 0;
        }
    }
}

// ===== UI 管理器 =====
class UIManager {
    updatePlayPauseButton() {
        const elements = [
            { play: 'playIcon', pause: 'pauseIcon' },
            { play: 'playIconDesktop', pause: 'pauseIconDesktop' }
        ];
        
        elements.forEach(el => {
            const playIcon = document.getElementById(el.play);
            const pauseIcon = document.getElementById(el.pause);
            
            if (playIcon && pauseIcon) {
                if (appState.isPlaying) {
                    playIcon.style.display = 'none';
                    pauseIcon.style.display = 'block';
                } else {
                    playIcon.style.display = 'block';
                    pauseIcon.style.display = 'none';
                }
            }
        });
    }

    updateTimeDisplay() {
        const timeElements = ['currentTime', 'currentTimeDesktop'];
        const minutes = Math.floor(appState.currentTime / 60);
        const seconds = Math.floor(appState.currentTime % 60);
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        timeElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = timeString;
            }
        });
    }

    updateSpeedSelectors(speed) {
        const selects = document.querySelectorAll('.speed-select');
        selects.forEach(select => {
            select.value = speed;
        });
    }

    showSpeedNotification(speed) {
        let notification = document.getElementById('speedNotification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'speedNotification';
            notification.className = 'speed-notification';
            document.body.appendChild(notification);
        }
        
        notification.textContent = `播放速度: ${speed}x`;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 1000);
    }

    // 預留計數器相關UI更新方法
    updateMantraCounter() {
        const counterElement = document.getElementById('mantraCounter');
        if (counterElement) {
            counterElement.textContent = appState.mantraCount;
        }
    }
}

// ===== 時間管理器 =====
class TimeManager {
    start() {
        if (timeUpdateInterval) {
            clearInterval(timeUpdateInterval);
        }
        
        timeUpdateInterval = setInterval(() => {
            if (appState.playerReady && youtubePlayer && youtubePlayer.isReady()) {
                try {
                    appState.currentTime = youtubePlayer.getCurrentTime();
                    uiManager.updateTimeDisplay();
                } catch (error) {
                    // 靜默處理錯誤
                }
            }
        }, CONFIG.UPDATE_INTERVAL);
    }

    stop() {
        if (timeUpdateInterval) {
            clearInterval(timeUpdateInterval);
        }
    }
}

// ===== 速度控制器 =====
class SpeedController {
    adjustSpeed(direction) {
        if (!youtubePlayer.isReady()) return;
        
        if (direction === 'up' && appState.currentSpeedIndex < appState.speedOptions.length - 1) {
            appState.currentSpeedIndex++;
        } else if (direction === 'down' && appState.currentSpeedIndex > 0) {
            appState.currentSpeedIndex--;
        } else {
            return;
        }
        
        const newSpeed = appState.speedOptions[appState.currentSpeedIndex];
        youtubePlayer.setPlaybackRate(newSpeed);
        uiManager.updateSpeedSelectors(newSpeed);
        uiManager.showSpeedNotification(newSpeed);
        console.log(`速度調整至: ${newSpeed}x`);
    }

    setNormalSpeed() {
        if (!youtubePlayer.isReady()) return;
        
        appState.currentSpeedIndex = 3;
        const normalSpeed = appState.speedOptions[appState.currentSpeedIndex];
        youtubePlayer.setPlaybackRate(normalSpeed);
        uiManager.updateSpeedSelectors(normalSpeed);
        uiManager.showSpeedNotification(normalSpeed);
        console.log('速度重設為正常: 1x');
    }

    changeFromSelect(rate) {
        if (!youtubePlayer.isReady()) return;
        
        const speedIndex = appState.speedOptions.indexOf(rate);
        if (speedIndex !== -1) {
            appState.currentSpeedIndex = speedIndex;
        }
        
        youtubePlayer.setPlaybackRate(rate);
        uiManager.updateSpeedSelectors(rate);
        console.log('播放速度已設為:', rate + 'x');
    }
    
    // 設定速度並更新狀態（用於從儲存載入）
    setSpeedFromStorage(rate) {
        const speedIndex = appState.speedOptions.indexOf(rate);
        if (speedIndex !== -1) {
            appState.currentSpeedIndex = speedIndex;
            uiManager.updateSpeedSelectors(rate);
            console.log('已從儲存載入播放速度:', rate + 'x');
        }
    }
}

// ===== 計數器管理器 =====
class CounterManager {
    constructor() {
        this.count = 0;
        this.isVisible = false;
        this.autoSaveEnabled = true; // 是否啟用自動儲存
        
        // 手機版元素
        this.counterPanel = document.getElementById('counterPanel');
        this.counterToggleBtn = document.getElementById('counterToggleBtn');
        this.resetBtn = document.getElementById('resetCounter');
        
        // 桌機版元素
        this.counterBtnDesktop = document.getElementById('counterBtnDesktop');
        this.resetBtnDesktop = document.getElementById('resetCounterDesktop');
        
        // 所有計數顯示元素
        this.counterNumbers = document.querySelectorAll('.counter-number');
    }

    init() {
        // 從本機儲存載入計數值
        this.loadFromStorage();
        
        // 初始化計數器顯示
        this.updateDisplay();

        // 手機版事件綁定
        if (this.counterPanel && this.counterToggleBtn) {
            // 切換按鈕事件
            this.counterToggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleVisibility();
            });

            // 計數器主要區域點擊事件
            const counterMain = document.getElementById('counterMain');
            if (counterMain) {
                counterMain.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.increment();
                });
            }

            // Reset 區域點擊事件
            const resetArea = document.getElementById('resetArea');
            if (resetArea) {
                resetArea.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.reset();
                });
            }

            // 重設按鈕事件（保留作為備用）
            if (this.resetBtn) {
                this.resetBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.reset();
                });
            }
        }

        // 桌機版事件綁定
        if (this.counterBtnDesktop) {
            this.counterBtnDesktop.addEventListener('click', () => {
                this.increment();
            });
        }

        if (this.resetBtnDesktop) {
            this.resetBtnDesktop.addEventListener('click', () => {
                this.reset();
            });
        }

        // 鍵盤事件
        document.addEventListener('keydown', (e) => {
            // 在手機版時，只有當面板顯示時才響應鍵盤事件
            if (window.innerWidth <= 768 && !this.isVisible) return;

            // 如果焦點在任何一個按鈕上，而且該按鈕不是計數器按鈕，則不執行計數操作
            const focusedElement = document.activeElement;
            if (focusedElement && focusedElement.tagName === 'BUTTON') {
                const isCounterButton = focusedElement.id === 'counterBtnDesktop' || focusedElement.id === 'counterBtnMobile';
                if (!isCounterButton) {
                    return; // 讓 Enter 鍵觸發按鈕的預設 click 行為
                }
            }
            
            if (e.key === 'Enter') {
                e.preventDefault(); // 防止觸發點擊事件
                this.increment();
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault(); // 防止觸發瀏覽器返回等預設行為
                this.reset();
            }
        });

        // 監聽視窗大小變化，當切換到桌面版時隱藏手機版計數器面板
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    handleResize() {
        // 當視窗寬度大於 768px（桌面版）時，隱藏手機版計數器面板
        if (window.innerWidth > 768 && this.isVisible) {
            this.hidePanel();
        }
    }

    hidePanel() {
        this.isVisible = false;
        
        if (this.counterPanel) {
            this.counterPanel.classList.remove('show');
        }
        
        if (this.counterToggleBtn) {
            this.counterToggleBtn.classList.remove('active');
        }
    }

    toggleVisibility() {
        this.isVisible = !this.isVisible;
        
        if (this.counterPanel) {
            this.counterPanel.classList.toggle('show', this.isVisible);
        }
        
        if (this.counterToggleBtn) {
            this.counterToggleBtn.classList.toggle('active', this.isVisible);
        }
    }

    increment() {
        this.count++;
        this.updateDisplay();
        
        // 自動儲存
        if (this.autoSaveEnabled) {
            storageManager.saveMantraCount(this.count);
        }
    }

    reset() {
        this.count = 0;
        this.updateDisplay();
        
        // 儲存重設狀態
        if (this.autoSaveEnabled) {
            storageManager.saveMantraCount(this.count);
        }
    }
    
    // 從本機儲存載入計數值
    loadFromStorage() {
        try {
            const savedCount = storageManager.loadMantraCount();
            this.count = savedCount;
            console.log('計數器已從本機儲存載入:', savedCount);
        } catch (error) {
            console.warn('載入計數器狀態失敗:', error);
            this.count = 0;
        }
    }
    
    // 手動儲存至本機
    saveToStorage() {
        storageManager.saveMantraCount(this.count);
    }
    
    // 設定計數值（不自動儲存）
    setCount(count) {
        this.count = Math.max(0, parseInt(count) || 0);
        this.updateDisplay();
    }
    
    // 設定計數值並儲存
    setCountAndSave(count) {
        this.setCount(count);
        this.saveToStorage();
    }

    updateDisplay() {
        this.counterNumbers.forEach(element => {
            if (element) {
                element.textContent = this.count;
            }
        });
    }
}

// ===== 事件管理器 =====
class EventManager {
    init() {
        this.initControlButtons();
        this.initKeyboardShortcuts();
    }

    initControlButtons() {
        // 使用事件委派處理所有控制按鈕
        document.addEventListener('click', (event) => {
            const button = event.target.closest('[data-action]');
            if (!button) return;

            const action = button.dataset.action;
            const value = button.dataset.value;

            switch (action) {
                case 'toggle':
                    youtubePlayer.togglePlayPause();
                    break;
                case 'reset':
                    youtubePlayer.resetAndPlay();
                    break;
                case 'seek':
                    youtubePlayer.seekRelative(parseInt(value));
                    break;
                case 'counter-increment':
                    counterManager.increment();
                    break;
                case 'counter-reset':
                    counterManager.reset();
                    break;
            }
        });

        // 處理速度選擇器
        document.addEventListener('change', (event) => {
            if (event.target.matches('[data-action="speed"]')) {
                const rate = parseFloat(event.target.value);
                speedController.changeFromSelect(rate);
                
                // 同步其他選擇器
                const selects = document.querySelectorAll('.speed-select');
                selects.forEach(select => {
                    if (select !== event.target) {
                        select.value = event.target.value;
                    }
                });
            }
        });
    }

    initKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // 忽略輸入框中的鍵盤事件
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) {
                return;
            }
            
            const code = event.code;
            
            switch (code) {
                case CONFIG.KEYBOARD_SHORTCUTS.SPACE:
                    event.preventDefault();
                    youtubePlayer.togglePlayPause();
                    break;
                case CONFIG.KEYBOARD_SHORTCUTS.RESET:
                    event.preventDefault();
                    youtubePlayer.resetAndPlay();
                    break;
            }
            
            if (CONFIG.KEYBOARD_SHORTCUTS.SEEK_BACK.includes(code)) {
                event.preventDefault();
                youtubePlayer.seekRelative(-CONFIG.SEEK_SECONDS);
            } else if (CONFIG.KEYBOARD_SHORTCUTS.SEEK_FORWARD.includes(code)) {
                event.preventDefault();
                youtubePlayer.seekRelative(CONFIG.SEEK_SECONDS);
            } else if (CONFIG.KEYBOARD_SHORTCUTS.SPEED_DOWN.includes(code) && !event.metaKey) {
                event.preventDefault();
                speedController.adjustSpeed('down');
            } else if (CONFIG.KEYBOARD_SHORTCUTS.SPEED_UP.includes(code) && !event.metaKey) {
                event.preventDefault();
                speedController.adjustSpeed('up');
            } else if (CONFIG.KEYBOARD_SHORTCUTS.SPEED_NORMAL.includes(code) && !event.metaKey) {
                event.preventDefault();
                speedController.setNormalSpeed();
            }
        });
    }
}

// ===== 應用程式初始化 =====
class App {
    constructor() {
        this.youtubeManager = youtubePlayer;
        this.uiManager = uiManager;
        this.timeManager = timeManager;
        this.speedController = speedController;
        this.counterManager = counterManager;
        this.eventManager = eventManager;
    }

    init() {
        // 檢查儲存可用性
        if (!storageManager.isStorageAvailable()) {
            console.warn('本機儲存不可用，將無法保存設定');
        } else {
            console.log('本機儲存可用，將保存計數器和播放狀態');
            
            // 載入儲存的狀態
            appState.initializeFromStorage();
            
            // 啟動自動儲存
            appState.startAutoSave();
        }
        
        this.eventManager.init();
        this.counterManager.init();
        
        // 顯示儲存摘要（供調試用）
        const summary = storageManager.getStorageSummary();
        console.log('儲存狀態摘要:', summary);
    }

    cleanup() {
        this.timeManager.stop();
        appState.stopAutoSave();
        
        // 在頁面關閉時儲存當前狀態（只有在已經開始過播放時）
        if (storageManager.isStorageAvailable() && youtubePlayer.isReady() && appState.hasStartedPlaying) {
            const currentTime = youtubePlayer.getCurrentTime();
            if (currentTime > 0.5) {
                storageManager.saveVideoTime(currentTime);
                console.log('頁面關閉時已儲存影片位置:', currentTime.toFixed(1) + '秒');
            }
        }
    }
}

// ===== 全域實例 =====
const storageManager = new LocalStorageManager();
const youtubePlayer = new YouTubePlayerManager();
const uiManager = new UIManager();
const timeManager = new TimeManager();
const speedController = new SpeedController();
const counterManager = new CounterManager();
const eventManager = new EventManager();

// ===== YouTube API 回調函數 =====
function onYouTubeIframeAPIReady() {
    youtubePlayer.init();
}

// ===== 頁面生命週期 =====
window.addEventListener('load', () => {
    console.log('頁面完全載入，包括所有依賴項...');
    
    // 顯示載入狀態提示
    showStorageStatus();
    
    // 初始化應用
    const app = new App();
    app.init();
    window.app = app; // 為了調試方便
    
    // 檢查計數器元素
    const counterPanel = document.getElementById('counterPanel');
    const counterToggleBtn = document.getElementById('counterToggleBtn');
    const counterToggleBtnDesktop = document.getElementById('counterToggleBtnDesktop');
    
    console.log('計數器面板元素:', counterPanel ? '已找到' : '未找到');
    console.log('移動版切換按鈕:', counterToggleBtn ? '已找到' : '未找到');
    console.log('桌面版切換按鈕:', counterToggleBtnDesktop ? '已找到' : '未找到');
    
    // 在開發模式下顯示調試控制
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        document.getElementById('debugControls').style.display = 'flex';
    }
});

// 清理函數
window.addEventListener('beforeunload', function() {
    if (window.app) {
        window.app.cleanup();
    }
});

// 頁面可見性變化事件（當使用者切換到其他分頁時）
document.addEventListener('visibilitychange', function() {
    if (document.hidden && window.app && youtubePlayer.isReady() && appState.hasStartedPlaying) {
        const currentTime = youtubePlayer.getCurrentTime();
        if (currentTime > 0.5) {
            storageManager.saveVideoTime(currentTime);
            appState.lastVideoTimeSave = currentTime;
            console.log('切換分頁時已儲存影片位置:', currentTime.toFixed(1) + '秒');
        }
    }
});

// ===== 向後相容的全域函數（保留舊的函數名稱） =====
function togglePlayPause() {
    youtubePlayer.togglePlayPause();
}

function seekRelative(seconds) {
    youtubePlayer.seekRelative(seconds);
}

function resetAndPlay() {
    youtubePlayer.resetAndPlay();
}

function changePlaybackRate() {
    // 這個函數現在由事件委派處理，保留為空函數以防向後相容問題
}

function onPlayerReady(event) {
    youtubePlayer.onReady(event);
}

function onPlayerStateChange(event) {
    youtubePlayer.onStateChange(event);
}

function onPlayerError(event) {
    youtubePlayer.onError(event);
}
