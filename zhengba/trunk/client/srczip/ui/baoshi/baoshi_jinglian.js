/**
 * Created by wfq on 2018/5/24.
 */
 (function () {
    //宝石-精炼
    var ID = 'baoshi_jinglian';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f4";
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;

            setPanelTitle(me.ui.nodes.txt_title,L('BTN_JINGLIAN'));

        },
        bindBtn: function () {
            var me = this;

            me.ui.nodes.mask.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    if(me.isAniShow) return;
                    me.remove();
                }
            });
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

            new X.bView('baoshijinglian_tip.json', function (view) {
                me._view = view;

                me.ui.nodes.panel_nr.removeAllChildren();
                me.ui.nodes.panel_nr.addChild(view);

                me.setContents();
            });
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var id = G.frame.yingxiong_xxxx.curXbId;
            var heroData = G.DATA.yingxiong.list[id];
            var dj = heroData.baoshijinglian ? heroData.baoshijinglian : 0;
            if(dj>=30){
                G.tip_NB.show(L('JLYMJ'));
                me.remove();
                return ;
            }
            me.setCenter();
            me.setXh();
        },
        setCenter: function () {
            var me = this;
            var panel = me._view;
            me.curXbId = G.frame.yingxiong_xxxx.curXbId;
            me.heroData = G.DATA.yingxiong.list[me.curXbId];
            me.bsData = me.heroData.weardata['6'];
            me.curId = X.keysOfObject(me.bsData)[0];
            var buffid = me.bsData[me.curId];
            var jlbuff=G.gc.baoshijinglian[buffid];
            var dj=me.heroData.baoshijinglian ? me.heroData.baoshijinglian : 0;
            me.need = G.gc.baoshijinglian[buffid][dj].need;
            me.setText(panel.nodes.panel_sxjc1,dj,jlbuff,1);
            me.setText(panel.nodes.panel_sxjc2,dj+1,jlbuff,2);
            panel.nodes.btn_zh.click(function (sender) {
                sender.setTouchEnabled(false);
                G.ajax.send('baoshi_jinglian',[me.curXbId],function(d) {
                    if(!d) return;
                    var d = JSON.parse(d);
                    if(d.s == 1) {
                        me.playAni(me.ui, function () {
                            G.frame.yingxiong_xxxx.emit('updateInfo');
                            me.setContents();
                            sender.setTouchEnabled(true);
                        });
                    } else {
                        sender.setTouchEnabled(true);
                    }
                },true);
            })
        },
        setText: function (node,dj,jlbuff,type) {
            var me = this;
            var panel = me._view;
            if(!jlbuff[dj]){
                panel.nodes.panel_2.show();
                panel.nodes.panel_1.hide();
                panel.nodes.img_wzsj.show();
                var sxjc=panel.nodes.panel_sxjc1.clone();
                panel.nodes.panel_2.addChild(sxjc);
                panel.nodes.btn_zh.setEnabled(false);
                return;
            }
            panel.nodes.txt_jcsx.setString(L("JBSX"));
            panel.nodes.txt_xhcl.setString(L("XHCL"));
            panel.nodes.btn_zh.show();

            node.removeAllChildren();
            var list = panel.nodes.list.clone();
            X.autoInitUI(list);
            var rh = new X.bRichText({
                size:22,
                maxWidth:list.nodes.txt_sx1.width,
                lineHeight:20,
                family:G.defaultFNT,
                color:G.gc.COLOR.n4,
            });
            rh.text(X.STR(L('BSDENGJI'+type),dj));
            rh.setPosition(cc.p(0,list.nodes.txt_sx1.height - rh.trueHeight()-5));
            list.nodes.txt_sx1.addChild(rh);
            node.addChild(list);
            list.show();
            var data = X.fmtBuff(jlbuff[dj].buff,false,{nofilterZero:true});
            for(var i = 0 ;i < data.length ;i++){
                var list = panel.nodes.list.clone();
                X.autoInitUI(list);
                if(type == 2){
                    var str = data[i].name + "<font color=#1c9700>+" + data[i].sz + "</font>";
                }else{
                    var str = data[i].name + "+" + data[i].sz;
                }
                var rh = new X.bRichText({
                    size:22,
                    maxWidth:list.nodes.txt_sx1.width,
                    lineHeight:20,
                    family:G.defaultFNT,
                    color:G.gc.COLOR.n4,
                });
                rh.text(str);
                rh.setPosition(cc.p(0,list.nodes.txt_sx1.height - rh.trueHeight()-5));
                list.nodes.txt_sx1.addChild(rh);
                node.addChild(list);
                list.show();
                list.y = panel.nodes.list.y - (panel.nodes.list.height + 10) * (i + 1);
            }
        },
        //消耗
        setXh: function () {
            var me = this;
            var view = me._view;
            if(!me.need[0]){
                view.nodes.panel_wpslx.hide();
            }else{
                view.nodes.panel_wpslx.show();
            }
            X.alignItems(view.nodes.panel_wpslx, me.need, 'left', {
                touch: true,
                scale: .8,
                mapItem: function (node) {
                    if(G.class.getOwnNum(node.data.t, node.data.a) < node.data.n) {
                        node.num.setTextColor(cc.color(G.gc.COLOR.n16));
                    }
                }
            });
        },
        playAni: function (panel, callback) {
            var me = this;
            me.isAniShow = true;
            G.class.ani.show({
                json: "ani_baoshishenji",
                addTo: panel,
                x: panel.width / 2,
                y: panel.height / 2,
                repeat: false,
                autoRemove: true,
                onend: function (node, action) {
                    callback && callback();
                    me.isAniShow = false;
                }
            });
        }
    });

G.frame[ID] = new fun('ui_tip11.json', ID);
})();