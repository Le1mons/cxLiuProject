/**
 * Created by yaosong on 2018/12/28.
 */
(function () {
    //王者荣耀-钻石赛分组
    var ID ='wangzherongyao_zuanshisai_fenzhu';

    var fun = X.bUi.extend({
        ctor: function (json,id) {
            var me = this;
            me.fullScreen = true;
            me.singleGroup = "f4";
            me._super(json,id);
        },
        onOpen: function () {
            var me = this;
            me.fillSize();
            me.initUi();
            me.bindBtn();
        },
        onShow: function () {
            var me = this;
            me.showToper();
        },
        onAniShow : function(){
            var me = this;
            me.getData(function () {
                me.setData();
            });
        },
        checkShow: function(callback) {
            var me = this;

            me.getData(function () {
                if(me.DATA != undefined)me.show();
                else{
                    callback && callback();
                }
            });
        },
        onHide: function () {
            var me = this;
            delete G.DATA.wzry_zss;
        },
        onClose: function () {

        },
        initUi: function () {
            var me = this;
        },
        bindBtn : function(){
            var me = this;
            me.ui.nodes.btn_fanhui.touch(function(sender,type){
                if(type==ccui.Widget.TOUCH_ENDED){
                    me.remove();
                }
            });
        },
        getData : function(callback,forceLoad){
            //forceLoad 是否强制读取
            var me = this;
            if(!forceLoad && me.DATA){
                callback && callback();
                return;
            }
            G.ajax.send('crosswz_zsopen',[],function(d){
                var data = JSON.parse(d);
                if (data.s == 1) {
                    me.DATA = data.d || {};
                    callback && callback();
                }
            });
        },
        setData: function () {
            var me = this;
            var d = me.DATA;
            var scrollView = me.ui.nodes.scrollview;
            scrollView.removeAllChildren();
            cc.enableScrollBar(scrollView,false);
            var list = me.ui.nodes.list;
            if (!me.tableView || !me.tableView.isEnabled()){
                me.tableView = new X.TableView(scrollView,list,2,function (ui, data) {
                    X.autoInitUI(ui);
                    ui.setSwallowTouches(false);
                    if(data % 2 == 1){
                        ui.nodes.txt_pm.setString(data);
                        X.enableOutline(ui.nodes.txt_pm,'#2f5691',2);
                        X.enableOutline(ui.nodes.txt_zu,'#2f5691',2);
                        ui.nodes.but_zs.loadTextureNormal("img/wangzherongyao/ben_fz3.png",1);
                    }else{
                        ui.nodes.txt_pm.setString(data);
                        X.enableOutline(ui.nodes.txt_pm,'#9f323a',2);
                        X.enableOutline(ui.nodes.txt_zu,'#9f323a',2);
                        ui.nodes.but_zs.loadTextureNormal("img/wangzherongyao/ben_fz4.png",1);
                    }
                    ui.nodes.txt_zu.setString(X.STR(L("WZRY_ZSS_ZU"),data));
                    if (d.mygroup == data){
                        ui.nodes.img_jt.show();
                        ui.nodes.txt_zu.setTextColor(cc.color('#fff21a'));
                    }else{
                        ui.nodes.img_jt.hide();
                        ui.nodes.txt_zu.setTextColor(cc.color('#ffffff'));
                    }
                    ui.nodes.but_zs.setTouchEnabled(false);
                    ui.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_NOMOVE){
                            G.frame.wangzherongyao_zuanshisai.parent(ID).data(data).show();
                        }
                    });
                },null,0,15);
                me.tableView.setData([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]);
                me.tableView.reloadDataWithScroll(true);
                me.tableView._table.tableView.setBounceable(false);
            }else{
                me.tableView.reloadDataWithScroll(false);
            }
            var str;
            if (!d.mygroup){
                str = L('WZRY_ZZS_WFZ');
            }else{
                str = X.STR(L('WZRY_ZZS_FZ'),d.mygroup);
            }
            me.ui.nodes.wz.setString(str);
        }
    });

    G.frame[ID] = new fun('wangzherongyao_zss.json', ID);
})();
