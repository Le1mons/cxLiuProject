#!/usr/bin/python
# coding:utf-8
'''
英雄--评论
'''


if __name__ == "__main__":
    import sys
    sys.path.append("..")

import g

def proc(conn, data):
    """

    :param conn:
    :param data:  1为评论 2加心 4点赞
    :return:
    ::

        data = ['25075', 1, '哈哈哈哈哈哈哈哈']  data[0]:英雄id data[1]:点赞 data[2]:评论内容
        {'d': {'content'评论: '\xe5\x93\x88\xe5\x93\x88\xe5\x93\x88\xe5\x93\x88\xe5\x93\x88\xe5\x93\x88\xe5\x93\x88\xe5\x93\x88',
               'ctime'评论时间: 1563269647,
               'headdata'玩家头像数据: {'chatborder'聊天框: u'1',
                            'guildname'公会名称: u'',
                            'head'头像: u'41023',
                            'headborder'头像框: u'1',
                            'lasttime'最后在线时间: 1563269623,
                            'lv'等级: 60,
                            'model'模型: u'',
                            'name'玩家名称: u'\u6073\u5207\u4e39',
                            'uid'玩家唯一标识: u'0_5d2d985b0ae9fe3a6006791d',
                            'uuid'唯一表示: u'024221',
                            'vip'贵族等级: 0,
                            'wzyj'王者印记: 0},
               'id'评论id: 1563269647,
               'jiaxin'加心标识: 0,
               'svrname'区服名称: u'\u4e89\u9738\u6d4b\u8bd51'},
         's': 1}

         data = ['25075', 2]  data[0]:英雄id data[1]:加心
        {'s': 1}

        data = ['25075', 4, '1563269647']  data[0]:英雄id data[1]:点赞 data[2]:评论id
        {'s': 1}
    """
    _res = doproc(conn, data)
    conn.response(_res)
    conn.send()

@g.apiCheckLogin
def doproc(conn, data):
    _res = {'s': 1}
    uid = conn.uid
    _hid = data[0]
    # 1为评论 2为点赞 3为踩 4为加心
    _act = int(data[1])
    gud = g.getGud(uid)
    # 判断是否十星
    _con = g.GC['pre_hero']
    if _hid not in _con:
        _res['s'] = -10
        _res['errmsg'] = g.L('global_argserr')
        return _res

    _hid = _con[_hid]['pinglunid']
    # 修改缓存
    _key = 'hero_comment_' + str(_hid)
    _allheroInfo = g.crossMC.get(_key)
    if _act == 1:
        _comment = data[2]
        # 评论不能超过30个字
        if len(_comment) >= 80 and len(_comment) == 0:
            _res['s'] = -3
            _res['errmsg'] = g.L('hero_comment_-3')
            return _res

        # 名称含有非法字符
        if g.checkWord(_comment) != True:
            _res["s"] = -4
            _res["errmsg"] = g.L("user_rename_res_-4")
            return _res

        if not g.chkOpenCond(uid, 'comment'):
            _res['s'] = -2
            _res['errmsg'] = g.L('hero_comment_-2')
            return _res

        _data = g.getAttrByDate(uid, {'ctype': 'hero_comment'})
        # 一天只能评论一次
        if _data and _hid in _data[0]['v']:
            _res['s'] = -1
            _res['errmsg'] = g.L('hero_comment_-1')
            return _res

        if g.m.chatlogfun.isBlack(uid):
            _res["s"] = -6
            _res["errmsg"] = g.L("email_sendghemail_-2")
            return (_res)

        # 英雄评论
        g.m.chatlogfun.saveLog(gud, _comment, 5)

        _heroInfo = g.crossDB.find1('hero_comment', {'hid': _hid},fields=['_id'])
        _hidList = _data[0]['v'] if _data else []
        _hidList.append(_hid)
        g.setAttr(uid, {'ctype': 'hero_comment'}, {'v': _hidList})
        _commentList = _heroInfo.get('comment',[]) if _heroInfo else []
        _commentList.sort(key=lambda x:x.get('jiaxin', 0), reverse=True)

        # 夹心前五的评论
        _topComment = _commentList[:5]
        _commentList = sorted(_commentList[5:50], key=lambda x:x['ctime'], reverse=True)[:45]
        _data = {
            'headdata': g.m.userfun.getShowHead(uid),
            'svrname': g.m.crosscomfun.getSNameBySid(gud['sid']),
            'content': _comment,
            'ctime': g.C.NOW(),
            'id': g.C.NOW(),
            "jiaxin":0
        }
        _commentList.append(_data)
        g.crossDB.update('hero_comment',{'hid':_hid},{'$set':{'comment':_topComment+_commentList}},upsert=True)
        if _allheroInfo:
            _allheroInfo['comment'] = _topComment+_commentList

        _res['d'] = _data

    elif _act == 2:
        _data = g.getAttrOne(uid, {'ctype': 'hero_like'})
        _likeList = _data['v'] if _data else []
        # 不能重复点赞
        if _hid in _likeList:
            _res['s'] = -7
            _res['errmsg'] = g.L('hero_comment_-7')
            return _res
        _likeList.append(_hid)
        if _allheroInfo:
            _allheroInfo['like'] = _allheroInfo.get('like',0) + 1

        g.setAttr(uid, {'ctype': 'hero_like'},{'v':_likeList})
        g.crossDB.update('hero_comment', {'hid': _hid}, {'$inc': {'like': 1}},upsert=True)

    # elif _act == 3:
    #     _data = g.getAttrOne(uid, {'ctype': 'hero_like'})
    #     _unlikeList = _data['v'] if _data else []
    #     # 不能重复踩
    #     if _hid in _unlikeList:
    #         _res['s'] = -8
    #         _res['errmsg'] = g.L('hero_comment_-8')
    #         return _res
    #     _unlikeList.append(_hid)
    #     g.setAttr(uid, {'ctype': 'hero_like'}, {'v': _unlikeList})
    #     g.crossDB.update('hero_comment', {'hid': _hid}, {'$inc': {'unlike': 1}},upsert=True)

    elif _act == 4:
        _id = data[2]
        _data = g.getAttrOne(uid, {'ctype': 'comment_jiaxin'})
        _idDict = _data['v'] if _data else {}
        # 不能给同一条评论夹心
        if _idDict and _hid in _idDict and _id in _idDict[_hid]:
            _res['s'] = -9
            _res['errmsg'] = g.L('hero_comment_-9')
            return _res

        _heroInfo = g.crossDB.find1('hero_comment', {'hid': _hid})
        # 没有此条英雄评论信息
        if not _heroInfo or not _heroInfo.get('comment'):
            _res['s'] = -4
            _res['errmsg'] = g.L('hero_comment_-4')
            return _res

        g.setAttr(uid, {'ctype': 'comment_jiaxin'},{'$push':{g.C.STR('v.{1}',_hid): _id}})
        _commentList = _heroInfo.get('comment',[])

        _indicator = False
        for idx,i in enumerate(_commentList):
            if i['id'] == _id:
                _commentList[idx]['jiaxin'] = i.get('jiaxin', 0) + 1
                _indicator = True
                break

        if _indicator:
            # 修改缓存
            _commentList.sort(key=lambda x: x.get('jiaxin', 0), reverse=True)
            if _allheroInfo:
                _allheroInfo['comment'] = _commentList
            g.crossDB.update('hero_comment', {'hid': _hid}, {'comment': _commentList})

    # 更新缓存
    if _allheroInfo:
        g.crossMC.set(_key, _allheroInfo, 600)

    return _res


if __name__ == '__main__':
    uid = g.buid('xcy1')
    g.debugConn.uid = uid
    data = ['25075', 4, '1563269647']

    from pprint import pprint

    pprint(doproc(g.debugConn, data))
