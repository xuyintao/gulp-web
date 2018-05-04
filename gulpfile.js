//公共
const gulp = require('gulp');
const path = require('path');
const sourcemaps = require('gulp-sourcemaps');
const gulpif = require('gulp-if');
const del = require('del');
const changed = require('gulp-changed');
//const watch = require('gulp-watch');//只编译打包过的文件
//服务器 端口3000
const browserSync = require('browser-sync');

 //样式
const less = require('gulp-less');
const LessAutoprefix = require('less-plugin-autoprefix');
const autoprefix = new LessAutoprefix({ browsers: ['last 2 versions'] });
const minifycss = require('gulp-minify-css');

//js
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');

//环境
const minimist = require('minimist');

//图片
const imagemin = require('gulp-imagemin');

const basePath={
	style:{
		src:"./app/style/**/*.less",
		dist:"./app/dist/style"
	},
	scripts:{
		src:"./app/js/**/*.js",
		dist:"./app/dist/js"
	},
	image:{
		src:"./app/images/**/*",
		dist:"./app/dist/images"
	}
}


//clean
gulp.task('clean', function (cb) {
  return del(['./app/dist'], cb);
});

// 监视文件改动并重新载入
gulp.task('server',['style'], function() {
  browserSync({
	port:8888,
    server: {
      baseDir: 'app'
    }
  });
	gulp.watch(basePath.style.src,['style']);
	gulp.watch(['app/*.html', basePath.scripts.src], browserSync.reload);
});

const knownOptions = {
  string: 'env',
  default: { env: process.env.NODE_ENV || 'development' }
};
const options = minimist(process.argv.slice(2), knownOptions);//{ _: [ 'scripts' ], env: 'development' } 

gulp.task('scripts',function() {
  return gulp.src(basePath.scripts.src)
	.pipe(changed(basePath.scripts.dist))
	.pipe(gulpif(options.env === 'development', sourcemaps.init()))
	.pipe(babel({
		presets: ['env']
	}))
    .pipe(gulpif(options.env === 'production', uglify())) // 仅在生产环境时候进行压缩 gulp scripts --env production /development
	.pipe(gulpif(options.env === 'development', sourcemaps.write('../maps')))
    .pipe(gulp.dest(basePath.scripts.dist));
});


gulp.task('style',function () {
  return gulp.src(basePath.style.src)
	.pipe(changed(basePath.scripts.dist))
	.pipe(gulpif(options.env === 'development', sourcemaps.init()))
	.pipe(less({
		plugins: [autoprefix]
	}))
	.pipe(gulpif(options.env === 'production', minifycss()))
	.pipe(gulpif(options.env === 'development', sourcemaps.write('../maps')))
    .pipe(gulp.dest(basePath.style.dist))
	.pipe(browserSync.reload({stream:true}));
});


gulp.task('imagemin', () =>
    gulp.src(basePath.image.src)
        .pipe(imagemin())
        .pipe(gulp.dest(basePath.image.dist))
);


gulp.task('build', ['clean'],function(){
	gulp.start('scripts', 'style');
});
gulp.task('default', ['scripts', 'style']);


gulp.task('watch',function(){
	gulp.watch(basePath.scripts.src,['scripts']);
	gulp.watch(basePath.style.src,['style']);
})