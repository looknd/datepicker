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

    //时间常数
    var _second = 1000,
        _minute = 60 * _second,
        _hour = 60 * _minute,
        _day = 24 * _hour,
        _week = 7 * _day;

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

        //一周的开始星期（0: sunday, 1: monday etc）
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

    function DatePicker (options) {
        var self = this,
            opts = self.config(options);
    }

    DatePicker.prototype = {
        //配置函数
        config: function (options) {
            //var opts =
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
         * 对象合并
         * @param to        {object}    需要合并到的对象
         * @param from      {object}    合并项
         * @param overwrite {object}    重写
         * @returns {*}     {object}    合并后的对象
         */
        extend: function (to, from, overwrite) {

            return to;
        }
    };

    return DatePicker;
}));
