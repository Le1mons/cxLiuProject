==============================
bingo
==============================

1. 模拟器用户按 ``F12`` 点击 ``输入GM命令`` 输入命令，可以把常用命令放到 ``tester/GM.txt`` 中，按 ``F12`` 可以直接点击命令即可执行

2. 网页用户直接在控制台输入


=============================


开始游戏赠送大礼包，基本够用
``bingo('start')``


一键添加所有的物品 不会重复添加
``bingo('allitem')``

一键删掉所有的物品
``bingo('delallitem')``

添加物品
``bingo('item',1001,100)``

添加多个物品
``bingo('items',[1001,1002],100)``

添加装备 十字弩
``bingo('item',11011,1)``

增加玩家属性
``bingo('jinbi',1000)``

添加角色
``bingo('hero','1')``

删掉英雄
``bingo('delhero','1')``

添加宠物
``bingo('pet','1')``

加探险地图 ``map.json`` 中的数据
``bingo('map',1002)``


添加武器配件方案
``bingo('weaponpart',1)``

有奖励的邮件 没有奖励不传第四个参数

``bingo('email','title','content','{"prize":{"a":"attr","t":"rmbmoney","n":"100"}}')``

有过期时间的邮件 300秒后过期

``bingo('email','title','content','{"passtime":300}')``













