import { createMvcServer, hostUntilPressingEnter, MvcRouterResult, registerFolder, untilPressEnter } from 'gaclib-host';
import { createRouter } from 'gaclib-mvc';
import { collectStaticUrls, downloadWebsite } from 'gaclib-spider';
import * as path from 'path';
import { homePageDynamicUrls, registerHomePages } from './homePages';
import { registerTopLevelPages, topLevelPageDynamicUrls } from './topLevelPages';

const router = createRouter<MvcRouterResult>();
registerFolder(router, path.join(__dirname, `./dist`));
registerHomePages(router);
registerTopLevelPages(router);

console.log(JSON.stringify(process.argv, undefined, 4));
const server = createMvcServer(router);

if (process.argv[2] === '-d') {
    server.listen(8080, 'localhost');

    const urls = collectStaticUrls(router).concat(homePageDynamicUrls).concat(topLevelPageDynamicUrls);
    downloadWebsite(urls, path.join(__dirname, './website'));
    untilPressEnter();
} else {
    hostUntilPressingEnter(server, 8080);
}
