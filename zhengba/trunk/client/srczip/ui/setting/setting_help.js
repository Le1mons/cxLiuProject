/**
 * Created by lsm on 2018/7/7
 */
(function() {
    //帮助
    G.class.setting_help = X.bView.extend({
        ctor: function(type) {
            var me = this;
            me._type = type;
            me._super('setting_help.json');
        },
        refreshPanel: function() {
            var me = this;
            me.getData(function() {
                me.DATA[1] = G.class.support.getHelp();
                me.DATA[2] = G.class.support.getProblem();
                me.nodes.page3.triggerTouch(ccui.Widget.TOUCH_ENDED);
            });
        },
        bindBTN: function() {
            var me = this;
        },
        initUi:function(){
            var me = this;
            var btns = me.ui.finds('panel_page').children;
            X.radio(btns, function (sender) {
                var name = sender.getName();
                var name2type = {
                    page1$:1,
                    page2$:2,
                    page3$:3,
                };
                me.setContents(name2type[name]);
            });
        },
        onOpen: function() {
            var me = this;
            me.initUi();
            me.bindBTN();
            cc.enableScrollBar(me.nodes.listview);
        },
        onShow: function() {
            var me = this;
            me.refreshPanel();
            me.nodes.page2.setEnabled(true);
        },
        onRemove: function() {
            var me = this;

        },
        getData:function(callback){
            var me = this;
            if (me.DATA) {
                callback && callback.call(me);
                return;
            }
            me.DATA = {};
            // G.ajax.send('gonggao_getlist',null,function(data){
            //     data = X.toJSON(data);
            //     if (data.s == 1) {
            //         me.DATA[3] = data.d;
            //         callback && callback.call(me);
            //     }
            // },true);
            if(!G.gonggaoUrl || G.gonggaoUrl=="")return;
            var url = G.gonggaoUrl+"&channel="+ (G.CHANNEL||"") +"&owner="+ (G.owner||"") +"&gamename="+ (G.gameName||"") + "&channelid="+ (G.channelId||"");
            X.ajax.get(url,{},function(txt) {
                var d = X.toJSON(txt);
                me.DATA[3] = d;
                callback && callback(d);
            });

        },
        setContents: function (type) {
            var me = this;
            var listview = me.nodes.listview;
            listview.removeAllChildren();
            cc.enableScrollBar(me.nodes.listview, false);
            var list = me.nodes.list;
            me.posy = 0;
            var data = me.ContentData = me.DATA[type];
            for(var i in data){
                var item = list.clone();
                item.idx = i;
                me.setItem(item);
                listview.pushBackCustomItem(item);
                item.show();
            }
        },
        
        setItem: function (item) {
            var me = this;
            X.autoInitUI(item);
            me.defBtnPos = item.nodes.btn_list.getPosition();
            me.defBtnPos.y = 66;
            me.defInfoPos = item.nodes.panel_info.getPosition();
            item.nodes.txt_title.setString(me.ContentData[item.idx].title);
            X.enableOutline(item.nodes.txt_title,'#7b531a',2);
            // item.setContentSize(item.width,item.height + me.richHeight);
            item.nodes.btn_list.setPositionY(item.height);
            // item.nodes.panel_info.setPositionY(item.height - item.nodes.btn_list.height);
            item.nodes.btn_list.setTouchEnabled(true);
            item.nodes.btn_list.setSwallowTouches(false);
            item.isExt = false;
            item.nodes.img_arrow_off.show();
            item.nodes.btn_list.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE){
                    var item = this;
                    item.isExt = !item.isExt;
                    if (item.isExt) {
                        me.showContent(item);
                    }else{
                        me.hideContent(item,true);
                    }
                }
            },item);
        },
        showContent: function (item) {
            var me = this;
            var idx = item.idx;
            X.autoInitUI(item);
            me.setItemContent(item);
            item.setContentSize(item.width,item.height + me.richHeight);
            item.nodes.btn_list.setPositionY(item.height);
            item.nodes.panel_info.setPositionY(item.height - item.nodes.btn_list.height + 10);
            me.updateListViewSize(item.height + me.richHeight,idx);
        },
        setItemContent:function(item){
            var me = this;
            var idx = item.idx;
            var data = me.ContentData[idx];
            var rt =new X.bRichText({
                size: 22,
                maxWidth:item.nodes.btn_list.width - 30,
                lineHeight:36,
                color:'#804326',
                family: G.defaultFNT
            });
            rt.text(data.content);
            rt.setAnchorPoint(0,0);
            me.richHeight = rt.trueHeight() + 30;
            me.defWidth =  item.nodes.btn_list.width;
            rt.setPosition(10,me.richHeight * 0.6);
            item.nodes.panel_info.removeAllChildren();
            item.nodes.panel_info.addChild(rt);
            item.nodes.panel_info.setContentSize(cc.size(me.defWidth - 10, me.richHeight));
            item.nodes.panel_info.setBackGroundImage('img/public/bg_xinxi12.png',1);
            rt.setPosition(7,(item.nodes.panel_info.height - rt.trueHeight()) / 2);
            item.nodes.img_arrow_on.show();
            item.nodes.img_arrow_off.hide();
            item.nodes.txt_title.setString(data.title);  
        },
        hideContent: function (item,isUpdate) {
            var me = this;
            var idx = item.idx;
            var h = item.height;
            item.nodes.img_arrow_on.hide();
            item.nodes.img_arrow_off.show();
            item.nodes.panel_info.removeAllChildren();
            // item.nodes.btn_list.setPositionY(0);
            item.nodes.btn_list.setPosition(me.defBtnPos);
            item.nodes.panel_info.setPosition(me.defInfoPos);
            item.nodes.panel_info.setContentSize(item.nodes.btn_list.width,0);
            item.nodes.panel_info.removeBackGroundImage();
            item.setContentSize(item.nodes.btn_list.getContentSize());
            if (isUpdate) {
                me.updateListViewSize(-h, idx);
            }
        },
        updateListViewSize: function (h, startIdx) {
            var me = this;
            var listView = me.nodes.listview;
            var y = listView.getInnerContainer().y;
            var children = listView.getChildren();
            var allH = 0;
            for (var i = 0; i < children.length; i++){
                var child = children[i];
                allH += child.height;
            }
            var size = listView.getInnerContainerSize();
            if (allH < listView.getContentSize().height){
                listView.setInnerContainerSize(listView.getContentSize());
                //listView.getInnerContainer().setPositionY(0);
                var ah = 0;
                for (var i = 0; i < children.length; i++){
                    var child = children[i];
                    child.setPositionY(listView.getContentSize().height - ah);
                    ah += child.height;
                }

                me.ui.setTimeout(function () {
                    // listView.scrollToTop(0.1,true);
                },0,0,0.01);
            }else{
                size.height = allH;
                listView.setInnerContainerSize(size);
                y -= h;
                //listView.getInnerContainer().setPositionY(y > 0 ? 0 : y);
                var ah = 0;
                for (var i = startIdx; i > -1; i--){
                    var child = children[i];
                    child.setPositionY(child.y + h);
                }

                me.ui.setTimeout(function () {
                    if (y >= 0) {
                        // listView.scrollToBottom(0.1, true);
                    }else{
                        var minY = listView.getContentSize().height - listView.getInnerContainerSize().height;
                        var per = (y - minY)/-minY;
                        // listView.scrollToPercentVertical(per,0.1,true);
                    }
                },0,0,0.01);
            }
        },
    });
})();