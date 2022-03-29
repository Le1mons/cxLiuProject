/**
 * Created by yaosong on 2018/12/28.
 */
(function () {
    //王者荣耀-王者竞猜
    var ID = 'wangzherongyao_jcwz';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f5";
            me._super(json, id, {action:true});
        },
        onOpen: function () {
            var me = this;
            me.fillSize();

            me.initUI();
            me.bindUI();
        },
        onShow: function () {
            var me = this;

            new X.bView('wangzherongyao_jcwz.json', function(view) {
                me._view = view;

                me.defHeight = me._view.height;
                me.ui.nodes.panel_nr.removeAllChildren();
                me.ui.nodes.panel_nr.addChild(view);
                view.setTouchEnabled(true);

                me.ui.nodes.tip_title.setString(L(ID));
                me.reloadData(function () {
                    me.action.play('scrollviewup',false);
                });
            });
        },
        onHide: function () {
            var me = this;

            G.frame.wangzherongyao.isShow && G.frame.wangzherongyao.freshData();

        },
        initUI: function () {
            var me = this;
        },
        bindUI: function () {
            var me = this;

            me.ui.nodes.mask.touch(function(sender,type){
                if(type==ccui.Widget.TOUCH_ENDED){
                    me.remove();
                }
            });
        },
        reloadData: function (callback) {
            var me = this;
            me.getData(function () {
                me.setData();
                callback && callback();
            },true);
        },
        getData: function (callback,forceLoad) {
            //forceLoad 是否强制读取
            var me = this;
            if(!forceLoad && me.DATA){
                callback && callback();
                return;
            }
            G.ajax.send('crosswz_guessopen',[],function(d){
                var data = JSON.parse(d);
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            });
        },
        setData: function () {
            var me = this;
            var view = me._view;
            var d = me.DATA;
            d.userlist.sort(function (a, b) {
                return a.guessnum > b.guessnum ? -1 : 1;
            });
            view.nodes.txt_je1.setString(d.totalmoney);
            view.nodes.txt_mc.setString(d.myguess != '' ? d.myguess : L('WU'));
            var scrollView = view.nodes.scrollview;
            scrollView.removeAllChildren();
            cc.enableScrollBar(scrollView,false);
            var listItem = view.nodes.list;
            var tableView = new X.TableView(scrollView,listItem,1,function (ui, data) {
                X.autoInitUI(ui);
                ui.nodes.ico.removeAllChildren();
                var ico = G.class.shead(data,false);
                ico.setAnchorPoint(0,0);
                ui.nodes.ico.addChild(ico);
                ui.nodes.name.setString(data.name);
                ui.nodes.wz_zgx.setString(data.ext_servername || "");
                ui.nodes.txt_zl.setString(data.zhanli || "");
                ui.nodes.sl2.setString(data.guessnum);
                ui.nodes.sl3.setString(data.guessmoney);

                ui.nodes.ico.setTouchEnabled(true);
                ui.nodes.ico.touch(function (sender, type) {
                    if (type == ccui.Widget.TOUCH_ENDED){
                        G.ajax.send('crosswz_userdetails',[data.uid],function(rd) {
                            rd = X.toJSON(rd);
                            if (rd.s === 1) {
                                G.frame.wangzherongyao_wjxx.data({frame:me.ID(), data: rd.d}).show();
                            }
                        },true);
                    }
                });

                if (d.canguess) {
                    ui.nodes.btn_gm.show();
                    ui.nodes.btn_gm.setEnableState(true);
                    ui.nodes.btn_gm.setSwallowTouches(false);
                    ui.nodes.btn_gm.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_NOMOVE) {
                            G.frame.wangzherongyao_wangzhejingcai_tankuang.data(data.uid).show();
                        }
                    });
                }else{
                    ui.nodes.btn_gm.setBright(false);
                    ui.nodes.btn_gm.setTitleColor(cc.color(G.gc.COLOR.n15));
                }
                if (d.guessuid == data.uid){
                    ui.finds('wz_yjc').show();
                }else{
                    ui.finds('wz_yjc').hide();
                }
                // if(G.frame.wangzherongyao.DATA.status == 6) {
                //
                // }
                ui.nodes.jb.hide();
                if (data.deep > 5){
                    ui.nodes.jb.loadTexture('img/wangzherongyao/jcwz_' + ['sq','yj','gj'][data.deep - 6] + '.png',ccui.Widget.PLIST_TEXTURE);
                    ui.nodes.jb.show();
                }
                if(data.predeep) {
                    if(data.predeep > 0) {
                        ui.nodes.jb.show();
                        ui.nodes.jb.loadTexture('img/wangzherongyao/img_sj_' + ['sq','yj','gj'][data.predeep - 6] + '.png',ccui.Widget.PLIST_TEXTURE);
                    }
                }
            });
            tableView.setData(d.userlist);
            tableView.reloadDataWithScroll(true);
        }
    });

    G.frame[ID] = new fun('ui_tip4.json', ID);
})();
