module.exports = function(grunt) {
    "use strict";

    //定义任务配置
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        //基础目录
        dirs: {
            src : 'src/**',
            dest: 'dist/<%= pkg.name %>-<%= pkg.version %>',
            test: 'test/**'
        },

        //合并文件
        concat: {
            options: {
                separator: '\n;'  //定义一个用于插入合并输出文件之间的字符
            },
            basic: {
                src : ['<%= dirs.src %>/*.js'],   //将要被合并的文件
                dest: '<%= dirs.dest %>.js'       //合并后的js文件的存放位置
            }
        },

        //压缩文件
        uglify: {
            options: {
                //定义的banner注释将插入到输出文件的顶部
                banner: '/* <%= pkg.name %> - v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            dist: {
                files: {
                    '<%= dirs.dest %>.min.js': ['<%= concat.basic.dest %>']
                }
            }
        },

        //单元测试
        nodeunit: {
            all: ['test/**/*_test.js'],
            options: {
                reporter: 'junit',
                reporterOptions: {
                    output: 'testdir'
                }
            }
        },

        //js语法检查
        jshint: {
            files: ['gruntfile.js', '<%= dirs.src %>/*.js', '<%= dirs.test %>/*.js'],
            options: {
                //这里是覆盖JSHint默认配置的选项
                globals: {
                    jQuery: true,
                    console: true,
                    module: true,
                    document: true
                }
            }
        },

        //监视文件变动
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint', 'nodeunit']
        }
    });

    //加载包含的任务的插件。
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

    //默认被执行的任务列表，只需在命令行上输入"grunt"，就会执行default task
    grunt.registerTask('default', ['jshint', 'concat', 'uglify']);

    //自定义任务列表，在命令行上输入"grunt test"，test任务就会被执行
    grunt.registerTask('test', ['jshint', 'nodeunit']);

};
