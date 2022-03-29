(function(){
var CustomTableViewCell = cc.TableViewCell.extend({
    draw: function(ctx) {
        this._super(ctx);
    }
});

//var CustomTableViewCell = ccui.Widget.extend({
//    _idx:0,
//
//    getIdx:function () {
//        return this._idx;
//    },
//    setIdx:function (idx) {
//        this._idx = idx;
//    },
//    reset:function () {
//        this._idx = cc.INVALID_INDEX;
//    },
//    setObjectID:function (idx) {
//        this._idx = idx;
//    },
//    getObjectID:function () {
//        return this._idx;
//    },
//    draw: function(ctx) {
//        this._super(ctx);
//    }
//});

    cc.myTableViewDelegate = cc.Class.extend({

        /**
         * 数据模板
         * @returns {*}
         */
        cellDataTemplate: function () {
            return new ccui.Layout();
        },
        /**
         * 数据初始化
         * @param ui
         * @param data
         * @param pos [row,col]
         */
        cellDataInit: function (ui,data,pos) {

        },
        /**
         * 分组title模板
         * @returns {*}
         */
        cellGroupTemplate: function () {
            return new ccui.Layout();
        },
        /**
         * title初始化
         * @param ui
         * @param type
         */
        cellGroupInit: function (ui, type) {

        }
    });

    /*cc.TableView.prototype._onTouchEnded = cc.TableView.prototype.onTouchEnded;
    cc.TableView.prototype.onTouchEnded = function (touch,event) {
        this._onTouchEnded(touch,event);
        var delegate = this.getDelegate();
        if (delegate && delegate.triggerTouch){
            delegate.triggerTouch(touch,event);
        }
    };*/
cc.myTableView = cc.Class.extend({
    ctor : function(config){
        //this._super();
        this._config = config;
        this._cellSize={};
    },
    setDelegate: function(d){
        this._delegate = d;
    },
    
    bindScrollView : function(scrollView){
        var me = this;
        //me.setContentSize(scrollView.getContentSize());
        
        me.tableSize = scrollView.getContentSize();
        me.tableView = new cc.TableView(this,me.tableSize);
        me.tableView.setDirection(scrollView.getDirection());
        me.tableView.width = scrollView.width;
        me.tableView.height = scrollView.height;
        me.tableView.x = me.tableView.y = 0;
        me.tableView.setAnchorPoint(C.ANCHOR[7]);
        me.tableView.setDelegate(this);
        me.tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);

        me.direction = scrollView.getDirection();
        
        scrollView.innerWidth = scrollView.width;
        scrollView.innerHeight = scrollView.height;

        scrollView.setTouchEnabled(false);
        scrollView.addChild(me.tableView);

        return this;
    },
    showIndex : function(callback){
        this._showIndexCall = callback;
        return this;
    },
    
    data : function(d){
        var me = this;
        if (d) {
            me._data = d;
            if (me._titleui){
                for(var i in me._titleui){
                    me._titleui[i].removeFromParent();
                }
                delete me._titleui;
            }
            return this;
        }else{
            return me._data;
        }
    },

    numberOfCellsInTableView:function(table) {
        //总行数
        var me = this;
        var rowNum = 0;
        if (me._config.group){
            for(var i in me._config.group){
                var type = me._config.group[i];
                var data = me._data[type];
                if (data){
                    rowNum += Math.ceil(data.length/me._config.rownum);
                }
            }
        }else {
            rowNum = Math.ceil((me._data.length || 1) / me._config.rownum);
        }
        return rowNum;
    },



    tableCellAtIndex:function (table, idx) {
        var me = this;
        var strValue = idx.toFixed(0);
        var cell = table.dequeueCell();
        var cellHeight = me.tableCellSizeForIndex(table,idx).height;
        if (me._config.group && me.groupAtIndex(idx)[1] == 0){
            cellHeight -= me._config.groupTitleHeight;
        }
        if (!cell) {
            cell = new CustomTableViewCell();
            cell.setAnchorPoint(C.ANCHOR[1]);
            
            for(var i=0;i<me._config.rownum;i++){
                var node = this._delegate.cellDataTemplate();
                node.idx = idx*me._config.rownum + i;
                this._delegate.cellDataInit(node,this.dataAtIndex(idx,i),[idx,i]);

                node.setAnchorPoint(C.ANCHOR[1]);
                node.y = cellHeight;

                if(idx==0 && this._config.paddingTop){
                    node.y -= this._config.paddingTop;
                }

                if (me._config.rownum > 1) {
                    var sw = (me.tableSize.width - node.width - 1) / (me._config.rownum - 1);
                    node.x = i * sw;
                }else{
                    node.x = 0;
                }
                
                cell.addChild(node);
                if(node.needRelease)node.release();
            }
        }else{
            var children = cell.getChildren();
            for(var i=0;i<me._config.rownum;i++){
                var node = children[i];
                node.y = cellHeight;

                if(idx==0 && this._config.paddingTop){
                    node.y -= this._config.paddingTop;
                }

                node.idx = idx*me._config.rownum + i;
                if (node) {
                    this._delegate.cellDataInit(node,this.dataAtIndex(idx,i),[idx,i]);
                }
            }
        }
        if (this._config.group) {
            this._titleui = this._titleui || {};
            var group = this.groupAtIndex(idx);
            if (group[1] == 0) {
                var pos = cc.p(0, 0);
                if (idx == 0) {
                    pos.y = table.getContainer().getContentSize().height;
                } else {
                    var lastcell = table.cellAtIndex(idx - 1);
                    if (lastcell) {
                        //pos.y = lastcell.getPositionY();
                        pos.y = table.getContainer().getContentSize().height - (X.arrayFind(this._config.group,group[0]) * this._config.groupTitleHeight + idx * me._config.lineheight);
                    } else {
                        lastcell = table.cellAtIndex(idx + 1);
                        if (lastcell) {
                            pos.y = lastcell.getPositionY() + me._config.lineheight * 2 + me._config.groupTitleHeight;
                        }
                    }
                }
                if (!this._titleui[group[0]]) {
                    var titleui = this._delegate.cellGroupTemplate();
                    titleui.setAnchorPoint(0, 1);
                    this._delegate.cellGroupInit(titleui, group[0]);
                    table.getContainer().addChild(titleui);
                    this._titleui[group[0]] = titleui;
                }
                this._titleui[group[0]].setPosition(pos);
            }
        }
        return cell;
    },
    sizeIndex : function(){
        return this;
    },

    setCellSize : function(idx,size){
        var me = this;
        //设置指定cell的自定义size,size = {w:11,h:22}  w和h均可选
        me._cellSize[ idx ] = size;
    },
    delCellSize : function(idx){
        var me = this;
        delete me._cellSize[ idx ];
    },

    tableCellSizeForIndex:function (table, idx) {
        var me = this;
        var specSize = me._cellSize[idx]||{};

        if( me.direction == cc.SCROLLVIEW_DIRECTION_HORIZONTAL){
            var size = me._cellSize[ -1 ];//横放时特殊处理
        }else{
            var size = cc.size(specSize.w || specSize.width ||this.tableSize.width, specSize.h || specSize.height || me._config.lineheight);
            if (me._config.group && me.groupAtIndex(idx)[1] == 0){
                size.height += me._config.groupTitleHeight;
            }
        }

        // var size = cc.size(specSize.w || specSize.width ||this.tableSize.width, specSize.h || specSize.height || me._config.lineheight);
        // if (me._config.group && me.groupAtIndex(idx)[1] == 0){
        //     size.height += me._config.groupTitleHeight;
        // }

        if(idx==0 && this._config.paddingTop){
            size.height += this._config.paddingTop;
        }
        return size;
    },
    /**
     *
     * @param idx
     * @returns {*}[grouptype,新组第n行]
     */
    groupAtIndex: function (idx) {
        var me = this;
        var row = 0;
        for(var i in me._config.group){
            var type = me._config.group[i];
            var data = me._data[type];
            if (data && data.length > 0){
                if (idx == row) return [type,0];

                var a = Math.ceil(data.length/me._config.rownum);
                if (idx < row + a) return [type,idx - row];

                row += a;
            }else{
                if (this._titleui && this._titleui[type]){
                    this._titleui[type].removeFromParent();
                    delete this._titleui[type];
                }
            }
        }
    },
    dataAtIndex: function (row, col) {
        var me = this;
        if (me._config.group) {
            var group = me.groupAtIndex(row);
            return me._data[group[0]][me._config.rownum * group[1] + col];
        }else{
            return me._data[me._config.rownum * row + col];
        }
    },
    getItemByName: function (name) {
        var list = this.tableView.getChildren()[0].getChildren();
        for (var i in list){
            var children = list[i].getChildren();
            for (var j in children){
                var ui = children[j];
                if (ui != null){
                    if (ui.getName() == name){
                        return [ui,[i,j]];
                    }
                }
            }
        }
        return null;
    },
    cellDataUpdate: function (name,data) {
        var list = this.tableView.getChildren()[0].getChildren();
        for (var i in list){
            var children = list[i].getChildren();
            for (var j in children){
                var ui = children[j];
                if (ui != null){
                    if (ui.getName() == name){
                        this._delegate.cellDataInit(ui,data,[i,j]);
                        break;
                    }
                }
            }
        }
        var item = this.getItemByName(name);
        if (item) {
            this._delegate.cellDataInit(item[0], data, item[1]);
        }
    },
    reloadDataWithScroll: function (isScroll) {
        var offset = isScroll ? null : this.tableView.getContentOffset();
        this.tableView.reloadData();

        if (!isScroll){
            if( this.direction == cc.SCROLLVIEW_DIRECTION_HORIZONTAL){
                //横向滚动特殊处理
                this.tableView.setContentOffset(offset);
                /*
                 var minOffsetX = this.tableSize.width - this.tableView.getContentSize().width;
                 if (minOffsetX < 0 && minOffsetX <= offset.x) {
                 this.tableView.setContentOffset(offset);
                 }
                 */
            }else{
                var minOffsetY = this.tableSize.height - this.tableView.getContentSize().height;
                if (minOffsetY < 0 && minOffsetY <= offset.y) {
                    this.tableView.setContentOffset(offset);
                }
            }
        }
    },
    reloadDataWithScrollToBottomRight: function () {
        this.tableView.reloadData();
        if( this.direction == cc.SCROLLVIEW_DIRECTION_HORIZONTAL){
            //横向滚动特殊处理
            var minOffsetX = this.tableSize.width - this.tableView.getContentSize().width;
            if (minOffsetX < 0) {
                this.tableView.setContentOffset(cc.p(minOffsetX, 0));
            }
        }else{
            var minOffsetY = this.tableSize.height - this.tableView.getContentSize().height;
            if (minOffsetY < 0){
                this.tableView.setContentOffset(cc.p(0,0));
            }
        }
    },
    scrollToCell: function (cellIndex) {
        if( this.direction == cc.SCROLLVIEW_DIRECTION_HORIZONTAL){
            //横向滚动特殊处理
            var minOffsetX = this.tableSize.width - this.tableView.getContentSize().width;
            if (minOffsetX < 0) {
                var x = 0;
                for (var i = 1; i <= cellIndex; i++){
                    x += this._cellSize[i-1] ? this._cellSize[i-1].width : this._cellSize[-1].width;
                }
                if (-x < minOffsetX){
                    this.tableView.setContentOffset(cc.p(minOffsetX, 0));
                }else {
                    this.tableView.setContentOffset(cc.p(-x, 0));
                }
            }
        }else{
            var minOffsetY = this.tableSize.height - this.tableView.getContentSize().height;
            if (minOffsetY < 0){
                var y = 0;
                for (var i = 1; i <= cellIndex; i++){
                    y += (this._cellSize[i-1] ? this._cellSize[i-1].height : this._config.lineheight) + (this._config.offsetY || 0);
                }

                if (minOffsetY > 0) {
                    this.tableView.setContentOffset(cc.p(0, minOffsetY));
                } else {
                    if (y + minOffsetY >= 0) {
                        this.tableView.setContentOffset(cc.p(0, 0));
                    } else {
                        this.tableView.setContentOffset(cc.p(0, y + minOffsetY));
                    }
                }

                // for (var i = 1; i <= cellIndex; i++){
                //     y += (this._cellSize[i-1] ? this._cellSize[i-1].height : this._config.lineheight) + (this._config.offsetY || 0);
                // }
                // y -= this.tableSize.height;
                // if (y > 0) {
                //     if (y + minOffsetY >= 0) {
                //         this.tableView.setContentOffset(cc.p(0, 0));
                //     } else {
                //         this.tableView.setContentOffset(cc.p(0, y + minOffsetY));
                //     }
                // }else{
                //     this.tableView.setContentOffset(cc.p(0, minOffsetY));
                // }
            }
        }
    },
    reloadDataWithScrollToCellAtIndex: function (idx) {
        var me = this;
        me.tableView.reloadData();
        me.tableView.setTimeout(function () {
            me.scrollToCell(idx);
        },10);
    }
});

})();