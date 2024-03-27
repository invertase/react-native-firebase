rm "./src/app/page.mdx"
rm -rf "./src/app/(docs)"
bun docs.ts
sleep 1
mv "./src/app/(docs)/page.mdx" "./src/app/"
