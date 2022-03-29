/**
 * Created by zhangming on 2017-12-25
 */
(function () {
    //自动创建按钮组
    G.class.topMenu = function(bui,conf, view, listView){
        var me = this;

        me.list = view ? view.nodes.list : bui.ui.nodes.list;

        var listview = view ? view.nodes.listview : (bui.ui.nodes.listview || listView);
        me._listview = me.listview = listview;

        me.bui = bui;
        me.btns = {};

        listview.setScrollBarEnabled && listview.setScrollBarEnabled(false);
        listview.removeAllItems();

        for(var i=0;i<conf.btns.length;i++){
            var d = conf.btns[i];
            var list = me.list.clone();
            list.setName(d.id);
            list.idx = i;
            me.setItem(list,d);

            list.show();
            listview.pushBackCustomItem(list);
        }
    };

    G.class.topMenu.prototype = {
        getItem : function(id){
            var items = this._listview.getItems();
            for(var i=0;i<items.length;i++){
                if(items[i].getName() == id){
                    return items[i];
                }
            }
            return null;
        },
        getBtn : function(id){
            var item = this.getItem(id);
            return item ? item.btn : null;
        },
        getConf : function(id){
            return this.getBtn(id).data;
        },
        changeMenu : function(id){ // , jump
            var me = this;
            var item = me.getItem(id);
            if (!cc.sys.isObjectValid(item)) {
                return;
            }
            item.btn.triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        //设置按钮
        setItem: function (list,d) {
            var me = this;

            X.autoInitUI(list);
            var btn = list.btn = list.nodes.btn_1;
            var title = list.title = list.nodes.txt_name;

            title.setString(d.title);
            btn.data = d;

            title.setTextColor(cc.color('#A79682'));
            btn.setBright(true);

            var _name = 'menuBtn'+ (d.id||"");
            btn.setName(_name);
            me.btns[_name] = btn;

            if(d.checkLv) {
                if(d.checkLv == 'gh') {
                    if(!P.gud.ghid) {
                        btn.disable = true;
                        btn.show = d.show;
                    }
                }else {
                    if(P.gud.lv < G.class.opencond.getLvById(d.checkLv)) {
                        btn.disable = true;
                        btn.show = X.STR(d.show, G.class.opencond.getLvById(d.checkLv));
                    }
                }
            }

            btn.touch(function (sender, type, fromwhere) {
                if (type === ccui.Widget.TOUCH_ENDED) {
                    if (fromwhere != 'fromcode' && !sender.isBright()) {
                        return;
                    }
                    var btns = me.listview.getItems();
                    for (var j = 0; j < btns.length; j++) {
                        var btn = btns[j].btn;
                        if (sender == btn) {
                            // 选中状态
                            if (!sender.disable) {
                                btns[j].title.setTextColor(cc.color('#FFFFFF'));
                                X.enableOutline(btns[j].title,cc.color('#0a1021'),2);
                                sender.setBright(false);
                            }
                        } else {
                            // 未选中状态
                            if (!sender.disable && !btn.disable) {
                                btns[j].title.setTextColor(cc.color('#A79682'));
                                X.enableOutline(btns[j].title,cc.color('#44281d'),2);
                                btn.setBright(true);
                            }
                        }
                    }
                    me.bui.changeType && me.bui.changeType(sender);
                }
            });
        },
        //增加单个按钮
        addItem: function (d) {
            var me = this;

            var listview = me.listview;
            var list = me.list.clone();

            //如果已经存在该节点，跳出设置
            var child = listview.finds(d.id);
            if (cc.isNode(child)) {
                return;
            }

            list.setName(d.id);
            list.idx = listview.getChildren().length;
            me.setItem(list,d);

            listview.pushBackCustomItem(list);
            list.show();
        },
        // enableMenu : function(v){
        //     var items = this._listview.getItems();
        //     for(var i=0;i<items.length;i++){
        //         items[i].btn.setTouchEnabled(v);
        //     }
        // },
        // setDisable: function (id,disbale) {
        //     var item = this.getItem(id);
        //     if (!cc.sys.isObjectValid(item)) {
        //         return;
        //     }

        //     item.setLock(disbale);
        // }
    };

})();
