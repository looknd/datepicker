(function (root, factory) {
    if (typeof exports === 'object') {
        // CommonJs
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define([], factory);
    } else {
        // Browser globals (root is window)
        root.datepicker = factory();
    }
}(this, function () {
    'use strict';

    // 默认配置项
    var defaults = {
        // 绑定的表单元素id
        id: null,

        // 格式化日期
        format: 'YYYY-MM-DD',

        // 初始化的值
        defaultDate: null,

        // 初始化时，是否显示值
        setDefaultDate: false,

        // 一周的开始星期（0: sunday, 1: monday etc.）
        firstDay: 0,

        // 能选择的最小/最早的日期
        minDate: null,

        // 能选择的最大/最迟的日期
        maxDate: null,

        // internationalization
        i18n: {
            month: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
            weekdays: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
            weekdaysShot: ['日', '一', '二', '三', '四', '五', '六']
        },

        // 回调函数
        onSelect: null,
        onOpen: null,
        onClose: null,
        onDraw: null
    };


    // 日历构造函数
    function DatePicker(options) {

    }

    // 对外开放的API
    DatePicker.prototype = {
        // 配置函数
        config: function (options) {
            if (!this._o) {
                this._o = util.extend({}, defaults);
            }
            var opts = util.extend(this._o, options, true);

            // 处理id是否存在
            var field = document.getElementById(opts.id);
            this.field = (field && field.nodeName) ? field : null;
        }
    };


    function renderHeader() {
        var pickerHeaderHtml = '';
        pickerHeaderHtml += '<select class="calendar-select-year">';
        pickerHeaderHtml += '<option value="0">2015</option>';
        pickerHeaderHtml += '</select>';
    }

    function getMonth() {

    }

    function getYear(year) {

    }


    // 检测是否是对象
    function isObject(value) {
        // http://jsperf.com/isobject4
        return value !== null && typeof value === 'object';
    }


    //合并对象
    function extend(to, from, overwrite) {
        overwrite = overwrite || false;
        var prop, hasProp;

        for (prop in from) {
            hasProp = (to[prop] !== undefined);

            if(hasProp && isObject(from[prop])) {
                //拥有相同属性，属性值为object，执行递归合并
                extend(to[prop], from[prop], overwrite);
            } else if (!hasProp || overwrite) {
                //不具有相同属性时，将不相同的属性值添加到目标对象上去
                //需要覆盖合并时，直接覆盖目标对象的所有属性
                to[prop] = from[prop];
            }
        }

        return to;
    }

    return DatePicker;
}));
