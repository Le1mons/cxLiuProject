/**
 * Created by liusimin on 2018-07-6
 */
(function () {
    //公告
    var ID = 'gonggao';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },

        getData : function (callback) {
            var me = this;

            if(!G.gonggaoUrl || G.gonggaoUrl=="")return;
            var url = G.gonggaoUrl+"&channel="+ (G.CHANNEL||"") +"&owner="+ (G.owner||"") +"&gamename="+ (G.gameName||"") + "&channelid="+ (G.channelId||"");
            X.ajax.get(url,{},function(txt) {
                var d = X.toJSON(txt);
                me.DATA = d;
                callback && callback(d);
            });

            // if (me.DATA) {
            //     callback && callback.call(me);
            //     return;
            // }
            // G.ajax.send('gonggao_getlist',null,function(data){
            //     data = X.toJSON(data);
            //     if (data.s == 1) {
            //         me.DATA = data.d;
            //         // me.DATA =  [{title:'测试',stype:'1',content:'暂无公告暂无公告暂无公告暂无公告暂无公告暂无公告暂无公告暂无公告暂无公告暂无公告暂无公告暂无公告'},{title:'测试',stype:'1',content:'暂无公告'},{title:'测试',stype:'1',content:'暂无公告'},{title:'测试',stype:'1',content:'暂无公告'}];
            //         callback && callback.call(me);
            //     }
            // },true);
        },

        setContents: function () {
            var me = this;
            var listview = me.nodes.listview;
            me.btns = [];
            var list = me.nodes.list;
            me.posy = 0;
            if(me.DATA.length < 1) {
                if(cc.isNode(me.ui.finds("zwnr"))) {
                    me.ui.finds("zwnr").show();
                }
                return;
            }else{
                if(cc.isNode(me.ui.finds("zwnr"))) {
                    me.ui.finds("zwnr").hide();
                }
            }
            for(var i in me.DATA){
                var item = list.clone();
                item.idx = i;
                me.setItem(item);
                listview.pushBackCustomItem(item);
                item.show();
            }
            me.btns[0].triggerTouch(ccui.Widget.TOUCH_NOMOVE);
        },


        // setItem: function (item) {
        //     var me = this;
        //     X.autoInitUI(item);
        //     me.setItemContent(item);
        //     item.isExt = true;
        //     me.defBtnPos = item.nodes.btn_list.getPosition();
        //     me.defInfoPos = item.nodes.panel_info.getPosition();
        //     item.setContentSize(item.width,item.height + me.richHeight);
        //     item.nodes.btn_list.setPositionY(item.height);
        //     item.nodes.panel_info.setPositionY(item.height - item.nodes.btn_list.height + 10);
        //     item.nodes.btn_list.setTouchEnabled(true);
        //     item.nodes.btn_list.setSwallowTouches(false);
        //     item.nodes.btn_list.touch(function (sender, type) {
        //         if (type == ccui.Widget.TOUCH_NOMOVE){
        //             var item = this;
        //             item.isExt = !item.isExt;
        //             if (item.isExt) {
        //                 me.showContent(item);
        //             }else{
        //                 me.hideContent(item,true);
        //             }
        //         }
        //     },item);
        // },
        setItem: function (item) {
            var me = this;
            X.autoInitUI(item);
            // me.setItemContent(item);
            var idx = item.idx;
            var data = me.DATA[idx];
            me.defBtnPos = item.nodes.btn_list.getPosition();
            me.defInfoPos = item.nodes.panel_info.getPosition();
            item.nodes.txt_title.setString(data.title);
            X.enableOutline(item.nodes.txt_title,'#7b531a',2);
            item.nodes.btn_list.setPositionY(item.height);
            item.nodes.btn_list.setTouchEnabled(true);
            item.nodes.btn_list.setSwallowTouches(false);
            item.isExt = false;
            item.nodes.img_arrow_off.show();
            me.btns.push(item.nodes.btn_list);
            item.nodes.btn_list.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE){
                    var item = sender.parent;
                    for (var i = me.btns.length - 1; i >= 0; i--) {
                        if(me.btns[i].parent.isExt && me.btns[i].parent != item){
                            me.btns[i].parent.isExt = !me.btns[i].parent.isExt;
                            if (me.btns[i].parent.isExt) {
                                me.showContent(me.btns[i].parent);
                            }else{
                                me.hideContent(me.btns[i].parent,true);
                            }
                            // me.hideContent(me.btns[i].parent,true);
                            // return;
                        }
                    }
                    item.isExt = !item.isExt;
                    if (item.isExt) {
                        me.showContent(item);
                    }else{
                        me.hideContent(item,true);
                    }
                }
            });
        },
        showContent: function (item) {
            var me = this;
            var idx = item.idx;
            X.autoInitUI(item);
            me.setItemContent(item);
            // item.nodes.btn_list.setPositionY(me.richHeight - 68 - 12);
            item.setContentSize(item.width,item.height + me.richHeight);
            item.nodes.btn_list.setPositionY(item.height);
            item.nodes.panel_info.setPositionY(item.height - item.nodes.btn_list.height + 10);
            me.updateListViewSize(me.richHeight,idx);
        },
        setItemContent:function(item){
            var me = this;
            var idx = item.idx;
            var data = me.DATA[idx];
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
            rt.setPosition(14,me.richHeight * 0.6);
            item.nodes.panel_info.removeAllChildren();
            item.nodes.panel_info.addChild(rt);
            item.nodes.panel_info.setContentSize(cc.size(me.defWidth - 10, me.richHeight));
            item.nodes.panel_info.setBackGroundImage('img/public/bg_xinxi12.png',1);
            rt.setPosition(7,(item.nodes.panel_info.height - rt.trueHeight()) / 2);
            item.nodes.img_arrow_on.show();
            item.nodes.img_arrow_off.hide();
            item.nodes.txt_title.setString(data.title);
            item.nodes.txt_title.setFontName(G.defaultFNT);
            X.enableOutline(item.nodes.txt_title,'#7b531a',2);
        },
        hideContent: function (item,isUpdate) {
            var me = this;
            var idx = item.idx;
            var h = item.height;
            item.nodes.img_arrow_on.hide();
            item.nodes.img_arrow_off.show();
            item.nodes.panel_info.removeAllChildren();
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

        bindUI: function () {
            var me = this;

        },
        
        bindBtn: function () {
            var me = this;
            me.nodes.btn_gonggao_qr.click(function () {
                me.data().okCall();
            });
        },

        onOpen: function () {
            var me = this;
            cc.enableScrollBar(me.nodes.listview);
            me.bindBtn();
        },

        onAniShow:function() {
            var me = this;
        },

        show : function(conf){
            var me = this;
            var _super = this._super;
            this.getData(function () {
                _super.apply(me,arguments);
            });
        },

        onShow: function () {
            var me = this;
            me.setContents();
            cc.isNode(G.frame.login.zhezhao) && G.frame.login.zhezhao.removeFromParent();
        },

        checkShow: function (callback) {
            var me = this;
            if(G.__quanfugonggaoShowed){
                return;
            }
            me.getData(function () {
                if (G.frame.login.isShow && me.DATA.length>0) {
                    G.__quanfugonggaoShowed = true;
                    me.show();
                }
                else{
                    callback && callback();
                }
            });
        },
        onRemove: function () {
            var me = this;
        }
    });

    G.frame[ID] = new fun('gonggao.json', ID);
})();