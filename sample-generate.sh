# Just 4 regular modules and the main one
# node index.js generate --module main\
#  --view header,footer

# node index.js generate --module gallery\
#  --controller 'album list, album detail, photo list, photo detail, album add, photo add, search'\
#  --directive 'scrolling,random,share'\
#  --filter 'size'\
#  --service album\
#  --provider photo\

# node index.js generate --module music\
#  --controller 'album list, album detail, song list, song detail, album add, song add, search'\
#  --directive 'scrolling,random,share'\
#  --filter 'size'\
#  --service album\
#  --provider song\

# node index.js generate --module videos\
#  --controller 'album list, album detail, video list, video detail, album add, video add, search'\
#  --directive 'scrolling,random,share'\
#  --filter 'size'\
#  --service album\
#  --provider video\

time node index.js generate --module jobs\
  --controller test
 # --directive scrolling,two,three-four-five\
 # --controller 'listing list, listing detail, job list, job detail, listing add, job add, search'\
 # --filter 'size'\
 # --service listing\
 # --provider job

# Go bananas
# node index.js generate --module random\
#  --controller 'listing list, listing detail, job list, job detail, listing add, job add, album list, album detail, photo list, photo detail, photo add, song list, song detail, song add, video list, video detail, album add, video add, search,listing list, listing detail, job list, job detail, listing add, job add, album list, album detail, photo list, photo detail, photo add, song list, song detail, song add, video list, video detail, album add, video add, search,listing list, listing detail, job list, job detail, listing add, job add, album list, album detail, photo list, photo detail, photo add, song list, song detail, song add, video list, video detail, album add, video add, search'\
#  --directive 'scrolling,random,share,scrolling,random,share,scrolling,random,share,scrolling,random,share,scrolling,random,share'\
#  --filter 'size,size,size,size,size,size,size,size,size,size,size,size,size,size'\
#  --service listing,listing,listing,listing,listing,listing,listing,listing,listing,listing,listing\
#  --provider job,job,job,job,job,job,job,job,job,job,job,job,job,job,job,job\
#  --view header,footer,footer,footer,footer,footer,footer,footer,footer,footer