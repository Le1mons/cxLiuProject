/**
 * Created by
 */
(function () {
    //
    var ID = 'yingxiongyure_czzl';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;
            me.nodes.btn_fh.click(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });

            me.nodes.btn_jia2.click(function () {
                G.frame.chongzhi.once('willClose',function () {
                    G.frame.yingxiongyure.getData(function () {
                        me.DATA = G.frame.yingxiongyure.DATA;
                        G.frame.yingxiongyure.checkRedPoint();
                        me.setContents();

                    });
                }).show();
            });
            var zero = X.getTodayZeroTime()+24*3600;
            X.timeout(me.nodes.txt_sj, zero, function () {
                G.tip_NB.show('任务已刷新');
                if (G.frame.yingxiongyure.isShow){
                    G.frame.yingxiongyure.getData(function () {
                        me.setContents();
                    });
                }
            });
            me.setHero();
        },
        bindBtn: function () {
            var me = this;
            var dhbtn = me.ui.finds('ico_2');
            dhbtn.setTouchEnabled(true);
            dhbtn.click(function () {
                G.frame.yingxiongyure_dh.show();
            });

        },
        onOpen: function () {
            var me = this;
            me.DATA = G.frame.yingxiongyure.DATA;
            me.initUi();
        },
        onHide: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.bindBtn();
            me.setContents();
            me.showAttr();
        },
        showAttr: function () {
            var me = this;
            me.ui.finds("token_jb").loadTexture(G.class.getItemIco('5101'), 1);
            var myown = G.class.getOwnNum('5101','item');
            me.nodes.txt_jb.setString(X.fmtValue(myown));
            me.nodes.txt_zs.setString(X.fmtValue(P.gud.rmbmoney));
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
                    node.y = 50;
                },
            });
        },
        setContents: function () {
            var me = this;
            var txtjf = me.ui.finds('txt_jf');
            var num = G.class.getOwnNum(me.DATA.info.duihuanNeed[0].t,me.DATA.info.duihuanNeed[0].a);
            var str1 = X.STR(L('yrhd_tip3'),num);
            var rh = new X.bRichText({
                size: 18,
                maxWidth: txtjf.width,
                lineHeight: 24,
                family: G.defaultFNT,
                color: '#fef7e0',
                eachText: function (node) {
                    X.enableOutline(node, "#311e00", 2);
                }
            });
            rh.text(str1);
            rh.setAnchorPoint(0.5, 0.5);
            rh.setPosition(txtjf.width / 2, txtjf.height / 2);
            txtjf.removeAllChildren();
            txtjf.addChild(rh);
            //
            var arr = me.sortData();
            me.nodes.scrollview.removeAllChildren();
            var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_lb, 1, function (ui, data) {
                me.setItem(ui, data);
            }, null, null, 10, 5);
            table.setData(arr);
            table.reloadDataWithScroll(true);
        },
        setItem:function(ui,idx){
          var me = this;
          var taskconf = me.DATA.info.task[idx];
          X.autoInitUI(ui);
          ui.nodes.panel_ico1.setTouchEnabled(false);
          ui.nodes.txt_ms.setString(taskconf.desc);
            X.alignItems(ui.nodes.panel_ico1,taskconf.prize,'left',{
                touch:true
            });
            var rec = me.DATA.myinfo.task.rec;
            var jindu = me.DATA.myinfo.task.data[idx]||0;
            ui.nodes.btn_lq.hide();
            ui.nodes.btn_qd.hide();
            if (X.inArray(rec,idx)){
                //已经领取
                ui.nodes.btn_lq.show();
                ui.nodes.btn_lq.setTouchEnabled(false);
                ui.nodes.btn_lq.setBright(false);
                ui.nodes.txt_lq.setString('已领取');
                ui.nodes.txt_lq.setTextColor(cc.color("#565656"));
            }else {
                if (jindu>=taskconf.pval){
                    //可以领取
                    ui.nodes.btn_lq.show();
                    ui.nodes.btn_lq.setTouchEnabled(true);
                    ui.nodes.btn_lq.setBright(true);
                    ui.nodes.txt_lq.setString('领取');
                } else {
                    ui.nodes.btn_qd.show();
                }
            }
            ui.nodes.btn_lq.idx = idx;
            ui.nodes.btn_lq.touch(function (sender,type) {
                if (type == ccui.Widget.TOUCH_NOMOVE){
                    G.ajax.send('huodong_use',[G.frame.yingxiongyure.hdid,'4',sender.idx,1],function (data) {
                        var data = JSON.parse(data);
                        if(data.s == 1) {
                            G.frame.jiangli.once('close',function () {
                                me.setContents();
                            }).data({
                                prize:[].concat(data.d.prize || [])
                            }).show();
                            me.DATA.myinfo = data.d.myinfo;
                            G.frame.yingxiongyure.DATA.myinfo = data.d.myinfo;
                            G.frame.yingxiongyure.checkRedPoint();
                            G.hongdian.getData('heropreheat');
                        }
                    })
                }
            });
            ui.nodes.btn_qd.tzid = taskconf.tiaozhuan;
            ui.nodes.btn_qd.touch(function (sender,type) {
                if (type == ccui.Widget.TOUCH_NOMOVE){
                    if (sender.tiaozhuan){
                        X.tiaozhuan(conf.tiaozhuan);
                        me.remove();
                        G.frame.yingxiongyure.remove();
                    } else {
                        // me.remove();
                    }
                }
            })
        },
        sortData:function () {
          var me = this;
          var task = me.DATA.info.task;
          var rec = me.DATA.myinfo.task.rec;
          var jindu = me.DATA.myinfo.task.data;
          var arr1 = [];
          var arr2 = [];
          var arr3 = [];
          for (var i in task){
                var nval = jindu[i]||0;
                if (X.inArray(rec,i)){
                    //已经领取
                    arr3.push(i);
                }else {
                    if (nval>=task[i].pval){
                        arr1.push(i);
                    } else {
                        arr2.push(i);
                    }
                }
          }
        var arr = arr1.concat(arr2.concat(arr3));
          return arr;
        },
    });
    G.frame[ID] = new fun('yingxiongyure_tk3.json', ID);
})();