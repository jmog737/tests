var gulp = require('gulp');
var connect = require('gulp-connect-php');
var browserSync = require('browser-sync');

gulp.task('chrome', function() {
	process.title = "@CHROME";
  connect.server({}, function (){
	  browserSync({
		  proxy: 'localhost/tests',
			browser: "chrome",
			port: 3000,
			ui: {
			  port: 3001
			}
		});
	});

	gulp.watch('**/*.*').on('change', function () {
		browserSync.reload("**/*.*");
  });
});

gulp.task('firefox', function() {
	process.title = "@FIREFOX";
  connect.server({}, function (){
    browserSync({
      proxy: 'localhost/tests',
		  browser: "firefox",
		  port: 3002,
		  ui: {
		    port: 3003
	 	  }
	  });
  });
	gulp.watch('**/*.*').on('change', function () {
    browserSync.reload("**/*.*");
  });
});

gulp.task('opera', function() {
	process.title = "@OPERA";
  connect.server({}, function (){
    browserSync({
      proxy: 'localhost/tests',
		  browser: "opera",
		  port: 3004,
		  ui: {
		    port: 3005
	 	  }
	  });
  });

  gulp.watch('**/*.*').on('change', function () {
    browserSync.reload("**/*.*");
  });
});