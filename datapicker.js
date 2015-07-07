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
        //绑定的表单元素id
        id: null,

        //获取焦点时，是否自动显示picker
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
        var self = this;
    }

    DatePicker.prototype = {
        //配置函数
        config: function (options) {
            if(!this._o) {
                this._o = util.extend({}, defaults);
            }
            var opts = util.extend(this._o, options, true);

            //处理id是否存在
            var field = document.getElementById(opts.id);
            this.field = (field && field.nodeName) ? field : null;

            //处理自动显示

        },

        renderHeader: function () {
            return ''
        }
    };


    //特征检测及帮助函数
    var util = {
        /**
         * 检测是否是对象
         * 需要注意的是，此函数里null不被认为是一个对象，array在javascript里被认为是一个对象
         */
        isObject: function (value) {
            // http://jsperf.com/isobject4
            return value !== null && typeof value === 'object';
        },
        
        extend: function (to, from, overwrite) {
            overwrite = overwrite || false;
            var prop, hasProp;

            for(prop in from) {
                hasProp = to[prop] !== undefined;

                if(hasProp && util.isObject(from[prop])) {
                    //存在相同属性，需要覆盖合并时，且form的属性为object, 递归合并
                    if(overwrite) {
                        util.extend(to[prop], from[prop], overwrite);
                    }
                } else if(!hasProp || overwrite) {
                    //不存在相同属性或需要覆盖合并时, 将此属性添加到 to 里
                    to[prop] = from[prop];
                }
            }

            return to;
        }
    };

    return DatePicker;
}));
