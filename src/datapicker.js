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

    // 合并对象
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
        this.curDate = new Date();  // 当前日期
        this.component = {};        // 日历Dom组件集合
        this.cell = {};             // 日期单元格的集合
        this.cell.monthCells = [];  // 当前月份的天数单元格
        this.cell.prevCells = [];   // 上个月的倒数几天单元格
        this.cell.afterCells = [];  // 下个月的开始几天单元格
        this.config(options);
        this.draw();
    };

    // 日历对象属性
    // ============================
    Picker.prototype = {
        // 配置处理函数
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

        // 年份下拉列表，并判断年份区间
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

        // 月份下拉列表，并选中当前月份
        monthSelect: function () {
            var i, monthHtml,
                cmp = this.component,
                monthOpt = this.options.i18n.month,
                curMonth = this.curDate.getMonth();

            monthHtml = '<select name="calendar-select-month">';
            for (i = 0; i < 12; i++) {
                (curMonth === i)
                    ? monthHtml += '<option value="' + i + '" selected>' + monthOpt[i] + '</option>'
                    : monthHtml += '<option value="' + i + '">' + monthOpt[i] + '</option>';
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

        // 根据年月，来生成相应的日期表格
        dayGrid: function (year, month) {
            var dayOpts, totalRow = [], totalCell = [],
                cellObj = this.cell,
                totalDay = getDayInMonth(year)[month],
                curDay = parseInt(this.curDate.getDate());

            this.isFill(year, month);

            // 获取当前月份的天数，并对当前天，添加选中状态
            for (var i = 1; i <= totalDay; i++) {
                dayOpts = {year: year, month: month, day: i};
                (i === curDay) ? extend(dayOpts, {selected: true}) : dayOpts;
                cellObj.monthCells.push(this.renderDay(dayOpts));
            }

            // totalCell的数组连接顺序不能变
            totalCell = cellObj.prevCells.concat(cellObj.monthCells, cellObj.afterCells);

            // 将所有的单元格切割为长度为 7 的小数组，并添加到 tr 里去
            for (var j = 0; j < totalCell.length; j++) {
                if(!(j % 7)) {
                    console.log(j)
                    totalRow.push(this.renderRow(totalCell.slice(j, j + 7)));
                }
            }

            this.component.pickerGrid = document.createElement('tbody');
            this.component.pickerGrid.innerHTML = totalRow.join('');

            return this.component.pickerGrid;
        },

        // 渲染日期行
        renderRow: function (days) {
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
                // 设置'空白'状态
                classArr.push('calendar-cell-empty');
            }

            cell = '<td class="' + classArr.join(' ') + '" data-date="' + dateStr + '">' + cellOpts.day + '</td>';
            return cell;
        },

        // 获取月份的前后单元格，并判断是否添加'空白'状态
        isFill: function (year, month) {
            var prevOpts, afterOpts, cellObj = this.cell, isFb = this.options.isFillBlank,

                // 一个月的总天数
                totalDay = getDayInMonth(year)[month],

                // 上一月的总天数
                prevTotalDay = getDayInMonth(year)[month - 1],

                // 一个星期第一天的星期数
                weekFirst = parseInt(this.options.firstDay),

                // 一个月第一天的星期数
                monthFirst = new Date(year, month, 1).getDay(),

                // 第一个星期的空白单元格数量
                before = (monthFirst >= weekFirst) ? (monthFirst - weekFirst) : (7 - weekFirst + monthFirst),

                // 最后一个星期空白单元格数量
                after = 7 - (before + totalDay) % 7;

            // 获取上个月的倒数几天，并判断是否添加'空白'状态
            for (var i = 0; i < before; i++) {
                prevOpts = {year: year, month: month, day: prevTotalDay - i};
                isFb ? extend(prevOpts, {empty: true}) : extend(prevOpts, {disabled: true});
                cellObj.prevCells.push(this.renderDay(prevOpts));
            }
            cellObj.prevCells = cellObj.prevCells.reverse();

            // 获取下个月的前几天，并判断是否添加'空白'状态
            for (var j = 0; j < after; j++) {
                afterOpts = {year: year, month: month, day: j + 1};
                isFb ? extend(afterOpts, {empty: true}) : extend(afterOpts, {disabled: true});
                cellObj.afterCells.push(this.renderDay(afterOpts));
            }
        }
    };

    return Picker;
}));