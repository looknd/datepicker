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

        // 格式化日期，可选项：'YYYY/MM/DD', 'YYYY年MM月DD日'
        format: 'YYYY-MM-DD',

        // 初始化的值
        defaultDate: null,

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
        var self = this,
            opts = self.config(options);
        this.draw();
    }

    DatePicker.prototype = {
        // 配置处理函数及设置常用属性
        config: function (options) {
            if (!this._o) {
                this._o = extend({}, defaults);
            }
            var opts = extend(this._o, options, true);

            // 检测Id是否存在
            var field = document.getElementById(opts.id);
            this.field = (field && field.nodeName) ? field : null;

            // 最大和最小日期
            var minYear = parseInt(new Date(opts.minDate).getFullYear());
            var maxYear = parseInt(new Date(opts.maxDate).getFullYear());
            opts.minDate = (minYear === 1970 || minYear > maxYear) ? '1900,01,01' : opts.minDate;
            opts.maxDate = (maxYear === 1970 || minYear > maxYear) ? '2300,01,01' : opts.maxDate;

            //当前日期
            this.curDate = new Date();
        },

        // 生成日历的html
        draw: function () {
            var self = this, picker;

            picker = document.createElement('div');
            picker.className = 'date-picker';
            picker.appendChild(self.pickerHeader());

            document.body.appendChild(picker);
        },

        pickerHeader: function () {
            var pickerHeader, pickerHeaderHtml, self = this;

            pickerHeaderHtml = self.yearSelect(self._o.minDate, self._o.maxDate);
            pickerHeaderHtml += self.monthSelect();
            pickerHeaderHtml += '<button type="button" class="calendar-btn calendar-prev">&lt;</button>';
            pickerHeaderHtml += '<button type="button" class="calendar-btn calendar-next">&gt;</button>';

            pickerHeader = document.createElement('div');
            pickerHeader.className = 'calendar-header';
            pickerHeader.innerHTML = pickerHeaderHtml;

            return pickerHeader;
        },

        // 年份下拉列表
        yearSelect: function () {
            var self = this, i, calendarYear, yearHtml,
                startYear = new Date(self._o.minDate).getFullYear() - 1,
                endYear = new Date(self._o.maxDate).getFullYear(),
                curYear = self.curDate.getFullYear();

            yearHtml = '<select name="calendar-select-year">';
            for (i = endYear; i > startYear; i--) {
                (curYear === i) ? yearHtml += '<option value="' + i + '" selected>' + i + '</option>'
                                : yearHtml += '<option value="' + i + '">' + i + '</option>';
            }
            yearHtml += '</select>';

            calendarYear = document.createElement('div');
            calendarYear.className = '';
            calendarYear.innerHTML = yearHtml;

            return calendarYear;
        },

        // 月份下拉列表
        monthSelect: function () {
            var i, calendarMonth, monthHtml,
                curMonth = this.curDate.getMonth() + 1;

            monthHtml = '<select name="calendar-select-month">';
            for(i = 1; i < 13; i++) {
                (curMonth === i) ? monthHtml += '<option value="' + i + '" selected>' + i + '</option>'
                                 : monthHtml += '<option value="' + i + '">' + i + '</option>';
            }
            monthHtml += '</select>';

            calendarMonth = document.createElement('div');
            calendarMonth.className = '';
            calendarMonth.innerHTML = monthHtml;

            return calendarMonth;
        }
    };

    function getInDayMonth(month) {

    }

    // 格式化日期
    function formatDate(date) {

    }

    // 检测是否是闰年
    function isLeapYear(year) {
        return (year % 4 === 0) && (year % 400 === 0) && (year % 100 !== 0);
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
