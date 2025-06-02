const mix = require('laravel-mix');

mix.js('public/js/app.js', 'public/build/js')
   .js('public/js/landing-app.jsx', 'public/build/js')
   .js('public/js/register-app.jsx', 'public/build/js')
   .js('public/js/login-app.jsx', 'public/build/js')
   .react()
   .sass('resources/sass/app.scss', 'public/build/css')
   .options({
      processCssUrls: false
   });

// Copy fonts and other assets if needed
// mix.copyDirectory('resources/fonts', 'public/build/fonts');

if (mix.inProduction()) {
   mix.version();
}
