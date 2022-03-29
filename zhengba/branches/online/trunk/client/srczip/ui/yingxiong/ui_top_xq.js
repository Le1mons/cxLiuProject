/**
 * Created by zhangming on 2018-05-03
 */
(function () {
    //英雄信息-数据详情
    var ID = 'ui_top_xq';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f4";
            me._super(json, id, {action: true});
        },
        setContents:function() {
            var me = this;
            var data = (me.data() && me.data().data) || G.DATA.yingxiong.list[me.curXbId] || G.class.herogrow.getById(me.curId);
            var keys = ['jingzhunpro','gedangpro','undpspro','dpspro','skilldpspro','baoshangpro','baojipro','miankongpro','pojiapro',"pvpdpspro","pvpundpspro"];

            var listview = me.nodes.listview;
            listview.setScrollBarEnabled && listview.setScrollBarEnabled(false);
            listview.removeAllItems();

            for(var i=0;i<keys.length;i++){
                var list = me.nodes.list.clone();
                X.autoInitUI(list);
                if(data[keys[i]] == null){
                    data[keys[i]] = '0';
                }
                var num = parseInt(data[keys[i]]/10) + ("." + data[keys[i]]%10 + "%");
                X.render({
                    txt_sx:L('ITEM_ATTR_' + keys[i]),
                    txt_sz:num
                }, list.nodes);
                list.show();
                listview.pushBackCustomItem(list);
            }
        },
        bindUI: function () {
            var me = this;

            me.nodes.mask.click(function(){
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.bindUI();

            if(me.data().y) {
                me.nodes.panel_top.y = me.data().y / 2;
            } else {
                me.nodes.panel_top.y += 180;
            }
        },
        onShow: function () {
            var me = this;
            me.curXbId = me.data().tid;
            me.curId = me.data().id;

            me.setContents();

        },
        onRemove: function () {
            var me = this;
        }
    });

    G.frame[ID] = new fun('ui_top1.json', ID);
})();
