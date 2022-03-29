======================================
类继承
======================================

TBD
========

游戏类继承
========================
.. graphviz::

    digraph GameClass{

        node [shape = record, fontname = "Microsoft YaHei", fontsize = 10];

        User [label="User\n用户"];
        Hero [label="Hero\n玩家的英雄"];
        Pet [label="Pet\n玩家的宠物"];
        Item [label="Item\n物品"];
        Gene [label="Gene\n基因"];
        Equip [label="Equip\n装备"];


        User -> Hero;
        User -> Pet;
        Hero -> Item;
        Item -> Gene;
        Item -> Equip;


    }