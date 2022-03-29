(function () {

    G.event.on("sdkevent", function (obj) {

        cc.log('sdkEvent data: ================= ', obj);
        if(!P.gud) return;
        cc.log('binduid',P.gud.binduid);
        var data = {
            currentuserLv: P.gud.lv,
            currentVipLv: P.gud.vip,
            time: G.time,
            ghID: P.gud.ghid,
            currentdiamond: P.gud.rmbmoney,
            _game_role_id: P.gud.uid,
            _channel_name: G.CHANNEL,
            _channel_uid: P.gud.binduid.split('_')[1],
            _owner_name: G.owner,
            _device_id: G.nativeId,
            _manufacturer: G.nativeManufacturer,
            _model: G.nativeModel,
            _carrier: G.nativeCarrier,
            _network: G.nativeNetwork,
            _os_version: G.nativeOSVersion
        };
        var obj = cc.mixin(obj,data);

        if (G.isWaiWang) {
            if (obj.type == "user") {
                G.sdkEvent && G.sdkEvent.userSend(obj);
            } else {
                G.sdkEvent && G.sdkEvent.eventSend(obj);
            }
        }else {
            if (obj.type == "user") {
                G.sdkEvent && G.sdkEvent.userSend(obj);
            } else {
                G.sdkEvent && G.sdkEvent.eventSend(obj);
            }
        }

        // if ( G.owner && cc.sys.isNative) {
        //     if (obj.type == "user") {
        //         G.sdkEvent.userSend(obj);
        //     } else {
        //
        //         G.sdkEvent.eventSend(obj);
        //     }
        // }

        // if (G.owner == "zhengba" && G.OPENTIME < 1555257599 && cc.sys.isNative) {
        //     if (obj.type == "user") {
        //         G.sdkEvent.userSend(obj);
        //     } else {
        //         G.sdkEvent.eventSend(obj);
        //     }
        // }
    });

    G.event.on("pay_event", function (proid) {
        if(!proid)return;
        G.event.emit("sdkevent", {
            event: "rechargeGame",
            data: {
                payItem: proid,
                newVipLv: P.gud.vip,
                islishishouci: false,
                isdangrishouci: false,
                lv: P.gud.lv,
                mapid: P.gud.mapid,
                exp:P.gud.exp
            }
        });
    });
})();