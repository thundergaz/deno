import {
    json,
    validateRequest,
} from "https://deno.land/x/sift@0.6.0/mod.ts";
import { queryFauna } from "../query.ts";

export const UserRoute = {
    '/user/find/:user': getCurrentUser,
}

async function getCurrentUser(request: Request) {

    // 这里为api的请求规则，请求方式以及请求体，不符合规则会报错。
    const { error, body } = await validateRequest(request, {
        GET: {},
    });
    // 验证请求体是否符合 要求
    if (error) {
        return json({ error: error.message }, { status: error.status });
    }

    const query = `
      query {
        allDiarys {
          data {
            quote
            author
          }
        }
      }
    `;

    const { data, errors } = await queryFauna(query, {});
    if (errors) {
        console.error(errors.map((error) => error.message).join("\n"));
        return json({ error: "couldn't fetch the quotes" }, { status: 500 });
    }

    const {
        allDiarys: { data: diarys },
    } = data as { allDiarys: { data: string[] } };

    return json({ diarys });
}