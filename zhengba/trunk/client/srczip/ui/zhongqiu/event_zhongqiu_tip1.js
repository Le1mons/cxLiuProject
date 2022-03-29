/**
 * Created by zhangming on 2020-09-21
 */
(function () {
    // 制作月饼
    var ID = 'event_zhongqiu_tip1';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f3";
            me._super(json, id, {action:true});
        },
        setContents: function() {
            var me = this;
            if(!cc.isNode(me.ui)) return;
            var prize = me.DATA.prize;

            X.render({
                panel_1: function(node){
                    var widget = G.class.sitem(prize);
                    widget.setPosition(node.width / 2, node.height / 2);
                    node.removeAllChildren();
                    node.addChild(widget);
                    G.frame.iteminfo.showItemInfo(widget);
                },
                textfield_5: function(node){
                    node.setTextHorizontalAlignment(1);
                    node.setTextVerticalAlignment(1);

                    X.setInput(node, function (sender) {
                        var num = parseInt(sender.getString().trim());
                        if (num > me.maxNum) num = me.maxNum;
                        if (num % 1 !== 0) num = 1;

                        me.curNum = num;
                        me.setCurNum();
                    });
                },
                text_1: X.STR(L('zhongqiu_make'), me.maxNum),
            }, me.nodes);

            me.setCurNum();
        },
        setCurNum: function(){
            var me = this;
            if(!cc.isNode(me.ui)) return;

            if (me.curNum < 1) {
                me.curNum = 1;
            }
            if (me.curNum > me.maxNum) {
                me.curNum = me.maxNum;
            }

            me.nodes.btn_1.setEnableState(false);
            me.nodes.btn_jian10.setEnableState(false);

            me.nodes.btn_2.setEnableState(false);
            me.nodes.btn_jia10.setEnableState(false);

            if (me.curNum != 1){
                me.nodes.btn_1.setEnableState(true);
                me.nodes.btn_jian10.setEnableState(true);
            }
            if (me.curNum < me.maxNum){
                me.nodes.btn_2.setEnableState(true);
                me.nodes.btn_jia10.setEnableState(true);
            }

            X.render({
                textfield_5: me.curNum + '',
            }, me.nodes);
        },
        bindUI: function () {
            var me = this;
            if(!cc.isNode(me.ui)) return;
            me.nodes.txt_title.setString(me.data().title || L('zhongqiu_title3'));

            me.nodes.mask.click(function(sender,type){
                me.remove();
            });

            // 制作
            me.nodes.btn_zs.click(function(sender,type){
                me.DATA.callback && me.DATA.callback(me.curNum);
                me.remove();
            });

            // 减1
            me.nodes.btn_1.click(function(sender,type){
                if (me.curNum > 0) {
                    me.curNum--;
                    me.setCurNum();
                }
            });

            // 减10
            me.nodes.btn_jian10.click(function(sender,type){
                if (me.curNum > 0) {
                    me.curNum-=10;
                    me.setCurNum();
                }
            });

            // 加1
            me.nodes.btn_2.click(function(sender,type){
                if (me.curNum < me.maxNum) {
                    me.curNum++;
                    me.setCurNum();
                }
            });

            // 加10
            me.nodes.btn_jia10.click(function(sender,type){
                if (me.curNum < me.maxNum) {
                    me.curNum+=10;
                    me.setCurNum();
                }
            });
        },
        onOpen: function () {
            var me = this;

            me.bindUI();
        },
        onShow: function () {
            var me = this;
            me.DATA = me.data();
            me.maxNum = me.DATA.maxNum || 1;
            me.curNum = me.maxNum;

            me.setContents();
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
    });

    G.frame[ID] = new fun('event_zhongqiu_tip1.json', ID);
})();