# !/usr/bin/python
# coding:utf-8
# 脚本模板

import sys

sys.path.append('./game')
import g

# 跳过模块内的where条件检测，若没有充分理由，请勿随意跳过
#g.m.pathDebug.SKIP_WHERE_CHECK = True
uids = [
  "0_5e876d739dc6d6742a4eae01",
  "520_5bcb56c777f23b442d1e3933",
  "35440_5ea7e14d0678b6438d6733b8",
  "23800_5d5e5cbac62bd96c00be24bd",
  "16650_5cee6d9e59d1b26fe1f612ec",
  "41410_5f62368fcc20f36a3ff3c96f",
  "14050_5cce4247644a6148b31bcd41",
  "41250_5f617a81338ea063a6c573b3",
  "11590_5ca80d172d28171a23a66abc",
  "35970_5eb519f368ddf3425bb04e94",
  "4140_5c258b27dd264434f70676f9",
  "40280_5f487ac6c62bd962eee6cd0f",
  "12030_5cade3fb53fe6c0badc720e7",
  "7150_5c654f059bf6d34771b3f9eb",
  "23810_5d5f1db8ea71300a1c762698",
  "24790_5d6f8af07e07132cacab41f0",
  "39530_5f33ce3477f23b027c076f65",
  "42110_5f754b13ae34bd10c826b310",
  "29870_5e0fc5330df34c2ef0485300",
  "34250_5e7f3b1660a509040d37030f",
  "38070_5f0623bab5342a5db9dbc063",
  "40260_5f479c1fcc20f33aa651bf5c",
  "22970_5d4ce21142c7ac3d003fd3c2",
  "1400_5be3fc05191d52459dbb1ac7",
  "36980_5eddfbceb5342a52f1ef72b0",
  "31670_5e3936c0ae34bd0517d1ba98",
  "31660_5e391bba4005a03810f3d9c3",
  "4440_5c2ad41450261a2f21966ad2",
  "31500_5e3647da23c8f24364d94805",
  "41930_5f6f6f86cc20f37df4a0bd9c",
  "19720_5d24669bdd2644168470c3cf",
  "5580_5c4344e7a18275661485f716",
  "39400_5f2d227bc995bf3d9a19cadf",
  "36150_5ebcaa5560a5096b74a1a647",
  "1250_5be1bae2ab618731a8e8c89b",
  "3380_5c19a89b4383486def7da968",
  "23120_5d4f90eaae34bd266d2238fe",
  "41460_5f640780191d52515c045a9a",
  "31170_5e2914c7658c8879450ebf13",
  "35610_5eaa00640678b61b3c3f7d5f",
  "15340_5cdcc46c658c8860b3cf63ff",
  "41670_5f69b2a3df29765c81a770ff",
  "15660_5ce3437038a4b96bf96cdd1a",
  "5680_5c48732bc995bf0792a20219",
  "5550_5c43dfdab538b32c8ebfcd23",
  "32620_5e4c9c9fa97fa5262a0a067a",
  "30230_5e18667248fc701ce5ea036a",
  "18150_5d08a1c950261a28b86d19ba",
  "16190_5ce9268242c7ac7c4dd220d9",
  "30100_5e15c31e9cad086452ce0ab6",
  "40800_5f54a4c868ddf3761f5c88c7",
  "23600_5d5770074005a0473cd2fe14",
  "30640_5e2402a885b6b83bc2170ce0",
  "41190_5f5f403f50261a2388904b4c",
  "40370_5f4ce4701526675384e4fa64",
  "31470_5e355ad90df34c49d7068584",
  "28990_5df3b87c9bbd0a147466f754",
  "41570_5f674d60df297629e6b3633d",
  "42110_5f754f4bae34bd10c826bf42",
  "20010_5d26ae13c5c6f72da3e071e4",
  "40000_5f3ffa79d33a8b739cf0d62b",
  "30160_5e168e1e642fb216e93ee672",
  "39710_5f37f285642fb2372b284d26",
  "1720_5bebfa51090588151b9a7ebe",
  "42350_5f7a72f548fc706f48801984",
  "17060_5cf5aa09cb5e3b59b4ef7a90",
  "5230_5c3ab0e4b538b3118a45985b",
  "36300_5ec3411a60a50947ecdc8f9c",
  "30200_5e16894ea31eba40a17c3f0f",
  "22260_5d444f24c995bf0705e53afb",
  "12710_5cb99570cb5e3b5a6aeaba9c",
  "7090_5c63b8b12d2817657d4e08e1",
  "31640_5e3a238c658c8859a3d5114b",
  "38730_5f199dbe3c237760e1dcee02",
  "41360_5f61de52df29763761b53ff7",
  "41290_5f5f9a8568ddf35cb6c2e0f3",
  "18150_5d08583650261a28ba1e2ad7",
  "27970_5dce4463fa0c4720cc99a47f",
  "28140_5dd6c4753c2377365332c521",
  "25880_5d8acb1b3d8c4268b4cff703",
  "8740_5c7f435a642fb208b8215220",
  "38710_5f17ed0f161a87287fc17223",
  "40740_5f6026dd68ddf3080e90159f",
  "40260_5f53747dcc20f373d31a402e",
  "39120_5f257dae0d7e5902b091b7e6",
  "10220_5c963c07191d520b55d3293d",
  "1120_5bdd97c61526675123d4c0e4",
  "31640_5e3a4d43658c8859a4c841a8",
  "31250_5e2bf2f453fe6c0e50e3630e",
  "40660_5f50f781b5342a73dc1a9653",
  "41470_5f649fa6df29764be44accfb",
  "32570_5e4be2d2ab61876b6fa8eb37",
  "8110_5c726b55a97fa50599e6a27d",
  "37660_5ef4cb68ae34bd49f606d091",
  "28130_5dd614d3ea713021210537c7",
  "28170_5dd813af09058834ae407b2e",
  "24580_5d6ac3549cad0849462e577b",
  "37300_5ee847f8ae34bd6d3d991f1a",
  "22260_5d44ccaac995bf070399f1a3",
  "33305_5e5be05e0678b6259be717ed",
  "36340_5ec5434d68ddf34bd61205d1",
  "40620_5f506594c995bf12e4d8fc1a",
  "26450_5da13549658c88047c947892",
  "39280_5f298644642fb2596c527bed",
  "42330_5f79fdddc62bd950f2d09b15",
  "10880_5c9ff7c359d1b22b5e59e99e",
  "34280_5e801b48b7733a27882892bd",
  "28670_5deb2972fb1f0f45fd07be54",
  "3430_5c19f69b4005a0449c1a3fb6",
  "34190_5e7caf6ab5342a6cb589bf7b",
  "42110_5f75d1c3ae34bd10c828613b",
  "11590_5cadbd602d281710d9a3f5e8",
  "40260_5f478fc8cc20f33aac6ba70a",
  "31640_5e3a2c16658c8859a21171ea",
  "25490_5d831026bde0c1250e6df72e",
  "41660_5f6d918548fc705d9eeef3d0",
  "26850_5dadd62d53448031715a7818",
  "41560_5f6705e5c62bd95dd8eeddff",
  "18930_5d1650d3c62bd929a73b0f73",
  "37550_5ef2cb099bbd0a31529f8785",
  "37660_5ef58499ae34bd49f5b6e281",
  "38480_5f11804e9cad08708e9cdfe1",
  "42230_5f77b91e9cad0863614ca851",
  "8010_5c6f5a0cc5c6f7031cf14e22",
  "10790_5c9e085309058814655ce983",
  "34680_5e8f33da0678b646096864c8",
  "35640_5eaaaf777ce45270b4033023",
  "16560_5ced5c277e07133a9183bf2e",
  "12750_5cbfb830857ead58ad9aae1a",
  "40250_5f4a0893191d527fedc41f56",
  "42440_5f7db0a1191d5219f9f855b4",
  "4580_5c2d7205dd26447384b60254",
  "25140_5d773359d33a8b2da433af8f",
  "28060_5dd1ffeec3c75a3a36516cb8",
  "26770_5dab24e838a4b96c35b84adf",
  "33385_5e5fd22eb7733a7ab64b9e0d",
  "24320_5d6575c7090588513062ea84",
  "17920_5d04d790644a61123f95caa2",
  "38940_5f20787977f23b3cb8d9c204",
  "42160_5f76b792658c886813cea518",
  "33530_5e64d992b5342a61e7335bc6",
  "28950_5df2f2c7658c88033d29fc45",
  "42440_5f7c95b1191d5219f9f5dfce",
  "360_5bc485ab3d8c4260124430ba",
  "39710_5f3803d8642fb2372c41d744",
  "18880_5e44ff05644a6173574094b5",
  "24100_5d60ad4a9cad08208af74452",
  "42440_5f7c99ba191d5219fbb147cf",
  "40920_5f56e65d338ea028c50a8aa0",
  "30750_5e2633a2642fb22647870a49",
  "24470_5d69a9fdb538b36f51722a59",
  "4240_5c27cd4b50261a2f2425f1de",
  "15980_5ce6b9f1c3c75a57f48e31d4",
  "41600_5f67ac23191d5222dcbaf66d",
  "42360_5f7b0e64090588736723fc5d",
  "37340_5eea2e2f161a872912f170ba",
  "42110_5f75db3eae34bd10c678ccab",
  "28760_5deb7180c5c6f72611469510",
  "42020_5f733c01cc20f31b97b437ec",
  "42400_5f86ea5048fc7017ff2e4448",
  "32800_5e51f9ab4005a042d3199710",
  "3210_5cff52ee50261a0f9784545c",
  "40680_5f504e7afb1f0f0adb9d982e",
  "4920_5ca167ae23c8f20ac7099a8b",
  "23880_5d5d611d0df34c62a0b70251",
  "3690_5c1d4e3150261a452de4ce68",
  "22800_5d4bf888cc20f37e0a940544",
  "42090_5f73e6d39bf6d35eba01797f",
  "42000_5f739a443d8c4251b849a2ec",
  "42220_5f775c214005a07b14abecff",
  "39800_5f39620a9bbd0a0a35d230fb",
  "33030_5e54c5fc0df34c265138eaa4",
  "24010_5d5f54fca97fa5292a98c38c",
  "6310_5c543e5353fe6c207bc58f15",
  "40260_5f4bb9becc20f33aac6ce178",
  "3230_5c1856bc0d7e5950cb954c7f",
  "30390_5e1c192815266766c4dda2ea",
  "37530_5ef15538b5342a71b1f3ab12",
  "41560_5f671342c62bd95dd73952b4",
  "25770_5d89c24e77f23b3c3cf4a28a",
  "41240_5f5ef7f385b6b80eee008842",
  "42150_5f7645a460a5092abeb98f8f",
  "20720_5d317b8f53fe6c37714460f3",
  "42470_5f7d24b2152667763a0b983b",
  "22880_5d4c534609058807326a6989",
  "41840_5f6d667068ddf36c3e3e2f76",
  "8780_5ea3ac46a31eba515f6b9b47",
  "24660_5d6c8dd8d33a8b3e4f4fe13e",
  "35940_5eb773700678b676b6d21ff2",
  "32960_5e523a50c62bd975667ed6bb",
  "25320_5d7b191b0df34c5e4fab9c02",
  "22410_5d46e07277f23b52abc47e46",
  "9410_5c85e7110df34c50f6b5d008",
  "5920_5c4d967a9bbd0a161c6547e2",
  "42170_5f76e35e0d7e593e76a8daee",
  "23120_5d4fa072ae34bd266d22728c",
  "27750_5dc77daf23c8f21ad504664f",
  "42370_5f7b5bdc77f23b6dae0a0812",
  "39480_5f3039d3df297675dd45d703",
  "42110_5f75a1e3ae34bd10c7319722",
  "40340_5f4a40d42d281703db0b606f",
  "34755_5e90604eb5342a72e2186edb",
  "4240_5f5ce67150261a12bcf8345e",
  "6040_5ce54003a18275295f1a14c2",
  "30080_5e12a94fae34bd191a19f88d",
  "33860_5e6f8080b5342a7fbac34dd6",
  "33770_5e6cf81268ddf36faa8b4c05",
  "15830_5ce6ab7185b6b8611680cc99",
  "15880_5ce5d280dd264448f9929094",
  "5680_5c95988dc995bf0a792ef087",
  "5680_5c959740c995bf0a792eef56",
  "5680_5c94eb4fc995bf0a792e3edb",
  "5680_5c94ad82c995bf0a792e0de2",
  "10220_5d06971d191d524da23d83d8",
  "10220_5ed8d331191d52078478b853",
  "28900_5f4f4aa350261a209b9a7eba",
  "7150_5d4789f69bf6d3591a6728f7",
  "16190_5f1c417a38a4b95afe2cf3a5",
  "1120_5cc692c715266741dd87fcec",
  "1120_5cc6befe15266741dd88252f",
  "1120_5ccfcd4615266741dd91947a",
  "23600_5d5760204005a04737b1b4cc",
  "1120_5ccfcb6315266741dd9191ad",
  "1120_5ccfcc5a15266741dd919353",
  "9760_5c8cdb61df297621c49bf259",
  "1120_5ccec25b15266741dd90547d",
  "41070_5f5abf700678b63db1f7ee32",
  "29850_5e142dd523c8f213dcaa93d5",
  "28950_5df307f8658c88033e5730e3",
  "41660_5f6c433248fc705d9ba947b0",
  "41880_5f71091115266701ed036070",
  "37700_5ef6aa18642fb26df3dcc83f",
  "19330_5e8203b4a31eba7b9ad6143b",
  "33720_5f983a85338ea04cbf43f711",
  "30080_5e129db9ae34bd191b14f0cc",
  "41500_5f660a599cad085183573c86",
  "31530_5f5ce85438a4b913a6b87cf9",
  "15540_5cdfb718cc20f359d52adcf9",
  "31640_5e5b85f6658c8838b7c2f1f0",
  "28760_5e988108c5c6f721ba5ad5af",
  "42120_5f74b4b2b538b36ff382ea98",
  "28000_5dd072759bf6d30b0684dfa1",
  "36100_5f9a110068ddf333722ebcf2",
  "42250_5f77f1bdfa0c472e50aeb0f6",
  "41980_5f72874085b6b8410f6baea2",
  "30200_5ea9ebeba31eba1359cfd4d0",
  "24790_5dc184e77e07132b47a716fb",
  "24790_5dc4f8607e07136e35af622f",
  "24790_5ea9317c7e07136d142f4b6e",
  "30200_5ea9e9bba31eba1359cfd2ea",
  "30200_5ea9dab2a31eba1359cfcc31",
  "16560_5cf9db447e07133a930bc533",
  "24790_5ea92a9a7e07136d142f4882",
  "15980_5ce6a78ec3c75a57f3587024",
  "24790_5ddd3df97e07135f5444147f",
  "20560_5d2d9b7fab618739e838f8d8",
  "40260_5f505e64cc20f37f40fafc2a",
  "24790_5eaa66de7e07136d142f7415",
  "24790_5ea9260b7e07136d142f463a",
  "22450_5d47600e23c8f25dab72d279",
  "35230_5f6384fb17ec593f374661ea",
  "39120_5f3b31f20d7e5901d22cde32",
  "16560_5d9627547e071332e4acf817",
  "10220_5ed8df29191d52078478bb1b",
  "10220_5e317d1a191d5264c66548d8",
  "17060_5eae5556cb5e3b4c4faa52d7",
  "31790_5ea4ddd7a31eba4c74dc4c07",
  "6310_5ddd021d53fe6c7818b5b5ae",
  "10150_5f70186a3d8c42550d0a77c8",
  "31790_5ec5df7da31eba36d0889a77",
  "10220_5ed8f721191d52078478bda2",
  "7030_5c6235d09cad081bee82a8d4",
  "10220_5e311c82191d5264c66544b2",
  "10220_5ed92c80191d52078478c672",
  "28950_5f371ba9658c884b01f792f0",
  "11150_5ca1f764c995bf31e878e576",
  "26660_5f263d9648fc7016f4b7a732",
  "35230_5f63825a17ec593f37465ec6",
  "11150_5ca21510c995bf31e87962e5",
  "23600_5d6535e94005a010b60e7747",
  "16560_5cee312d7e07133a93fa92a8",
  "5230_5e30bc5db538b35ff4d64b59",
  "40260_5f86f894cc20f3190a20ace3",
  "32720_5f762e2c68ddf33d5b324d37",
  "39950_5f3f675c48fc7045bf36bfe8",
  "29160_5df9886adf29763d0c981ae1",
  "35650_5eab1bbc0678b644cd9f0ef6",
  "27230_5dbb8e9677f23b705d01319e",
  "40260_5f868ea1cc20f3190a20a238",
  "7150_5d8a1f1d9bf6d337d9807607",
  "40690_5f5305d42d281737f6495df7",
  "28950_5ee1e00c658c881842857736",
  "42380_5f7b4ae3191d521aae1925d4",
  "41150_5f5c56890678b63d0297e80a",
  "40680_5f504e38fb1f0f0ade09d734",
  "40260_5f8933c1cc20f3190a20da2e"
]
class Patch(object):

    @g.m.pathDebug.patch
    def shop(self):
        for i in uids:
          if g.m.crosscomfun.chkIsThisService(i):
            g.mdb.update('blacklist',{'uid':i},{"ctype" : 3,"etime" : 1607529600,"ctime" : 1604895951,"remarks" : "双十一"},upsert=True,RELEASE=1)

    @g.m.pathDebug.run
    def run(self):
        # run名字固定，在这里指定执行顺序
        self.shop()


if __name__ == '__main__':
    patch = Patch()
    patch.run()