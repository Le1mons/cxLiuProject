#!/usr/bin/python
#coding:utf-8

import json
from datetime import datetime

class UserEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.__str__()

        return json.JSONEncoder.default(self, obj)

def read (s):
    return json.loads(s)

def write (o):
    return json.dumps(o, ensure_ascii=False,cls=UserEncoder)

def loads(s):
    return json.loads(s)