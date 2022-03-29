#!/usr/bin/python
#coding:utf-8

'''
创建MongoDB 用户
'''
import pymongo

client = pymongo.MongoClient("127.0.0.1",27017)
client["admin"]["system.version"].update({"_id" : "authSchema"},{"currentVersion":3})
client.get_database("admin").add_user("root","iamciniao")
print "Create MongoDB User Success ... "