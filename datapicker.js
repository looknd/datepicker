(function (root, factory) {
    if(typeof exports === 'object') {
        //CommonJs
        module.exports = factory();
    } else if(typeof define === 'function' && define.amd) {
        //AMD
        define([], factory);
    } else {
        // Browser globals (root is window)
        root.datepicker = factory();
    }
}(this, function () {
    'use strict';

    //默认配置项
    var defaults = {
        //绑定的表单元素
        field: null,

        //field 获取焦点时，是否自动显示picker
        bound: undefined,

        //格式化日期
        format: 'YYYY-MM-DD',

        //初始化的值
        defaultDate: null,

        //初始化时，是否显示值
        setDefaultDate: false,

        //一周的开始星期（0: sunday, 1: monday etc.）
        firstDay: 0,

        //能选择的最小/最早的日期
        minDate: null,

        //能选择的最大/最迟的日期
        maxDate: null,

        //年份的范围，或数组的 上限/下限 范围
        yearRange: 10,

        //internationalization
        i18n: {
            previousMonth: 'Previous Month',
            nextMonth: 'Next Month',
            month: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
            weekdays: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
            weekdaysShot: ['日', '一', '二', '三', '四', '五', '六']
        },

        //回调函数
        onSelect: null,
        onOpen: null,
        onClose: null,
        onDraw: null
    };


    //日历构造函数
    function DatePicker (options) {
        options = options || {};

        var self = this;
    }

    DatePicker.prototype = {
        //配置函数
        config: function (options) {
            var opts = util.extend()
        },

        show: function () {

        },

        hide: function () {

        },

        destroy: function () {

        }
    };


    //特征检测及帮助函数
    var util = {
        /**
         * 检测是否是对象
         * 需要注意的是，null不被认为是一个对象，array在javascript里被认为是一个对象
         */
        isObject: function (value) {
            // http://jsperf.com/isobject4
            return value !== null && typeof value === 'object';
        },
        
        isFunction: function (value) {
            return typeof value === 'function';
        },

        /**
         * 合并对象，将源对象的所有属性复制到目标对象上
         * @param destination   {object}    目标对象
         * @param source        {object}    [可选]源对象
         * @param deep          {boolean}   [可选]是否复制(继承)对象中的对象，默认：false
         * @returns {object}                返回继承了source对象属性的新对象
         */
        extend: function (destination, source, deep) {

            for(var i = 0, j = source.length; i < j; ++i) {
                var obj = source[i];

                if (!util.isObject(obj) && !util.isFunction(obj)) continue;
                var keys = Object.keys(obj);

                for(var m = 0, n = keys.length; m < n; ++m) {
                    var key = keys[i], src = obj[key];

                    if(deep && util.isObject(src)) {
                        if(!util.isObject(destination[key])) {
                            destination[key] = isArray(src) ? [] : {};
                        }
                        util.extend(destination[key], [src], true);
                    }
                }
            }


            return destination;
        }
    };

    return DatePicker;
}));
