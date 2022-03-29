(function () {
    var ID = 'shengdanjie_ts2';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },

        initUi: function () {
            var me = this;

        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            })
            me.nodes.btn_lan.click(function (sender) {
                var jfd = G.gc.christmas.jifeidian;
                G.event.once('paysuccess', function(arg) {
                    try {
                        var day = G.frame.shengdanjie.DATA.hdinfo.day;
                        var task = G.gc.christmas.task;
                        var myinfo = G.frame.shengdanjie.DATA.myinfo;
                        var prize = [];
                        for(var i in task){
                            if(task[i].spprize && task[i].day <= day && task[i].pval <= myinfo.task.data[i]){
                                for(var j = 0 ; j < task[i].spprize.length; j++){
                                    prize.push(task[i].spprize[j]);
                                }
                            }
                        }
                        if(prize.length > 0){
                            G.frame.jiangli.data({
                                prize: prize
                            }).show();
                        }
                        me.data().callback && me.data().callback();
                        me.remove();
                    } catch (e) {}
                });
                G.event.emit('doSDKPay', {
                    pid: jfd.proid,
                    logicProid: jfd.proid,
                    money: jfd.unitPrice,
                });
            });
        },
        onOpen: function () {
            var me = this;

        },

        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.bindBtn();
            me.setContents();
        },
        setContents:function () {
            var me = this;
            me.nodes.txt_ms.setFontSize(21);
            me.nodes.txt_ms.setString(L("shengdanjie_txt9"));
            me.nodes.txet_lan.setString(L("shengdanjie_txt13"));
        }
    });
    G.frame[ID] = new fun('sdhd_tk2.json', ID);
})();