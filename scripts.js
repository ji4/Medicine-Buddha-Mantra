// ===== 應用程式狀態管理 =====
class AppState {
    constructor() {
        this.isPlaying = false;
        this.currentTime = 0;
        this.playerReady = false;
        this.currentSpeedIndex = 3; // 預設 1x 速度
        this.speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
        // 預留計數器相關狀態
        this.mantraCount = 0;
        this.sessionStartTime = null;
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
        timeManager.start();
        uiManager.updateTimeDisplay();
    }

    onStateChange(event) {
        console.log('播放器狀態變化:', event.data);
        
        if (event.data == YT.PlayerState.PLAYING) {
            appState.isPlaying = true;
            uiManager.updatePlayPauseButton();
            console.log('開始播放');
        } else if (event.data == YT.PlayerState.PAUSED) {
            appState.isPlaying = false;
            uiManager.updatePlayPauseButton();
            console.log('暫停播放');
        } else if (event.data == YT.PlayerState.ENDED) {
            appState.isPlaying = false;
            uiManager.updatePlayPauseButton();
            console.log('播放結束');
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
            console.log(`跳轉到: ${newTime.toFixed(1)}秒 (${seconds > 0 ? '+' : ''}${seconds}秒)`);
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
            console.log('重置並開始播放');
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
            if (appState.playerReady && youtubePlayer) {
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
        
        appState.currentSpeedIndex = appState.speedOptions.indexOf(rate);
        youtubePlayer.setPlaybackRate(rate);
        uiManager.updateSpeedSelectors(rate);
        console.log('播放速度已設為:', rate + 'x');
    }
}

// ===== 計數器管理器（為未來功能預留） =====
class CounterManager {
    constructor() {
        this.count = 0;
        this.isVisible = false;
    }

    init() {
        console.log('初始化計數器管理器...');
        
        // 獲取 DOM 元素
        this.counterPanel = document.getElementById('counterPanel');
        this.counterNumber = document.querySelector('.counter-number');
        this.resetBtn = document.getElementById('resetCounter');
        this.toggleBtns = {
            mobile: document.getElementById('counterToggleBtn'),
            desktop: document.getElementById('counterToggleBtnDesktop')
        };

        // 檢查元素是否存在
        if (!this.counterPanel) console.error('找不到計數器面板元素');
        if (!this.counterNumber) console.error('找不到計數顯示元素');
        if (!this.resetBtn) console.error('找不到重設按鈕元素');
        if (!this.toggleBtns.mobile) console.error('找不到移動版切換按鈕');
        if (!this.toggleBtns.desktop) console.error('找不到桌面版切換按鈕');

        // 初始化計數器顯示
        this.updateDisplay();

        // 綁定計數器面板點擊事件
        if (this.counterPanel) {
            this.counterPanel.addEventListener('click', (e) => {
                console.log('計數器面板被點擊');
                // 如果點擊的是重設按鈕，不要增加計數
                if (e.target.closest('.reset-btn')) return;
                this.increment();
            });
        }

        // 綁定重設按鈕事件
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', (e) => {
                console.log('重設按鈕被點擊');
                e.stopPropagation(); // 防止觸發面板的點擊事件
                this.reset();
            });
        }

        // 綁定切換按鈕事件
        Object.entries(this.toggleBtns).forEach(([type, btn]) => {
            if (btn) {
                btn.addEventListener('click', () => {
                    console.log(`${type} 切換按鈕被點擊`);
                    this.toggleVisibility();
                });
            }
        });

        // 綁定鍵盤事件
        document.addEventListener('keydown', (e) => {
            if (!this.isVisible) return;

            if (e.key === 'Enter') {
                console.log('Enter 鍵被按下');
                this.increment();
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
                console.log('Delete/Backspace 鍵被按下');
                this.reset();
            }
        });

        console.log('計數器管理器初始化完成');
    }

    toggleVisibility() {
        console.log('切換計數器面板可見性');
        this.isVisible = !this.isVisible;
        if (this.counterPanel) {
            this.counterPanel.classList.toggle('show', this.isVisible);
        }
        
        // 更新切換按鈕狀態
        Object.values(this.toggleBtns).forEach(btn => {
            if (btn) {
                btn.classList.toggle('active', this.isVisible);
            }
        });
        console.log('計數器面板可見性:', this.isVisible);
    }

    increment() {
        this.count++;
        console.log('計數增加到:', this.count);
        this.updateDisplay();
    }

    reset() {
        this.count = 0;
        console.log('計數重設為 0');
        this.updateDisplay();
    }

    updateDisplay() {
        if (this.counterNumber) {
            this.counterNumber.textContent = this.count;
            console.log('更新計數顯示:', this.count);
        } else {
            console.error('無法更新計數顯示：找不到計數顯示元素');
        }
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
        this.youtubeManager = new YouTubePlayerManager();
        this.uiManager = new UIManager();
        this.timeManager = new TimeManager();
        this.speedController = new SpeedController();
        this.counterManager = new CounterManager();
        this.eventManager = new EventManager();
    }

    init() {
        this.youtubeManager.init();
        this.eventManager.init();
        this.counterManager.init();
    }

    cleanup() {
        this.timeManager.stop();
    }
}

// ===== 全域實例 =====
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
});

// 清理函數
window.addEventListener('beforeunload', function() {
    app.cleanup();
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
