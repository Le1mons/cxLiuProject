#!/usr/bin/python
#coding:utf-8

import sys
if __name__ == "__main__":
    sys.path.append("..")

import g
import urllib
import urllib2
import json
import hashlib



class MaoErApi(object):
    """
    聊天第三方接口
    猫耳
    游戏ID： 923
    充值Key： 210e148868047504b922fc334c511fb1
    礼包Key： 210e148868047504b922fc334c511fb1
    Mr_PLATFORM： _mrgame
    Mr_ADID： _5442
    Mr_GAME_ID： _923
    GAME_CODE： blzh
    SERCRET： c345a165b566d1c421afd8a748373d7f

    owner里包含：maoerbl
    这个的区，执行以上判断
    """

    def __init__(self):
        self.sercret = 'c345a165b566d1c421afd8a748373d7f'
        self.game_code = '923'
        self.sid = str(g.getSvrIndex())
        self.sname = 's' + self.sid
        # 超时时间
        self.timeout = 10

    def apiChat(self, data):
        """
        聊天接口

        :param data:
        :return:
        """
        self.url = 'https://api.maoergame.com/game/chat/response'
        # self.url = 'https://google.com'
        nt = g.C.NOW()
        formateData = {
            'game_code': self.game_code,              # 游戏简称，由猫耳提供
            'server_id': self.sid,                # 服务器id
            'server_name': self.sname,             # 服务器名
            'chat_type': 1,                 # 聊天类型 1文本 2语音 3其他
            'chat_channel': '5',            # 聊天频道，0世界 2公会 3个人 4组队 5其他，如果为私聊的话 需要发送相关接受者的信息
            'chat_content': '',            # 聊天内容 如果为语音，建议翻译成中文保存
            'sender_uid': '',              # 发送者登陆游戏使用的账号
            'sender_rid': '',               # 发送者角色id
            'sender_name': '',              # 发送者角色名
            'sender_level': '0',            # 发送者角色等级
            'sender_vip_level': 0,          # 发送者角色VIP等级
            'receiver_uid': '',            # 接受者玩家登陆游戏使用的账号
            'receiver_rid': '',            # 接受者角色id
            'receiver_name': '',           # 接受者角色名
            'receiver_level': '',          # 接受者角色等级
            'receiver_vip_level': 0,        # 接受者角色VIP等级
            'timestamp': nt,                 # 时间戳，聊天时间
            'key': '',                       # 通过秘钥加密后的数据md5(sercret+timestamp)
        }
        formateData.update(data)

        m2 = hashlib.md5()
        m2.update(self.sercret + str(formateData['timestamp']))
        mysign = m2.hexdigest()
        formateData['key'] = mysign

        urlData = urllib.urlencode(formateData)

        # request = urllib2.Request(url, data=data, headers=headers)
        request = urllib2.Request(self.url, data=urlData)
        try:
            response = urllib2.urlopen(request, timeout=self.timeout)
            res = response.read()
            # {"result": "success", "code": 0, "content": "1"}
            jRes = json.loads(res)

            return jRes
        except Exception, e:
            print '猫耳api超时了',e,
            res = {
                "result": "success",
                "code": 0,
                "content": formateData['chat_content'],
                "error": "urlopen error timed out"}
            return res


    def apiMail(self,data):
        """
        邮件接口

        :param data:
        :return:
        """
        self.url = 'https://api.maoergame.com/game/mail/response'
        # self.url = 'https://google.com'
        nt = g.C.NOW()
        formateData = {
            'game_code': self.game_code,             # 游戏简称，由猫耳提供
            'server_id': self.sid,          # 服务器id
            'server_name': self.sname,      # 服务器名
            'mail_type': 1,                 # 邮件类型 1个人2公会
            'mail_title': '',                # 邮件标题
            'mail_content': '',            # 邮件内容
            'mail_envelope': '',            # 邮件附件，如果有，则发对应的附件名，用逗号(,)隔开
            'sender_uid': '',              # 发送者登陆游戏使用的账号
            'sender_rid': '',               # 发送者角色id
            'sender_name': '',              # 发送者角色名
            'sender_level': '0',            # 发送者角色等级
            'receiver_uid': '',            # 接受者玩家登陆游戏使用的账号
            'receiver_rid': '',            # 接受者角色id
            'receiver_name': '',           # 接受者角色名
            'receiver_level': '',          # 接受者角色等级
            'timestamp': nt,                 # 时间戳，聊天时间
            'key': '',                       # 通过秘钥加密后的数据md5(sercret+timestamp)
        }
        formateData.update(data)

        m2 = hashlib.md5()
        m2.update(self.sercret + str(formateData['timestamp']))
        mysign = m2.hexdigest()
        formateData['key'] = mysign

        urlData = urllib.urlencode(formateData)

        # request = urllib2.Request(url, data=data, headers=headers)
        request = urllib2.Request(self.url, data=urlData)
        try:
            response = urllib2.urlopen(request, timeout=self.timeout)
            res = response.read()
            jRes = json.loads(res)
            return jRes

        except urllib2.URLError, e:
            print '猫耳api超时了',e,
            res = {
                "result": "success",
                "code": 0,
                "mail_title": formateData['mail_title'],
                "mail_content": formateData['mail_content'],
                "error": "urlopen error timed out"
            }
            return res



    def apiSociaty(self,data):
        """
        公会接口 只有在公会进行编辑公告/修改公会名时，才发送该接口

        :param data:
        :return:
        """
        self.url = 'https://api.maoergame.com/game/sociaty/response'
        # self.url = 'https://google.com'
        nt = g.C.NOW()
        formateData = {
            'game_code': self.game_code,             # 游戏简称，由猫耳提供
            'server_id': self.sid,          # 服务器id
            'server_name': self.sname,      # 服务器名
            'op_type': 2,                    # 操作类型，1公告编辑 2修改公会名
            # 'name': '',                     # 公会名
            # 'notice': '',                    # 公告
            'leader_uid': '',               # 公会长账号
            'leader_rid': '',               # 公会长角色Id
            'leader_name': '',              # 公会长名称
            'vice_leader_uid': '',              # 副会长账号
            'vice_leader_rid': '',               # 副会长角色Id
            'vice_leader_name': '',              # 副会长名称
            'edit_uid': '',                  # 编辑者账号
            'edit_rid': '',                  # 编辑者角色id
            'edit_name': '',                 # 编辑者角色名
            'timestamp': nt,                 # 时间戳，聊天时间
            'key': '',                       # 通过秘钥加密后的数据md5(sercret+timestamp)
        }
        formateData.update(data)

        m2 = hashlib.md5()
        m2.update(self.sercret + str(formateData['timestamp']))
        mysign = m2.hexdigest()
        formateData['key'] = mysign

        urlData = urllib.urlencode(formateData)

        # request = urllib2.Request(url, data=data, headers=headers)
        request = urllib2.Request(self.url, data=urlData)
        try:
            response = urllib2.urlopen(request, timeout=self.timeout)
            res = response.read()
            jRes = json.loads(res)
            return jRes
        except Exception, e:
            print '猫耳api超时了',e,
            res = {
                "result": "success",
                "code": 0,
                "content": data['name'] if formateData.get('name','') else formateData.get('notice',''),
                "error": "urlopen error timed out"
            }
            return res


    def apiRole(self,data):
        """
        角色名接口 玩家创建角色或者修改名字时发送

        :param data:
        :return:
        """
        self.url = 'https://api.maoergame.com/game/role/response'
        # self.url = 'https://google.com'
        nt = g.C.NOW()
        formateData = {
            'game_code': self.game_code,             # 游戏简称，由猫耳提供
            'server_id': self.sid,          # 服务器id
            'server_name': self.sname,      # 服务器名
            'role_name': '',                     # 角色名
            'sender_uid': '',               # 发送者登陆游戏使用的账号
            'sender_rid': '',               # 发送者角色id
            'sender_name': '',              # 发送者角色名
            'sender_level': '0',              # 发送者角色等级
            'sender_vip_level': 0,            # 发送者角色VIP等级
            'timestamp': nt,                 # 时间戳，聊天时间
            'key': '',                       # 通过秘钥加密后的数据md5(sercret+timestamp)
        }
        formateData.update(data)

        m2 = hashlib.md5()
        m2.update(self.sercret + str(formateData['timestamp']))
        mysign = m2.hexdigest()
        formateData['key'] = mysign

        urlData = urllib.urlencode(formateData)

        # request = urllib2.Request(url, data=data, headers=headers)
        request = urllib2.Request(self.url, data=urlData)
        try:
            response = urllib2.urlopen(request, timeout=self.timeout)
            res = response.read()
            jRes = json.loads(res)
            return jRes
        except Exception, e:
            print '猫耳api超时了',e,
            res = {
                "result": "success",
                "code": 0,
                "content": formateData['role_name'],
                "error": "urlopen error timed out"
            }
            return res



def maoErPostChat(**data):
    """
    聊天 系统频道不需要发送


    :param data: dict uid mtype content
    :return:
    """
    res = True, data['content']

    mtypeMapping = {
        1: '2',
        2: '0',
        3: '2',
        4: '0',
    }
    gud = g.getGud(data['uid'])
    binduid = gud.get('binduid', '')
    jqbinduid = binduid.lstrip('jingqi_')

    data = {
        'chat_channel': mtypeMapping.get(data['mtype'], '0'),
        'chat_content': data['content'],
        'sender_uid': data['uid'],
        # 'sender_rid': gud.get('binduid', ''),
        'sender_rid': jqbinduid,
        'sender_name': gud.get('name', ''),
        'sender_level': str(gud.get('lv', 0)),
        'sender_vip_level': gud.get('vip', 0),
    }

    mrApi = MaoErApi()
    resJson = mrApi.apiChat(data)

    # 只有验证verify_fail才算失败 不让发送数据
    if resJson['result'] == 'verify_fail':
        res = False, resJson['code']
    elif resJson['result'] == 'success':
        res = True, resJson['content']
    else:
        pass

    # print 'maoer api ==== ', res

    return res


def maoErPostMail(**data):
    """
    发送邮件 只发公会、个人邮件，其他类型不需要
    公会邮件群发邮件，只需要发送一次接口则可
    不同类型的接收者信息，不同

    :param data: dict uid touid title content
    :return:
    """
    res = True, data['title'], data['content']
    gud = g.getGud(data['uid'])
    binduid = gud.get('binduid', '')
    jqbinduid = binduid.lstrip('jingqi_')

    mrApi = MaoErApi()
    emailData = {
        'mail_type': 2,  # 公会邮件
        'mail_title': data['title'],
        'mail_content': data['content'],
        'sender_uid': data['uid'],
        # 'sender_rid': gud.get('binduid', ''),
        'sender_rid': jqbinduid,
        'sender_name': gud.get('name', ''),
        'sender_level': str(gud.get('lv', 0)),
    }
    if 'touid' in data:
        togud = g.getGud(data['touid'])
        tobinduid = togud.get('binduid', '')
        jqtobinduid = tobinduid.lstrip('jingqi_')
        emailData.update({
            'mail_type': 1,
            'sender_uid': data['touid'],
            # 'sender_rid': togud.get('binduid', ''),
            'sender_rid': jqtobinduid,
            'sender_name': togud.get('name', ''),
            'sender_level': str(togud.get('lv', 0)),
        })

    resJson = mrApi.apiMail(emailData)

    # 只有验证verify_fail才算失败 不让发送数据
    if resJson['result'] == 'verify_fail':
        res = False, resJson['code']
    elif resJson['result'] == 'success':
        res = True, resJson['mail_title'], resJson['mail_content']
    else:
        pass

    # print 'maoer api ==== ',res

    return res


def maoErPostSociaty(**data):
    """
    公会接口 只有在公会进行编辑公告/修改公会名时，才发送该接口
    op_type 操作类型，1公告编辑 2修改公会名

    :param data: dict uid name|notice
    :return:
    """
    resContent = ''
    res = True, resContent
    gud = g.getGud(data['uid'])


    sData = {
        # 'op_type': data.get('act', 2),  # 公会邮件
        # 'name': data['content'],
        'leader_uid': data.get('uid', ''),
        'leader_rid': gud.get('binduid', ''),
        'leader_name': gud.get('name', ''),
        'vice_leader_uid': data.get('uid', ''),
        'vice_leader_rid': gud.get('binduid', ''),
        'vice_leader_name': gud.get('name', ''),
        'edit_uid': data.get('uid', ''),
        'edit_rid': gud.get('binduid', ''),
        'edit_name': gud.get('name', ''),
    }

    if 'name' in data:
        sData.update({
            'op_type': 2,
            'name': data['name'],
        })
        resContent = data['name']
    else:
        sData.update({
            'op_type': 1,
            'notice': data['notice'],
        })
        resContent = data['notice']

    mrApi = MaoErApi()
    resJson = mrApi.apiSociaty(sData)

    # 只有验证verify_fail才算失败 不让发送数据
    if resJson['result'] == 'verify_fail':
        res = False, resJson['code']
    elif resJson['result'] == 'success':
        res = True, resJson['content']
    else:
        pass

    # print 'maoer api ==== ', res

    return res

def maoErPostRole(**data):
    """
    角色名接口 玩家创建角色或者修改名字时发送

    :param data: dict uid name
    :return:
    """
    res = True, data['name']

    gud = g.getGud(data['uid'])
    binduid = gud.get('binduid', '')
    jqbinduid = binduid.lstrip('jingqi_')

    sData = {
        'role_name': data['name'],
        'sender_uid': data['uid'],
        # 'sender_rid': gud.get('binduid', ''),
        'sender_rid': jqbinduid,
        'sender_name': gud.get('name', ''),
        'sender_level': str(gud.get('lv', 0)),
        'sender_vip_level': gud.get('vip', 0),

    }

    mrApi = MaoErApi()
    resJson = mrApi.apiRole(sData)

    # 只有验证verify_fail才算失败 不让发送数据
    if resJson['result'] == 'verify_fail':
        res = False, resJson['code']
    elif resJson['result'] == 'success':
        res = True, resJson['content']
    else:
        pass

    # print 'maoer api ==== ',res

    return res


if __name__=='__main__':
    # print filterMsg("毛泽东撒傲视打算但是")
    # print g.chatBlackWordReg.findall('cfdsfs')
    uid = g.buid('xuzhao')
    gud = g.getGud(uid)
    # print getChatList('0_5aec54eb625aeef374e25e16')
    from pprint import pprint

    # a = MaoErApi()
    # a.apiChat()

    a = maoErPostChat(**{
        'uid':uid,
        'mtype':1,
        'content':'你好'
    })
    # a = maoErPostMail({
    #     'uid':uid,
    #     'touid':uid,
    #     'title':'能看见邮件吗',
    #     'content':'能看见邮件吗',
    # })

    # a = maoErPostSociaty({
    #     'act': 2,
    #     'uid': uid,
    #     'content': '你好'
    # })

    # a = maoErPostRole(**{
    #     'uid':uid,
    #     'name':'生米的热'
    # })
    print a
