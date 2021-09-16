# vue相关问题

## vue双向绑定

数据劫持： vue.js是采用数据劫持结合发布者-订阅者模式的方式，通过Object.defineProperty()来劫持各个属性的setter,getter,在数据变动时发布消息给订阅者，触发相应的监听回调

## 阐述一下你所理解的MVVM响应式原理
vue是采用数据劫持配合发布者-订阅者的模式的方式，通过Object.defineProperty()来劫持各个属性的getter和setter，在数据变动时，发布消息给依赖收集器(dep中的subs)，去通知(notify)观察者，做出对应的回调函数，去更新视图

MVVM作为绑定的入口，整合Observer,Compile和Watcher三者，通过Observer来监听model数据变化，通过Compile来解析编译模板指令，最终利用Watcher搭起Observer，Compile之间的通信桥路，达到数据变化=>视图更新；视图交互变化=>数据model变更的双向绑定效果。

## vue中父子组件的生命周期

父子组件的生命周期是一个嵌套的过程 <br/>
+ 渲染的过程<br/>
    父beforeCreate->父created->父beforeMount->子beforeCreate->子created->子beforeMount->子mounted->父mounted<br/>
+ 子组件更新过程<br/>
    父beforeUpdate->子beforeUpdate->子updated->父updated<br/>
+ 父组件更新过程<br/>
    父beforeUpdate->父updated<br/>
+ 销毁过程<br/>
    父beforeDestroy->子beforeDestroy->子destroyed->父destroyed

## Vue中的nextTick

+ 解释 <br/>
nextTick：在下次 DOM 更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的 DOM。<br/><br/>
+ 应用<br/>
想要在Vue生命周期函数中的created()操作DOM可以使用Vue.nextTick()回调函数<br/>
在数据改变后要执行的操作，而这个操作需要等数据改变后而改变DOM结构的时候才进行操作，需要用到nextTick


## computed和watch的区别

+ computed<br/>
   计算属性，依赖其他属性，当其他属性改变的时候下一次获取computed值时也会改变，computed的值会有缓存
+ watch<br/>
类似于数据改变后的回调<br/>
如果想深度监听的话，后面加一个deep:true<br/>
如果想监听完立马运行的话，后面加一个immediate:true

## Vue-router的模式

+ hash模式 <br/>
利用onhashchange事件实现前端路由，利用url中的hash来模拟一个hash，以保证url改变时，页面不会重新加载。
+ history模式 <br/>
利用pushstate和replacestate来将url替换但不刷新，但是有一个致命点就是，一旦刷新的话，就会可能404，因为没有当前的真正路径，要想解决这一问题需要后端配合，将不存在的路径重定向到入口文件。

## diff算法

diff算法是指对新旧虚拟节点进行对比，并返回一个patch对象，用来存储两个节点不同的地方，最后利用patch记录的消息局部更新DOM

## 虚拟DOM的优缺点

+ 缺点<br/>
首次渲染大量DOM时，由于多了一层虚拟DOM的计算，会比innerHTML插入慢<br/>
+ 优点<br/>
减少了dom操作，减少了回流与重绘<br/>
保证性能的下限，虽说性能不是最佳，但是它具备局部更新的能力，所以大部分时候还是比正常的DOM性能高很多的

## Vue的Key的作用

+ key主要用在虚拟Dom算法中，每个虚拟节点VNode有一个唯一标识Key，通过对比新旧节点的key来判断节点是否改变，用key就可以大大提高渲染效率，这个key类似于缓存中的etag。



