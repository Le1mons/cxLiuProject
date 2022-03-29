/**
 * Created by YanJun on 12/22/15.
 */
(function () {
    //帮助
    var ID ='guize';

    var fun = X.bUi.extend({
        ctor: function (json,id) {
            var me = this;
            me._super(json, id,{action:true});
            this.modalFrame = true;
        },
        onOpen: function () {
            var me = this;
            
            me.initUi();
            me.bindBtn();
        },
        onShow: function () {
            var me = this;

            X.render({
                top_title:L('UI_TITLE_' + ID),
                btn_gb: function (node) {
                    node.click(function (sender, type) {
                        me.remove();
                    });
                }
            },me.nodes);
            new X.bView('ui_tip_tishi4.json', function (view) {
                me._view = view;

                me.nodes.panel_nr.addChild(view);
                me.setContents();
            });

        },
        onRemove: function () {
            var me = this;
        },
        initUi: function () {
            var me = this;
        },
        bindBtn : function(){
            var me = this;

        },
        setContents: function () {
            var me = this;

            var view = me._view;
            X.render({
                listview: function (node) {
                    node.removeAllChildren();
                    cc.enableScrollBar(node);

                    var d = me.data();
                    if(typeof(d)=="string"){
                        var strArr = [L('GZ_' + d)];
                    }else{
                        var strArr = d.content;
                        me.nodes.top_title.setString(d.title);
                    }

                    for(var i=0;i<strArr.length;i++){
                        var rt = new X.bRichText({
                            size:24,
                            maxWidth:node.width,
                            lineHeight:40,
                            color: G.gc.COLOR.n5
                        });
                        rt.text(strArr[i]);
                        rt.setPosition(0,0);
                        var layout = new ccui.Layout();
                        layout.setContentSize(node.width,rt.trueHeight());
                        layout.addChild(rt);
                        node.pushBackCustomItem(layout);
                    }
                },
                panel_btn: function (node) {

                }
            },view.nodes);
        }
    });

    G.frame[ID] = new fun('ui_tip3.json', ID);
})();