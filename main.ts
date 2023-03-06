import {
  serve,
} from "https://deno.land/x/sift@0.6.0/mod";
import * as router from './controller'

serve(router);
