
## 使用

### 1 安装sphinx

    pip install sphinx
    pip install sphinx_rtd_theme
    pip install sphinx-autobuild
    pip install sphinxcontrib-napoleon
    pip install recommonmark
    
    
    # 可选依赖 graphviz    
    sudo yum install graphviz


### 2 当前目录下运行
    
    # 生成代码文档
    sphinx-apidoc -o source/api/ ../game/api
    sphinx-autobuild  -p 8080 source build/html
    sphinx-autobuild  source build/html -H 0.0.0.0 -p 8080

    # 或者在build/html下
    python -m SimpleHTTPServer 8080

浏览器 localhost:8080 访问


