#coding:utf-8
#!/usr/bin/python

'''
    双11——奖池邮件
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")
import g

def proc(arg,karg):
    print 'double11_prize start ...'
    _data = g.crossDB.find1('crossconfig', {'ctype':'double11_pool','send':{'$exists':0}},fields=['_id','v','rtime','k'])
    # 没有活动 或者已经发了
    if not _data:
        return

    if g.crossDB.count('crossconfig', {'ctype':'double11_sendemail','k':_data['k']}):
        return

    # 最后一天才发
    if g.C.getDateDiff(_data['rtime'], g.C.NOW()) != 0:
        return

    _send = {}
    _con = g.GC['double11']
    _email = _con['email']
    _insert = []
    for idx, i in enumerate(_con['prizepool']):
        if not _data['v'].get(str(idx)):
            continue

        _num = 0
        _list = []
        for uid,num in _data['v'][str(idx)].items():
            _num += num
            _list += [uid] * num

        # 不足以抽奖
        if _num < i['jindu']:
            for uid,num in _data['v'][str(idx)].items():
                _prize = [{'a': 'item', 't': _con['poolreturn'], 'n': int(g.C.CEIL(num/i['return']))}]
                kwargs={"ifpull":0,'title':_email['pool_fail']['title'],'content':_email['pool_fail']['content'].format(_con['prizepool'][idx]['name']),'uid':uid,'prize':_prize,'sid':uid.split('_')[0]}
                _temp = g.m.emailfun.fmtEmail(**kwargs)
                _insert.append(_temp)
        else:
            g.C.SHUFFLE(_list)
            _group = _num // i['jindu']
            _pool = []
            for x in xrange(_group):
                _pool.append(_list[:i['jindu']])
                del _list[:i['jindu']]
            else:
                _pool[-1].extend(_list)

            # 开始抽奖
            for x in _pool:
                uids = g.C.RANDLIST(x, num=len(i['prize']))
                for uidIdx, uid in enumerate(uids):
                    _head = g.crossDB.find1('cross_friend',{'uid':uid},fields=['_id','head.name','head.svrname']) or {'head':{}}
                    _send.setdefault(str(idx), []).append({'uid':uid,'name':_head['head'].get('name',''),'svrname':_head['head'].get('svrname',''),'idx':uidIdx})
                    _content = _email['pool_ok']['content'].format(i['prize'][uidIdx][0]['n'], i['itemname'][uidIdx])
                    kwargs={"ifpull":0,'title':_email['pool_ok']['title'],'content':_content,'uid':uid,'prize':i['prize'][uidIdx],'sid':uid.split('_')[0]}
                    _temp = g.m.emailfun.fmtEmail(**kwargs)
                    _insert.append(_temp)

    if _insert:
        g.crossDB.insert('crossemail', _insert)

    g.crossDB.update('crossconfig', {'ctype': 'double11_sendemail'}, {'v': 1, 'k': _data['k']}, upsert=True)
    g.crossDB.update('crossconfig', {'ctype': 'double11_pool', 'k': _data['k']}, {'send':_send})
    print 'double11_prize finished ...'

if __name__ == '__main__':
    proc(1,2)