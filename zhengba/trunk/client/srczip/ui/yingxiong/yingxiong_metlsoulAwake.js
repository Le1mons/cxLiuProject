/**
 * Created by  on .
 */
(function () {
    //皮肤-选择
    var ID = 'yingxiong_metlsoulAwake';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
            me.nodes.txt_title.setString(L('metlsoul_tip1'));
            me.nodes.img_gouxuan.setVisible(X.cacheByUid('metlsoulten'));
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });
            me.nodes.img_kuang.setTouchEnabled(true);
            me.nodes.img_kuang.click(function () {
                if (X.cacheByUid('metlsoulten')){//取消勾选
                    X.cacheByUid('metlsoulten',0);
                    me.nodes.img_gouxuan.hide()
                }else {
                    X.cacheByUid('metlsoulten',1);
                    me.nodes.img_gouxuan.show();
                }
            })
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            me.curTid = G.frame.yingxiong_xxxx.curXbId;
            var msconf = G.gc.meltsoulcom.base.wake;
            var nowmslv = P.gud.mswake;//此刻的觉醒等级
            var msmaxlv = X.keysOfObject(msconf.data).length-1; //配置中的最大等级
            var now_maxlv = me.getMaxAwakeLv()>=msmaxlv?msmaxlv:me.getMaxAwakeLv();//当前可以升到的最大等级
            if (nowmslv>=msmaxlv){
                //达到了最大
                var nextlv = nowmslv;
                me.nodes.panel_xh.hide();
                me.nodes.txt_ymj.show();
                me.nodes.txt_ymj.setString(L('YMJ'));
            } else if (nowmslv>=now_maxlv){
                //达到了可升到的最大
                var nextlv = nowmslv+1;
                me.nodes.panel_xh.hide();
                me.nodes.txt_ymj.show();
                me.nodes.txt_ymj.setString(L('RHJXSX'));
            }else {
                var nextlv = nowmslv+1;
            }
            me.nodes.panel_1.removeAllChildren();
            var itemclone1 = me.nodes.list.clone();
            itemclone1.show();
            itemclone1.setAnchorPoint(0,0);
            itemclone1.setPosition(0,0);
            X.autoInitUI(itemclone1);
            itemclone1.nodes.text_1.setString('觉醒等级');
            itemclone1.nodes.text_2.setString(nowmslv+'/'+now_maxlv);
            itemclone1.nodes.text_3.setString(nextlv+'/'+now_maxlv);
            me.nodes.panel_1.addChild(itemclone1);
            var nowbuff = msconf.data[nowmslv].buff;
            var nextbuff = msconf.data[nextlv].buff;
            me.nodes.panel_2.removeAllChildren();
            for (var i=0;i<2;i++){
                var item = me.nodes.list.clone();
                item.show();
                X.autoInitUI(item);
                item.setAnchorPoint(0,0);
                item.setPosition(0,30*i);
                if (i==0){
                    item.nodes.text_1.setString(L('QTSM'));
                    item.nodes.text_2.setString(nowbuff.hp);
                    item.nodes.text_3.setString(nextbuff.hp);
                }else {
                    item.nodes.text_1.setString(L('QTGJ'));
                    item.nodes.text_2.setString(nowbuff.atk);
                    item.nodes.text_3.setString(nextbuff.atk);
                }
                me.nodes.panel_2.addChild(item);
            }
            me.nodes.panel_wp.removeAllChildren();
            X.alignItems( me.nodes.panel_wp, msconf.data[nowmslv].need, "center",{
                touch:true
            });
            var node1 = me.nodes.panel_1.getChildren()[0];
            var node2 = me.nodes.panel_2.getChildren()[0];
            var node3 = me.nodes.panel_2.getChildren()[1];
            me.nodes.btn_zs.click(function () {
                var iften = X.cacheByUid('metlsoulten') ? true : false;
                G.ajax.send('hero_mswake',[iften],function (d) {
                    var d = JSON.parse(d);
                    if (d.s == 1){
                        G.frame.yingxiong_xxxx.qh.refreshPanel&&G.frame.yingxiong_xxxx.qh.refreshPanel();
                        G.frame.yingxiong_xxxx.updateInfo();
                        if (cc.isNode(node1) && cc.isNode(node2) && cc.isNode(node3)){
                            me.setBuffAni([node1.getChildByName('text_2$'),node1.getChildByName('text_3$'),node2.getChildByName('text_2$'),node2.getChildByName('text_3$'),node3.getChildByName('text_2$'),node3.getChildByName('text_3$')],function () {
                                me.setContents();
                            });
                        }
                    }
                })
            },1000)
        },
        getMaxAwakeLv:function () {
            var me = this;
            var _num=0;
            var data = G.DATA.yingxiong.list;
            for (var i in data){
                if (data[i].meltsoul>=8){
                    _num++;
                }
            }
            var maxlv = G.gc.meltsoulcom.base.wake.lv*_num;
            return maxlv;
        },
        //属性动画
        setBuffAni:function (arr,callback) {
            var me = this;
            if(!me.nodes)return;

            me.isrun = true;
            function runani(node) {
                if(!cc.isNode(node))return;

                var aninode = node;
                if(!aninode.actionA){
                    G.class.ani.show({
                        json: "ronghun_sx_tx",
                        addTo: node.parent,
                        x: node.x-45,
                        y: node.y ,
                        repeat: false,
                        cache:true,
                        autoRemove: false,
                        onload: function (node, action) {
                            aninode.node = node;
                            aninode.actionA = action;
                            aninode.actionA.play("in",false);
                        }
                    });
                }else{
                    aninode.actionA.gotoFrameAndPause(0);
                    aninode.node.zIndex = 300;
                    aninode.node.setVisible(true);
                    aninode.actionA.play("in",false);

                }

                node.runActions([
                    cc.scaleTo(.2,1.1,1.1),
                    cc.scaleTo(.3,1,1),
                    cc.callFunc(()=>{
                        if(me.isrun){
                            me.isrun = !me.isrun;
                            callback && callback();
                        }
                    })
                ]);
            };

            for(var i = 0; i < arr.length; i++){
                (function (node) {
                    runani(node);
                }(arr[i]));
            }
        },
    });
    G.frame[ID] = new fun('ui_tip_rhjx.json', ID);
})();