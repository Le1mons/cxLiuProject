/**
 * Created by  on 2019//.
 */
(function () {
    //公会统计
    G.class.alaxi_ghtj = X.bView.extend({
        ctor: function () {
            var me = this;
            me._super("ghz_tip_tj.json",null,{cache:true});
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
        },
        bindBtn: function () {
            var me = this;
            cc.enableScrollBar(me.nodes.listview);
            var btn = me.btn = ['btn_tjp','btn_nc','btn_kd','btn_sl','btn_fmc'];
            me.citytype = [3,5,2,1,4];//按钮对应的城池类型
            for(var i = 0; i < btn.length; i++){
                me.nodes[btn[i]].type = me.citytype[i];
                me.nodes[btn[i]].click(function (sender) {
                    me.type = sender.type;
                    me.setContents();
                })
            }
        },
        onShow: function () {
            var me = this;
            me.type = me.citytype[0];
            me.getData(function () {
                me.nodes[me.btn[0]].triggerTouch(ccui.Widget.TOUCH_ENDED);
            })
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        getData:function (callback) {
            var me = this;
            connectApi('gonghuisiege_cityuserrank',[],function (data) {
                me.DATA = [];
                for(var i in data){
                    for(var j = 1; j < 6; j++){
                        if(!data[i].fightnuminfo[j]){
                            data[i].fightnuminfo[j] = 0;
                        }
                    }
                    me.DATA.push(data[i]);
                }
                callback && callback();
            });
        },
        setContents:function () {
            var me = this;
            me.sortData(me.type);
            me.nodes.img_zwnr.setVisible(me.DATA.length == 0);
            me.nodes.listview.removeAllChildren();
            for(var i = 0; i < me.DATA.length; i++){
                var list = me.nodes.list.clone();
                me.setItem(list,me.DATA[i]);
                me.nodes.listview.pushBackCustomItem(list);
            }
        },
        setItem:function (ui,data) {
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            ui.nodes.txt_name.setString(data.headata.name);
            for(var i = 0; i < 5; i++){
                var num = data.fightnuminfo[me.citytype[i]] ? data.fightnuminfo[me.citytype[i]] : 0;
                ui.nodes['txt_cs' + (i+1)].setString(num + L('CI'));
            }
        },
        sortData:function (type) {
            var me = this;
            me.DATA.sort(function (a,b) {
                return a.fightnuminfo[type] > b.fightnuminfo[type] ? -1:1;
            });
        }
    });
})();