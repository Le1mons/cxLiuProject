(function(){
    G.class.mapObject = ccui.Layout.extend({
        ctor : function(data){
            var me = this;
            this._super();
            this.data = data;
            this.map = data.map;

            this.width = data.width;
            this.height = data.height;
            this.setAnchorPoint(0.5,0.5);

            data._id && this.setName( data._id );

            this.grid = {gx: data.gx, gy: data.gy};
            var pos = me.map.gridToPosition(this.grid);
            this.setPosition( pos );

            if(this.map){
                this.map.obj[ data._id ] = this;

                // me.map.onEvent('GLOBALLOOP',function(dt){
                //     me.GLOBALLOOP(dt);
                // },me);
            }
        },
        getpos : function(){
            //当前坐标
            var me = this;
            var _pos = me.getPosition();
            return cc.p( parseInt(_pos.x,10) , parseInt(_pos.y,10) );
        },
        distance : function(toRole){
            //与toRole的距离
            if(typeof(toRole)=='string')toRole=this.map.get(toRole);
            return cc.pDistance( this.getpos() , toRole.getpos());
        },
        onExit : function(){

            if(!this.data.ignoreGraph && this.data.barrier=='1'){
                //还原该物体对地图的影响
                this.map.tileJson.Z[ this.data.gy*1 ][ this.data.gx*1 ] = 1;
                this.map.initGraph();
            }

            this._super();

            if(this.map){
                this.map.offEventByObj(this);

                var _id = this.data._id;
                delete this.map.obj[ _id ];
            }
        },
        //累加计数器，每次+dt，当达到needsumdt后返回true并重置计数器
        // getSumDelay: function(type,dt,needsumdt){
        //     this.data._sumDelay = this.data._sumDelay || {};
        //     if(this.data._sumDelay[type]==null)this.data._sumDelay[type]=0;
        //     this.data._sumDelay[type]+=dt;

        //     if(this.data._sumDelay[type] >= needsumdt){
        //         this.data._sumDelay[type] = 0;
        //         return true;
        //     }else{
        //         return false;
        //     }
        // },
        // 重置, 重新计算
        // resetSumDelay : function(type){
        //     this.data._sumDelay = this.data._sumDelay || {};
        //     delete this.data._sumDelay[type];
        // },
        // GLOBALLOOP : function(dt){
        //     //无论是否AI驱动，都会进入的循环
        // },
        //通过data.name显示名字
        // showName : function(){
        //     var me = this;
        //     if(!me.data.name)return;
        //     if(!cc.isNode(me.nameNode)){
        //         var _nameNode = me.nameNode = new ccui.Text();
        //         var offsetX = (me.data.offset && me.data.offset[0]) || 0;
        //         var offsetY = (me.data.offset && me.data.offset[1]) || 0;
        //         _nameNode.setName('objname');
        //         _nameNode.setFontName(G.defaultFNT);
        //         _nameNode.setFontSize(18);
        //         _nameNode.setContentSize(cc.size(40, 100));
        //         _nameNode.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
        //         _nameNode.zIndex = 11;
        //         _nameNode.y = me.height+37 + offsetY;
        //         _nameNode.x = me.width/2 + offsetX;
        //         X.enableOutline(_nameNode,cc.color('#000000'),1);
        //         me.addChild( me.nameNode );
        //     }
        //     me.nameNode.setString( me.data.name+"" );
        // },
    });
})();
