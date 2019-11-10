# passwordmgrwithpage
带页面的密码管理工具
#  go版本
### 代码目录
```
src/awesomeProject
```
### 证书生成
```
https://www.jianshu.com/p/6c08a3ca2638

bin目录下管理员执行cmd：(参考https://www.jianshu.com/p/6c08a3ca2638)
目录：C:\Program Files\OpenSSL-Win64\bin
cmd下执行命令：
openssl genrsa -out server.key 2048
openssl req -new -x509 -sha256 -key server.key -out server.crt -days 3650
key与crt文件放在exe同级目录下
```
代码编译器：
```
1.golang
2.go sdk
```
### 编译
```
第一次运行：(参考https://github.com/elazarl/go-bindata-assetfs#readme)
 go get github.com/go-bindata/go-bindata/...
 go get github.com/elazarl/go-bindata-assetfs/...

每次编辑html/css/js需执行：
根目录运行：go-bindata-assetfs views/...

编译exe：
go build
```
