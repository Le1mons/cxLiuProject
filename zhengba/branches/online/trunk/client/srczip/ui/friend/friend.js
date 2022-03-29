/**
 * Created by lsm on 2018/6/27.
 */
(function () {
    //聊天
    var ID = 'friend';

    G.event.on("addfriend", function () {
        G.DATA.addfriend = true;
        G.setNewIcoImg(G.view.mainView.nodes.btn_hy);
    });

    var fun = X.bUi.extend({
        extConf: {
            maxnum: 30
        },
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f3";
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;

            me.topMenu = new G.class.topMenu(me, {
                btns: X.clone(G.class.menu.get('friend'))
            });
            me.nodes.listview.setTouchEnabled(true);
        },
        changeType: function (sender) {
            var me = this;
            if(sender.data){
                var type = sender.data.id;
            }else{
                var type = sender;
            }


            if(sender.disable) {
                G.tip_NB.show(sender.show);
                return;
            }

            me.curType = type;

            var viewConf = {
                "1": G.class.friend_list,
                "2": G.class.friend_search,
                "3": G.class.friend_application,
                "4": G.class.friend_treasure
            };
            me._panels = me._panels || {};
            for (var _type in me._panels) {
                cc.isNode(me._panels[_type]) && me._panels[_type].hide();
            }
            if (!cc.isNode(me._panels[type])) {
                me._panels[type] = new viewConf[type](type);
                me.ui.nodes.panel_nr.addChild(me._panels[type]);
            }
            me._panels[type].isShow = true;
            for(var i in me._panels){
                if(i != type){
                    me._panels[i].isShow = false;
                }
            }
            me._panels[type].show();
        },
        bindBtn: function () {
            var me = this;
            me.ui.nodes.mask.click(function(){
                me.remove();
            })
        },
        onOpen: function () {
            var me = this;
            me.fillSize();

            me.initUi();
            me.bindBtn();
            me.checkRedPoint();
        },
        checkRedPoint: function(){
            var me = this;
            var arr = ["friend"];
            var btns = [me.nodes.listview.children[0]];
            for(var i = 0; i < arr.length; i ++){
                if(G.DATA.hongdian[arr[i]] > 0){
                    G.setNewIcoImg(btns[i]);
                    btns[i].getChildByName("redPoint").setPosition(111, 61);
                }else{
                    G.removeNewIco(btns[i]);
                }
            }
            if(G.DATA.addfriend){
                G.setNewIcoImg(me.nodes.listview.children[2]);
                me.nodes.listview.children[2].getChildByName("redPoint").setPosition(111, 61);
            }else{
                G.removeNewIco(me.nodes.listview.children[2]);
            }
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            var type = (me.data() && me.data().tztype) || 1;
            me.topMenu.changeMenu(1);
        },
        onHide: function () {
            var me = this;
            me.event.emit('hide');
            G.hongdian.getHongdian(1, function () {
                G.hongdian.checkFriend();
            })
        },

        setContents: function () {
            var me = this;

        },
        getData: function(callback, errCall) {
            var me = this;
            G.ajax.send('friend_open', [], function(d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                } else {
                    errCall && errCall();
                }
            }, true);
        },
        setFriendNum: function () {
            var me = this;
        }
    });

    G.frame[ID] = new fun('friend.json', ID);
})();
