```log
PS C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu> npm run build

> web-kpu@0.1.0 build
> next build

▲ Next.js 16.4.1 (Turbopack)
- Environments: .env.local
✓ Running next.config.mjs took 215ms
- Experiments (use with caution):
  · serverActions

  Creating an optimized production build ...
✓ Compiled successfully in 50s
  Running TypeScript ...
  Finished TypeScript in 98ms ...
  Collecting page data using 7 workers ...
✓ Collecting page data using 7 workers in 11.1s
  Generating static pages using 7 workers (0/33) ...
⚠ Unsupported metadata viewport is configured in metadata export in /panitia/dashboard. Please move it to viewport export instead.
Read more: https://nextjs.org/docs/app/api-reference/functions/generate-viewport
⚠ Unsupported metadata viewport is configured in metadata export in /_not-found. Please move it to viewport export instead.
Read more: https://nextjs.org/docs/app/api-reference/functions/generate-viewport
⚠ Unsupported metadata viewport is configured in metadata export in /contact. Please move it to viewport export instead.
Read more: https://nextjs.org/docs/app/api-reference/functions/generate-viewport
⨯ useSearchParams() should be wrapped in a suspense boundary at page "/contact". Read more: https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
    at nb (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:69690)
    at Object.use (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:74159)
    at t.use (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:191340)
    at Object.o (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\.next\server\chunks\ssr\node_modules_next_1j959trwdpacv._.js:240:2168)
    at q (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\.next\server\chunks\ssr\node_modules_next_1j959trwdpacv._.js:1:4535)
    at C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\.next\server\chunks\ssr\src_components_1a7ut_ojzp79-._.js:1:307
    at al (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:86324)
    at ac (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:88140)
    at ac (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:106660)
    at ah (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:110003)
    at af (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:107320)
    at aS (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:115065)
    at ap (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:112064)
    at ah (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:110277)
    at af (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:107320)
    at aS (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:115065)
    at ac (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:100759)
    at ah (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:110003)
    at af (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:107320)
    at aS (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:115065)
    at ap (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:112064)
    at ah (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:110277)
    at af (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:107320)
    at ac (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:101342)
    at ah (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:110003)
    at af (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:107320)
    at ac (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:106278)
    at ah (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:110003)
    at af (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:107320)
    at au (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:86676)
    at ac (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:88185)
    at ah (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:110003)
    at af (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:107320)
    at aS (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:115065)
    at ap (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:112064)
    at ah (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:110277)
    at af (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:107320)
    at ac (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:88104)
    at ah (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:110003)
    at af (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:107320)
    at au (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:86676)
    at ac (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:88185)
    at ah (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:110003)
    at af (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:107320)
    at ac (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:88104)
    at ah (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:110003)
    at af (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:107320)
    at au (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:86676)
    at ac (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:88185)
    at ah (C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\node_modules\next\dist\compiled\next-server\app-page-turbo.runtime.prod.js:2:110003)
Error occurred prerendering page "/contact". Read more: https://nextjs.org/docs/messages/prerender-error
Export encountered an error on /(portal)/contact/page: /contact, exiting the build.
⨯ Next.js build worker exited with code: 1 and signal: null
PS C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu>
```