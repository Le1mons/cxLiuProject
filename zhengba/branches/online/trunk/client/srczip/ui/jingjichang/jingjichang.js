/**
 * Created by wfq on 2018/6/19.
 */
(function () {
    //竞技场
    var ID = 'jingjichang';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
			me.fullScreen = true;
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_fh.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });

            me.nodes.btn_sc.click(function (sender, type) {
                G.frame.shop.data({type: 4, name: "jjsd"}).show();
            })
        },
        onOpen: function () {
            var me = this;
            X.audio.playEffect("sound/openjingjichang.mp3");
            me.fillSize();
            me.showToper();

            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;

            me.ui.setTimeout(function(){
            	G.guidevent.emit('jingjichangOpenOver');
            },200);
        },
        onShow: function () {
            var me = this;

            me.getData(function () {
                me.setContents();
            });
        },
        onHide: function () {
            var me = this;
            me.event.emit('hide');
        },
        getData: function (callback) {
            var me = this;

            me.DATA = {};
            callback && callback();
            // G.ajax.send('zypkjjc_open', [], function (d) {
            //     if (!d) return;
            //     var d = JSON.parse(d);
            //     if (d.s == 1) {
            //         me.DATA = d.d;
            //         callback && callback();
            //     }
            // }, true);
        },
        checkRedPoint: function() {
            var me = this;
            var data = G.DATA.hongdian.crosswz;
            if (data > 0 && P.gud.lv >= G.class.wangzherongyao.getOpen().lv) {
                G.setNewIcoImg(me.nodes.img_dfwz, .7);
                me.nodes.img_dfwz.getChildByName("redPoint").setPosition(570, 170);
            } else {
                G.removeNewIco(me.nodes.img_dfwz);
            }

        },
        setContents: function () {
            var me = this;

            var imgFreeJJC = me.nodes.img_zyjj;
            var imgGuanjun = me.nodes.img_gjsl;
            var imgWangzhe = me.nodes.img_dfwz;
            var txtTimeStr1 = me.nodes.text_1;
            var txtTime1 = me.nodes.text_djs1;
            var txtTimeStr2 = me.nodes.text_2;
            var txtTime2 = me.nodes.text_djs2;
            var txtTimeStr3 = me.nodes.text_3;
            var txtTime3 = me.nodes.text_djs3;
            // var imgOpen2 = me.ui.finds('img_kfdj');


            // imgOpen2.hide();

            //自由竞技场
            var zeroTime = X.getLastMondayZeroTime();
            var openDuration = G.class.jingjichang.get().base.closetime;

            if (me.timer1) {
                txtTime1.clearTimeout(me.timer1);
                delete me.timer1;
            }

            if (G.time > zeroTime + openDuration) {
                //休息时间
                me.iszyjjc = false;
                txtTimeStr1.setString(L('OPEN_TO_STAR') + '：');
                me.timer1 = X.timeout(txtTime1,zeroTime + 7 * 24 * 60 * 60, function () {
                    me.setContents();
                },null,null);
            } else {
                //活动时间
                me.iszyjjc = true;
                txtTimeStr1.setString(L('OPEN_TO_END') + '：');
                me.timer1 = X.timeout(txtTime1,zeroTime + openDuration, function () {
                    me.setContents();
                },null,null);
            }

            imgFreeJJC.setZoomScale(0.05);
            imgFreeJJC.setTouchEnabled(true);
            imgFreeJJC.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    // if (G.time > zeroTime + openDuration) {
                    //     G.tip_NB.show(L('JJC_FREE_NOWORK'));
                    //     return;
                    // }
                    G.frame.jingjichang_freepk.data(me.iszyjjc).checkShow();
                }
            });

            if(G.class.opencond.getIsOpenById('championtrial')){
                imgGuanjun.setBright(true);
            }else{
                imgGuanjun.setBright(false);
            }
            // 冠军试炼
            var openDuration2 = G.class.championtrial.get().base.opentime;
            var closetime = G.class.championtrial.get().base.colsetime;
            if (me.timer2) {
                txtTime2.clearTimeout(me.timer2);
                delete me.timer2;
            }
            if (G.time < zeroTime + 4 * 24 * 3600 + 8 * 3600) {
                //休息时间
                me.isFight = false;
                imgGuanjun.isopen = false;
                imgGuanjun.setTouchEnabled(false);
                txtTimeStr2.setString(L('OPEN_TO_STAR') + '：');
                me.timer2 = X.timeout(txtTime2,zeroTime + 4 * 24 * 3600 + 8 * 3600, function () {
                    me.setContents();
                },null,null);
            }else if(G.time > zeroTime + 6 * 24 * 3600 + 22 * 3600){
                //休息时间
                me.isFight = false;
                imgGuanjun.isopen = false;
                imgGuanjun.setTouchEnabled(false);
                txtTimeStr2.setString(L('OPEN_TO_STAR') + '：');
                me.timer2 = X.timeout(txtTime2,zeroTime + 11 * 24 * 3600 + 8 * 3600, function () {
                    me.setContents();
                },null,null);
            } else {
                //活动时间
                me.isFight = true;
                imgGuanjun.isopen = true;
                imgGuanjun.setBright(true);
                txtTimeStr2.setString(L('OPEN_TO_END') + '：');
                me.timer2 = X.timeout(txtTime2,zeroTime + 6 * 24 * 3600 + 22 * 3600, function () {
                    me.setContents();
                },null,null);
            }
            if (P.gud.lv < G.class.opencond.getLvById('championtrial')) {
                imgGuanjun.setBright(false);
            }
            imgGuanjun.setZoomScale(0.05);
            imgGuanjun.setTouchEnabled(true);
            imgGuanjun.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    if (P.gud.lv < G.class.opencond.getLvById('championtrial')) {
                        G.tip_NB.show(L('JJC_GUANJUN_NOWORK'));
                        return;
                    }
                    if(!sender.isopen){
                        G.tip_NB.show(L('JJC_FIGHT_OVER'));
                        return;
                    }
                    G.frame.jingjichang_guanjunshilian.data(sender.isopen).checkShow();
                }
            });

            if(G.loginAllData.opentime + 24 * 3600 * 7 < G.time){
                imgWangzhe.setBright(true);
                imgWangzhe.setTouchEnabled(true);
                imgWangzhe.loadTextureNormal("img/jingjichang/img_jjc_dfwz2.png", 1);
                me.checkRedPoint();
            }else{
                imgWangzhe.setBright(false);
                imgWangzhe.setTouchEnabled(false);
            }
            imgWangzhe.setZoomScale(0.05);
            imgWangzhe.click(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {

                    G.frame.wangzherongyao.show();
                }
            }, 600);



        },
    });

    G.frame[ID] = new fun('jingjichang.json', ID);
})();
