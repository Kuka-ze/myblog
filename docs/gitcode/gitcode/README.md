# git常用命令行

``` js

初始化   git init

默认提交所有文件到本地仓库   git add .

提交并且加注释  git commit - m "提交信息"

与远程仓库进行关联    git remote add origin "git仓库地址"

拉取远程仓库代码      git pull origin dev

将代码推送至远程仓库dev中  git push origin dev

查看本地分支    git branch 

查看分支详细信息   git branch -v 

查看本地所有分支+hash+与远程的关联信息   git branch -vv 

查看所有分支 (本地+远程分支)    git branch -a 

创建并切换本地分支，分支名为dev   git checkout -b dev

合并分支  git merge origin dev

删除远程分支关联 git remote rm origin 

添加新地址 git remote add origin '项目地址'

添加新地址后提交到远程仓库     git push -u origin master

然后执行 1、git add .
        2、git commit -m '备注'
        3、git push '项目地址' master


``` 


## git生成公钥

``` js
1、输入下面的命令行
ssh-keygen -t rsa -C"xxxxx@xxxxx.com"  // 在终端输入  注意替换自己的邮箱地址

2、按照提示 三次回车 即可生成

3、查看公钥  

 cat ~/.ssh/id_rsa.pub

``` 
