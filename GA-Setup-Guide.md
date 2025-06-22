# Google Analytics 設定指導

## 🎯 完整設定步驟

### 第一步：建立 Google Analytics 帳戶

1. **前往 Google Analytics**
   - 訪問：https://analytics.google.com
   - 使用您的 Google 帳戶登入

2. **建立新資源**
   - 點擊「開始使用」
   - 填寫帳戶名稱：`藥師咒助念器`
   - 填寫資源名稱：`Medicine Buddha Mantra`
   - 選擇報表時區：`(GMT+08:00) 台北`
   - 選擇貨幣：`新台幣 (TWD)`

3. **設定資料串流**
   - 選擇「網站」
   - 輸入網站網址：`您的網站域名`
   - 輸入串流名稱：`藥師咒網站`
   - 完成後會獲得測量 ID（格式：`G-XXXXXXXXXX`）

### 第二步：更新網站程式碼

1. **複製您的測量 ID**
   - 在 GA 後台找到類似 `G-XXXXXXXXXX` 的測量 ID

2. **更新 index.html**
   - 找到第 13-18 行的 Google Analytics 程式碼
   - 將 `GA_MEASUREMENT_ID` 替換為您的實際測量 ID

   ```html
   <!-- 範例：將此行 -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
   
   <!-- 改為（假設您的ID是 G-ABC123DEF4） -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC123DEF4"></script>
   ```

3. **更新 ga-config.js**
   - 打開 `ga-config.js` 檔案
   - 找到第 5 行：`measurementId: 'GA_MEASUREMENT_ID'`
   - 將 `GA_MEASUREMENT_ID` 替換為您的實際測量 ID

   ```javascript
   // 範例：將此行
   measurementId: 'GA_MEASUREMENT_ID',
   
   // 改為（假設您的ID是 G-ABC123DEF4）
   measurementId: 'G-ABC123DEF4',
   ```

### 第三步：測試設定

1. **啟動本地測試**
   - 在專案目錄中開啟終端機
   - 執行：`python -m http.server 8000` 或 `npx serve`
   - 在瀏覽器中打開：`http://localhost:8000`

2. **檢查 GA 追蹤**
   - 按 F12 開啟開發者工具
   - 切換到 Console 標籤
   - 應該會看到類似訊息：
     ```
     GA Tracking initialized
     GA Event tracked: page_view
     ```

3. **測試各項功能**
   - 播放/暫停影片
   - 調整播放速度
   - 使用計數器
   - 檢查 Console 是否顯示 GA 事件追蹤訊息

### 第四步：部署並驗證

1. **上傳到您的網站伺服器**
   - 確保所有檔案都已上傳
   - 特別注意 `ga-config.js` 檔案

2. **在 GA 後台驗證**
   - 前往 GA 後台的「即時」報表
   - 訪問您的網站
   - 應該會在即時報表中看到活躍使用者

## 📊 已設定的追蹤功能

我已經為您的網站添加了以下 GA 追蹤功能：

### 🎬 影片互動追蹤
- **播放事件**：當使用者點擊播放
- **暫停事件**：當使用者點擊暫停
- **重新開始**：當使用者重置影片
- **跳轉**：當使用者前進/後退影片

### ⚡ 播放控制追蹤
- **速度調整**：追蹤播放速度變更（0.25x 到 2x）
- **鍵盤快捷鍵使用**：追蹤鍵盤操作

### 🔢 計數器使用追蹤
- **計數增加**：每次點擊計數時記錄
- **計數重設**：當使用者重設計數器
- **計數里程碑**：特殊計數值（如 108、216 等）

### 🌐 一般網站互動
- **頁面瀏覽**：基本的頁面載入
- **滾動深度**：使用者滾動頁面的程度
- **停留時間**：使用者在頁面的時間
- **外部連結點擊**：點擊 email 聯絡或護持連結

## 🔧 進階設定選項

在 `ga-config.js` 中，您可以調整追蹤選項：

```javascript
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
```

## 🐛 常見問題排解

### Q: 在 Console 中看到 "GA_MEASUREMENT_ID" 錯誤
**A:** 您尚未更新測量 ID，請參考第二步的說明。

### Q: GA 後台沒有顯示數據
**A:** 
1. 確認測量 ID 正確
2. 檢查網站是否正確載入 ga-config.js
3. GA 數據可能需要 24-48 小時才會完整顯示

### Q: 想要停用某些追蹤功能
**A:** 在 `ga-config.js` 中將對應的選項設為 `false`

### Q: 如何查看詳細的事件資料
**A:** 
1. 前往 GA 後台
2. 點選「報表」→「參與度」→「事件」
3. 可以看到各種自訂事件的詳細數據

## 📈 推薦的 GA 報表設定

建立以下自訂報表來更好地了解使用者行為：

1. **念誦習慣報表**：
   - 事件：counter increment
   - 維度：使用者、工作階段
   - 指標：計數器使用次數、平均停留時間

2. **播放行為報表**：
   - 事件：play、pause、speed_change
   - 維度：播放速度、影片時間
   - 指標：播放時長、互動率

3. **使用者參與報表**：
   - 事件：scroll、timing_complete
   - 維度：裝置類型、來源
   - 指標：跳出率、頁面停留時間

## 🎉 完成！

設定完成後，您就可以在 Google Analytics 中追蹤：
- 有多少人使用您的藥師咒助念器
- 使用者最常使用哪些功能
- 平均念誦次數和時間
- 使用者的互動模式

這些數據將幫助您了解使用者需求，並持續改善網站功能。

---

💡 **小提示**：建議定期檢查 GA 報表，了解使用者行為模式，這樣可以針對性地優化使用者體驗。
