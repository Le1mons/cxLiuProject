/**
 * Created by LYF on 2018/12/5.
 */
(function () {
    //公会-赛区排行
    var ID = 'gonghui_ljwz';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_fanhui.click(function () {
                me.remove();
            });

            me.nodes.btn_xsl1.click(function () {
                me.changeType(false);
            });

            me.nodes.btn_xsl2.click(function () {
                me.changeType(true);
            })
        },
        setState: function() {
            var me = this;

            me.nodes.txt_ljwz.setString("S" + me.cur + L("JIE"));
            me.nodes.btn_xsl2.setTouchEnabled(true);
            me.nodes.btn_xsl1.setTouchEnabled(true);

            if(me.cur <= 1) me.nodes.btn_xsl1.setTouchEnabled(false);
            if(me.cur >= me.max) me.nodes.btn_xsl2.setTouchEnabled(false);
        },
        onOpen: function () {
            var me = this;

            me.fillSize();
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        changeType: function(bool) {
            var me = this;

            if(bool) me.cur ++;
            else me.cur --;

            me.setState();

            me.getData(function () {
                me.setContents();
            })
        },
        onShow: function () {
            var me = this;

            me.showToper();
            me.addAni();

            me.max = G.frame.gonghui_zhengfeng.DATA.season;
            me.cur = G.frame.gonghui_zhengfeng.DATA.season - 1;

            me.setState();

            me.getData(function () {
                me.setContents();
            });
        },
        addAni: function() {
            var me = this;
            var obj = {
                1: "hong",
                2: "zi",
                3: "lan"
            };

            for (var i = 1; i < 4; i++) {
                var lay = me.nodes["panel_dh" + i];

                G.class.ani.show({
                    x: lay.width / 2,
                    y: lay.height / 2,
                    json: "ani_gonghuizhenfeng_" + obj[i],
                    addTo: lay,
                    repeat: true,
                    autoRemove: false
                })
            }
        },
        getData: function (callback) {
            var me = this;

            me.ajax("ghcompeting_toplog", [me.cur], function (str, data) {
                if(data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            })
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            function f(ui, data) {
                X.autoInitUI(ui);

                if(data) {
                    ui.children[0].hide();

                    for (var i = 1; i < ui.children.length; i ++) {
                        ui.children[i].show();
                    }

                    ui.nodes.txt_fuq.setString(data.guildinfo.svrname);
                    ui.nodes.txt_gh.setString(data.guildinfo.name);
                    ui.nodes.txt_name.setString(L("HUIZHANG") + data.guildinfo.chairman);
                    ui.nodes.txt_zdl.setString(L("ZHANLI") + "：" + data.zhanli);
                    ui.nodes.img_hz.setBackGroundImage(G.class.gonghui.getFlagImgById(data.guildinfo.flag), 1);
                    ui.nodes.img_hz.setScale(.25);
                } else {
                    ui.children[0].show();

                    for (var i = 1; i < ui.children.length; i ++) {
                        ui.children[i].hide();
                    }
                }
            }

            for (var i = 1; i < 4; i ++) {
                f(me.nodes["panel_ms" + i], me.DATA[i - 1]);
            }
        },
    });
    G.frame[ID] = new fun('gonghui_ghzf_ljwz.json', ID);
})();