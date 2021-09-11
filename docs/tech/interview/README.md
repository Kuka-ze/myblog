# 手写源码
## 1、实现防抖函数 (debounce)
**防抖函数远离:** <br/>
在事件被触发 n秒后再执行回调, 如果在这n秒内又被触发, 则重新计时

``` js
// func是用户传入需要防抖的函数
// wait是等待时间
const debounce = (func, wait = 50) => {
  // 缓存一个定时器id
  let timer = 0
  // 这里返回的函数是每次用户实际调用的防抖函数
  // 如果已经设定过定时器了就清空上一次的定时器
  // 开始一个新的定时器，延迟执行用户传入的方法
  return function(...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, wait)
  }
}

``` 
**适用场景:** <br/>
按钮提交场景：防止多次提交按钮，只执行最后提交的一次 服务端验证场景：表单验证需要服务端配合，只执行一段连续的输入事件的最后一次，还有搜索联想词功能类似

# 手写源码
## 2、实现节流函数（throttle）
**节流函数原理:** <br/>
规定在一个单位时间内，只能触发一次函数。如果这个单位时间内触发多次函数，只有一次生效
``` js
// func是用户传入需要防抖的函数
// wait是等待时间
const throttle = (func, wait = 50) => {
  // 上一次执行该函数的时间
  let lastTime = 0
  return function(...args) {
    // 当前时间
    let now = +new Date()
    // 将当前时间和上一次执行函数时间对比
    // 如果差值大于设置的等待时间就执行函数
    if (now - lastTime > wait) {
      lastTime = now
      func.apply(this, args)
    }
  }
}

``` 
**适用场景:** <br/>
+ 拖拽场景：固定时间内只执行一次，防止超高频次触发位置变动<br/>
+ 缩放场景：监控浏览器resize<br/>
+ 动画场景：避免短时间内多次触发动画引起性能问题<br/>

## 3、深拷贝
**方法一** <br/>

``` js

const newObj = JSON.parse(JSON.stringify(oldObj));

``` 
**局限性:** <br/>
+ 他无法实现对函数、RegExp 等特殊对象的克隆<br/>
+ 会抛弃对象的 constructor,所有的构造函数会指向 Object<br/>
+ 对象有循环引用,会报错<br/>

**方法二** <br/>

``` js

function deepCopy(obj){
  //判断是否是简单数据类型，
  if(typeof obj == "object") {
      //复杂数据类型
      var result = obj.constructor == Array ? [] : {};
      for(let i in obj) {
          result[i] = typeof obj[i] == "object" ? deepCopy(obj[i]) : obj[i];
      }
  } else {
      //简单数据类型 直接 == 赋值
      var result = obj;
  }
  return result;
}

``` 

## 4、实现 Event(event bus)
 <font color=#A52A2A  size=4 >event bus</font>既是 <font color=#A52A2A size=4 >node</font> 中各个模块的基石，又是前端组件通信的依赖手段之一，同时涉及了订阅-发布设计模式，是非常重要的基础

``` js
class EventEmeitter {
  constructor() {
    this._events = this._events || new Map(); // 储存事件/回调键值对
    this._maxListeners = this._maxListeners || 10; // 设立监听上限
  }
}

// 触发名为type的事件
EventEmeitter.prototype.emit = function(type, ...args) {
  let handler;
  handler = this._events.get(type);
  if (Array.isArray(handler)) {
    // 如果是一个数组说明有多个监听者,需要依次此触发里面的函数
    for (let i = 0; i < handler.length; i++) {
      if (args.length > 0) {
        handler[i].apply(this, args);
      } else {
        handler[i].call(this);
      }
    }
  } else {
    // 单个函数的情况我们直接触发即可
    if (args.length > 0) {
      handler.apply(this, args);
    } else {
      handler.call(this);
    }
  }

  return true;
};

// 监听名为type的事件
EventEmeitter.prototype.addListener = function(type, fn) {
  const handler = this._events.get(type); // 获取对应事件名称的函数清单
  if (!handler) {
    this._events.set(type, fn);
  } else if (handler && typeof handler === "function") {
    // 如果handler是函数说明只有一个监听者
    this._events.set(type, [handler, fn]); // 多个监听者我们需要用数组储存
  } else {
    handler.push(fn); // 已经有多个监听者,那么直接往数组里push函数即可
  }
};

EventEmeitter.prototype.removeListener = function(type, fn) {
  const handler = this._events.get(type); // 获取对应事件名称的函数清单

  // 如果是函数,说明只被监听了一次
  if (handler && typeof handler === "function") {
    this._events.delete(type, fn);
  } else {
    let postion;
    // 如果handler是数组,说明被监听多次要找到对应的函数
    for (let i = 0; i < handler.length; i++) {
      if (handler[i] === fn) {
        postion = i;
      } else {
        postion = -1;
      }
    }
    // 如果找到匹配的函数,从数组中清除
    if (postion !== -1) {
      // 找到数组对应的位置,直接清除此回调
      handler.splice(postion, 1);
      // 如果清除后只有一个函数,那么取消数组,以函数形式保存
      if (handler.length === 1) {
        this._events.set(type, handler[0]);
      }
    } else {
      return this;
    }
  }
};


``` 

## 5、实现 instanceOf
**思路：** <br/>
+ 步骤1：先取得当前类的原型，当前实例对象的原型链
​+ 步骤2：一直循环（执行原型链的查找机制）
+ 取得当前实例对象原型链的原型链（proto = proto.proto，沿着原型链一直向上查找）
+ 如果 当前实例的原型链 __proto__ 上找到了当前类的原型 prototype，则返回 true
+ 如果 一直找到 Object.prototype.__proto__ == null，Object 的基类( null )上面都没找到，则返回 false

``` js
function myInstanceof(left, right) {
  let proto = Object.getPrototypeOf(left);
  while(true) {
    if(proto == null) return false;

    // 在当前实例对象的原型链上，找到了当前类
    if(proto == right.prototype) return true;
    // 沿着原型链__ptoto__一层一层向上查
    proto = Object.getPrototypeof(proto);
  }
}

``` 

## 6、模拟 new
**new 操作符做了这些事：** <br/>
+ 创建一个全新的对象，这个对象的 __proto__ 要指向构造函数的原型对象
+ 执行构造函数
+ 返回值为 object 类型则作为 new 方法的返回值返回，否则返回上述全新对象

``` js
function myNew(fn, ...args) {
  let instance = Object.create(fn.prototype);
  let res = fn.apply(instance, args);
  return typeof res === 'object' ? res: instance;
}

``` 

## 7、实现 call 方法
**调用 call 方法具体做了什么:** <br/>
+ 将函数设为对象的属性
+ 执行后删除这个函数
+ 指定 this 到函数并传入给定参数执行函数
+ 如果不传入参数，默认指向为 window

``` js
//实现一个call方法：
Function.prototype.myCall = function(context) {
  //此处没有考虑context非object情况
  context.fn = this;
  let args = [];
  for (let i = 1, len = arguments.length; i < len; i++) {
    args.push(arguments[i]);
  }
  context.fn(...args);
  let result = context.fn(...args);
  delete context.fn;
  return result;
};

``` 

## 8、实现 apply 方法
思路: 利用 this 的上下文特性。

``` js
//实现apply只要把下一行中的...args换成args即可 
Function.prototype.myCall = function(context = window, ...args) {
  let func = this;
  let fn = Symbol("fn");
  context[fn] = func;

  let res = context[fn](...args);//重点代码，利用this指向，相当于context.caller(...args)

  delete context[fn];
  return res;
}

``` 

## 9、实现 bind
bind 的实现对比其他两个函数略微地复杂了一点，因为 bind 需要返回一个函数，需要判断一些边界问题，以下是 bind 的实现<br/>

+ bind 返回了一个函数，对于函数来说有两种方式调用，一种是直接调用，一种是通过 new 的方式，我们先来说直接调用的方式<br/>
+ 对于直接调用来说，这里选择了 apply 的方式实现，但是对于参数需要注意以下情况：因为 bind 可以实现类似这样的代码 f.bind(obj, 1)(2)，所以我们需要将两边的参数拼接起来，于是就有了这样的实现 args.concat(...arguments)<br/>
+ 最后来说通过 new 的方式，在之前的章节中我们学习过如何判断 this，对于 new 的情况来说，不会被任何方式改变 this，所以对于这种情况我们需要忽略传入的 this

``` js
Function.prototype.myBind = function (context) {
  if (typeof this !== 'function') {
    throw new TypeError('Error')
  }
  const _this = this
  const args = [...arguments].slice(1)
  // 返回一个函数
  return function F() {
    // 因为返回了一个函数，我们可以 new F()，所以需要判断
    if (this instanceof F) {
      return new _this(...args, ...arguments)
    }
    return _this.apply(context, args.concat(...arguments))
  }
}

``` 

## 10、模拟 Object.create
Object.create() 方法创建一个新对象，使用现有的对象来提供新创建的对象的 __proto__

``` js
// 模拟 Object.create
function create(proto) {
  function F() {}
  F.prototype = proto;

  return new F();
}

``` 


## 11、实现类的继承
类的继承在几年前是重点内容，有 n 种继承方式各有优劣，es6 普及后越来越不重要，那么多种写法有点『回字有四样写法』的意思，如果还想深入理解的去看红宝书即可，我们目前只实现一种最理想的继承方式。

``` js
function Parent(name) {
    this.parent = name
}
Parent.prototype.say = function() {
    console.log(`${this.parent}: 你打篮球的样子像kunkun`)
}
function Child(name, parent) {
    // 将父类的构造函数绑定在子类上
    Parent.call(this, parent)
    this.child = name
}

/** 
 1. 这一步不用Child.prototype =Parent.prototype的原因是怕共享内存，修改父类原型对象就会影响子类
 2. 不用Child.prototype = new Parent()的原因是会调用2次父类的构造方法（另一次是call），会存在一份多余的父类实例属性
3. Object.create是创建了父类原型的副本，与父类原型完全隔离
*/
Child.prototype = Object.create(Parent.prototype);
Child.prototype.say = function() {
    console.log(`${this.parent}好，我是练习时长两年半的${this.child}`);
}

// 注意记得把子类的构造指向子类本身
Child.prototype.constructor = Child;

var parent = new Parent('father');
parent.say() // father: 你打篮球的样子像kunkun

var child = new Child('cxk', 'father');
child.say() // father好，我是练习时长两年半的cxk


``` 


## 12、实现一个 JSON.stringify

``` js
JSON.stringify(value[, replacer [, space]])：

``` 
+ Boolean | Number| String 类型会自动转换成对应的原始值。
+ undefined、任意函数以及 symbol，会被忽略（出现在非数组对象的属性值中时），或者被转换成 null（出现在数组中时）。
+ 不可枚举的属性会被忽略如果一个对象的属性值通过某种间接的方式指回该对象本身，即循环引用，属性也会被忽略
+ 如果一个对象的属性值通过某种间接的方式指回该对象本身，即循环引用，属性也会被忽略

``` js
function jsonStringify(obj) {
    let type = typeof obj;
    if (type !== "object") {
        if (/string|undefined|function/.test(type)) {
            obj = '"' + obj + '"';
        }
        return String(obj);
    } else {
        let json = []
        let arr = Array.isArray(obj)
        for (let k in obj) {
            let v = obj[k];
            let type = typeof v;
            if (/string|undefined|function/.test(type)) {
                v = '"' + v + '"';
            } else if (type === "object") {
                v = jsonStringify(v);
            }
            json.push((arr ? "" : '"' + k + '":') + String(v));
        }
        return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}")
    }
}
jsonStringify({x : 5}) // "{"x":5}"
jsonStringify([1, "false", false]) // "[1,"false",false]"
jsonStringify({b: undefined}) // "{"b":"undefined"}"


``` 


## 13、实现一个 JSON.parse

``` js
JSON.parse(text[, reviver])

``` 
用来解析 JSON 字符串，构造由字符串描述的 JavaScript 值或对象。提供可选的 reviver 函数用以在返回之前对所得到的对象执行变换(操作)

**第一种:直接调用 eval** <br/>

``` js
function jsonParse(opt) {
    return eval('(' + opt + ')');
}
jsonParse(jsonStringify({x : 5}))
// Object { x: 5}
jsonParse(jsonStringify([1, "false", false]))
// [1, "false", falsr]
jsonParse(jsonStringify({b: undefined}))
// Object { b: "undefined"}

``` 

::: warning 注意
避免在不必要的情况下使用 eval，eval() 是一个危险的函数，他执行的代码拥有着执行者的权利。如果你用 eval() 运行的字符串代码被恶意方（不怀好意的人）操控修改，您最终可能会在您的网页/扩展程序的权限下，在用户计算机上运行恶意代码。它会执行 JS 代码，有 XSS 漏洞。
:::
如果你只想记这个方法，就得对参数 json 做校验。

``` js
var rx_one = /^[\],:{}\s]*$/;
var rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
var rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
var rx_four = /(?:^|:|,)(?:\s*\[)+/g;
if (
    rx_one.test(
        json
            .replace(rx_two, "@")
            .replace(rx_three, "]")
            .replace(rx_four, "")
    )
) {
    var obj = eval("(" +json + ")");
}

``` 
**第二种:Function** <br/>


核心：Function 与 eval 有相同的字符串参数特性

``` js
var func = new Function(arg1, arg2, ..., functionBody);
``` 
在转换 JSON 的实际应用中，只需要这么做


``` js
var jsonStr = '{ "age": 20, "name": "jack" }'
var json = (new Function('return ' + jsonStr))();

``` 
::: danger 注意
eval 与 Function都有着动态编译js代码的作用，但是在实际的编程中并不推荐使用
::: 

## 14、 Promise的简单实现

``` js
function myPromise(constructor) {
    let self = this;
    self.status = "pending"   // 定义状态改变前的初始状态
    self.value = undefined;   // 定义状态为resolved的时候的状态
    self.reason = undefined;  // 定义状态为rejected的时候的状态
    function resolve(value) {
       if(self.status === "pending") {
          self.value = value;
          self.status = "resolved";
       }
    }
    function reject(reason) {
       if(self.status === "pending") {
          self.reason = reason;
          self.status = "rejected";
       }
    }
    // 捕获构造异常
    try {
       constructor(resolve,reject);
    } catch(e) {
       reject(e);
    }
}

// 添加 then 方法
myPromise.prototype.then = function(onFullfilled,onRejected) {
   let self = this;
   switch(self.status) {
      case "resolved":
        onFullfilled(self.value);
        break;
      case "rejected":
        onRejected(self.reason);
        break;
      default:       
   }
}

var p = new myPromise(function(resolve,reject) {
    resolve(1)
});
p.then(function(x) {
    console.log(x) // 1
})

``` 


## 15、用ES5实现数组的map方法

``` js
Array.prototype.MyMap = function(fn, context){
  var arr = Array.prototype.slice.call(this);//由于是ES5所以就不用...展开符了
  var mappedArr = [];
  for (var i = 0; i < arr.length; i++ ){
    mappedArr.push(fn.call(context, arr[i], i, this));
  }
  return mappedArr;
}

``` 

## 16、用ES5实现数组的reduce方法

``` js
Array.prototype.myReduce = function(fn, initialValue) {
  var arr = Array.prototype.slice.call(this);
  var res, startIndex;
  res = initialValue ? initialValue : arr[0];
  startIndex = initialValue ? 0 : 1;
  for(var i = startIndex; i < arr.length; i++) {
    res = fn.call(null, res, arr[i], i, this);
  }
  return res;
}
``` 


## 17、实现bind方法
``` js
Function.prototype.bind = function(context, ...args) {
  let self = this;//谨记this表示调用bind的函数
  let fBound = function() {
      //this instanceof fBound为true表示构造函数的情况。如new func.bind(obj)
      return self.apply(this instanceof fBound ? this : context || window, args.concat(Array.prototype.slice.call(arguments)));
  }
  fBound.prototype = Object.create(this.prototype);//保证原函数的原型对象上的属性不丢失
  return fBound;
}
``` 

## 18、实现单例模式
::: warning
核心要点: 用闭包和Proxy属性拦截
:::

``` js
function proxy(func) {
    let instance;
    let handler = {
        constructor(target, args) {
            if(!instance) {
                instance = Reflect.constructor(fun, args);
            }
            return instance;
        }
    }
    return new Proxy(func, handler);
}
``` 

## 19、实现数组的flat
**需求** ：多维数组转化为一维数组

``` js
let ary = [1, [2, [3, [4, 5]]], 6];
let str = JSON.stringify(ary);

//第一种处理:直接的调用
arr_flat = arr.flat(Infinity);


//第二种处理
ary = str.replace(/(\[|\])/g, '').split(',');

//第三种处理
str = str.replace(/(\[\]))/g, '');
str = '[' + str + ']';
ary = JSON.parse(str);

//第四种处理：递归处理
let result = [];
let fn = function(ary) {
  for(let i = 0; i < ary.length; i++) }{
    let item = ary[i];
    if (Array.isArray(ary[i])){
      fn(item);
    } else {
      result.push(item);
    }
  }
}


//第五种处理：用 reduce 实现数组的 flat 方法
function flatten(ary) {
  return ary.reduce((pre, cur) => {
      return pre.concat(Array.isArray(cur) ? flatten(cur) : cur);
  }, []);
}
let ary = [1, 2, [3, 4], [5, [6, 7]]]
console.log(flatten(ary))

//第六种处理：扩展运算符
while (ary.some(Array.isArray)) {
  ary = [].concat(...ary);
}

``` 

## 20、对象扁平化

``` js
function objectFlat(obj = {}) {
  const res = {}
  function flat(item, preKey = '') {
    Object.entries(item).forEach(([key, val]) => {
      const newKey = preKey ? `${preKey}.${key}` : key
      if (val && typeof val === 'object') {
        flat(val, newKey)
      } else {
        res[newKey] = val
      }
    })
  }
  flat(obj)
  return res
}

const source = { a: { b: { c: 1, d: 2 }, e: 3 }, f: { g: 2 } }
console.log(objectFlat(source));
``` 

## 21、请实现一个 add 函数，满足以下功能

``` js
add(1); 			// 1
add(1)(2);  	// 3
add(1)(2)(3)；// 6
add(1)(2, 3); // 6
add(1, 2)(3); // 6
add(1, 2, 3); // 6
``` 

``` js
function add() {
  let args = [].slice.call(arguments);
  
  let fn = function(){
   let fn_args = [].slice.call(arguments)
   return add.apply(null,args.concat(fn_args))
  }
  
  fn.toString = function(){
    return args.reduce((a,b)=>a+b)
  }
  
  return fn
}

``` 

## 22、实现一个 sleep 函数，比如 sleep(1000) 意味着等待1000毫秒

``` js
const sleep = (time) => {
  return new Promise(resolve => setTimeout(resolve, time))
}

sleep(1000).then(() => {
    // 这里写你的骚操作
})

``` 

## 23、实现一个JS函数柯里化

是把接受多个参数的函数变换成接受一个单一参数（最初函数的第一个参数）的函数，并且返回接受余下的参数且返回结果的新函数的技术

**通用版**

``` js
function curry(fn, args) {
    var length = fn.length;
    var args = args || [];
    return function(){
        newArgs = args.concat(Array.prototype.slice.call(arguments));
        if (newArgs.length < length) {
            return curry.call(this,fn,newArgs);
        }else{
            return fn.apply(this,newArgs);
        }
    }
}

function multiFn(a, b, c) {
    return a * b * c;
}

var multi = curry(multiFn);

multi(2)(3)(4);
multi(2,3,4);
multi(2)(3,4);
multi(2,3)(4)

``` 

**ES6写法**

``` js
const curry = (fn, arr = []) => (...args) => (
  arg => arg.length === fn.length
    ? fn(...arg)
    : curry(fn, arg)
)([...arr, ...args])

let curryTest=curry((a,b,c,d)=>a+b+c+d)
curryTest(1,2,3)(4) //返回10
curryTest(1,2)(4)(3) //返回10
curryTest(1,2)(3,4) //返回10

``` 

## 24、实现一个双向绑定

**defineProperty 版本**

``` js
// 数据
const data = {
  text: 'default'
};
const input = document.getElementById('input');
const span = document.getElementById('span');
// 数据劫持
Object.defineProperty(data, 'text', {
  // 数据变化 --> 修改视图
  set(newVal) {
    input.value = newVal;
    span.innerHTML = newVal;
  }
});
// 视图更改 --> 数据变化
input.addEventListener('keyup', function(e) {
  data.text = e.target.value;
});

``` 

**proxy 版本**

``` js
// 数据
const data = {
  text: 'default'
};
const input = document.getElementById('input');
const span = document.getElementById('span');
// 数据劫持
const handler = {
  set(target, key, value) {
    target[key] = value;
    // 数据变化 --> 修改视图
    input.value = value;
    span.innerHTML = value;
    return value;
  }
};
const proxy = new Proxy(data, handler);

// 视图更改 --> 数据变化
input.addEventListener('keyup', function(e) {
  proxy.text = e.target.value;
});

``` 


## 25、 Array.isArray 实现

是把接受多个参数的函数变换成接受一个单一参数（最初函数的第一个参数）的函数，并且返回接受余下的参数且返回结果的新函数的技术

``` js
Array.myIsArray = function(o) {
  return Object.prototype.toString.call(Object(o)) === '[object Array]';
};

console.log(Array.myIsArray([])); // true

``` 

## 26、 对象数组如何去重

根据每个对象的某一个具体属性来进行去重

``` js
const responseList = [
  { id: 1, a: 1 },
  { id: 2, a: 2 },
  { id: 3, a: 3 },
  { id: 1, a: 4 },
];
const result = responseList.reduce((acc, cur) => {
    const ids = acc.map(item => item.id);
    return ids.includes(cur.id) ? acc : [...acc, cur];
}, []);
console.log(result); // -> [ { id: 1, a: 1}, {id: 2, a: 2}, {id: 3, a: 3} ]

``` 

## 27、 实现一个函数判断数据类型

根据每个对象的某一个具体属性来进行去重

``` js
function getType(obj) {
   if (obj === null) return String(obj);
   return typeof obj === 'object' 
   ? Object.prototype.toString.call(obj).replace('[object ', '').replace(']', '').toLowerCase()
   : typeof obj;
}

// 调用
getType(null); // -> null
getType(undefined); // -> undefined
getType({}); // -> object
getType([]); // -> array
getType(123); // -> number
getType(true); // -> boolean
getType('123'); // -> string
getType(/123/); // -> regexp
getType(new Date()); // -> date

``` 

## 28、 查找字符串中出现最多的字符和个数

``` js
// 例: abbcccddddd -> 字符最多的是d，出现了5次

let str = "abcabcabcbbccccc";
let num = 0;
let char = '';

 // 使其按照一定的次序排列
str = str.split('').sort().join('');
// "aaabbbbbcccccccc"

// 定义正则表达式
let re = /(\w)\1+/g;
str.replace(re,($0,$1) => {
    if(num < $0.length){
        num = $0.length;
        char = $1;        
    }
});
console.log(`字符最多的是${char}，出现了${num}次`);

``` 

## 29、数组去重问题
** 双层 for 循环**

``` js
function distinct(arr) {
  for (let i=0, len=arr.length; i<len; i++) {
    for (let j=i+1; j<len; j++) {
      if (arr[i] == arr[j]) {
        arr.splice(j, 1);
        // splice 会改变数组长度，所以要将数组长度 len 和下标 j 减一
        len--;
        j--;
      }
    }
  }
  return arr;
}

``` 

::: warning . 
思想: 双重 for 循环是比较笨拙的方法，它实现的原理很简单：先定义一个包含原始数组第一个元素的数组，然后遍历原始数组，将原始数组中的每个元素与新数组中的每个元素进行比对，如果不重复则添加到新数组中，最后返回新数组；因为它的时间复杂度是O(n^2)，如果数组长度很大，效率会很低
:::

**Array.filter() 加 indexOf/includes**

``` js
function distinct(a, b) {
  let arr = a.concat(b);
  return arr.filter((item, index)=> {
    //return arr.indexOf(item) === index
    return arr.includes(item)
  })
}
``` 
::: warning ·
思想: 利用indexOf检测元素在数组中第一次出现的位置是否和元素现在的位置相等，如果不等则说明该元素是重复元素
:::


**ES6 中的 Set 去重**

``` js
function distinct(array) {
  return Array.from(new Set(array));
}
``` 
::: warning ·
思想: ES6 提供了新的数据结构 Set，Set 结构的一个特性就是成员值都是唯一的，没有重复的值。
:::

**reduce 实现对象数组去重复**

``` js
var resources = [
  { name: "张三", age: "18" },
  { name: "张三", age: "19" },
  { name: "张三", age: "20" },
  { name: "李四", age: "19" },
  { name: "王五", age: "20" },
  { name: "赵六", age: "21" }
]
var temp = {};
resources = resources.reduce((prev, curv) => {
 // 如果临时对象中有这个名字，什么都不做
 if (temp[curv.name]) {
 
 } else {
    // 如果临时对象没有就把这个名字加进去，同时把当前的这个对象加入到prev中
    temp[curv.name] = true;
    prev.push(curv);
 }
 return prev
}, []);
console.log("结果", resources);
``` 
::: warning ·
这种方法是利用高阶函数 reduce 进行去重， 这里只需要注意initialValue得放一个空数组[]，不然没法push
:::


## 30、基于Generator函数实现async/await原理
** 核心：传递给我一个Generator函数，把函数中的内容基于Iterator迭代器的特点一步步的执行**

``` js
function readFile(file) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(file);
    }, 1000);
    })
};

function asyncFunc(generator) {
  const iterator = generator(); // 接下来要执行next
  // data为第一次执行之后的返回结果，用于传给第二次执行
  const next = (data) => {
    let { value, done } = iterator.next(data); // 第二次执行，并接收第一次的请求结果 data
    
    if (done) return; // 执行完毕(到第三次)直接返回
    // 第一次执行next时，yield返回的 promise实例 赋值给了 value
    value.then(data => {
      next(data); // 当第一次value 执行完毕且成功时，执行下一步(并把第一次的结果传递下一步)
    });
  }
  next();
};

asyncFunc(function* () {
  // 生成器函数：控制代码一步步执行 
  let data = yield readFile('a.js'); // 等这一步骤执行执行成功之后，再往下走，没执行完的时候，直接返回
  data = yield readFile(data + 'b.js');
  return data;
})

``` 

## 31、基于Promise封装Ajax
+ 返回一个新的 Promise 实例
+ 创建 HMLHttpRequest 异步对象
+ 调用 open 方法，打开 url，与服务器建立链接（发送前的一些处理）
+ 监听 Ajax 状态信息
+ 如果 xhr.readyState == 4（表示服务器响应完成，可以获取使用服务器的响应了）
+ xhr.status == 200，返回 resolve 状态
+ xhr.status == 404，返回 reject 状态
+ xhr.readyState !== 4，把请求主体的信息基于 send 发送给服务器


``` js
function ajax(url, method) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(url, method, true)
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve(xhr.responseText)
        } else if (xhr.status === 404) {
          reject(new Error('404'))
        }
      } else {
        reject('请求数据失败')
      }
    }
    xhr.send(null)
  })
}

``` 

## 32、手动实现JSONP跨域
+ 创建 script 标签
+ 设置 script 标签的 src属性，以问号传递参数，设置好回调函数 callback 名称
+ 插入到 html 文本中
+ 调用回调函数，res 参数就是获取的数据

``` js
let script = document.createElement('script');

script.src = 'http://www.baidu.cn/login?username=JasonShu&callback=callback';

document.body.appendChild(script);

function callback (res) {
    console.log(res);
}
``` 


## 33、手动实现发布订阅
发布订阅的核心:： 每次event. emit（发布），就会触发一次event.on（注册）

``` js
class EventEmitter {
  constructor() {
    // 事件对象，存放订阅的名字和事件
    this.events = {};
  }
  // 订阅事件的方法
  on(eventName,callback) {
    if (!this.events[eventName]) {
      // 注意数据，一个名字可以订阅多个事件函数
      this.events[eventName] = [callback];
    } else  {
      // 存在则push到指定数组的尾部保存
      this.events[eventName].push(callback)
    }
  }
  // 触发事件的方法
  emit(eventName) {
    // 遍历执行所有订阅的事件
    this.events[eventName] && this.events[eventName].forEach(cb => cb());
  }
}
``` 
## 34、手动实现观察者模式

观察者模式（基于发布订阅模式） 有观察者，也有被观察者 <br/>

观察者需要放到被观察者中，被观察者的状态变化需要通知观察者 我变化了 内部也是基于发布订阅模式，收集观察者，状态变化后要主动通知观察者

```js

class Subject { // 被观察者 学生
  constructor(name) {
    this.state = '开心的'
    this.observers = []; // 存储所有的观察者
  }
  // 收集所有的观察者
  attach(o){ // Subject. prototype. attch
    this.observers.push(o)
  }
  // 更新被观察者 状态的方法
  setState(newState) {
    this.state = newState; // 更新状态
    // this 指被观察者 学生
    this.observers.forEach(o => o.update(this)) // 通知观察者 更新它们的状态
  }
}

class Observer{ // 观察者 父母和老师
  constructor(name) {
    this.name = name
  }
  update(student) {
    console.log('当前' + this.name + '被通知了', '当前学生的状态是' + student.state)
  }
}

let student = new Subject('学生'); 

let parent = new Observer('父母'); 
let teacher = new Observer('老师'); 

// 被观察者存储观察者的前提，需要先接纳观察者
student. attach(parent); 
student. attach(teacher); 
student. setState('被欺负了');

```

## 35、手动实现Object.freeze
Object.freeze    冻结一个对象，让其不能再添加/删除属性，也不能修改该对象已有属性的可枚举性、可配置可写性，也不能修改已有属性的值和它的原型属性，最后返回一个和传入参数相同的对象

```js

function myFreeze(obj){
  // 判断参数是否为Object类型，如果是就封闭对象，循环遍历对象。去掉原型属性，将其writable特性设置为false
  if(obj instanceof Object){
    Object.seal(obj);  // 封闭对象
    for(let key in obj){
      if(obj.hasOwnProperty(key)){
        Object.defineProperty(obj,key,{
          writable:false   // 设置只读
        })
        // 如果属性值依然为对象，要通过递归来进行进一步的冻结
        myFreeze(obj[key]);  
      }
    }
  }
}

```

## 36、手动实现Promise.all

+ Promise.all：有一个 promise 任务失败就全部失败
+ Promise.all 方法返回的是一个 promise

```js
function isPromise (val) {
  return typeof val.then === 'function'; // (123).then => undefined
}

Promise.all = function(promises) {
  return new Promise((resolve, reject) => {
    let arr = []; // 存放 promise执行后的结果
    let index = 0; // 计数器，用来累计promise的已执行次数
    const processData = (key, data) => {
      arr[key] = data; // 不能使用数组的长度来计算
      /*
        if (arr.length == promises.length) {
          resolve(arr);  // [null, null , 1, 2] 由于Promise异步比较慢，所以还未返回
        }
      */
     if (++index === promises.length) {
      // 必须保证数组里的每一个
       resolve(arr);
     }
    }
    // 遍历数组依次拿到执行结果
    for (let i = 0; i < promises.length; i++) {
      let result = promises[i];
      if(isPromise(result)) {
        // 让里面的promise执行，取得成功后的结果
        // data promise执行后的返回结果
        result.then((data) => {
          // 处理数据，按照原数组的顺序依次输出
          processData(i ,data)
        }, reject)  // reject本事就是个函数 所以简写了
      } else {
        // 1 , 2
        processData(i ,result)
      }
    }
  })
}

```

## 37、手动实现Promise.allSettled

::: warning .
MDN: Promise.allSettled() 方法返回一个在所有给定的 promise 都已经 fulfilled 或 rejected 后的 promise，并带有一个对象数组，每个对象表示对应的 promise 结果
:::

```js

function isPromise (val) {
  return typeof val.then === 'function'; // (123).then => undefined
}

Promise.allSettled = function(promises) {
  return new Promise((resolve, reject) => {
    let arr = [];
    let times = 0;
    const setData = (index, data) => {
      arr[index] = data;
      if (++times === promises.length) {
        resolve(arr);
      }
      console.log('times', times)
    }

    for (let i = 0; i < promises.length; i++) {
      let current = promises[i];
      if (isPromise(current)) {
        current.then((data) => {
          setData(i, { status: 'fulfilled', value: data });
        }, err => {
          setData(i, { status: 'rejected', value: err })
        })
      } else {
        setData(i, { status: 'fulfilled', value: current })
      }
    }
  })
}
```

## 38、手动实现Promise.prototype.finally

::: warning.
前面的promise不管成功还是失败，都会走到finally中，并且finally之后，还可以继续then（说明它还是一个then方法是关键），并且会将初始的promise值原封不动的传递给后面的then.
:::

**Promise.prototype.finally最大的作用**
+ finally 里的函数，无论如何都会执行，并会把前面的值原封不动传递给下一个 then 方法中
+ 如果 finally 函数中有 promise 等异步任务，会等它们全部执行完毕，再结合之前的成功与否状态，返回值

**源码实现**

```js
Promise.prototype.finally = function (callback) {
  return this.then((data) => {
    // 让函数执行 内部会调用方法，如果方法是promise，需要等待它完成
    // 如果当前promise执行时失败了，会把err传递到，err的回调函数中
    return Promise.resolve(callback()).then(() => data); // data 上一个promise的成功态
  }, err => {
    return Promise.resolve(callback()).then(() => {
      throw err; // 把之前的失败的err，抛出去
    });
  })
}
```
**Promise.prototype.finally六大情况用法**
```js
// 情况1
Promise.resolve(123).finally((data) => { // 这里传入的函数，无论如何都会执行
  console.log(data); // undefined
})

// 情况2 (这里，finally方法相当于做了中间处理，起一个过渡的作用)
Promise.resolve(123).finally((data) => {
  console.log(data); // undefined
}).then(data => {
  console.log(data); // 123
})

// 情况3 (这里只要reject，都会走到下一个then的err中)
Promise.reject(123).finally((data) => {
  console.log(data); // undefined
}).then(data => {
  console.log(data);
}, err => {
  console.log(err, 'err'); // 123 err
})

// 情况4 (一开始就成功之后，会等待finally里的promise执行完毕后，再把前面的data传递到下一个then中)
Promise.resolve(123).finally((data) => {
  console.log(data); // undefined
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('ok');
    }, 3000)
  })
}).then(data => {
  console.log(data, 'success'); // 123 success
}, err => {
  console.log(err, 'err');
})

// 情况5 (虽然一开始成功，但是只要finally函数中的promise失败了，就会把其失败的值传递到下一个then的err中)
Promise.resolve(123).finally((data) => {
  console.log(data); // undefined
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject('rejected');
    }, 3000)
  })
}).then(data => {
  console.log(data, 'success');
}, err => {
  console.log(err, 'err'); // rejected err
})

// 情况6 (虽然一开始失败，但是也要等finally中的promise执行完，才能把一开始的err传递到err的回调中)
Promise.reject(123).finally((data) => {
  console.log(data); // undefined
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('resolve');
    }, 3000)
  })
}).then(data => {
  console.log(data, 'success');
}, err => {
  console.log(err, 'err'); // 123 err
})

```

## 39、异步并发数限制

```js
/**
 * 关键点
 * 1. new promise 一经创建，立即执行
 * 2. 使用 Promise.resolve().then 可以把任务加到微任务队列，防止立即执行迭代方法
 * 3. 微任务处理过程中，产生的新的微任务，会在同一事件循环内，追加到微任务队列里
 * 4. 使用 race 在某个任务完成时，继续添加任务，保持任务按照最大并发数进行执行
 * 5. 任务完成后，需要从 doingTasks 中移出
 */
function limit(count, array, iterateFunc) {
  const tasks = []
  const doingTasks = []
  let i = 0
  const enqueue = () => {
    if (i === array.length) {
      return Promise.resolve()
    }
    const task = Promise.resolve().then(() => iterateFunc(array[i++]))
    tasks.push(task)
    const doing = task.then(() => doingTasks.splice(doingTasks.indexOf(doing), 1))
    doingTasks.push(doing)
    const res = doingTasks.length >= count ? Promise.race(doingTasks) : Promise.resolve()
    return res.then(enqueue)
  };
  return enqueue().then(() => Promise.all(tasks))
}

// test
const timeout = i => new Promise(resolve => setTimeout(() => resolve(i), i))
limit(2, [1000, 1000, 1000, 1000], timeout).then((res) => {
  console.log(res)
})
```

## 40、异步串行 | 异步并行

```js
// 字节面试题，实现一个异步加法
function asyncAdd(a, b, callback) {
  setTimeout(function () {
    callback(null, a + b);
  }, 500);
}

// 解决方案
// 1. promisify
const promiseAdd = (a, b) => new Promise((resolve, reject) => {
  asyncAdd(a, b, (err, res) => {
    if (err) {
      reject(err)
    } else {
      resolve(res)
    }
  })
})

// 2. 串行处理
async function serialSum(...args) {
  return args.reduce((task, now) => task.then(res => promiseAdd(res, now)), Promise.resolve(0))
}
// 3. 并行处理
async function parallelSum(...args) {
  if (args.length === 1) return args[0]
  const tasks = []
  for (let i = 0; i < args.length; i += 2) {
    tasks.push(promiseAdd(args[i], args[i + 1] || 0))
  }
  const results = await Promise.all(tasks)
  return parallelSum(...results)
}

// 测试
(async () => {
  console.log('Running...');
  const res1 = await serialSum(1, 2, 3, 4, 5, 8, 9, 10, 11, 12)
  console.log(res1)
  const res2 = await parallelSum(1, 2, 3, 4, 5, 8, 9, 10, 11, 12)
  console.log(res2)
  console.log('Done');
})()
```

## 41、图片懒加载
```js
// <img src="default.png" data-src="https://xxxx/real.png">
function isVisible(el) {
  const position = el.getBoundingClientRect()
  const windowHeight = document.documentElement.clientHeight
  // 顶部边缘可见
  const topVisible = position.top > 0 && position.top < windowHeight;
  // 底部边缘可见
  const bottomVisible = position.bottom < windowHeight && position.bottom > 0;
  return topVisible || bottomVisible;
}

function imageLazyLoad() {
  const images = document.querySelectorAll('img')
  for (let img of images) {
    const realSrc = img.dataset.src
    if (!realSrc) continue
    if (isVisible(img)) {
      img.src = realSrc
      img.dataset.src = ''
    }
  }
}

// 测试
window.addEventListener('load', imageLazyLoad)
window.addEventListener('scroll', imageLazyLoad)
// or
window.addEventListener('scroll', throttle(imageLazyLoad, 1000))
```

## 42、模板引擎实现

```js
let template = '我是{{name}}，年龄{{age}}，性别{{sex}}';
let data = {
  name: '姓名',
  age: 18
}
render(template, data); // 我是姓名，年龄18，性别undefined
```

```js
function render(template, data) {
  const reg = /\{\{(\w+)\}\}/; // 模板字符串正则
  if (reg.test(template)) { // 判断模板里是否有模板字符串
    const name = reg.exec(template)[1]; // 查找当前模板里第一个模板字符串的字段
    template = template.replace(reg, data[name]); // 将第一个模板字符串渲染
    return render(template, data); // 递归的渲染并返回渲染后的结构
  }
  return template; // 如果模板没有模板字符串直接返回
}
```

## 43、转化为驼峰命名

```js

var s1 = "get-element-by-id"

// 转化为 getElementById

var f = function(s) {
    return s.replace(/-\w/g, function(x) {
        return x.slice(1).toUpperCase();
    })
}

```

## 44、查找字符串中出现最多的字符和个数

例: abbcccddddd -> 字符最多的是d，出现了5次

```js
let str = "abcabcabcbbccccc";
let num = 0;
let char = '';

 // 使其按照一定的次序排列
str = str.split('').sort().join('');
// "aaabbbbbcccccccc"

// 定义正则表达式
let re = /(\w)\1+/g;
str.replace(re,($0,$1) => {
    if(num < $0.length){
        num = $0.length;
        char = $1;        
    }
});
console.log(`字符最多的是${char}，出现了${num}次`);
```

## 45、实现千位分隔符

```js
function parseToMoney(num) {
  num = parseFloat(num.toFixed(3));
  let [integer, decimal] = String.prototype.split.call(num, '.');
  integer = integer.replace(/\d(?=(\d{3})+$)/g, '$&,');
  return integer + '.' + (decimal ? decimal : '');
}

// 保留三位小数
parseToMoney(1234.56); // return '1,234.56'
parseToMoney(123456789); // return '123,456,789'
parseToMoney(1087654.321); // return '1,087,654.321'

```

## 46、判断是否是电话号码

```js
function isPhone(tel) {
    var regx = /^1[34578]\d{9}$/;
    return regx.test(tel);
}

```

## 47、验证是否是邮箱

```js
function isEmail(email) {
    var regx = /^([a-zA-Z0-9_\-])+@([a-zA-Z0-9_\-])+(\.[a-zA-Z0-9_\-])+$/;
    return regx.test(email);
}

```


## 48、验证是否是身份证

```js
function isCardNo(number) {
    var regx = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    return regx.test(number);
}

```

## 49、解析 URL Params 为对象

```js
let url = 'http://www.domain.com/?user=anonymous&id=123&id=456&city=%E5%8C%97%E4%BA%AC&enabled';
parseParam(url)
/* 结果
{ user: 'anonymous',
  id: [ 123, 456 ], // 重复出现的 key 要组装成数组，能被转成数字的就转成数字类型
  city: '北京', // 中文需解码
  enabled: true, // 未指定值得 key 约定为 true
}
*/
```

```js
function parseParam(url) {
  const paramsStr = /.+\?(.+)$/.exec(url)[1]; // 将 ? 后面的字符串取出来
  const paramsArr = paramsStr.split('&'); // 将字符串以 & 分割后存到数组中
  let paramsObj = {};
  // 将 params 存到对象中
  paramsArr.forEach(param => {
    if (/=/.test(param)) { // 处理有 value 的参数
      let [key, val] = param.split('='); // 分割 key 和 value
      val = decodeURIComponent(val); // 解码
      val = /^\d+$/.test(val) ? parseFloat(val) : val; // 判断是否转为数字

      if (paramsObj.hasOwnProperty(key)) { // 如果对象有 key，则添加一个值
        paramsObj[key] = [].concat(paramsObj[key], val);
      } else { // 如果对象没有这个 key，创建 key 并设置值
        paramsObj[key] = val;
      }
    } else { // 处理没有 value 的参数
      paramsObj[param] = true;
    }
  })

  return paramsObj;
}
```