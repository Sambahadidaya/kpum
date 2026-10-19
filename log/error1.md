```log
Error: Error evaluating Node.js code
Error: Cannot find module '@tailwindcss/postcss'
Require stack:
- C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\.next\dev\build\chunks\[root-of-the-server]__1kki86fknkq7y._.js
- C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\.next\dev\build\chunks\[turbopack]_runtime.js  
- C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\.next\dev\build\chunks\pool_entry-[turbopack-node]_transforms_postcss_ts_0tp-k2vy8nj6i._.js
    [at Module._resolveFilename (node:internal/modules/cjs/loader:1456:15)]
    [at defaultResolveImpl (node:internal/modules/cjs/loader:1066:19)]
    [at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1071:22)]
    [at Module._load (node:internal/modules/cjs/loader:1242:25)]
    [at wrapModuleLoad (node:internal/modules/cjs/loader:255:19)]
    [at Module.require (node:internal/modules/cjs/loader:1556:12)]
    [at require (node:internal/modules/helpers:152:16)]
    [at <anonymous> (turbopack:///[turbopack-node]/transforms/postcss.ts?config=[project]/postcss.config.mjs:49:25)]
    [at <anonymous>]
    [at Module.init (turbopack:///[turbopack-node]/transforms/postcss.ts?config=[project]/postcss.config.mjs:43:33)]

Import trace:
  Client Component Browser:
    ./src/app/globals.css [Client Component Browser]
    ./src/app/layout.js [Server Component]



./src/components/SamsAsisten.js:8:1
Error: Module not found: Can't resolve '@/api/openai/chat'
   6 | import { panduanData } from '@/data/panduanData';
   7 | import { ketentuanData } from '@/data/ketentuanData';
>  8 | import { generateAnswer } from '@/api/openai/chat';
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   9 | import { saveChatHistory } from '@/api/supabase/public/admin';
  10 | import { usePathname } from 'next/navigation';
  11 |

Import map: aliased to relative './src/api/openai/chat' inside of [project]/


Import trace:
  Server Component:
    ./src/components/SamsAsisten.js
    ./src/app/(portal)/layout.js

https://nextjs.org/docs/messages/module-not-found



./src/components/SamsAsisten.js:8:1
Error: Module not found: Can't resolve '@/api/openai/chat'
   6 | import { panduanData } from '@/data/panduanData';
   7 | import { ketentuanData } from '@/data/ketentuanData';
>  8 | import { generateAnswer } from '@/api/openai/chat';
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   9 | import { saveChatHistory } from '@/api/supabase/public/admin';
  10 | import { usePathname } from 'next/navigation';
  11 |

Import map: aliased to relative './src/api/openai/chat' inside of [project]/


Import trace:
  Server Component:
    ./src/components/SamsAsisten.js
    ./src/app/(portal)/layout.js

https://nextjs.org/docs/messages/module-not-found



./src/components/SamsAsisten.js:9:1
Error: Module not found: Can't resolve '@/api/supabase/public/admin'
   7 | import { ketentuanData } from '@/data/ketentuanData';
   8 | import { generateAnswer } from '@/api/openai/chat';
>  9 | import { saveChatHistory } from '@/api/supabase/public/admin';
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  10 | import { usePathname } from 'next/navigation';
  11 |
  12 | // Menyisipkan custom keyframes untuk animasi melayang acak dan titik berpikir

Import map: aliased to relative './src/api/supabase/public/admin' inside of [project]/


Import trace:
  Server Component:
    ./src/components/SamsAsisten.js
    ./src/app/(portal)/layout.js

https://nextjs.org/docs/messages/module-not-found



./src/components/SamsAsisten.js:9:1
Error: Module not found: Can't resolve '@/api/supabase/public/admin'
   7 | import { ketentuanData } from '@/data/ketentuanData';
   8 | import { generateAnswer } from '@/api/openai/chat';
>  9 | import { saveChatHistory } from '@/api/supabase/public/admin';
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  10 | import { usePathname } from 'next/navigation';
  11 |
  12 | // Menyisipkan custom keyframes untuk animasi melayang acak dan titik berpikir

Import map: aliased to relative './src/api/supabase/public/admin' inside of [project]/


Import trace:
  Server Component:
    ./src/components/SamsAsisten.js
    ./src/app/(portal)/layout.js

https://nextjs.org/docs/messages/module-not-found



./src/components/SamsAsisten.js:7:1
Error: Module not found: Can't resolve '@/data/ketentuanData'
   5 | import { getFaqBySite, getRandomQuestions } from '@/lib/faqData';
   6 | import { panduanData } from '@/data/panduanData';
>  7 | import { ketentuanData } from '@/data/ketentuanData';
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   8 | import { generateAnswer } from '@/api/openai/chat';
   9 | import { saveChatHistory } from '@/api/supabase/public/admin';
  10 | import { usePathname } from 'next/navigation';

Import map: aliased to relative './src/data/ketentuanData' inside of [project]/


Import trace:
  Server Component:
    ./src/components/SamsAsisten.js
    ./src/app/(portal)/layout.js

https://nextjs.org/docs/messages/module-not-found



./src/components/SamsAsisten.js:7:1
Error: Module not found: Can't resolve '@/data/ketentuanData'
   5 | import { getFaqBySite, getRandomQuestions } from '@/lib/faqData';
   6 | import { panduanData } from '@/data/panduanData';
>  7 | import { ketentuanData } from '@/data/ketentuanData';
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   8 | import { generateAnswer } from '@/api/openai/chat';
   9 | import { saveChatHistory } from '@/api/supabase/public/admin';
  10 | import { usePathname } from 'next/navigation';

Import map: aliased to relative './src/data/ketentuanData' inside of [project]/


Import trace:
  Server Component:
    ./src/components/SamsAsisten.js
    ./src/app/(portal)/layout.js

https://nextjs.org/docs/messages/module-not-found



./src/components/SamsAsisten.js:6:1
Error: Module not found: Can't resolve '@/data/panduanData'
  4 | import { Bot, Headset, X, Send, HelpCircle, Maximize2, Minimize2 } from 'lucide-react';     
  5 | import { getFaqBySite, getRandomQuestions } from '@/lib/faqData';
> 6 | import { panduanData } from '@/data/panduanData';
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  7 | import { ketentuanData } from '@/data/ketentuanData';
  8 | import { generateAnswer } from '@/api/openai/chat';
  9 | import { saveChatHistory } from '@/api/supabase/public/admin';

Import map: aliased to relative './src/data/panduanData' inside of [project]/


Import trace:
  Server Component:
    ./src/components/SamsAsisten.js
    ./src/app/(portal)/layout.js

https://nextjs.org/docs/messages/module-not-found



./src/components/SamsAsisten.js:6:1
Error: Module not found: Can't resolve '@/data/panduanData'
  4 | import { Bot, Headset, X, Send, HelpCircle, Maximize2, Minimize2 } from 'lucide-react';     
  5 | import { getFaqBySite, getRandomQuestions } from '@/lib/faqData';
> 6 | import { panduanData } from '@/data/panduanData';
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  7 | import { ketentuanData } from '@/data/ketentuanData';
  8 | import { generateAnswer } from '@/api/openai/chat';
  9 | import { saveChatHistory } from '@/api/supabase/public/admin';

Import map: aliased to relative './src/data/panduanData' inside of [project]/


Import trace:
  Server Component:
    ./src/components/SamsAsisten.js
    ./src/app/(portal)/layout.js

https://nextjs.org/docs/messages/module-not-found



./src/components/SamsAsisten.js:5:1
Error: Module not found: Can't resolve '@/lib/faqData'
  3 | import { useState, useEffect, useRef } from 'react';
  4 | import { Bot, Headset, X, Send, HelpCircle, Maximize2, Minimize2 } from 'lucide-react';     
> 5 | import { getFaqBySite, getRandomQuestions } from '@/lib/faqData';
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  6 | import { panduanData } from '@/data/panduanData';
  7 | import { ketentuanData } from '@/data/ketentuanData';
  8 | import { generateAnswer } from '@/api/openai/chat';

Import map: aliased to relative './src/lib/faqData' inside of [project]/


Import trace:
  Server Component:
    ./src/components/SamsAsisten.js
    ./src/app/(portal)/layout.js

https://nextjs.org/docs/messages/module-not-found



./src/components/SamsAsisten.js:5:1
Error: Module not found: Can't resolve '@/lib/faqData'
  3 | import { useState, useEffect, useRef } from 'react';
  4 | import { Bot, Headset, X, Send, HelpCircle, Maximize2, Minimize2 } from 'lucide-react';     
> 5 | import { getFaqBySite, getRandomQuestions } from '@/lib/faqData';
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  6 | import { panduanData } from '@/data/panduanData';
  7 | import { ketentuanData } from '@/data/ketentuanData';
  8 | import { generateAnswer } from '@/api/openai/chat';

Import map: aliased to relative './src/lib/faqData' inside of [project]/


Import trace:
  Server Component:
    ./src/components/SamsAsisten.js
    ./src/app/(portal)/layout.js

https://nextjs.org/docs/messages/module-not-found


○ Compiling /_error ...
 GET / 500 in 39.0s (next.js: 36.3s, proxy.ts: 2.1s, application-code: 617ms)
[browser] Uncaught Error: ./src/app/globals.css
Error: Error evaluating Node.js code
Error: Cannot find module '@tailwindcss/postcss'
Require stack:
- C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\.next\dev\build\chunks\[root-of-the-server]__1kki86fknkq7y._.js
- C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\.next\dev\build\chunks\[turbopack]_runtime.js  
- C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\.next\dev\build\chunks\pool_entry-[turbopack-node]_transforms_postcss_ts_0tp-k2vy8nj6i._.js
    [at Module._resolveFilename (node:internal/modules/cjs/loader:1456:15)]
    [at defaultResolveImpl (node:internal/modules/cjs/loader:1066:19)]
    [at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1071:22)]
    [at Module._load (node:internal/modules/cjs/loader:1242:25)]
    [at wrapModuleLoad (node:internal/modules/cjs/loader:255:19)]
    [at Module.require (node:internal/modules/cjs/loader:1556:12)]
    [at require (node:internal/modules/helpers:152:16)]
    [at <anonymous> (turbopack:///[turbopack-node]/transforms/postcss.ts?config=[project]/postcss.config.mjs:49:25)]
    [at <anonymous>]
    [at Module.init (turbopack:///[turbopack-node]/transforms/postcss.ts?config=[project]/postcss.config.mjs:43:33)]

Import trace:
  Client Component Browser:
    ./src/app/globals.css [Client Component Browser]
    ./src/app/layout.js [Server Component]


[browser] ./src/app/globals.css
Error: Error evaluating Node.js code
Error: Cannot find module '@tailwindcss/postcss'
Require stack:
- C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\.next\dev\build\chunks\[root-of-the-server]__1kki86fknkq7y._.js
- C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\.next\dev\build\chunks\[turbopack]_runtime.js
- C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\.next\dev\build\chunks\pool_entry-[turbopack-node]_transforms_postcss_ts_0tp-k2vy8nj6i._.js
    [at Module._resolveFilename (node:internal/modules/cjs/loader:1456:15)]
    [at defaultResolveImpl (node:internal/modules/cjs/loader:1066:19)]
    [at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1071:22)]
    [at Module._load (node:internal/modules/cjs/loader:1242:25)]
    [at wrapModuleLoad (node:internal/modules/cjs/loader:255:19)]
    [at Module.require (node:internal/modules/cjs/loader:1556:12)]
    [at require (node:internal/modules/helpers:152:16)]
    [at <anonymous> (turbopack:///[turbopack-node]/transforms/postcss.ts?config=[project]/postcss.config.mjs:49:25)]
    [at <anonymous>]
    [at Module.init (turbopack:///[turbopack-node]/transforms/postcss.ts?config=[project]/postcss.config.mjs:43:33)]

Import trace:
  Client Component Browser:
    ./src/app/globals.css [Client Component Browser]
    ./src/app/layout.js [Server Component]
[browser] ./src/components/SamsAsisten.js:8:1
Error: Module not found: Can't resolve '@/api/openai/chat'
   6 | import { panduanData } from '@/data/panduanData';
   7 | import { ketentuanData } from '@/data/ketentuanData';
>  8 | import { generateAnswer } from '@/api/openai/chat';
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   9 | import { saveChatHistory } from '@/api/supabase/public/admin';
  10 | import { usePathname } from 'next/navigation';
  11 |

Import map: aliased to relative './src/api/openai/chat' inside of [project]/

Import trace:
  Server Component:
    ./src/components/SamsAsisten.js
    ./src/app/(portal)/layout.js

https://nextjs.org/docs/messages/module-not-found
[browser] ./src/components/SamsAsisten.js:9:1
Error: Module not found: Can't resolve '@/api/supabase/public/admin'
   7 | import { ketentuanData } from '@/data/ketentuanData';
   8 | import { generateAnswer } from '@/api/openai/chat';
>  9 | import { saveChatHistory } from '@/api/supabase/public/admin';
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  10 | import { usePathname } from 'next/navigation';
  11 |
  12 | // Menyisipkan custom keyframes untuk animasi melayang acak dan titik berpikir

Import map: aliased to relative './src/api/supabase/public/admin' inside of [project]/

Import trace:
  Server Component:
    ./src/components/SamsAsisten.js
    ./src/app/(portal)/layout.js

https://nextjs.org/docs/messages/module-not-found
[browser] ./src/components/SamsAsisten.js:7:1
Error: Module not found: Can't resolve '@/data/ketentuanData'
   5 | import { getFaqBySite, getRandomQuestions } from '@/lib/faqData';
   6 | import { panduanData } from '@/data/panduanData';
>  7 | import { ketentuanData } from '@/data/ketentuanData';
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   8 | import { generateAnswer } from '@/api/openai/chat';
   9 | import { saveChatHistory } from '@/api/supabase/public/admin';
  10 | import { usePathname } from 'next/navigation';

Import map: aliased to relative './src/data/ketentuanData' inside of [project]/

Import trace:
  Server Component:
    ./src/components/SamsAsisten.js
    ./src/app/(portal)/layout.js

https://nextjs.org/docs/messages/module-not-found
[browser] ./src/components/SamsAsisten.js:6:1
Error: Module not found: Can't resolve '@/data/panduanData'
  4 | import { Bot, Headset, X, Send, HelpCircle, Maximize2, Minimize2 } from 'lucide-react';     
  5 | import { getFaqBySite, getRandomQuestions } from '@/lib/faqData';
> 6 | import { panduanData } from '@/data/panduanData';
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  7 | import { ketentuanData } from '@/data/ketentuanData';
  8 | import { generateAnswer } from '@/api/openai/chat';
  9 | import { saveChatHistory } from '@/api/supabase/public/admin';

Import map: aliased to relative './src/data/panduanData' inside of [project]/

Import trace:
  Server Component:
    ./src/components/SamsAsisten.js
    ./src/app/(portal)/layout.js

https://nextjs.org/docs/messages/module-not-found
[browser] ./src/components/SamsAsisten.js:5:1
Error: Module not found: Can't resolve '@/lib/faqData'
  3 | import { useState, useEffect, useRef } from 'react';
  4 | import { Bot, Headset, X, Send, HelpCircle, Maximize2, Minimize2 } from 'lucide-react';     
> 5 | import { getFaqBySite, getRandomQuestions } from '@/lib/faqData';
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  6 | import { panduanData } from '@/data/panduanData';
  7 | import { ketentuanData } from '@/data/ketentuanData';
  8 | import { generateAnswer } from '@/api/openai/chat';

Import map: aliased to relative './src/lib/faqData' inside of [project]/

Import trace:
  Server Component:
    ./src/components/SamsAsisten.js
    ./src/app/(portal)/layout.js

https://nextjs.org/docs/messages/module-not-found
[browser] ./src/app/globals.css
Error: Error evaluating Node.js code
Error: Cannot find module '@tailwindcss/postcss'
Require stack:
- C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\.next\dev\build\chunks\[root-of-the-server]__1kki86fknkq7y._.js
- C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\.next\dev\build\chunks\[turbopack]_runtime.js  
- C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\.next\dev\build\chunks\pool_entry-[turbopack-node]_transforms_postcss_ts_0tp-k2vy8nj6i._.js
    [at Module._resolveFilename (node:internal/modules/cjs/loader:1456:15)]
    [at defaultResolveImpl (node:internal/modules/cjs/loader:1066:19)]
    [at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1071:22)]
    [at Module._load (node:internal/modules/cjs/loader:1242:25)]
    [at wrapModuleLoad (node:internal/modules/cjs/loader:255:19)]
    [at Module.require (node:internal/modules/cjs/loader:1556:12)]
    [at require (node:internal/modules/helpers:152:16)]
    [at <anonymous> (turbopack:///[turbopack-node]/transforms/postcss.ts?config=[project]/postcss.config.mjs:49:25)]
    [at <anonymous>]
    [at Module.init (turbopack:///[turbopack-node]/transforms/postcss.ts?config=[project]/postcss.config.mjs:43:33)]

Import trace:
  Client Component Browser:
    ./src/app/globals.css [Client Component Browser]
    ./src/app/layout.js [Server Component]
[browser] ./src/components/SamsAsisten.js:8:1
Error: Module not found: Can't resolve '@/api/openai/chat'
   6 | import { panduanData } from '@/data/panduanData';
   7 | import { ketentuanData } from '@/data/ketentuanData';
>  8 | import { generateAnswer } from '@/api/openai/chat';
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   9 | import { saveChatHistory } from '@/api/supabase/public/admin';
  10 | import { usePathname } from 'next/navigation';
  11 |

Import map: aliased to relative './src/api/openai/chat' inside of [project]/

Import trace:
  Server Component:
    ./src/components/SamsAsisten.js
    ./src/app/(portal)/layout.js

https://nextjs.org/docs/messages/module-not-found
[browser] ./src/components/SamsAsisten.js:9:1
Error: Module not found: Can't resolve '@/api/supabase/public/admin'
   7 | import { ketentuanData } from '@/data/ketentuanData';
   8 | import { generateAnswer } from '@/api/openai/chat';
>  9 | import { saveChatHistory } from '@/api/supabase/public/admin';
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  10 | import { usePathname } from 'next/navigation';
  11 |
  12 | // Menyisipkan custom keyframes untuk animasi melayang acak dan titik berpikir

Import map: aliased to relative './src/api/supabase/public/admin' inside of [project]/

Import trace:
  Server Component:
    ./src/components/SamsAsisten.js
    ./src/app/(portal)/layout.js

https://nextjs.org/docs/messages/module-not-found
[browser] ./src/components/SamsAsisten.js:7:1
Error: Module not found: Can't resolve '@/data/ketentuanData'
   5 | import { getFaqBySite, getRandomQuestions } from '@/lib/faqData';
   6 | import { panduanData } from '@/data/panduanData';
>  7 | import { ketentuanData } from '@/data/ketentuanData';
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   8 | import { generateAnswer } from '@/api/openai/chat';
   9 | import { saveChatHistory } from '@/api/supabase/public/admin';
  10 | import { usePathname } from 'next/navigation';

Import map: aliased to relative './src/data/ketentuanData' inside of [project]/

Import trace:
  Server Component:
    ./src/components/SamsAsisten.js
    ./src/app/(portal)/layout.js

https://nextjs.org/docs/messages/module-not-found
[browser] ./src/components/SamsAsisten.js:6:1
Error: Module not found: Can't resolve '@/data/panduanData'
  4 | import { Bot, Headset, X, Send, HelpCircle, Maximize2, Minimize2 } from 'lucide-react';     
  5 | import { getFaqBySite, getRandomQuestions } from '@/lib/faqData';
> 6 | import { panduanData } from '@/data/panduanData';
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  7 | import { ketentuanData } from '@/data/ketentuanData';
  8 | import { generateAnswer } from '@/api/openai/chat';
  9 | import { saveChatHistory } from '@/api/supabase/public/admin';

Import map: aliased to relative './src/data/panduanData' inside of [project]/

Import trace:
  Server Component:
    ./src/components/SamsAsisten.js
    ./src/app/(portal)/layout.js

https://nextjs.org/docs/messages/module-not-found
[browser] ./src/components/SamsAsisten.js:5:1
Error: Module not found: Can't resolve '@/lib/faqData'
  3 | import { useState, useEffect, useRef } from 'react';
  4 | import { Bot, Headset, X, Send, HelpCircle, Maximize2, Minimize2 } from 'lucide-react';     
> 5 | import { getFaqBySite, getRandomQuestions } from '@/lib/faqData';
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  6 | import { panduanData } from '@/data/panduanData';
  7 | import { ketentuanData } from '@/data/ketentuanData';
  8 | import { generateAnswer } from '@/api/openai/chat';

Import map: aliased to relative './src/lib/faqData' inside of [project]/

Import trace:
  Server Component:
    ./src/components/SamsAsisten.js
    ./src/app/(portal)/layout.js

https://nextjs.org/docs/messages/module-not-found
[browser] ./src/app/globals.css
Error: Error evaluating Node.js code
Error: Cannot find module '@tailwindcss/postcss'
Require stack:
- C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\.next\dev\build\chunks\[root-of-the-server]__1kki86fknkq7y._.js
- C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\.next\dev\build\chunks\[turbopack]_runtime.js  
- C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\.next\dev\build\chunks\pool_entry-[turbopack-node]_transforms_postcss_ts_0tp-k2vy8nj6i._.js
    [at Module._resolveFilename (node:internal/modules/cjs/loader:1456:15)]
    [at defaultResolveImpl (node:internal/modules/cjs/loader:1066:19)]
    [at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1071:22)]
    [at Module._load (node:internal/modules/cjs/loader:1242:25)]
    [at wrapModuleLoad (node:internal/modules/cjs/loader:255:19)]
    [at Module.require (node:internal/modules/cjs/loader:1556:12)]
    [at require (node:internal/modules/helpers:152:16)]
    [at <anonymous> (turbopack:///[turbopack-node]/transforms/postcss.ts?config=[project]/postcss.config.mjs:49:25)]
    [at <anonymous>]
    [at Module.init (turbopack:///[turbopack-node]/transforms/postcss.ts?config=[project]/postcss.config.mjs:43:33)]

Import trace:
  Client Component Browser:
    ./src/app/globals.css [Client Component Browser]
    ./src/app/layout.js [Server Component]
[browser] ./src/components/SamsAsisten.js:8:1
Error: Module not found: Can't resolve '@/api/openai/chat'
   6 | import { panduanData } from '@/data/panduanData';
   7 | import { ketentuanData } from '@/data/ketentuanData';
>  8 | import { generateAnswer } from '@/api/openai/chat';
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   9 | import { saveChatHistory } from '@/api/supabase/public/admin';
  10 | import { usePathname } from 'next/navigation';
  11 |

Import map: aliased to relative './src/api/openai/chat' inside of [project]/

Import trace:
  Server Component:
    ./src/components/SamsAsisten.js
    ./src/app/(portal)/layout.js

https://nextjs.org/docs/messages/module-not-found
[browser] ./src/components/SamsAsisten.js:9:1
Error: Module not found: Can't resolve '@/api/supabase/public/admin'
   7 | import { ketentuanData } from '@/data/ketentuanData';
   8 | import { generateAnswer } from '@/api/openai/chat';
>  9 | import { saveChatHistory } from '@/api/supabase/public/admin';
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  10 | import { usePathname } from 'next/navigation';
  11 |
  12 | // Menyisipkan custom keyframes untuk animasi melayang acak dan titik berpikir

Import map: aliased to relative './src/api/supabase/public/admin' inside of [project]/

Import trace:
  Server Component:
    ./src/components/SamsAsisten.js
    ./src/app/(portal)/layout.js

https://nextjs.org/docs/messages/module-not-found
[browser] ./src/components/SamsAsisten.js:7:1
Error: Module not found: Can't resolve '@/data/ketentuanData'
   5 | import { getFaqBySite, getRandomQuestions } from '@/lib/faqData';
   6 | import { panduanData } from '@/data/panduanData';
>  7 | import { ketentuanData } from '@/data/ketentuanData';
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   8 | import { generateAnswer } from '@/api/openai/chat';
   9 | import { saveChatHistory } from '@/api/supabase/public/admin';
  10 | import { usePathname } from 'next/navigation';

Import map: aliased to relative './src/data/ketentuanData' inside of [project]/

Import trace:
  Server Component:
    ./src/components/SamsAsisten.js
    ./src/app/(portal)/layout.js

https://nextjs.org/docs/messages/module-not-found
[browser] ./src/components/SamsAsisten.js:6:1
Error: Module not found: Can't resolve '@/data/panduanData'
  4 | import { Bot, Headset, X, Send, HelpCircle, Maximize2, Minimize2 } from 'lucide-react';     
  5 | import { getFaqBySite, getRandomQuestions } from '@/lib/faqData';
> 6 | import { panduanData } from '@/data/panduanData';
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  7 | import { ketentuanData } from '@/data/ketentuanData';
  8 | import { generateAnswer } from '@/api/openai/chat';
  9 | import { saveChatHistory } from '@/api/supabase/public/admin';

Import map: aliased to relative './src/data/panduanData' inside of [project]/

Import trace:
  Server Component:
    ./src/components/SamsAsisten.js
    ./src/app/(portal)/layout.js

https://nextjs.org/docs/messages/module-not-found
[browser] ./src/components/SamsAsisten.js:5:1
Error: Module not found: Can't resolve '@/lib/faqData'
  3 | import { useState, useEffect, useRef } from 'react';
  4 | import { Bot, Headset, X, Send, HelpCircle, Maximize2, Minimize2 } from 'lucide-react';     
> 5 | import { getFaqBySite, getRandomQuestions } from '@/lib/faqData';
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  6 | import { panduanData } from '@/data/panduanData';
  7 | import { ketentuanData } from '@/data/ketentuanData';
  8 | import { generateAnswer } from '@/api/openai/chat';

Import map: aliased to relative './src/lib/faqData' inside of [project]/

Import trace:
  Server Component:
    ./src/components/SamsAsisten.js
    ./src/app/(portal)/layout.js

https://nextjs.org/docs/messages/module-not-found
[browser] ./src/app/globals.css
Error: Error evaluating Node.js code
Error: Cannot find module '@tailwindcss/postcss'
Require stack:
- C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\.next\dev\build\chunks\[root-of-the-server]__1kki86fknkq7y._.js
- C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\.next\dev\build\chunks\[turbopack]_runtime.js  
- C:\Users\samba\OneDrive\Documents\WebKPU\web-kpu\.next\dev\build\chunks\pool_entry-[turbopack-node]_transforms_postcss_ts_0tp-k2vy8nj6i._.js
    [at Module._resolveFilename (node:internal/modules/cjs/loader:1456:15)]
    [at defaultResolveImpl (node:internal/modules/cjs/loader:1066:19)]
    [at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1071:22)]
    [at Module._load (node:internal/modules/cjs/loader:1242:25)]
    [at wrapModuleLoad (node:internal/modules/cjs/loader:255:19)]
    [at Module.require (node:internal/modules/cjs/loader:1556:12)]
    [at require (node:internal/modules/helpers:152:16)]
    [at <anonymous> (turbopack:///[turbopack-node]/transforms/postcss.ts?config=[project]/postcss.config.mjs:49:25)]
    [at <anonymous>]
    [at Module.init (turbopack:///[turbopack-node]/transforms/postcss.ts?config=[project]/postcss.config.mjs:43:33)]

Import trace:
  Client Component Browser:
    ./src/app/globals.css [Client Component Browser]
    ./src/app/layout.js [Server Component]
[browser] ./src/components/SamsAsisten.js:8:1
Error: Module not found: Can't resolve '@/api/openai/chat'
   6 | import { panduanData } from '@/data/panduanData';
   7 | import { ketentuanData } from '@/data/ketentuanData';
>  8 | import { generateAnswer } from '@/api/openai/chat';
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   9 | import { saveChatHistory } from '@/api/supabase/public/admin';
  10 | import { usePathname } from 'next/navigation';
  11 |

Import map: aliased to relative './src/api/openai/chat' inside of [project]/

Import trace:
  Server Component:
    ./src/components/SamsAsisten.js
    ./src/app/(portal)/layout.js

https://nextjs.org/docs/messages/module-not-found
[browser] ./src/components/SamsAsisten.js:9:1
Error: Module not found: Can't resolve '@/api/supabase/public/admin'
   7 | import { ketentuanData } from '@/data/ketentuanData';
   8 | import { generateAnswer } from '@/api/openai/chat';
>  9 | import { saveChatHistory } from '@/api/supabase/public/admin';
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  10 | import { usePathname } from 'next/navigation';
  11 |
  12 | // Menyisipkan custom keyframes untuk animasi melayang acak dan titik berpikir

Import map: aliased to relative './src/api/supabase/public/admin' inside of [project]/

Import trace:
  Server Component:
    ./src/components/SamsAsisten.js
    ./src/app/(portal)/layout.js

https://nextjs.org/docs/messages/module-not-found
[browser] ./src/components/SamsAsisten.js:7:1
Error: Module not found: Can't resolve '@/data/ketentuanData'
   5 | import { getFaqBySite, getRandomQuestions } from '@/lib/faqData';
   6 | import { panduanData } from '@/data/panduanData';
>  7 | import { ketentuanData } from '@/data/ketentuanData';
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   8 | import { generateAnswer } from '@/api/openai/chat';
   9 | import { saveChatHistory } from '@/api/supabase/public/admin';
  10 | import { usePathname } from 'next/navigation';

Import map: aliased to relative './src/data/ketentuanData' inside of [project]/

Import trace:
  Server Component:
    ./src/components/SamsAsisten.js
    ./src/app/(portal)/layout.js

https://nextjs.org/docs/messages/module-not-found
[browser] ./src/components/SamsAsisten.js:6:1
Error: Module not found: Can't resolve '@/data/panduanData'
  4 | import { Bot, Headset, X, Send, HelpCircle, Maximize2, Minimize2 } from 'lucide-react';     
  5 | import { getFaqBySite, getRandomQuestions } from '@/lib/faqData';
> 6 | import { panduanData } from '@/data/panduanData';
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  7 | import { ketentuanData } from '@/data/ketentuanData';
  8 | import { generateAnswer } from '@/api/openai/chat';
  9 | import { saveChatHistory } from '@/api/supabase/public/admin';

Import map: aliased to relative './src/data/panduanData' inside of [project]/

Import trace:
  Server Component:
    ./src/components/SamsAsisten.js
    ./src/app/(portal)/layout.js

https://nextjs.org/docs/messages/module-not-found
[browser] ./src/components/SamsAsisten.js:5:1
Error: Module not found: Can't resolve '@/lib/faqData'
  3 | import { useState, useEffect, useRef } from 'react';
  4 | import { Bot, Headset, X, Send, HelpCircle, Maximize2, Minimize2 } from 'lucide-react';     
> 5 | import { getFaqBySite, getRandomQuestions } from '@/lib/faqData';
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  6 | import { panduanData } from '@/data/panduanData';
  7 | import { ketentuanData } from '@/data/ketentuanData';
  8 | import { generateAnswer } from '@/api/openai/chat';

Import map: aliased to relative './src/lib/faqData' inside of [project]/

Import trace:
  Server Component:
    ./src/components/SamsAsisten.js
    ./src/app/(portal)/layout.js

https://nextjs.org/docs/messages/module-not-found
```