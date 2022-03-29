/**
 * Created by LYF on 2018/8/14.
 */
(function () {
    //我要变强
    var ID = 'woyaobianqiang';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            me.ui.nodes.mask.click(function(sender,type){
                me.remove();
            });

            me.nodes.tip_title.setString(L('UI_TITLE_WYBQ'));
        },
        bindBtn: function () {
            var me = this;
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

            new X.bView("woyaobianqiang.json", function (view) {
                me._view = view;
                me._view.nodes.scrollview_xuanshangrenwu.hide();

                cc.enableScrollBar(me._view.nodes.listview_xuanshangrenwu);
                cc.enableScrollBar(me._view.nodes.scrollview_xuanshangrenwu);

                me.ui.nodes.panel_nr.addChild(view);
                X.viewCache.getView("woyaobianqiang_list.json", function (node) {
                    me.list = node.finds("list_nr");
                    me.setContents();
                    me.ui.setTimeout(function(){
                        G.guidevent.emit('woyaobainqiangOpenOver');
                    },200);
                })
            })
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var conf = G.class.getConf("woyaobianqiang");
            var keys = X.keysOfObject(conf);

            for(var i = 0; i < keys.length; i ++) {
                if(conf[keys[i]].checkLv) {
                    if(P.gud.lv < conf[keys[i]].checkLv) {
                        keys.splice(i, 1);
                        break;
                    }
                }
            }

            for(var i = 0; i < keys.length; i ++) {
                me._view.nodes.listview_xuanshangrenwu.pushBackCustomItem(me.setItem(conf[keys[i]], me.list.clone(), i));
            }
        },
        setItem: function(data, ui, idx) {
            X.autoInitUI(ui);

            var me = this;

            ui.nodes.tubiao.loadTexture("img/woyaobianqiang/" + data.img, 1);
            ui.finds("Image_2").loadTexture("img/woyaobianqiang/" + data.typeimg, 1);
            ui.finds("wz_biaoti").setString(data.title);

            var text = "";
            if(data.touchText.length > 1) {
                text = X.STR(data.content,
                    "<font color=#324cae" + " onclick=G.frame.woyaobianqiang.showTujing(this,0)>" + data.touchText[0] +"</font>",
                    "<font color=#324cae" + " onclick=G.frame.woyaobianqiang.showTujing(this,1)>" + data.touchText[1] +"</font>")
            }else {
                text = X.STR(data.content,
                    "<font color=#324cae" + " onclick=G.frame.woyaobianqiang.showTujing(this,0)>" + data.touchText[0] +"</font>");
            }

            var rh = new X.bRichText({
                size: 24,
                maxWidth: ui.nodes.wz_neirong.width,
                lineHeight: 32,
                color: "#be5e30",
                family: G.defaultFNT
            });
            rh.tconf = data.Texttujing;
            rh.text(text);
            rh.setAnchorPoint(0, 1);
            rh.setPosition(0, ui.nodes.wz_neirong.height);
            ui.nodes.wz_neirong.addChild(rh);

            if(idx == 0) {
                //映射引导按钮
                G.frame.woyaobianqiang.btn_on = ui.nodes.btn2_on;
            }
            ui.nodes.btn2_on.click(function () {
                me.remove();
                X.tiaozhuan(data.tujing);
            });

            return ui;
        },
        showTujing: function (target, idx) {
            G.frame.qianwang.data(target.tconf[idx]).show();
        }
    });
    G.frame[ID] = new fun('ui_tip7.json', ID);
})();