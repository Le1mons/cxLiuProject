# coding=utf-8
import sys

sys.path.append('game')
import g

FIELD_MAP = {
    "#ip": "a01",
    "#country": "a02",
    "#country_code": "a03",
    "#province": "a04",
    "#city": "a05",
    "#os_version": "a06",
    "#manufacturer": "a07",
    "#os": "a08",
    "#device_id": "a09",
    "#screen_height": "a10",
    "#screen_width": "a11",
    "#device_model": "a12",
    "#app_version": "a13",
    "#bundle_id": "a14",
    "#lib": "a15",
    "#lib_version": "a16",
    "#network_type": "a17",
    "#carrier": "a18",
    "#duration": "a21",
    "#zone_offset": "a37",
    "#app_id": "b01",
    "#user_id": "x01",
    "#account_id": "x02",
    "#distinct_id": "x03",
    "#event_name": "x04",
    "#event_time": "b06",
    "#server_time": "x05",
    "#type": "b02",
    "#time": "b03",

}
# 用户公有属性
SUPER_PROPERTIES = {'lv': 'lv',
                    'name': 'role_name',
                    'exp': 'exp',
                    'maxzhanli': 'maxzhanli',
                    'zhanli': 'zhanli',
                    'mapid': 'mapid',
                    'maxmapid': 'maxmapid',
                    'ghid': 'ghid',
                    'rmbmoney': 'rmbmoney',
                    'jinbi': 'jinbi',
                    'sid': 'svrindex',
                    'vip': 'vip',
                    'binduid': 'binduid',
                    'lastloginip': '#ip',
                    'ext_owner': 'owner_name',
                    'ext_channel': 'channel',
                    'ext_device_id': 'device_id',
                    'ext_first_device_id': 'first_device_id',
                    'ctime': 'reg_date'
                    }

USER_ACT = ('set', 'setOnce', 'add', 'unset', 'append', 'del')

# 多条写mdb
WRITE_LIMIT = 200

# 间隔时间写入
BLOCK_EXPIRE = 60

GAME = 'zhengba'

APPKEY = 'asfsdafasdsf'
APPID = 'e903ab24ad8f4bfca8a3ce7e122cd102'

owner_str = g.getOwner()
game_ver = g.getGameVer()
if (game_ver == 'debug') or (set(owner_str.split(',')) & {'business', 'dev', 'bussness', 'banshu',
                                'banshu2', 'banshu3', 'dev2', 'tishen',
                                'tishen2', 'wwceshi', 'del', 'delete',
                                'appledad', 'debug',''}):
    APPKEY = 'debug123456'
    APPID = 'WGtekOwwekH2kCad'
# 上报地址
SERVER_URL = 'http://taapi.legu.cc/v1/'
