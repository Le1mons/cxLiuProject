/**
 * Created by LYF on 2018/6/8.
 */
(function () {
    //极限通关
    var ID = 'dafashita_jxtg';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function (sender, type) {
                me.remove();
            });
            setPanelTitle(me.nodes.txt_title, L("JXTG"));
        },
        getData: function(callback){
            var me = this;
            G.ajax.send("fashita_recording", [me.data()], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if(d.s == 1){
                    me.DATA = d.d.recording;
                    callback && callback();
                }
            })
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
        onShow: function () {
            var me = this;
            new X.bView("fashita_jxtg.json", function (node) {
                me.view = node;
                me.view.nodes.list.hide();
                me.nodes.panel_nr.removeAllChildren();
                me.nodes.panel_nr.addChild(node);
                me.getData(function () {
                    me.setContents();
                })
            });
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            for(var i = 0; i < 3; i ++){
                var list = me.view.nodes.list.clone();
                var conf = me.DATA[i];
                me.setList(list, conf, i + 1);
            }
        },
        setList: function (list, conf, idx) {
            var me = this;
            X.autoInitUI(list);
            if(conf){
                var data = conf.fightdata.headdata[0];
                list.nodes.btn_lx.click(function (sender, type) {
                    conf.fightdata.pvType = "video";//增加跳过类型
                    G.frame.fight.demo(conf.fightdata);
                });
                list.nodes.img_txk.hide();
                list.nodes.text_mz.setString(data.name);
                var head = G.class.shead(data);
                head.setPosition(list.nodes.panel_tx.width / 2, list.nodes.panel_tx.height / 2);
                list.nodes.panel_tx.addChild(head);
            }else{
                list.nodes.btn_lx.hide();
                list.nodes.text_mz.hide();
                list.nodes.img_txk.hide();
                list.nodes.panel_tx.hide();
                list.nodes.img_zwnr.show();
            }

            list.show();
            var panel = me.view.finds("panel_" + idx);
            list.setPosition(cc.p(0,0));

            panel.addChild(list);
        }
    });
    G.frame[ID] = new fun('ui_tip2.json', ID);
})();