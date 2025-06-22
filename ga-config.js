// Google Analytics 配置檔案
// 請將 'GA_MEASUREMENT_ID' 替換為您的實際 Google Analytics 測量 ID

const GA_CONFIG = {
    // 在這裡填入您的 GA 測量 ID（格式：G-XXXXXXXXXX）
    measurementId: 'GA_MEASUREMENT_ID', // 請替換為您的實際 ID
    
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

// GA 事件追蹤函數
function trackEvent(eventName, parameters = {}) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, parameters);
        console.log('GA Event tracked:', eventName, parameters);
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
    initGATracking
};
