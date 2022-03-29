(function () {
    var ID = 'syzc_group';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {
                action: true
            });
        },
        onOpen: function () {
            var me = this;
            me.setContents()
        },
        setContents: function () {
            var me = this;
            var data = JSON.parse(JSON.stringify(G.DATA.shiyuanzhanchang.herodata));
            var arr = [];
            data.forEach(function name(item, idx) {
                var obj = {};
                obj.group = String(idx + 1);
                obj.hero = item;
                arr.push(obj);
            });
            var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list, 1, function (ui, data) {
                me.setItem(ui, data);
            }, null, null, 1, 5);
            table.setData(arr);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            var me = this;
            X.autoInitUI(ui);
            var duizang = G.gc.syzccom.duizhang[data.group];
            X.render({
                panel_tb: function (node) {
                    node.setBackGroundImage("img/shiyuanzhanchang/ico_dw" + data.group + data.group + ".png", 1)

                },
                panel_tx: function (node) {
                    node.setBackGroundImage('ico/itemico/' + duizang + 'y.png', 0);
                    node.show()
                },
                txt_name: G.gc.hero[duizang].name,
                panel_zhuli: function (node) {
                    me.createLayout(node,data.hero);
                    // node.removeAllChildren();
                    // var arr = [];
                    // for (var i = 0; i < data.hero.length; i++) {
                    //     var hero = G.class.shero(data.hero[i]);
                    //     hero.setHP(data.hero[i].hp / data.hero[i].maxhp * 100, true);
                    //     if (data.hero[i].hp <= 0) {
                    //         var img = new ccui.ImageView("img/shiyuanzhanchang/ico_sp.png", 1);
                    //         img.setPosition(40, 58)
                    //         img.setScale(1.5)
                    //         hero.addChild(img)
                    //     }
                    //     hero.lv.hide();
                    //     arr.push(hero)
                    // }
                    // X.center(arr, node, {
                    //     scale: 0.7,
                    //     callback: function (node) {
                    //         node.y += 5
                    //     },
                    // })
                },
            }, ui.nodes)
        },
        createLayout: function (node,data) {
            var me = this;

            var layArr = [node.finds("panel_qp$"), node.finds("panel_hp$")];
            var lay, herInterval;
            for (var i = 0; i < layArr.length; i++) {
                lay = layArr[i];
                lay.removeAllChildren();
            }
            var list = me.nodes.list_yx;
            list.hide();
            var scale = 1;
            var width = scale * list.width;

            var num = 0;
            var obj = me.getPosData(data);
            for (var i = 0; i < 6; i++) {
                var item = list.clone();
                X.autoInitUI(item);
                item.idx = i;
                item.setName(i);
                item.nodes.panel_yx.setBackGroundImage("img/zhandou/img_zdtx" + (i + 1) + ".png", 1);
                item.nodes.panel_jd.hide();
                //创建背景item
                var itemBg = list.clone();
                X.autoInitUI(itemBg);
                itemBg.setName('bg_' + i);
                itemBg.nodes.panel_yx.setBackGroundImage("img/public/ico/ico_bg0.png", 1);
                me.setItemHero(itemBg,obj[i+1]);
                if (data[i]){
                    item.nodes.panel_yx.hide();
                } else {
                    item.nodes.panel_yx.show();
                }
                if (i < 2) {
                    lay = layArr[0];
                    herInterval = (lay.width - (2 * width));
                } else {
                    lay = layArr[1];
                    herInterval = (lay.width - (4 * width)) / 3;
                }

                if (i == 2) {
                    num = 0;
                }

                item.setScale(scale);
                item.setPosition(cc.p(width / 2 + (width + herInterval) * (num % 6), lay.height / 2));

                itemBg.setScale(scale);
                itemBg.setPosition(cc.p(width / 2 + (width + herInterval) * (num % 6), lay.height / 2));

                num++;

                lay.addChild(itemBg);
                itemBg.setLocalZOrder(-1);
                itemBg.show();

                lay.addChild(item);
                item.setLocalZOrder(1);
                item.show();
            };
        },
        getPosData:function(data){
          var me = this;
          var obj = {};
          for (var i=0;i<data.length;i++){
              obj[data[i].pos] = data[i];
          }
          return obj;
        },
        setItemHero: function (item,data) {
            X.autoInitUI(item);
            var me = this;
            item.nodes.panel_yx.removeAllChildren();
            if (data){
                var hero = G.class.shero(data);
                hero.setAnchorPoint(0,0);
                hero.setPosition(0,0);
                item.nodes.panel_yx.addChild(hero);
                item.nodes.panel_jd.show();
                if (data.maxhp==0){
                    var maxhp = 1;
                }else {
                    var maxhp = data.maxhp;
                }
                item.nodes.jdt_hp_d.setPercent(Math.abs(data.hp / maxhp * 100));
                item.nodes.panel_b.setVisible(data.hp <= 0);
            }else {
                item.nodes.panel_jd.hide();
                item.nodes.panel_b.hide();
            }
        },

        onShow: function () {
            var me = this;
            me.bindBtn()
        },
        onAniShow: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function (sender) {
                me.remove()
            })
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('shiyuan_tk10.json', ID);
})();