#!/usr/bin/python
# coding:utf-8
import json, os, csv

def check_prize():
    # 检测
    def chechk(data, preKey=None):
        if isinstance(data, basestring) or isinstance(data, int):
            return

        if isinstance(data, dict):
            for key, val in data.items():
                # 记录p 的上一个字段
                if isinstance(val, dict) and [i for i in chkFile['key'] for j in val if j.find(i) != -1]:
                    preKey = key

                # 消耗就不检测
                if key.find('need') != -1:
                    continue

                # 找到atn配置了
                if isinstance(val, dict) and 'a' in val and 't' in val and 'n' in val:
                    # 只要key存在prize 或者 p
                    if [i for i in chkFile['key'] if key.find(i) != -1] and warning(val):
                        warnings.append([preKey, repr(val)])
                else:
                    chechk(val, preKey = preKey)


        elif isinstance(data, list):
            for val in data:
                if isinstance(val, dict) and 'hdid' in val:
                    preKey = val['hdid']

                # 找到atn配置了
                if isinstance(val, dict) and 'a' in val and 't' in val and 'n' in val:
                    if warning(val):
                        warnings.append([preKey, repr(val)])
                else:
                    chechk(val, preKey)

    # 触发警告
    def warning(data):
        if data['a'] not in chkFile or data['t'] not in chkFile[data['a']]:
            return False

        try:
            _num = int(data['n'])
        except:
            _num = 0
        if _num > chkFile[data['a']][data['t']]:
            return True

    # 检测的配置目录
    sameJsonPath = os.getcwd() + '\\samejson'
    jsonFiles = os.listdir(sameJsonPath)

    # 警告的存储文件
    wb = open('./warning.csv' ,'w')
    ws = csv.writer(wb)

    # 检测文件的配置
    with open(sameJsonPath + '\\check_prize.json', 'r') as f:
        chkFile = json.loads(f.read())

    for fileName in jsonFiles:
        with open(sameJsonPath + '\\' + fileName, 'r') as f:
            data = json.loads(f.read())

        warnings = []
        chechk(data)
        if warnings:
            ws.writerow([fileName])
            ws.writerow(['warning:{}'.format(len(warnings))])
            for i in warnings:
                ws.writerow(i)
    wb.close()

if __name__ == '__main__':
    check_prize()