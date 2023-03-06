import {
  serve,
} from "https://deno.land/x/sift@0.6.0/mod.ts";
import * as route from './controller/index.ts'

let router = {}
Object.values(route).forEach(element => {
  router = { ...router, ...element }
});

serve(router);
