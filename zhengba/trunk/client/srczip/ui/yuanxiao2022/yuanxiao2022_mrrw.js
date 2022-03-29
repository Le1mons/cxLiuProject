/**
 * Created by
 */

(function () {
    //每日任务
    var ID = 'yuanxiao2022_mrrw';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        onOpen: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onShow: function () {
            var me = this;
            me.setContents();
            me.nodes.txt_title.setString('每日任务');
        },
        setContents: function () {
            var me = this;
            var _task = G.gc.yuanxiao2022.task;
            var last = [];
            for (var i in _task){
                _task[i].taskid = i;
                last.push(_task[i]);
            }
            var lastdata = me.getData(last);
            me.nodes.scrollview.removeAllChildren();
            cc.enableScrollBar(me.nodes.scrollview,false);
            var table = me.table = new X.TableView(me.nodes.scrollview,me.nodes.list_mrrw,1, function (ui, data) {
                me.setItem(ui, data);
            },null,null,8,10);
            table.setData(lastdata);
            table.reloadDataWithScroll(true);
        },
        getData:function(arr){
          var me = this;
          var data = G.DATA.yuanxiao2022.myinfo.task;
          var arr1 = [];
          var arr2 = [];
          var arr3 = [];
          for (var i=0;i<arr.length;i++){
              var nval = data.data[arr[i].taskid]||0;
              if (X.inArray(data.rec,arr[i].taskid)){
                  arr3.push(arr[i].taskid);
              } else {
                  if (nval >= arr[i].pval){
                      arr1.push(arr[i].taskid);
                  }else {
                      arr2.push(arr[i].taskid);
                  }
              }
          }
          return arr1.concat(arr2.concat(arr3));
        },
        setItem:function (ui,taskid) {
            var me = this;
            X.autoInitUI(ui);
            var taskinfo = G.gc.yuanxiao2022.task[taskid];
            var taskdata = G.DATA.yuanxiao2022.myinfo.task;
            var nval = taskdata.data[taskid]||0;
            var color = nval>=taskinfo.pval?'#2f9801':'#531500';
            ui.nodes.txt_ms1.removeAllChildren();
            var rh1 = X.setRichText({
                parent:ui.nodes.txt_ms1,
                str:taskinfo.desc + X.STR(L('newyear_tip6'),color,nval,taskinfo.pval),
                anchor: {x: 0, y: 0.5},
                color:"#531500",
                size:20,
            });
            rh1.setPosition(0,ui.nodes.txt_ms1.height/2-rh1.trueHeight()/2+10);
            ui.nodes.panel_wp.removeAllChildren();
            X.alignItems(ui.nodes.panel_wp, taskinfo.prize, "left",{
                touch:true
            });
            G.removeNewIco(ui.nodes.btn1);
            if (X.inArray(taskdata.rec,taskid)){
                ui.nodes.btn1.setBright(false);
                ui.nodes.btn1.setTouchEnabled(false);
                ui.nodes.btn_txt1.setString('已领取');
                ui.nodes.btn_txt1.setTextColor(cc.color('#565656'));
            }else {
                if (nval >= taskinfo.pval){
                    //可领取
                    ui.nodes.btn1.state = 'klq';
                    ui.nodes.btn1.setBright(true);
                    ui.nodes.btn1.setTouchEnabled(true);
                    ui.nodes.btn_txt1.setString('领取');
                    G.setNewIcoImg(ui.nodes.btn1,0.8);
                }else {
                    //前往
                    ui.nodes.btn1.state = 'qw';
                    ui.nodes.btn1.setBright(true);
                    ui.nodes.btn1.setTouchEnabled(true);
                    ui.nodes.btn_txt1.setString('前往');
                }
            }
            ui.nodes.btn1.info = taskinfo;
            ui.nodes.btn1.taskid = taskid;
            ui.nodes.btn1.touch(function (sender,type) {
                if (type == ccui.Widget.TOUCH_NOMOVE){
                    if (sender.state == 'klq'){
                        G.DAO.yuanxiao2022.receive(sender.taskid,function (dd) {
                            G.frame.jiangli.data({
                                prize:dd.prize
                            }).show();
                            me.setContents();
                            G.frame.yuanxiao2022.showIteminfo();
                        });
                    }else {
                        if (sender.info.tiaozhuan){
                            X.tiaozhuan(sender.info.tiaozhuan);
                            me.remove();
                            G.frame.yuanxiao2022.remove();
                        }
                    }
                }
            })
        }
    });
    G.frame[ID] = new fun('yuanxiao_tk2.json', ID);
})();