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
            me.releaseRes = [
                'kfzb3', 'kfzb4', 'wangzherongyao', 'wangzherongyao2', 'wangzherongyao3',
                'wujunzhizhan', 'wztt', 'wztt_tx'
            ];
            me.releaseRes1 = [
                'img/bg/bg_jingjichang.jpg', 'img/changjingfengwei/bg_julongfenye.jpg', 'img/bg/img_wztt_bg.jpg', 'img/bg/bg_fengbaozhanchang.jpg',
                'img/changjingfengwei/bg_fengbaozhanchang.jpg', 'img/bg/img_wjzz_bg.jpg', 'img/bg/img_wjzz_d_bg.jpg', ''
            ]
        },
        initUi: function () {
            var me = this;

            G.class.ani.show({
                json: "ani_julongshendian_fengwei",
                addTo: me.nodes.bg_jjc,
                x: me.nodes.bg_jjc.width / 2,
                y: me.nodes.bg_jjc.height / 2,
                repeat: true,
                autoRemove: false,
            });

            cc.enableScrollBar(me.nodes.listview);
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_fh.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });

            me.nodes.btn_sc.click(function (sender, type) {

                // G.frame.shop.data({type: 4, name: "jjsd"}).show();
                G.frame.shopmain.data('4').show();
            });
            me.nodes.btn_zdyx.setTouchEnabled(true);
            me.nodes.btn_zdyx.click(function () {

                G.frame.fight_demo.show();
            });
        },
        onOpen: function () {
            var me = this;
            X.audio.playEffect("sound/openjingjichang.mp3");
            me.fillSize();
            me.showToper();

            me.initUi();
            me.bindBtn();
            cc.enableScrollBar(me.nodes.scrollview);
            G.DATA.music = 'jingji';
            X.audio.playMusic("sound/jingji.mp3", true);
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.initList();
        },
        onHide: function () {
            var me = this;
            me.event.emit('hide');
        },
        checkRedPoint: function() {
            var me = this;
            var data = G.DATA.hongdian.crosswz;

            if (!me.isShow) return;
            if (data > 0 && P.gud.lv >= G.class.wangzherongyao.getOpen().lv && me.nodes.img_dfwz) {
                G.setNewIcoImg(me.nodes.img_dfwz, .7);
                me.nodes.img_dfwz.redPoint.setPosition(585, 170);
            } else {
                G.removeNewIco(me.nodes.img_dfwz);
            }

            var storm = G.DATA.hongdian.storm;
            if(storm > 0 && me.nodes.img_fbzc) {
                G.setNewIcoImg(me.nodes.img_fbzc, .7);
                me.nodes.img_fbzc.redPoint.setPosition(585, 170);
            } else {
                G.removeNewIco(me.nodes.img_fbzc);
            }

            if (G.hongdian.objMeet(G.DATA.hongdian.crosszbjifen) && me.nodes.img_wyzb) {
                G.setNewIcoImg(me.nodes.img_wyzb, .7);
                me.nodes.img_wyzb.redPoint.setPosition(585, 170);
            } else {
                G.removeNewIco(me.nodes.img_wyzb);
            }

            // if (G.DATA.hongdian.wjzz) {
            //     G.setNewIcoImg(me.nodes.img_wjzz, .7);
            //     me.nodes.img_wjzz && me.nodes.img_wjzz.redPoint.setPosition(585, 170);
            // } else {
            //     G.removeNewIco(me.nodes.img_wjzz);
            // }

            if (G.DATA.hongdian.ladder) {
                G.setNewIcoImg(me.nodes.img_wztt, .7);
                me.nodes.img_wztt && me.nodes.img_wztt.redPoint.setPosition(585, 170);
            } else {
                G.removeNewIco(me.nodes.img_wztt);
            }
        },
        setContents: function () {
            var me = this;

            var imgFreeJJC = me.nodes.img_zyjj;
            var imgGuanjun = me.nodes.img_gjsl;
            var imgWangzhe = me.nodes.img_dfwz;
            var imgFbzc = me.nodes.img_fbzc;
            var txtTimeStr1 = me.nodes.img_zyjj.children[0];
            var txtTime1 = me.nodes.img_zyjj.children[1];
            var txtTimeStr2 = me.nodes.img_gjsl.children[0];
            var txtTime2 = me.nodes.img_gjsl.children[1];
            if (imgFbzc) var fbwz = imgFbzc.children[0];
            if (imgFbzc) var fbdjs = imgFbzc.children[1];


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

            imgFreeJJC.setTouchEnabled(true);
            imgFreeJJC.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.jingjichang_freepk.data(me.iszyjjc).checkShow();
                }
            });
            if(G.class.opencond.getIsOpenById('championtrial')){
                imgGuanjun.setBright(true);
            }else{
                imgGuanjun.setBright(false);
            }
            if (me.timer2) {
                txtTime2.clearTimeout(me.timer2);
                delete me.timer2;
            }
            var time1 = zeroTime + 4 * 24 * 3600 + 8 * 3600;
            var time2 = zeroTime + 6 * 24 * 3600 + 22 * 3600;
            if (G.time < time1) {
                //休息时间
                me.isFight = false;
                imgGuanjun.isopen = false;
                imgGuanjun.setTouchEnabled(false);
                txtTimeStr2.setString(L('OPEN_TO_STAR') + '：');
                me.timer2 = X.timeout(txtTime2,zeroTime + 4 * 24 * 3600 + 8 * 3600, function () {
                    me.setContents();
                },null,null);
            }else if(G.time >= time2){
                //休息时间
                me.isFight = false;
                imgGuanjun.isopen = true;
                imgGuanjun.setTouchEnabled(false);
                txtTimeStr2.setString(L('OPEN_TO_SHOW') + '：');
                me.timer2 = X.timeout(txtTime2,zeroTime + 6 * 24 * 3600 + 24 * 3600, function () {
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
            imgGuanjun.setZoomScale(0.02);
            imgGuanjun.setTouchEnabled(true);
            imgGuanjun.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    if (P.gud.lv < G.class.opencond.getLvById('championtrial')) {
                        G.tip_NB.show(X.STR(L('JJC_GUANJUN_NOWORK'), G.class.opencond.getLvById('championtrial')));
                        return;
                    }
                    if(!sender.isopen){
                        G.tip_NB.show(L('JJC_FIGHT_OVER'));
                        return;
                    }
                    G.frame.jingjichang_guanjunshilian.data(sender.isopen).checkShow();
                }
            });

            if (imgWangzhe) {
                if(G.time >= G.OPENTIME + X.getOpenTimeToNight() + (29 * 24 * 3600)){
                    imgWangzhe.setBright(true);
                    imgWangzhe.setTouchEnabled(true);
                    imgWangzhe.loadTextureNormal("img/jingjichang/img_jjc_dfwz2.png", 1);
                }else{
                    imgWangzhe.setBright(false);
                }
                imgWangzhe.click(function (sender, type) {
                    if (type == ccui.Widget.TOUCH_ENDED) {
                        G.frame.wangzherongyao.show();
                    }
                }, 600);
            }

            
            var timeFun = function () {
                var curTime = G.time;
                var time = G.gc.fbzc.base.act_time;
                var zeroTime = X.getTodayZeroTime();

                if(curTime < zeroTime + 12 * 3600) {
                    fbwz.setString(L("JLTJBXKS"));
                    me.setTime(fbdjs, zeroTime + 12 * 3600, timeFun);
                } else if(curTime < zeroTime + 12 * 3600 + time) {
                    fbwz.setString(L("TJBXJS"));
                    me.setTime(fbdjs, zeroTime + 12 * 3600 + time, timeFun);
                } else if(curTime < zeroTime + 21 * 3600) {
                    fbwz.setString(L("JLTJBXKS"));
                    me.setTime(fbdjs, zeroTime + 21 * 3600, timeFun);
                } else if(curTime < zeroTime + 21 * 3600 + time) {
                    fbwz.setString(L("TJBXJS"));
                    me.setTime(fbdjs, zeroTime + 21 * 3600 + time, timeFun);
                } else {
                    fbwz.setString(L("JLTJBXKS"));
                    me.setTime(fbdjs, zeroTime + 36 * 3600, timeFun);
                }
            };

            if (imgFbzc) {
                if(P.gud.lv < 60 || !G.DATA.openFBZC) {
                    imgFbzc.setBright(false);
                } else {
                    imgFbzc.setBright(true);
                    timeFun();
                }

                imgFbzc.click(function (sender, type) {
                    G.frame.fengbaozhanchang.show();
                }, 1500);
            }

            if (me.nodes.img_wyzb) {
                if(P.gud.lv < G.class.opencond.getLvById("crosszb") || G.time < G.OPENTIME + X.getOpenTimeToNight() + 24 *3600){
                    me.nodes.img_wyzb.setBright(false);
                }
                me.nodes.img_wyzb.click(function (sender) {
                    G.frame.yuwaizhengba.checkShow();
                });
            }

            // if (me.nodes.img_wjzz) {
            //     me.nodes.img_wjzz.setBright(X.checkIsOpen('wjzz'));
            //     me.nodes.img_wjzz.click(function () {
            //         G.frame.wujunzhizhan.show();
            //     });
            // }

            if (me.nodes.img_wztt) {
                me.nodes.img_wztt.setBright(X.checkIsOpen('wztt'));
                me.nodes.img_wztt.click(function () {
                    G.frame.wztt.show();
                });
            }
        },
        setTime: function (node, toTime, callback) {
            var me = this;
            X.timeout(node, toTime, function () {
                callback && callback();
            });
        },
        initList: function () {
            var me = this;
            var conf = [
                {
                    name: "img_zyjj",
                    isOpen: function () {
                        return true;
                    },
                    type: 'lv',
                    img: "img_jjc_zyjj"
                },
                {
                    name: "img_gjsl",
                    isOpen: function () {
                        return G.class.opencond.getIsOpenById('championtrial');
                    },
                    type: 'lv',
                    img: "img_jjc_gjsl"
                },
                {
                    name: "img_wyzb",
                    isOpen: function () {
                        return true;
                    },
                    type: 'time',
                    img: "img_jjc_wyzb"
                },
                {
                    name: "img_wztt",
                    isOpen: function () {
                        return G.time >= G.OPENTIME + X.getOpenTimeToNight() + (13 * 24 * 3600);
                    },
                    type: 'time',
                    img: "img_jjc_wztt"
                },
                {
                    name: "img_fbzc",
                    isOpen: function () {
                        return G.time >= G.OPENTIME + X.getOpenTimeToNight() + (20 * 24 * 3600);
                    },
                    type: 'time',
                    img: "img_jjc_fbzc"
                },
                {
                    name: "img_dfwz",
                    isOpen: function () {
                        return G.time >= G.OPENTIME + X.getOpenTimeToNight() + (29 * 24 * 3600);
                    },
                    type: 'time',
                    img: "img_jjc_dfwz2"
                },
                // {
                //     name: "img_wjzz",
                //     isOpen: function () {
                //         return G.time >= G.OPENTIME + X.getOpenTimeToNight() + 33 * 24 * 3600 && P.gud.lv >= 100;
                //     },
                //     type: 'time',
                //     img: "img_jjc_wjzz"
                // }
            ];
            var arr = {};
            var typeArr = ['lv', 'time'];
            for (var i = 0; i < conf.length; i ++) {
                var con = conf[i];
                if (!arr[con.type]) arr[con.type] = [];
                arr[con.type].push(i);
            }
            var arr1 = [];
            for (var i = 0; i < typeArr.length; i ++) {
                var data = arr[typeArr[i]];
                for (var index = 0; index < data.length; index ++) {
                    if (conf[data[index]].type == 'time') {
                        // if (conf[data[index]])
                        arr1.push(data[index]);
                    } else {
                        arr1.push(data[index]);
                    }
                    if (!conf[data[index]].isOpen()) break;
                }
            }

            for (var i = 0; i < arr1.length; i ++) {
                me.setList(conf[arr1[i]], i == arr1.length - 1);
            }
            me.setContents();
            me.checkRedPoint();

            me.ui.setTimeout(function(){
                G.guidevent.emit('jingjichangOpenOver');
            }, 200);
        },
        setList: function (conf, isHide) {
            var me = this;
            var list = me.nodes.list.clone();
            X.autoInitUI(list);
            X.render({
                img_sz1: function (node) {
                    node.setVisible(!isHide);
                },
                img_sz2: function (node) {
                    node.setVisible(!isHide);
                },
                btn_list: function (node) {
                    node.setZoomScale(0.02);
                    node.loadTextureNormal("img/jingjichang/" + conf.img + ".png", 1);
                    me.nodes[conf.name] = node;
                }
            }, list.nodes);
            list.show();
            me.nodes.listview.pushBackCustomItem(list);
        }
    });

    G.frame[ID] = new fun('jingjichang.json', ID);
})();
