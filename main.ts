import {
  serve,
} from "https://deno.land/x/sift@0.6.0/mod.ts";
import * as router from './controller/index.ts'

serve(router);
