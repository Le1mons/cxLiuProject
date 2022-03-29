(function () {
    var ID = 'slzt_sljc';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {
                action: true
            });
        },
        onOpen: function () {
            var me = this;
            me.bindBtn()
        },
        onShow: function () {
            var me = this;
            me.setContents()
        },
        setContents: function () {
            var me = this;
            cc.enableScrollBar(me.nodes.scrollview, false);
            var data =G.slzt.mydata.bufflist;
            var buffConf = G.class.slzt.getBuff()
            var buffArr = [];
            var obj = {};
            for(var k in data){
                var conf = buffConf[data[k]];
                if( obj[conf.parameter.stype]){
                    var key = X.keysOfObject(conf.parameter.buff)
                    obj[conf.parameter.stype].parameter.buff[key] += conf.parameter.buff[key];
                }else{

                    obj[conf.parameter.stype] = JSON.parse(JSON.stringify( conf));
                }
                // buffArr.push(obj);
            }
            for(var a  in obj){
                buffArr.push(obj[a])
            }
            if (buffArr.length < 1) {
                
                me.nodes.img_zwnr.show();
                return
            };
            me.table = new X.TableView(me.nodes.scrollview,me.nodes.list, 2, function (ui, data, pos) {
                me.setItem(ui, data, pos[0]);
            });
            me.table.setData(buffArr);
            me.table.reloadDataWithScroll(true);
        },
        setItem: function (ui,data) {
            var me = this;
             X.autoInitUI(ui);
            var buff = X.fmtBuff(data.parameter.buff);
            ui.nodes.txt_buff.setString(data.name);
            ui.nodes.txt_1.setString(data.parameter.intro);
            ui.nodes.txt_2.setString(buff[0].sz);
        },
        onAniShow: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function (sender) {
                me.remove()
            })
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('shilianzhita_tk8.json', ID);
})();