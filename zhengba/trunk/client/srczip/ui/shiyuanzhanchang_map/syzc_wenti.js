(function () {
    var ID = 'syzc_wenti';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {
                action: true
            });
        },
        onOpen: function () {
            var me = this;
            me.nodes.ui.setTouchEnabled(false);
            me.DATA = me.data();
            me.setContents()
        },
        setContents: function () {
            var me = this;
            var conf = me.conf = G.gc.syzccom.questions[me.DATA ? me.DATA.idx : 0];
            me.nodes.panel_rw2.removeAllChildren();
            me.nodes.txt_1.setString(conf.mingzi)
            X.spine.show({
                json: 'spine/' + conf.lihui + '.json',
                addTo: me.nodes.panel_rw2,
                cache: true,
                x: 80,
                y:40,
                z: 0,
                autoRemove: false,
                onload: function (node) {
                    node.runAni(0, "animation", true);
                }
            });
            me.nodes.txt_ms.setString(conf.content);
            var arr = [];
            for (var k in conf.answer) {
                var node = me.nodes.list.clone();
                X.autoInitUI(node);
                node.nodes.txt_xz.setString(conf.answer[k].intr);
                node.k = k
                node.setTouchEnabled(true);
                node.click(function (sender) {
                    if (me.choose != undefined) return;
                    me.choose = sender.k;
                    me.nodes.mask.setTouchEnabled(false);
                    me.ui.setTimeout(function () {
                        if (!cc.isNode(me.ui)) return;
                        me.showAnswer()
                    }, 500);
                })
                node.show()
                arr.push(node)
            }
            arr.reverse()
            X.verticalcenter(me.nodes.panel_2, arr, {
                itemHeight: me.nodes.list.height,
            })
        },
        showAnswer: function () {
            var me = this;
            var arr = me.nodes.panel_2.children;
            arr.forEach(function name(item, idx) {
                if (item.k == me.choose) {
                    item.nodes.panel_xz.setBackGroundImage("img/shiyuanzhanchang/img_6.png", 1);
                    item.nodes.img_cha.show();
                    item.nodes.txt_xz.setTextColor(cc.color("#ac4e38"));
                };
                if (item.k == me.conf.right) {
                    item.nodes.panel_xz.setBackGroundImage("img/shiyuanzhanchang/img_2.png", 1);
                    item.nodes.txt_xz.setTextColor(cc.color("#678724"));
                    item.nodes.img_cha.hide();
                    item.nodes.img_gou.show();
                }
            })
            me.ui.setTimeout(function () {
                me.DATA.callback && me.DATA.callback(me.choose == me.conf.right);
                me.remove();
            }, 1000)
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
            me.nodes.btn_lan2.click(function (sender) {
               G.frame.syzc_fx.data(me.DATA).show() 
            })
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('shiyuan_tk7.json', ID);
})();