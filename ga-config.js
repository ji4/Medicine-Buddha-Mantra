// Google Analytics 配置檔案
// 請將 'GA_MEASUREMENT_ID' 替換為您的實際 Google Analytics 測量 ID

const GA_CONFIG = {
    // 在這裡填入您的 GA 測量 ID（格式：G-XXXXXXXXXX）
    measurementId: 'G-SWBENZ34HE', // 請替換為您的實際 ID
    
    // 進階追蹤功能開關
    trackingOptions: {
        // 是否追蹤播放器互動
        trackVideoInteractions: true,
        
        // 是否追蹤計數器使用
        trackCounterUsage: true,
        
        // 是否追蹤播放速度調整
        trackSpeedChanges: true,
        
        // 是否追蹤外部連結點擊
        trackExternalLinks: true
    }
};

// 檢測是否應該停用 GA 追蹤
function shouldDisableGA() {
    // 1. 檢查 URL 參數
    const urlParams = new URLSearchParams(window.location.search);
    const gaParam = urlParams.get('ga');
    const noTrackParam = urlParams.get('notrack');
    
    if (gaParam === 'false' || noTrackParam === 'true') {
        console.log('🔍 GA 追蹤已停用（通過 URL 參數）');
        return true;
    }
    
    if (gaParam === 'true') {
        console.log('🔍 GA 追蹤已強制啟用（通過 URL 參數）');
        return false;
    }
    
    // 2. 檢查 localStorage 設定
    const localStorageGA = localStorage.getItem('disableGA');
    if (localStorageGA === 'true') {
        console.log('🔍 GA 追蹤已停用（通過 localStorage 設定）');
        return true;
    }
    
    // 3. 檢查是否為本地開發環境
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || 
                   hostname === '127.0.0.1' || 
                   hostname === '0.0.0.0' ||
                   hostname.startsWith('192.168.') ||
                   hostname.startsWith('10.') ||
                   hostname.startsWith('172.');
    
    if (isLocal) {
        console.log('🔍 GA 追蹤已停用（本地開發環境）');
        return true;
    }
    
    // 4. 檢查是否為特定用戶代理（可選）
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('bot') || userAgent.includes('crawler')) {
        console.log('🔍 GA 追蹤已停用（檢測到爬蟲）');
        return true;
    }
    
    return false;
}

// 初始化 Google Analytics
function initGoogleAnalytics() {
    if (shouldDisableGA()) {
        // 創建一個假的 gtag 函數
        window.gtag = function() {
            console.log('🔍 [GA 已停用] 追蹤事件:', arguments);
        };
        console.log('🔍 Google Analytics 已停用');
        
        // 在頁面上顯示 GA 停用狀態（可選）
        showGAStatus('已停用');
        return;
    }
    
    // 在生產環境中載入 GA
    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_CONFIG.measurementId}`;
    document.head.appendChild(gaScript);
    
    // 初始化 GA
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', GA_CONFIG.measurementId);
    
    console.log('✅ Google Analytics 已載入');
    
    // 在頁面上顯示 GA 啟用狀態（可選）
    showGAStatus('已啟用');
}

// 顯示 GA 狀態（開發者模式）
function showGAStatus(status) {
    // 只在開發者模式下顯示
    if (window.location.search.includes('debug=true') || 
        localStorage.getItem('showGAStatus') === 'true') {
        
        const statusDiv = document.createElement('div');
        statusDiv.id = 'ga-status';
        statusDiv.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: ${status === '已啟用' ? '#4CAF50' : '#f44336'};
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 9999;
            font-family: monospace;
        `;
        statusDiv.textContent = `GA: ${status}`;
        document.body.appendChild(statusDiv);
        
        // 3秒後自動隱藏
        setTimeout(() => {
            if (statusDiv.parentNode) {
                statusDiv.parentNode.removeChild(statusDiv);
            }
        }, 3000);
    }
}

// GA 事件追蹤函數
function trackEvent(eventName, parameters = {}) {
    // 檢查是否應該停用追蹤
    if (shouldDisableGA()) {
        console.log('🔍 [GA 已停用] 事件已跳過:', eventName, parameters);
        return;
    }
    
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, parameters);
        console.log('GA Event tracked:', eventName, parameters);
    } else {
        console.warn('GA 函數未載入，無法追蹤事件:', eventName);
    }
}

// 追蹤播放器事件
function trackVideoEvent(action, videoTime = null) {
    if (!GA_CONFIG.trackingOptions.trackVideoInteractions) return;
    
    const eventData = {
        event_category: 'video',
        event_label: '藥師咒',
        custom_map: {
            video_title: '藥師咒梵音'
        }
    };
    
    if (videoTime !== null) {
        eventData.video_current_time = Math.round(videoTime);
    }
    
    trackEvent(action, eventData);
}

// 追蹤計數器事件
function trackCounterEvent(action, count = null) {
    if (!GA_CONFIG.trackingOptions.trackCounterUsage) return;
    
    const eventData = {
        event_category: 'counter',
        event_label: '念誦計數'
    };
    
    if (count !== null) {
        eventData.count_value = count;
    }
    
    trackEvent(action, eventData);
}

// 追蹤播放速度事件
function trackSpeedEvent(speed) {
    if (!GA_CONFIG.trackingOptions.trackSpeedChanges) return;
    
    trackEvent('speed_change', {
        event_category: 'player_controls',
        event_label: '播放速度',
        speed_value: speed
    });
}

// 追蹤外部連結點擊
function trackExternalLink(url, linkText) {
    if (!GA_CONFIG.trackingOptions.trackExternalLinks) return;
    
    trackEvent('click', {
        event_category: 'external_link',
        event_label: linkText,
        link_url: url
    });
}

// 追蹤頁面滾動深度
function trackScrollDepth(percentage) {
    trackEvent('scroll', {
        event_category: 'engagement',
        event_label: '頁面滾動',
        scroll_depth: percentage
    });
}

// 追蹤用戶互動時間
function trackTimeOnPage() {
    trackEvent('timing_complete', {
        event_category: 'engagement',
        event_label: '頁面停留時間'
    });
}

// 初始化 GA 追蹤（在頁面載入後調用）
function initGATracking() {
    console.log('GA Tracking initialized');
    
    // 追蹤頁面載入
    trackEvent('page_view', {
        page_title: document.title,
        page_location: window.location.href
    });
    
    // 設定滾動深度追蹤
    let maxScrollDepth = 0;
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercentage = Math.round((scrollTop / documentHeight) * 100);
        
        if (scrollPercentage > maxScrollDepth && scrollPercentage % 25 === 0) {
            maxScrollDepth = scrollPercentage;
            trackScrollDepth(scrollPercentage);
        }
    });
    
    // 追蹤外部連結點擊
    document.querySelectorAll('a[href^="http"]').forEach(link => {
        link.addEventListener('click', function() {
            trackExternalLink(this.href, this.textContent.trim());
        });
    });
}

// 將函數暴露到全域，供其他腳本使用
window.GATracking = {
    trackEvent,
    trackVideoEvent,
    trackCounterEvent,
    trackSpeedEvent,
    trackExternalLink,
    trackScrollDepth,
    trackTimeOnPage,
    shouldDisableGA,
    showGAStatus
};

// 提供手動控制 GA 的函數
window.GAControl = {
    // 停用 GA 追蹤
    disable: function() {
        localStorage.setItem('disableGA', 'true');
        console.log('🔍 GA 追蹤已手動停用，請重新載入頁面');
        alert('GA 追蹤已停用，請重新載入頁面以套用設定');
    },
    
    // 啟用 GA 追蹤
    enable: function() {
        localStorage.removeItem('disableGA');
        console.log('🔍 GA 追蹤已手動啟用，請重新載入頁面');
        alert('GA 追蹤已啟用，請重新載入頁面以套用設定');
    },
    
    // 切換 GA 狀態
    toggle: function() {
        const currentStatus = localStorage.getItem('disableGA');
        if (currentStatus === 'true') {
            this.enable();
        } else {
            this.disable();
        }
    },
    
    // 顯示當前狀態
    status: function() {
        const isDisabled = shouldDisableGA();
        console.log('🔍 GA 追蹤狀態:', isDisabled ? '已停用' : '已啟用');
        alert(`GA 追蹤狀態: ${isDisabled ? '已停用' : '已啟用'}`);
    }
};