# Co-drawing

> b05902127 劉俊緯

##### 關於這個project...
* 有多個遊戲室來一起畫畫的App。

##### Deployed 連結
* http://140.112.30.39:3001/

##### 使用/操作方式

* 架起來！
  * 前端 `npm install && npm start`
  * 後端 `npm install && node src/server.js`
  * Server的ip放在`src/const.js`，若有需要請改這。
  * Server的port＆DB連結請於`src/server.js`前改。

* 操作方式：
  * **Register** : 註冊帳號。
  * **Login** : 登入帳號。要註冊過才能login。理論上登入後會跳轉到Home。
    * 如果沒有登入帳號，則名稱一律以**guest**表示。
    * cookie理論上有一天的時間，所以不開無痕/清cookie話的會紀錄還會在。
  * **Logout**：在登入完帳號的瞬間，理論上原本login的按鈕會變成你的名字。
    * 點選你的名字後進入使用者頁面，此時可以點擊logout換下個帳號登入。
  * **RoomEntry** : 
    * **進入**：選擇一個房間(點任何一個box) 。
    * **選擇** ：在最後的一個box輸入你要的房名即可多新增一個房間。
    * **刪除**：只有**創建者**以及**admin**可以刪除房間。
  * **Room**: (以下階有存入DB。因此紀錄不會消失。)
    * **繪圖**：右上角即是畫布。每個角色都會被分類到不同	的顏色。
      * 畫布即是點著拖拉就會痕跡的那種。
    * **聊天**：右下角即是聊天紀錄以及輸入框。輸入完文字以Enter觸發即可發送。
  * **~Meow~**: Meow。

##### 使用與參考框架

* 基本上除了dir放置方法同Practice-06外，其他功能都是純手刻。
* 前端 react，後端 node，DB為mongoDB。

##### 貢獻

* 一個最基本的遊戲框架要素
  * 可以創立帳號，且這是放在DB內的persistent 資料。
  * 每個帳號可以login，以cookie紀錄。
  * 每個帳號可以開間遊戲房，數目不限，唯有房名不可重複
  * 每個房間有獨立的聊天室以及繪板，並且每個人都可以同時繪製並同步。

##### 心得

* react大爆炸之我不會async。
* 所以我還是不太理解react跟canvas怎麼更新的原理。
* 來不及寫&想傳輸canvas的優化QQ。

* 其實這個本來是想寫你畫我猜的團體板，看到有人先po就臨時跳掉了ww。

* 我好像太晚才開始寫了QQ。