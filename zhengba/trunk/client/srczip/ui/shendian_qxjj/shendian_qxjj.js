/**
 * Created by LYF on 2019/1/9.
 */
(function () {
    //神殿-群雄集结
    var ID = 'shendian_qxjj';

    var fun = X.bUi.extend({
        extConf: {
            outline: {
                1: "#c07225",
                2: "#ae33c0",
                3: "#1a63ae"
            },
            bg: {
                1: "img/julongshendian/img_sdzl_qxjsq.png",
                2: "img/julongshendian/img_sdzl_qxymq.png",
                3: "img/julongshendian/img_sdzl_qxhyq.png"
            },
            num: 4
        },
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;
            var num = me.DATA.list.length;

            me.minTab = 1;
            me.curTab = 1;
            me.maxTab = num < me.extConf.num ? 1 : (num / me.extConf.num > num % me.extConf.num ? num % me.extConf.num + 1 : num % me.extConf.num);
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_fh.click(function () {

                me.remove();
            });

            me.nodes.btn_bz.click(function () {

                G.frame.help.data({
                    intr:L('TS28')
                }).show();
            });

            me.nodes.btn_tzph.click(function () {

            });

            me.nodes.btn_kts.click(function () {

                G.frame.qxjj_kqtb.show();
            });

            me.nodes.btn_fy1.click(function () {
                me.changeTab(-1);
            });

            me.nodes.btn_fy2.click(function () {
                me.changeTab(1);
            });

            me.nodes.btn_fyd1.click(function () {
                me.changeTab(-5);
            });

            me.nodes.btn_fyd2.click(function () {
                me.changeTab(5);
            });
        },
        changeTab: function(num) {
            var me = this;

            if(num > 0) {
                if(me.curTab + num <= me.maxTab) {
                    me.curTab += num;
                } else {
                    if(me.curTab == me.maxTab) return;
                    else me.curTab += (me.maxTab - me.curTab);
                }
            } else {
                if(me.curTab + num >= me.minTab) {
                    me.curTab += num;
                } else {
                    if(me.curTab == me.minTab) return;
                    else me.curTab -= (me.curTab - me.minTab);
                }
            }
            me.nodes.txt_ys.setString(me.curTab);
            me.setListView();
            me.setButtonState();
        },
        setButtonState: function() {
            var me = this;
            var addArr = [me.nodes.btn_fy2, me.nodes.btn_fyd2];
            var subArr = [me.nodes.btn_fy1, me.nodes.btn_fyd1];
            var btnArr = [me.nodes.btn_fy1, me.nodes.btn_fy2, me.nodes.btn_fyd1, me.nodes.btn_fyd2];

            for (var i in btnArr) {
                btnArr[i].setBright(true);
                btnArr[i].setTouchEnabled(true);
            }

            if(me.curTab == me.minTab) {
                for (var i in subArr) {
                    subArr[i].setBright(false);
                    subArr[i].setTouchEnabled(false);
                }
            }
            if(me.curTab == me.maxTab) {
                for (var i in addArr) {
                    addArr[i].setBright(false);
                    addArr[i].setTouchEnabled(false);
                }
            }
        },
        checkShow: function() {
            var me = this;

            G.ajax.send("qyjj_main", [], function (d) {
                if(!d) return;
                var d = JSON.parse(d);
                if(d.s == 1){
                    me.DATA = d.d;
                    if(me.DATA.data) {
                        G.frame.qxjj_main.data(me.DATA).show();
                        if(me.isShow) me.remove();
                    } else {
                        for (var i in me.DATA.list) {
                            var conf = G.class.qyjj.getConfById(me.DATA.list[i].type);
                            me.DATA.list[i].per = X.keysOfObject(me.DATA.list[i].user).length / conf.num_limit;
                        }
                        me.DATA.list.sort(function (a, b) {
                            if(a.per != b.per) {
                                return a.per < b.per ? -1 : 1;
                            } else {
                                return a.ctime > b.ctime ? -1 : 1;
                            }
                        });
                        me.show();
                    }
                }
            });
        },
        getData: function(callback){
            var me = this;

            me.ajax("qyjj_main", [1], function (str, data) {
                if(data.s == 1){
                    me.DATA = data.d;
                    for (var i in me.DATA.list) {
                        var conf = G.class.qyjj.getConfById(me.DATA.list[i].type);
                        me.DATA.list[i].per = X.keysOfObject(me.DATA.list[i].user).length / conf.num_limit;
                    }
                    me.DATA.list.sort(function (a, b) {
                        if(a.per != b.per) {
                            return a.per < b.per ? -1 : 1;
                        } else {
                            return a.ctime > b.ctime ? -1 : 1;
                        }
                    });
                    callback && callback();
                }
            });
        },
        onOpen: function () {
            var me = this;
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            cc.enableScrollBar(me.nodes.listview);

            if(me.DATA.list) {
                me.initUi();
                me.bindBtn();
                me.setContents();
                me.setButtonState();
            } else {
                me.getData(function () {
                    me.initUi();
                    me.bindBtn();
                    me.setContents();
                    me.setButtonState();
                });
            }

            G.class.ani.show({
                json: "ani_qunxiongjijie_jiheshi",
                addTo: me.nodes.btn_kts,
                x: me.nodes.btn_kts.width / 2,
                y: me.nodes.btn_kts.height / 2,
                repeat: true,
                autoRemove: false
            });
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            me.setListView();
        },
        setListView: function () {
            var me = this;
            var data = [];

            for (var i = (me.curTab - 1) * me.extConf.num; i < me.curTab * me.extConf.num; i ++) {
                if (me.DATA.list[i]) data.push(me.DATA.list[i]);
            }

            me.nodes.listview.removeAllChildren();

            for (var i = 0; i < data.length; i ++) {
                (function (data) {
                    var list = me.nodes.list.clone();
                    var color = me.extConf.outline[data.type];
                    var conf = G.class.qyjj.getConfById(data.type);
                    X.autoInitUI(list);
                    X.enableOutline(list.nodes.text_djs, color, 1);
                    X.enableOutline(list.nodes.text_mf, color, 1);
                    X.enableOutline(list.nodes.text_jssj, color, 1);
                    X.enableOutline(list.nodes.text_sj, color, 1);
                    X.setRichText({
                        str: X.STR(G.class.qyjj.getDeclareById(data.type), "叶良辰", data.opennum),
                        parent: list.nodes.panel_wz,
                        anchor: {x: 0, y: 1},
                        pos: {x: 0, y: list.nodes.panel_wz.height},
                        size: 16,
                        color: "#ffffff",
                        outline: me.extConf.outline[data.type]
                    });
                    X.timeout(list.nodes.text_sj, data.citime + conf.duration);
                    list.nodes.text_mf.setString(X.keysOfObject(data.user).length + "/" + conf.num_limit);
                    list.nodes.img_ptjs.loadTexture(me.extConf.bg[data.type], 1);
                    list.nodes.text_mf.setTextColor(cc.color("#30ff01"));
                    list.nodes.text_sj.setTextColor(cc.color("#30ff01"));
                    list.show();
                    list.click(function () {
                        if(G.frame.qxjj_main.isShow) {
                            G.frame.qxjj_main.remove();
                            G.frame.qxjj_main.once("close", function () {
                                G.frame.qxjj_main.data(data).show();
                            });
                        } else {
                            G.frame.qxjj_main.data(data).show();
                        }
                    });
                    me.nodes.listview.pushBackCustomItem(list);
                })(data[i]);
            }
        }
    });
    G.frame[ID] = new fun('shendianzhilu_qxjj.json', ID);
})();