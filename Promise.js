/* 
自定义Promise函数模块:IIFE
*/
(function (window) {
    const PENDING = "pending";
    const RESOLVED = "resolved";
    const REJECTED = "rejected";
    /* 
    Promise构造函数
    executor:执行器函数(同步执行)
    */
    function Promise(executor) {
        // 将当前promise实例对象保存起来
        const self = this;
        self.status = PENDING//给promise对象指定status属性，初始值为pending
        self.data = undefined;//给promise对象指定一个同用于存储结果数据的属性
        self.callbacks = [];//每个元素的结构是一个对象:{onResolved(){},onRejected(){}}

        function resolve(value) {
            //如果当前状态不是pending，直接结束
            if (self.status !== PENDING) {
                return;
            }
            // 将状态改为resolved
            self.status = RESOLVED;
            // 保存value数据
            self.data = value;
            // 若有待执行的回调函数,立即异步执行回调函数onResolved
            if (self.callbacks.length > 0) {
                setTimeout(() => {//放入队列中执行所有成功的回调
                    self.callbacks.forEach(callbacksObj => {
                        callbacksObj.onResolved(value)
                    })
                });
            }
        }
        function reject(reason) {
            //如果当前状态不是pending，直接结束
            if (self.status !== PENDING) {
                return;
            }
            // 将状态改为rejected
            self.status = REJECTED;
            // 保存reason数据
            self.data = reason;
            // 若有待执行的回调函数,立即异步执行回调函数onRejected
            if (self.callbacks.length > 0) {
                setTimeout(() => {
                    self.callbacks.forEach(callbacksObj => {
                        callbacksObj.onRejected(reason)
                    })
                });
            }
        }
        try {
            // 立即同步执行executor
            executor(resolve, reject)
        } catch (error) {//如果执行器抛出异常，promise对象变为rejected状态
            reject(error);
        }
    }
    /*  
    Promise原型对象的then()
    指定成功和失败的回调函数，
    返回一个新的promise对象
    */
    Promise.prototype.then = function (onResolved, onRejected) {/* onResolved，onRejected是用户传入的回调函数 */
        // 向后传递成功的value
        onResolved = typeof onRejected === 'function' ? onResolved : value=>value;

        // 指定默认的失败的回调(实现异常传透的关键点)，向后传递失败的reason
        onRejected = typeof onRejected === 'function' ? onRejected : reason => {throw reason}
        const self = this;
        // 返回一个新的promise对象
        return new Promise((resolve, reject) => {
            /* 
            调用指定的回调函数处理，并根据执行结果，改变retur的promise的状态
            */
            function handle(callback) {
                /* 
               1.如果onResolved返回promise对象，return promise对象的结果就是这个promise的结果
               2.如果onResolved返回非promise对象，return一个成功的promise对象(value=onResolved(self.data))
               3.如果执行throw return一个失败的promise对象(reason=err)
               */
                try {
                    const result = callback(self.data);
                    /* 
                    1.如果onResolved返回promise对象，return promise对象的结果就是这个promise的结果
                    2.如果onResolved返回非promise对象，return一个成功的promise对象(value=onResolved(self.data))
                    */
                    // result instanceof Promise ? result.then(value=>resolve(value)/* 当result指向一个成功的promise实例对象,让return的promise实例对象也为成功状态 */,reason=>reject(reason)) : resolve(result)/* 当result指向一个失败的promise实例对象,让return的promise实例对象也为失败状态 */
                    result instanceof Promise ? result.then(resolve, reject) : resolve(result)
                } catch (error) {
                    // 3.如果执行throw return一个失败的promise对象(reason=err)
                    return reject(error)
                }
            }
            if (self.status === PENDING) {//当前状态是pending，保存回调函数
                self.callbacks.push({
                    onResolved(value) {
                        handle(onResolved);//执行onResolved回调函数，并改return的promise实例的状态
                    },
                    onRejected(reason) {
                        handle(onRejected);
                    }
                })
            } else if (self.status === RESOLVED) {//调用then方法的promise实例状态为"resolved"，异步执行onResolved并改变return的promise的状态
                setTimeout(() => {
                    handle(onResolved)
                })
            } else {//调用then方法的promise实例状态为"rejected"，异步执行onRejected并改变return的promise的状态
                setTimeout(() => {
                    handle(onRejected);
                })
            }

        })
    }
    /* 
    Promise原型对象的catch()
    指定失败的回调函数，
    返回一个新的promise对象
    */
    Promise.prototype.catch = function (onRejected) {
      return this.then(undefined , onRejected)
    }
    /* 
    Promise函数对象上的resolve方法
    返回一个指定结果的成功的promise对象
     */
    Promise.resolve = function (value) {

    }
    /* 
    Promise函数对象上的reject方法
    返回一个指定reason的失败的promise对象
     */
    Promise.reject = function (reason) {

    }
    /* 
    Promise函数对象上的all方法
    返回一个promise对象,只有所有promises都是成功状态才是成功状态，否则只要有一个失败的就失败 */
    Promise.all = function (promises) {

    }
    /* 
    Promise函数对象上的race方法
    返回一个promise对象,其结果由promises中第一个完成的promise决定
     */
    Promise.race = function (promises) {

    }
    // 向外暴露Promise函数
    window.Promise = Promise;
})(window)