(function(){
    //服务端公共错误处理
    G.event.on('puberror',function(d){
        if(d.s=='-102'){
            if(!G.class.loginfun.otherClientlogin){
                var scene = cc.director.getRunningScene();
                if(scene._reloginTimer){
                    scene.clearTimeout(scene._reloginTimer);
                    delete scene._reloginTimer;
                }
                scene._reloginTimer = scene.setTimeout(function(){
                    G.class.loginfun.reDoLogin();
                },2000);
            }
        }else if (d.s == '-100'){
            // if (d.attr == 'rmbmoney') {
            //     function send(title,content,btnTitle) {
            //         console.log('topFrames======',G.DATA.topFrames);
            //         G.frame.alert.data({
            //             title: title,
            //             ok: {wz: btnTitle},
            //             sizeType:3,
            //             okCall: function () {
            //                 X.tiaozhuan('chongzhi');
            //                 // hideSomeFrames();
            //             },
            //             close: true,
            //             closeCall: function () {
            //
            //             },
            //             richText:content
            //         }).show();
            //     }
            //
            //     function hideSomeFrames() {
            //         if (G.DATA.topFrames && G.DATA.topFrames.length > 0) {
            //             for (var i = 0; i < G.DATA.topFrames.length; i++) {
            //               var frame = G.DATA.topFrames[i];
            //               cc.sys.isObjectValid(G.frame[frame].ui) && G.frame[frame].hide();
            //             }
            //             delete G.DATA.topFrames;
            //         }
            //     }
            //
            //     //充值会引起vip的变化，需要关闭之前的界面
            //     // 一旦事件被触发，只会对某些界面执行一次操作
            //     G.frame.chongzhi.once('show',function () {
            //         hideSomeFrames();
            //     });
            //     var title,content,btnTitle;
            //     if (P.gud.payexp <= 0) {
            //         //title = X.STR(L('ATTR_BUGOU'),G.class.attricon.getById(d.attr).name);
            //         //content = L('ATTR_TIP_ZS');
            //         //btnTitle = L('GET_XIAOQIAN');
            //         //send(title,content,btnTitle);
            //         G.frame.shouchongdali.once('show', function () {
            //             G.frame.alert.hide();
            //         }).show();
            //     } else {
            //         G.frame.shouchong2.getData(function() {
            //             if (G.frame.shouchong2.DATA.isrec == 0 && G.frame.shouchong2.DATA.ispay == 1) {
            //                 //title = L('ATTR_GENGLIHAI');
            //                 //content = L('ATTR_TIP_ZS2');
            //                 //btnTitle = L('GET_WUQI');
            //                 //send(title,content,btnTitle);
            //                 G.frame.shouchong2.once('show', function () {
            //                     G.frame.alert.hide();
            //                 }).show();
            //             } else {
            //                 title = X.STR(L('ATTR_BUZU'),G.class.attricon.getById(d.attr).name);
            //                 content = L('ATTR_TIP_ZS3');
            //                 btnTitle = L('GET_LIBAO');
            //                 send(title,content,btnTitle);
            //             }
            //         },true);
            //     }
            //
            // }
            G.tip_NB.show(G.class.attricon.getById(d.attr).name + L('buzu'));
        }else if(d.s == '-104'){
            if(d.equip){
                G.tip_NB.show(L("ZBCLBZ"));
            }else{
                var itemConf = G.class.getItemByType(d.item || 1001,'item');
                G.tip_NB.show(itemConf.name + L('buzu'));
            }

        }
    });


    G.getError = function(e){
        var info=[];
        return;
        info.push("信息：" + e.message||'unkonw');
        if(e.lineNumber)info.push("行号：" + e.lineNumber||'unkonw');
        if(e.columnNumber)info.push("列号：" + e.columnNumber||'unkonw');
        if(e.name)info.push("详情：" + e.name||'unkonw');

        cc.log(info);
    };

    //JS逻辑错误处理
    //window.onerror = function(errorMessage, scriptURI, lineNumber,columnNumber,errorObj) {
    //    G.getError && G.getError({
    //        message:errorMessage,
    //        lineNumber:lineNumber,
    //        columnNumber:columnNumber,
    //        name:errorObj
    //    });
    //};

})();