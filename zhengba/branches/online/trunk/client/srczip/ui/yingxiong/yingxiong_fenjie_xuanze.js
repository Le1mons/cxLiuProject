/**
 * Created by wfq on 2018/6/2.
 */
(function () {
    //英雄-分解-选择
    G.class.yingxiong_fenjie_xuanze = X.bView.extend({
        extConf:{
            maxnum:10
        },
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super('jisifazhen_tip_xzyx.json');
        },
        refreshPanel: function () {
            var me = this;

            me.setContents();
            me.setAttr();
            me.setyxsl();
        },
        setAttr: function () {
            var me = this;
            var panel = me.ui;
            var lay1 = panel.finds('panel_xhjy');
            var lay2 = panel.finds('panel_xhhz');

            var txtAttr1 = me.nodes.txt_jysl;
            var imgAttr1 = lay1.finds('token_yxexp');
            var txtAttr2 = me.nodes.txt_hzsl;
            var imgAttr2 = lay2.finds('token_hz');

            // 2004
            var attr1 = 'useexp';
            txtAttr1.setString(X.fmtValue(P.gud['useexp']));
            imgAttr1.loadTexture(G.class.getItemIco(attr1),1);
            var attr2 = '2004';
            txtAttr2.setString(X.fmtValue(G.class.getOwnNum(attr2,'item')));
            imgAttr2.loadTexture(G.class.getItemIco(attr2),1);
        },
        setyxsl:function(){
            var me = this;
            var panel = me.ui;
            var yfr = panel.finds('panel_yfr');
            var frsl = 0;
            var is = false;
            if(G.frame.yingxiong_fenjie.top.selectedData){
                frsl = G.frame.yingxiong_fenjie.top.selectedData.length;
            }
            me.yfr < frsl ? is = true : is = false;
            me.yfr = frsl;
            var str = L('TFRYXSL')+X.STR('{1}/{2}',frsl,10);
            var rh = new X.bRichText({
                size:22,
                maxWidth:yfr.width,
                lineHeight:32,
                color:'#ffffff',
                family:G.defaultFNT,
                eachText: function (node) {
                    X.enableOutline(node,'#000000',2);
                },
            });
            rh.text(str);
            rh.setPosition(cc.p(yfr.width / 2 - rh.trueWidth() / 2,yfr.height / 2 - rh.trueHeight() / 2));
            yfr.removeAllChildren();
            yfr.addChild(rh);
            if(is){
                var action1 = cc.scaleTo(0.3, 1.1, 1.1);
                var action2 = cc.scaleTo(0.3, 1, 1);
                var seq = cc.sequence(action1, action2);
                rh.stopAllActions();
                rh.runAction(seq);
            }
        },
        bindBTN: function () {
            var me = this;

            me.ui.finds('btn_xysd').click(function (sender, type) {
                G.frame.shop.data({type: "1", name: "yxsd"}).show();
            }, 1000);
            // me.nodes.btn_1.setTitleColor(cc.color(G.gc.COLOR.n13));
            //预览
            // me.nodes.btn_tishi.touch(function (sender, type) {
            //     if (type == ccui.Widget.TOUCH_ENDED) {
            //         var sData = G.frame.yingxiong_fenjie.top.selectedData;
            //
            //         if(sData.length < 1){
            //             G.tip_NB.show("请放入需要分解的英雄");
            //             return;
            //         }
            //
            //         function showJiangli(data) {
            //             G.frame.jiangliyulan.data({
            //                 prize:[].concat(data || []),
            //             }).show();
            //         }
            //
            //         if (sData.length  < 1) {
            //             showJiangli();
            //             return;
            //         }
            //
            //         G.ajax.send('hero_fenjieyulan',sData,function(d) {
            //             if(!d) return;
            //             var d = JSON.parse(d);
            //             if(d.s == 1) {
            //                 showJiangli(d.d.prize);
            //             }
            //         });
            //
            //     }
            // });
            // //快速放入
            // me.nodes.btn_1.touch(function (sender, type) {
            //     if (type == ccui.Widget.TOUCH_ENDED) {
            //         var sData = G.frame.yingxiong_fenjie.top.selectedData;
            //         if (sData.length >= me.extConf.maxnum) {
            //             return;
            //         }
            //
            //         var list = G.frame.yingxiong_fenjie.top.curList;
            //         var table = G.frame.yingxiong_fenjie.top.table;
            //         var lockArr = G.frame.yingxiong_fenjie.top.lockArr;
            //
            //         for (var i = 0; i < list.length; i++) {
            //             var tid = list[i];
            //             //选择过的继续
            //             if (X.inArray(sData, tid)) {
            //                 continue;
            //             }
            //             if(G.DATA.yingxiong.list[tid].star < 5 && !X.inArray(lockArr,tid)){
            //                 var obj = table.cellByName(tid);
            //                 if (obj && cc.sys.isObjectValid(obj[0])) {
            //                     obj[0].triggerTouch(ccui.Widget.TOUCH_NOMOVE)
            //                 } else {
            //                     me.addItem(tid);
            //                     G.frame.yingxiong_fenjie.top.selectedData.push(tid);
            //                 }
            //             }
            //             if (G.frame.yingxiong_fenjie.top.selectedData.length >= me.extConf.maxnum) {
            //                 break;
            //             }
            //
            //         }
            //     }
            // });
            // //分解
            // me.nodes.btn_2.touch(function (sender, type) {
            //     if (type == ccui.Widget.TOUCH_ENDED) {
            //         //空判断
            //         var sData = G.frame.yingxiong_fenjie.top.selectedData;
            //         if (sData.length < 1) {
            //             G.tip_NB.show(L('YX_FENJIE_TIP_1'));
            //             return;
            //         }
            //         //高级英雄判断
            //         var highStar = 0;
            //         for (var i = 0; i < sData.length; i++) {
            //             var tid = sData[i];
            //     if(G.frame.yingxiong_fenjie.top.selectedData.        var heroData = G.DATA.yingxiong.list[tid];
            //             if (heroData.star > highStar) {
            //                 highStar = heroData.star;
            //             }
            //         }
            //         if (highStar > 4) {
            //             var str = X.STR(L('YX_FENJIE_TIP_2'),highStar);
            //             G.frame.alert.data({
            //                 sizeType:3,
            //                 cancelCall:null,
            //                 okCall: function () {
            //                     me._resolve(sData);
            //                 },
            //                 richText:str
            //             }).show();
            //         }else{
            //             me._resolve(sData);
            //         }
            //
            //     }
            // });
        },
        // _resolve:function (sData) {
        //     G.ajax.send('hero_fenjie',sData,function(d) {
        //         if(!d) return;
        //         var d = JSON.parse(d);
        //         if(d.s == 1) {
        //             G.tip_NB.show(L('FENJIE') + L('SUCCESS'));
        //             G.frame.jiangli.data({
        //                 prize:[].concat(d.d.prize),
        //                 state: "fjlq"
        //             }).show();
        //             G.frame.yingxiong_fenjie.setContents();
        //         }
        //     },true);
        // },
        onOpen: function () {
            var me = this;
            me.yfr = 0;
            me.bindBTN();
        },
        onShow: function () {
            var me = this;

            G.class.ani.show({
                json: "ani_jisifazhen",
                addTo: me.nodes.panel_dh,
                x: 100,
                y: -113,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {
                    action.play("in", true);
                    G.frame.yingxiong_fenjie.men = action;
                }
            });

            me.refreshPanel();
        },
        onRemove: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            return;
            me.createLayout();
        },
        //创建10个层容器
        // createLayout: function () {
        //     var me = this;
        //
        //     var lay = me.nodes.panel_yxlb;
        //     lay.removeAllChildren();
        //     var list = me.nodes.list_yx;
        //     list.hide();
        //     me.itemArr = [];
        //
        //     var herInterval = (lay.width - (me.extConf.maxnum / 2 * list.width)) / (me.extConf.maxnum / 2 - 1);
        //     var verInterval = lay.height - (2 * list.height);
        //
        //     for (var i = 0; i < me.extConf.maxnum; i++) {
        //         var item = list.clone();
        //         item.idx = i;
        //         item.setName(i);
        //         me.setItem(item);
        //         item.setPosition(cc.p(item.width / 2 + (item.width + herInterval) * (i % 5),lay.height - item.height / 2 - (item.height + verInterval) * Math.floor(i / 5)));
        //         lay.addChild(item);
        //         item.show();
        //         me.itemArr.push(item);
        //     }
        // },
        // setItem: function (item) {
        //     var me = this;
        //
        //     X.autoInitUI(item);
        //
        //     // var imgAdd = item.nodes.img_add;
        //     var layIco = item.nodes.panel_yx;
        //
        //     if (item.data) {
        //         delete item.data;
        //     }
        //     layIco.setTouchEnabled(false);
        //     layIco.removeAllChildren();
        //     // imgAdd.show();
        //
        //     item.setTouchEnabled(true);
        //     item.touch(function (sender, type) {
        //         if (type == ccui.Widget.TOUCH_ENDED) {
        //             if (sender.data) {
        //                 me.removeItem(sender.data);
        //             }
        //         }
        //     });
        // },
        // removeItem: function (tid) {
        //     var me = this;
        //
        //     var itemArr = me.itemArr;
        //     for (var i = 0; i < itemArr.length; i++) {
        //         var item = itemArr[i];
        //         var layIco = item.nodes.panel_yx;
        //         // var imgAdd = item.nodes.img_add;
        //         if (item.data && item.data == tid) {
        //             var idx = X.arrayFind(G.frame.yingxiong_fenjie.top.selectedData,tid);
        //             if (idx > -1) {
        //                 G.frame.yingxiong_fenjie.top.selectedData.splice(idx, 1);
        //                 G.frame.yingxiong_fenjie.top.removeGou(tid);
        //             }
        //             delete item.data;
        //             layIco.removeAllChildren();
        //             // imgAdd.show();
        //         }
        //     }
        // },
        // addItem: function (tid) {
        //     var me = this;
        //
        //     var itemArr = me.itemArr;
        //     for (var i = 0; i < itemArr.length; i++) {
        //         var item = itemArr[i];
        //         if (!item.data) {
        //             item.data = tid;
        //             var layIco = item.nodes.panel_yx;
        //             // var imgAdd = item.nodes.img_add;
        //             var wid = G.class.shero(G.DATA.yingxiong.list[tid]);
        //             wid.setAnchorPoint(0.5,1);
        //             wid.setPosition(cc.p(layIco.width / 2,layIco.height));
        //             layIco.addChild(wid);
        //             // imgAdd.hide();
        //             break;
        //         }
        //     }
        // }
    });

})();