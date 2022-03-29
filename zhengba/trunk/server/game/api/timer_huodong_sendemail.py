#coding:utf-8
#!/usr/bin/python

'''
    活动 - 发送兑换邮件提示
'''

if __name__ == "__main__":
    import sys
    sys.path.append("..")
import g

def proc(arg,karg):
    print 'huodong_sendemail start ...'
    _htypes = [7,57,62, 75]
    _hds = g.mdb.find('hdinfo',{'htype':{'$in':_htypes},'rtime': {'$gt': g.C.NOW() - 300,'$lt':g.C.NOW()+24*3600}, 'stime': {'$lt': g.C.NOW()}},fields=['_id','name', "etime"])
    if not _hds:
        return

    for i in _hds:
        _email = {
            "uid": "SYSTEM",
            "title": g.L('duihuan_title'),
            "content": g.L('duihuan_content', i['name'], g.C.DATE(i["etime"])),
            "etype": '1'
        }
        g.m.emailfun.sendEmail(**_email)
    print 'huodong_sendemail finished ...'

if __name__ == '__main__':
    proc(1,2)