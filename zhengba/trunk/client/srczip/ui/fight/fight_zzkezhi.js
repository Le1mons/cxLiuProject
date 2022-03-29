/**
 * Created by wfq on 2018/6/6.
 */
(function () {
    //战斗-种族克制
    var ID = 'fight_zzkezhi';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f5";
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });

            me.nodes.txt_djgb.setTouchEnabled(true);
            me.nodes.txt_djgb.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });
        },
        onOpen: function () {
            var me = this;
            me.fillSize();
            me.initUi();
            me.bindBtn();
            me.zfConf = me.data() || {};
            cc.enableScrollBar(me.nodes.listview);
        },
        onAniShow: function () {
            var me = this;
            G.guidevent.emit('fight_zzkezhiOpenOver');
        },
        onShow: function () {
            var me = this;

            me.nodes.list.hide();
            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var conf = G.class.zhenfa.get();
            var keys = X.keysOfObject(conf.zhenfa);

            keys.sort(function (a, b) {
                var lvA = me.zfConf[a] == undefined ? -1 : me.zfConf[a];
                var lvB = me.zfConf[b] == undefined ? -1 : me.zfConf[b];
                return lvA > lvB ? -1 : 1;
            });

            for (var i = 0; i < keys.length; i ++) {
                me.nodes.listview.pushBackCustomItem(me.setItem(keys[i], conf.zhenfa[keys[i]]));
            }
            me.nodes.txt_zz.setString(L('syzc_39'));
        },
        setItem: function (index, conf) {
            var me = this;
            var list = me.nodes.list.clone();
            X.autoInitUI(list);
            list.show();

            if(me.zfConf[index] != undefined) {
                list.nodes.img_jh.show();
                list.nodes.panel_1.setBackGroundImage('img/zhenfa/' + G.class.zhenfa.getIcoById(index) + '.png',1);
                list.nodes.img_di.show();
            } else {
                list.nodes.img_di.hide();
                list.nodes.panel_1.setBackGroundImage('img/zhenfa/' + G.class.zhenfa.getIcoById(index) + '_h.png',1);
            }

            list.nodes.txt_name.setString(conf.name);
            list.nodes.txt_name.setTextColor(cc.color("#fdd464"));


            if(index == 1) {
                var buff = conf.data[0].buff;
                var keys = X.keysOfObject(buff);
                var active = me.zfConf[index] != undefined ? true : false;
                var color = active ? "#1f9201" : "#5d5244";
                var buff1 = keys[0].indexOf("pro") == -1 ? "+" + buff[keys[0]] : "+" + buff[keys[0]] / 10 + "%";
                var buff2 = keys[1].indexOf("pro") == -1 ? "+" + buff[keys[1]] : "+" + buff[keys[1]] / 10 + "%";
                var str = X.STR(L("zzkz_all"), L(keys[0]), color, buff1, L(keys[1]), color, buff2);
                X.setRichText({
                    str: str,
                    parent: list.nodes.panel_jh2,
                    anchor: {x: 0, y: 0.5},
                    pos: {x:0, y: list.nodes.panel_jh2.height / 2},
                    color: active ? "#f6ebcd" : "#5d5244"
                });
            }else if (index == 8){
                //第7种族特殊处理
                var active = false;
                var color = "#5d5244";
                var buff = conf.data[0].buff;
                var keys = X.keysOfObject(buff);
                var buff1 = keys[0].indexOf("pro") == -1 ? "+" + buff[keys[0]] : "+" + buff[keys[0]] / 10 + "%";
                var buff2 = keys[1].indexOf("pro") == -1 ? "+" + buff[keys[1]] : "+" + buff[keys[1]] / 10 + "%";
                var str = str = X.STR(L("zzkz7"), L("zhongzu_" + (index * 1 - 1)), L(keys[0]), color, buff1, L(keys[1]), color, buff2);
                if (me.zfConf[index] || me.zfConf[index] == 0){
                    // for (var i = 0; i < conf.data.length; i ++) {
                        buff = conf.data[me.zfConf[index]].buff;
                        keys = X.keysOfObject(buff);
                        active = me.zfConf[index] == i ? true : false;
                        color = active ? "#1f9201" : "#5d5244";
                        buff1 = keys[0].indexOf("pro") == -1 ? "+" + buff[keys[0]] : "+" + buff[keys[0]] / 10 + "%";
                        buff2 = keys[1].indexOf("pro") == -1 ? "+" + buff[keys[1]] : "+" + buff[keys[1]] / 10 + "%";
                        str = X.STR(L("zzkz"), conf.data[me.zfConf[index]].cond[index * 1 - 1], L("zhongzu_" + (index * 1 - 1)), L(keys[0]), color, buff1, L(keys[1]), color, buff2);

                    // }
                }
                var parent = list.nodes["panel_jh2"];
                X.setRichText({
                    str: str,
                    parent: parent,
                    anchor: {x: 0, y: 0.5},
                    pos: {x:0, y: parent.height / 2},
                    color: active ? "#f6ebcd" : "#5d5244"
                });
            } else {
                for (var i = 0; i < conf.data.length; i ++) {
                    var buff = conf.data[i].buff;
                    var keys = X.keysOfObject(buff);
                    var active = me.zfConf[index] == i ? true : false;
                    var color = active ? "#1f9201" : "#5d5244";
                    var parent = list.nodes["panel_jh" + (i + 1)];
                    var buff1 = keys[0].indexOf("pro") == -1 ? "+" + buff[keys[0]] : "+" + buff[keys[0]] / 10 + "%";
                    var buff2 = keys[1].indexOf("pro") == -1 ? "+" + buff[keys[1]] : "+" + buff[keys[1]] / 10 + "%";
                    var str = X.STR(L("zzkz"), conf.data[i].cond[index * 1 - 1], L("zhongzu_" + (index * 1 - 1)), L(keys[0]), color, buff1, L(keys[1]), color, buff2);
                    X.setRichText({
                        str: str,
                        parent: parent,
                        anchor: {x: 0, y: 0.5},
                        pos: {x:0, y: parent.height / 2},
                        color: active ? "#f6ebcd" : "#5d5244"
                    });
                }
            }

            return  list;
        }
    });

    G.frame[ID] = new fun('zhandou_top_zzkz.json', ID);
})();