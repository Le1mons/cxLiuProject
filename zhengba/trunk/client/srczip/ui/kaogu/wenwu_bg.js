/**
 * Created by 嘿哈 on 2020/4/7.
 */
(function () {
//考古-效果总览
    var ID = 'wenwu_bg';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        initUi:function(){
            var me = this;
        },
        bindBtn:function(){
            var me = this;
            cc.enableScrollBar(me.nodes.listview);
            me.nodes.listview.removeAllChildren();
            me.nodes.mask.click(function(){
                me.remove();
            });
            me.nodes.btn_qd.click(function(){
                me.remove();
            })
        },
        onOpen:function(){
            var me = this;
            me.bindBtn();
            me.type = me.data();
        },
        onShow:function(){
            var me = this;
            me.setContents();
        },
        setContents:function(){
            var me = this;
            //属性
            var data = G.gc.yjkg.exhibition[me.type];
            for(var k in data.buff){
                var type = L(k);
                if(k.indexOf("pro") == -1){
                    var value = data.buff[k];
                }else {
                    var value = data.buff[k] / 10 + "%";
                }
            }
            me.nodes.txt_sx.setString(X.STR(L("KAOGU28"),type,value));
            //故事
            var rh = new X.bRichText({
                size: 20,
                lineHeight: 32,
                maxWidth:me.nodes.listview.width,
                family: G.defaultFNT,
                color: "#93490E",
            });
            rh.text(data.story);
            rh.setAnchorPoint(0, 0.5);
            rh.setPosition(0, me.nodes.listview.width / 2);
            me.nodes.listview.pushBackCustomItem(rh);

            var layout = new ccui.Layout();
            layout.setContentSize(cc.size(me.nodes.listview.width, 10));
            me.nodes.listview.pushBackCustomItem(layout);
        }
    });

    G.frame[ID] = new fun('kaogu_wwbj.json', ID);
})();