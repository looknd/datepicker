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
            weekdaysShot: ['日', '一', '二', '三', '四', '五', '六']
        },

        // 回调函数
        onSelect: null,
        onOpen: null,
        onClose: null,
        onDraw: null
    };

    // 特征检测及工具函数
    // ============================

    // 检测是否是闰年
    var isLeapYear = function (year) {
        return (year % 4 === 0) && (year % 400 === 0) && (year % 100 !== 0);
    };

    // 检测是否是对象
    var isObject = function (value) {
        // http://jsperf.com/isobject4
        return value !== null && typeof value === 'object';
    };

    //合并对象
    var extend = function (to, from, overwrite) {
        overwrite = overwrite || false;
        var prop, hasProp;

        for (prop in from) {
            hasProp = (to[prop] !== undefined);

            if (hasProp && isObject(from[prop])) {
                //拥有相同属性，属性值为object，执行递归合并
                extend(to[prop], from[prop], overwrite);
            } else if (!hasProp || overwrite) {
                //不具有相同属性时，将不相同的属性值添加到目标对象上去
                //需要覆盖合并时，直接覆盖目标对象的所有属性
                to[prop] = from[prop];
            }
        }

        return to;
    };

    // 格式化日期
    var formatDate = function (date) {

    };

    // 获取一个月里有多少天
    function getDayInMonth(year) {
        var febDays = isLeapYear(year) ? 29 : 28;
        return [31, febDays, 31, 30, 31, 30, 31, 31, 30, 31,30, 31];
    }

    // 日历构造函数
    // ============================
    var Picker = function (options) {
        var self = this,
            opts = self.config(options);
        self.draw();
    };

    // 日历对象属性
    // ============================
    Picker.prototype = {
        // 配置处理函数及常用属性设置
        config: function (option) {
            if (!this.options) {
                this.options = extend({}, defaults);
            }

            var opt = extend(this.options, option, true);

            // 检测Id是否存在
            var field = document.getElementById(this.options.id);
            this.field = (field && field.nodeName) ? field : null;

            // 最大和最小日期
            var minYear = parseInt(new Date(opt.minDate).getFullYear());
            var maxYear = parseInt(new Date(opt.maxDate).getFullYear());
            opt.minDate = (opt.minDate === null || minYear > maxYear) ? '1900,01,01' : opt.minDate;
            opt.maxDate = (opt.maxDate === null || minYear > maxYear) ? '2300,01,01' : opt.maxDate;

            //一个星期的第一天是星期几
            var firstDay = parseInt(opt.firstDay);
            opt.firstDay = (firstDay > 6 || firstDay < 0) ? 0 : firstDay;
            var beforeDayShot = opt.i18n.weekdaysShot.slice(0, opt.firstDay);
            var afterDayShot = opt.i18n.weekdaysShot.slice(opt.firstDay);
            opt.i18n.weekdaysShot = afterDayShot.concat(beforeDayShot);

            //当前日期
            this.curDate = new Date();

            //日历Dom组件集合
            this.component = {};
        },

        // 渲染整体日历组件
        draw: function () {
            var self = this, cmp = self.component;
            cmp.picker = document.createElement('div');
            cmp.picker.className = 'date-picker';
            cmp.picker.appendChild(self.header());
            cmp.picker.appendChild(self.body());
            document.body.appendChild(cmp.picker);
        },

        // 渲染日历头部
        header: function () {
            var self = this, cmp = self.component;
            cmp.pickerHeader = document.createElement('div');
            cmp.pickerHeader.className = 'calendar-header';
            cmp.pickerHeader.appendChild(self.yearSelect());
            cmp.pickerHeader.appendChild(self.monthSelect());
            cmp.pickerHeader.appendChild(self.prevMonthBtn());
            cmp.pickerHeader.appendChild(self.nextMonthBtn());

            return cmp.pickerHeader;
        },

        // 渲染日历主体
        body: function () {
            var self = this, cmp = self.component;
            cmp.pickerBody = document.createElement('table');
            cmp.pickerBody.className = 'calendar-table';
            cmp.pickerBody.appendChild(self.weekNameRow());

            return cmp.pickerBody;
        },

        // 年份下拉列表
        yearSelect: function () {
            var i, yearHtml, self = this, cmp = self.component,
                startYear = new Date(self.options.minDate).getFullYear() - 1,
                endYear = new Date(self.options.maxDate).getFullYear(),
                curYear = self.curDate.getFullYear();

            yearHtml = '<select name="calendar-select-year">';
            for (i = endYear; i > startYear; i--) {
                (curYear === i) ? yearHtml += '<option value="' + i + '" selected>' + i + '</option>'
                    : yearHtml += '<option value="' + i + '">' + i + '</option>';
            }
            yearHtml += '</select>';

            cmp.pickerYear = document.createElement('span');
            cmp.pickerYear.className = 'calendar-select';
            cmp.pickerYear.innerHTML = yearHtml;

            return cmp.pickerYear;
        },

        // 月份下拉列表
        monthSelect: function () {
            var i, monthHtml,
                cmp = this.component,
                monthOpt = this.options.i18n.month,
                curMonth = this.curDate.getMonth();

            monthHtml = '<select name="calendar-select-month">';
            for (i = 0; i < 12; i++) {
                (curMonth === i)
                    ? monthHtml += '<option value="' + monthOpt[i] + '" selected>' + monthOpt[i] + '</option>'
                    : monthHtml += '<option value="' + monthOpt[i] + '">' + monthOpt[i] + '</option>';
            }
            monthHtml += '</select>';

            cmp.pickerMonth = document.createElement('span');
            cmp.pickerMonth.className = 'calendar-select';
            cmp.pickerMonth.innerHTML = monthHtml;

            return cmp.pickerMonth;
        },

        // 上一个月 按钮
        prevMonthBtn: function () {
            var  cmp = this.component;
            cmp.prevBtn = document.createElement('button');
            cmp.prevBtn.type = 'button';
            cmp.prevBtn.className = 'calendar-btn calendar-prev';
            cmp.prevBtn.innerHTML = '&lt;';

            return cmp.prevBtn;
        },

        // 下一个月 按钮
        nextMonthBtn: function () {
            var  cmp = this.component;
            cmp.nextBtn = document.createElement('button');
            cmp.nextBtn.type = 'button';
            cmp.nextBtn.className = 'calendar-btn calendar-next';
            cmp.nextBtn.innerHTML = '&gt;';

            return cmp.nextBtn;
        },

        // 星期标题
        weekNameRow: function () {
            var i, titleHtml,
                cmp = this.component,
                weekOpt = this.options.i18n.weekdaysShot;

            titleHtml = '<tr>';
            for (i = 0; i < 7; i++) {
                titleHtml += '<th>' + weekOpt[i] + '</th>';
            }
            titleHtml += '</tr>';

            cmp.weekTitle = document.createElement('thead');
            cmp.weekTitle.innerHTML = titleHtml;

            return cmp.weekTitle;
        },

        dayGrid: function (year, month) {
            var i, j, rowHtml, opt = this.options,

                // 获取当前月份的总天数
                totalDay = getDayInMonth(year)[month],

                // 获取当月第一天是星期几
                firstDayInWeek = new Date(year, month, 1).getDay(),

                // 获取当月第一行需要的空白列数
                firstRowBefore = Math.abs(opt.firstDay - firstDayInWeek),

                // 获取当月最后一行需要的空白列
                lastRowAfter = 7 - (totalDay + firstRowBefore) % 7,

                //获取一个月所需要的表格行数
                totalRow = Math.ceil((totalDay + firstRowBefore) / 7);

            rowHtml = '';
            for (i = 0; i < totalRow; i++) {
                rowHtml += '<tr>';
                rowHtml += '</tr>';
            }
        }
    };

    return Picker;
}));
