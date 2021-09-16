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