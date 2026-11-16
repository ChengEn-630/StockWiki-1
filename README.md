# StockWiki 股票知識庫

StockWiki 是一個使用 HTML、CSS、原生 JavaScript 與 JSON 建立的繁體中文股票知識網站。

## 本機預覽
因網站使用 `fetch()` 讀取 `data/articles.json`，請使用本機靜態伺服器預覽，不建議直接以 `file://` 開啟。

例如在專案根目錄執行：

```bash
python -m http.server 8000
```

接著瀏覽 `http://localhost:8000`。

## GitHub Pages 部署
1. 將整個專案上傳至 GitHub repository。
2. 進入 repository 的 Settings → Pages。
3. 在 Build and deployment 選擇 Deploy from a branch。
4. 選擇 `main` 分支及 `/ (root)` 資料夾並儲存。
5. 等待 GitHub Pages 完成部署。

## 文章管理
目前內含 12 篇示範文章，文章集中管理於 `data/articles.json`。新增文章時請參考既有欄位格式及根目錄的 `AGENTS.md`。

## 注意
本網站內容僅供教育與知識分享，不構成個人化投資建議。
