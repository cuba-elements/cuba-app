'use strict';

const gulp = require('gulp');
const typescript = require('gulp-typescript');




gulp.task('build', () => {
  const tsProject = typescript.createProject('tsconfig.json');
  return gulp
    .src('src/**/*.ts')
    .pipe(typescript(tsProject))
    .pipe(gulp.dest('./'));
});

gulp.task('default', ['build']);