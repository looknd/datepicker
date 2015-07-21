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

        // 月份的前后是否填充空白，默认不填充空白
        isFillBlank: false,

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

    // 获取一个月里有多少天
    function getDayInMonth(year) {
        var febDays = isLeapYear(year) ? 29 : 28;
        return [31, febDays, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
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
        // 配置处理函数及添加常用对象属性
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

            // 一个星期的第一天是星期几
            var firstDay = parseInt(opt.firstDay);
            opt.firstDay = (firstDay > 6 || firstDay < 0) ? 0 : firstDay;
            var beforeDayShot = opt.i18n.weekdaysShot.slice(0, opt.firstDay);
            var afterDayShot = opt.i18n.weekdaysShot.slice(opt.firstDay);
            opt.i18n.weekdaysShot = afterDayShot.concat(beforeDayShot);

            // 当前日期
            this.curDate = new Date();

            // 日历Dom组件集合
            this.component = {};

            // 当前显示的日期单元格集合，包括空白单元格
            this.cells = [];

            // 当前表格需要显示的上个月的倒数几天
            this.prevMonthLastDays = [];

            // 当前表格需要显示的下个月的开始几天
            this.nextMonthFirstDays = [];
        },

        // 渲染日历整体HTML
        draw: function () {
            var cmp = this.component;
            cmp.picker = document.createElement('div');
            cmp.picker.className = 'date-picker';
            cmp.picker.appendChild(this.header());
            cmp.picker.appendChild(this.body());
            document.body.appendChild(cmp.picker);
        },

        // 渲染日历头部
        header: function () {
            var cmp = this.component;
            cmp.pickerHeader = document.createElement('div');
            cmp.pickerHeader.className = 'calendar-header';
            cmp.pickerHeader.appendChild(this.yearSelect());
            cmp.pickerHeader.appendChild(this.monthSelect());
            cmp.pickerHeader.appendChild(this.prevMonthBtn());
            cmp.pickerHeader.appendChild(this.nextMonthBtn());

            return cmp.pickerHeader;
        },

        // 渲染日历主体
        body: function () {
            var cmp = this.component,
                curYear = this.curDate.getFullYear(),
                curMonth = this.curDate.getMonth();

            cmp.pickerBody = document.createElement('table');
            cmp.pickerBody.className = 'calendar-table';
            cmp.pickerBody.appendChild(this.weekNameRow());
            cmp.pickerBody.appendChild(this.dayGrid(curYear, curMonth));

            return cmp.pickerBody;
        },

        // 年份下拉列表
        yearSelect: function () {
            var i, yearHtml, cmp = this.component,
                startYear = new Date(this.options.minDate).getFullYear() - 1,
                endYear = new Date(this.options.maxDate).getFullYear(),
                curYear = this.curDate.getFullYear();

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
            var cmp = this.component;
            cmp.prevBtn = document.createElement('button');
            cmp.prevBtn.className = 'calendar-btn calendar-prev';
            cmp.prevBtn.innerHTML = '&lt;';

            return cmp.prevBtn;
        },

        // 下一个月 按钮
        nextMonthBtn: function () {
            var cmp = this.component;
            cmp.nextBtn = document.createElement('button');
            cmp.nextBtn.className = 'calendar-btn calendar-next';
            cmp.nextBtn.innerHTML = '&gt;';

            return cmp.nextBtn;
        },

        // 星期名称
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

        // 根据年月，来获取相应的日期表格
        dayGrid: function (year, month) {
            var totalCell, monthBeforeCell,

                // 一个星期第一天的星期数
                weekFirst = parseInt(this.options.firstDay),

                // 一个月第一天的星期数
                monthFirst = new Date(year, month, 1).getDay(),

                // 第一个星期的空白单元格数量
                before = (monthFirst >= weekFirst) ? (monthFirst - weekFirst) : (7 - weekFirst + monthFirst);

            //当前月的总天数，上个月的总天数，第一个星期的空白单元格数量，最后一个星期空白单元格数量
            this.totalDay = getDayInMonth(year)[month];
            this.prevMonthTotalDay = getDayInMonth(year)[month - 1];
            this.beforeMonth = (monthFirst >= weekFirst) ? (monthFirst - weekFirst) : (7 - weekFirst + monthFirst);
            this.afterMonth = 7 - (this.beforeMonth + this.totalDay) % 7;

            // 获取上个月的倒数几天
            for (var i = 0; i < this.beforeMonth; i++) {
                this.prevMonthLastDays.push(this.prevMonthTotalDay - i);
            }
            this.prevMonthLastDays = this.prevMonthLastDays.reverse();

            // 获取下个月的前几天
            for (var j = 0; j < this.afterMonth; j++) {
                this.nextMonthFirstDays.push(j + 1);
            }

            // 循环遍历所有单元格（包括空白单元格）,并将其放进数组里
            totalCell = this.beforeMonth + this.totalDay + this.afterMonth;
            monthBeforeCell = this.beforeMonth + this.totalDay;
            for (var k = 0; k <= totalCell; k++) {
                // 判断一个月的第一天之前和最后一天之后的单元格是否填充空白
                if(this.options.isFillBlank) {
                    if(k < this.beforeMonth) {
                        this.cells.push(this.renderDay({
                            year: year,
                            month: month - 1,
                            day: this.prevMonthLastDays[k],    //填充上个月的倒数几天
                            empty: true
                        }));
                    } else if(k > monthBeforeCell) {
                        this.cells.push(this.renderDay({
                            year: year,
                            month: month + 1,
                            day: this.nextMonthFirstDays[k - monthBeforeCell],    //填充下个月的开始几天
                            empty: true
                        }));
                    }
                } else {
                    if(k < this.beforeMonth) {
                        this.cells.push(this.renderDay({
                            year: year,
                            month: month - 1,
                            day: this.prevMonthLastDays[k],    //填充上个月的倒数几天
                            disabled: true
                        }));
                    } else if(k > monthBeforeCell) {
                        this.cells.push(this.renderDay({
                            year: year,
                            month: month + 1,
                            day: this.nextMonthFirstDays[k - monthBeforeCell],    //填充下个月的开始几天
                            disabled: true
                        }));
                    }
                }

                // 添加正常的天数
                if(k > this.beforeMonth && k <= this.beforeMonth + this.totalDay) {
                    this.cells.push(this.renderDay({
                        year: year,
                        month: month,
                        day: k - this.beforeMonth
                    }));
                }
            }

            this.component.pickerGrid = document.createElement('tbody');
            this.component.pickerGrid.innerHTML = this.cells.join('');

            return this.component.pickerGrid;
        },

        renderWeek: function (days) {
            return '<tr>' + days.join('') + '</tr>';
        },

        // 渲染天数单元格，并添加必要的状态
        renderDay: function (cellOpts) {
            var cell, classArr = [],
                dateStr = cellOpts.year + ',' + (cellOpts.month + 1) + ',' + cellOpts.day;

            if (cellOpts.disabled) {
                // 设置'禁用'状态
                classArr.push('calendar-cell-disabled');
            } else if (cellOpts.selected) {
                // 设置'选中'状态
                classArr.push('calendar-cell-selected');
            } else if (cellOpts.empty) {
                // 设置'空'状态
                classArr.push('calendar-cell-empty');
            }

            cell = '<td class="' + classArr.join(' ') + '" data-date="' + dateStr +'">' + cellOpts.day + '</td>';
            return cell;
        }
    };

    return Picker;
}));
