/**
 * Created by
 */
(function () {
    //
    G.event.on("attrchange_over", function () {
        if(G.frame.yingxiongyure.isShow) {
            G.frame.yingxiongyure.showAttr();
        }
        if(G.frame.yingxiongyure_czzl.isShow) {
            G.frame.yingxiongyure_czzl.showAttr();
        }
    });
    G.event.on("itemchange_over", function () {
        if(G.frame.yingxiongyure.isShow) {
            G.frame.yingxiongyure.showAttr();
        }
        if(G.frame.yingxiongyure_czzl.isShow) {
            G.frame.yingxiongyure_czzl.showAttr();
        }
    });
    var ID = 'yingxiongyure';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;
            me.nodes.btn_fh.click(function (sender, type) {
                me.remove();
            });
            me.nodes.btn_ph.click(function (sender, type) {
                G.frame.help.data({
                    intr:L("TS105")
                }).show();
            });
            if (G.time < me.asyncData.etime){
                X.timeout(me.nodes.txt_sj, me.asyncData.etime, function () {
                    G.tip_NB.show(L('HUODONG_HD_OVER'));
                    me.remove();
                    G.view.mainView.getAysncBtnsData(function () {
                        G.view.mainView.allBtns["lefttop"] = [];
                        G.view.mainView.setSvrBtns();
                    }, false, ["heropreheat"]);
                }, null, {
                    showDay: true
                });
            };
            G.class.ani.show({
                json: "yingxiongzhanshi2_dh",
                addTo: me.nodes.panel_dh2,
                x: me.nodes.panel_dh2.width / 2,
                y: 196,
                repeat: true,
                autoRemove: false,
                onend: function (node, action) {
                }
            });
            G.class.ani.show({
                json: "yingxiongzhanshi_dh",
                addTo: me.nodes.panel_dh1,
                x: 165,
                y: 198,
                repeat: true,
                autoRemove: false,
                onend: function (node, action) {
                }
            });
        },
        bindBtn: function () {
            var me = this;
            //英雄简介
            me.nodes.btn_yxjj.click(function () {
                G.frame.yingxiongyure_yxyl.data({
                    plid:me.DATA.info.plid
                }).show();
            });
            //成长之路
            me.nodes.btn_czzl.click(function () {
                G.frame.yingxiongyure_czzl.show();
            });
            //七日奖励
            me.nodes.btn_qrjl.click(function () {
                G.frame.yingxiongyure_qrjl.show();
            });
            //期待
            me.nodes.btn_qd.click(function () {
                G.ajax.send('huodong_use',[me.hdid,'2',1,1],function (data) {
                    var data = JSON.parse(data);
                    if(data.s == 1) {
                        G.frame.jiangli.data({
                            prize:[].concat(data.d.prize || [])
                        }).show();
                        me.getData(function () {
                            me.setContents();
                            me.checkRedPoint();
                            G.hongdian.getData('heropreheat');
                        });
                    }
                })
            });
            //领取
            me.nodes.btn_lq.click(function () {
                G.ajax.send('huodong_use',[me.hdid,'3',1,1],function (data) {
                    var data = JSON.parse(data);
                    if(data.s == 1) {

                        G.frame.jiangli.data({
                            prize:[].concat(data.d.prize || [])
                        }).show();
                        me.DATA.myinfo = data.d.myinfo;
                        me.setContents();
                    }
                })
            });

            me.nodes.btn_jia2.click(function () {
                G.frame.chongzhi.show();
            });
        },
        onOpen: function () {
            var me = this;
            me.asyncData = G.DATA.asyncBtnsData.heropreheat;
            me.initUi();
        },
        getData: function(callback) {
            var me = this;
            var hdid = me.hdid = G.DATA.asyncBtnsData.heropreheat.hdid;
            G.ajax.send("huodong_open", [hdid], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            })
        },
        show: function(){
            var me = this;
            var _super = this._super;
            this.getData(function () {
                _super.apply(me, arguments);
            })
        },
        onHide: function () {
            var me = this;
            me.changeToperAttr();
        },
        onAniShow: function () {
        },
        onShow: function () {
            var me = this;
            me.showAttr();
            me.bindBtn();
            me.setContents();
            me.checkRedPoint();
        },
        showAttr: function () {
            var me = this;
            me.ui.finds("token_jb").loadTexture(G.class.getItemIco('5101'), 1);
            var myown = G.class.getOwnNum('5101','item');
            me.nodes.txt_jb.setString(X.fmtValue(myown));
            me.nodes.txt_zs.setString(X.fmtValue(P.gud.rmbmoney));
        },
        setContents: function () {
            var me = this;
            me.nodes.txt_cs.removeAllChildren();
            var str1 = X.STR(L('yrhd_tip1'),me.DATA.myinfo.dianzan,1);
            var rh = new X.bRichText({
                size: 20,
                maxWidth: me.nodes.txt_cs.width,
                lineHeight: 34,
                family: G.defaultFNT,
                color: '#fff79f',
                outline:'#311e00'
            });
            rh.text(str1);
            rh.setAnchorPoint(0.5, 0.5);
            rh.setPosition(me.nodes.txt_cs.width / 2, me.nodes.txt_cs.height / 2);
            me.nodes.txt_cs.removeAllChildren();
            me.nodes.txt_cs.addChild(rh);
            var jd = me.DATA.allnum/me.DATA.info.libaoinfo.needval*100;
            me.nodes.jdt_1.setPercent(jd);
            if (jd>=100){
                //说明期待值已满
                me.nodes.btn_qd.hide();
                if (me.DATA.myinfo.finish==1){
                    //已经领取
                    me.nodes.btn_lq.setTouchEnabled(false);
                    me.nodes.btn_lq.setBright(false);
                    me.nodes.txt_lq.setTextColor(cc.color('#565656'))
                } else {
                    me.nodes.btn_lq.setTouchEnabled(true);
                    me.nodes.btn_lq.setBright(true);
                }
                me.nodes.btn_lq.show();
                me.nodes.img_1.hide();
            }else {
                if (me.DATA.myinfo.dianzan==1){
                    //今天已经点赞了
                    me.nodes.btn_qd.setTouchEnabled(false);
                    me.nodes.btn_qd.setBright(false);
                }else {
                    me.nodes.btn_qd.setTouchEnabled(true);
                    me.nodes.btn_qd.setBright(true);
                }
                me.nodes.btn_qd.show();
                me.nodes.btn_lq.hide();
                me.nodes.img_1.show();
                me.setText();
            }
            me.setHero();
        },
        setHero:function(){
          var me = this;
          var hid = G.class.hero.getHeroByPinglun(me.DATA.info.plid)[0].hid;
          me.nodes.panel_rw.removeBackGroundImage();
          me.nodes.panel_rw.removeAllChildren();
            X.setHeroModel({
                parent: me.nodes.panel_rw,
                data: {},
                model: hid,
                noRelease: true,
                cache: false,
                callback: function (node) {
                    node.x = 167;
                    node.y = 42;
                },
            });
        },
        setText:function(){
          var me = this;
            me.nodes.txt_lb.removeAllChildren();
            var hid = G.class.hero.getHeroByPinglun(me.DATA.info.plid)[0].hid;
            var heroconf = G.class.hero.getById(hid);
            var synum = me.DATA.info.libaoinfo.needval-me.DATA.allnum;
            var str1 = X.STR(L('yrhd_tip2'),me.DATA.allnum,synum,heroconf.name);
            var rh = new X.bRichText({
                size: 18,
                maxWidth: me.nodes.txt_lb.width,
                lineHeight: 24,
                family: G.defaultFNT,
                color: '#ffffff',
                outline:'#311e00'
            });
            rh.text(str1);
            rh.setAnchorPoint(0.5, 0.5);
            rh.setPosition(me.nodes.txt_lb.width / 2, me.nodes.txt_lb.height / 2);
            me.nodes.txt_lb.removeAllChildren();
            me.nodes.txt_lb.addChild(rh);
        },
        checkRedPoint:function () {
            var me = this;
            var czzlhd = 0;
            var qrqdhd = 0;
            var task = me.DATA.info.task;
            var rec = me.DATA.myinfo.task.rec;
            var jindu = me.DATA.myinfo.task.data;
            for (var i in task){
                var nval = jindu[i]||0;
                if (!X.inArray(rec,i)){
                    if (nval>=task[i].pval){
                        czzlhd = 1;
                        break;
                    }
                }
            };
            var qiandao = me.DATA.myinfo.qiandao;
            var today = me.DATA.myinfo.idx;
            if (!X.inArray(qiandao,today)){
                qrqdhd = 1;
            }
            if (czzlhd==1){
                G.setNewIcoImg(me.nodes.btn_czzl);
                me.nodes.btn_czzl.getChildByName("redPoint").setPosition(111, 96.7);
            } else {
                G.removeNewIco(me.nodes.btn_czzl);
            }
            if (qrqdhd==1){
                G.setNewIcoImg(me.nodes.btn_qrjl);
                me.nodes.btn_qrjl.getChildByName("redPoint").setPosition(111, 96.7);
            } else {
                G.removeNewIco(me.nodes.btn_qrjl);
            }
        }
    });
    G.frame[ID] = new fun('yingxiongyure.json', ID);
})();