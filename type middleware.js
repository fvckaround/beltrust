[33mcommit 0cfd8d796f736e937a8ec064dc31b9c51a218ff0[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mmain[m[33m, [m[1;31morigin/main[m[33m)[m
Author: kingsleyonyekwelu <kimonyekwelu@gmail.com>
Date:   Sat Jul 11 09:51:44 2026 +0100

    Fix middleware edge runtime error by splitting auth config

 middleware.js          |  9 [32m++++[m[31m-----[m
 src/lib/auth.config.js | 33 [32m+++++++++++++++++++++++++++++++++[m
 src/lib/auth.js        | 32 [32m++[m[31m------------------------------[m
 3 files changed, 39 insertions(+), 35 deletions(-)
