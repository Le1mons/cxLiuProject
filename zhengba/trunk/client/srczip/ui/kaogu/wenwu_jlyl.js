/**
 * Created by 嘿哈 on 2020/4/7.
 */
(function () {
//考古-效果总览
    var ID = 'wenwu_jlyl';

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
            //奖励
            X.alignItems(me.nodes.panel_wp,data.prize,"left",{
                touch:true
            })
        }
    });

    G.frame[ID] = new fun('kaogu_jlyl.json', ID);
})();