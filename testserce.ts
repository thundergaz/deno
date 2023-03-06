import {
    json,
    serve,
    validateRequest,
  } from "https://deno.land/x/sift@0.6.0/mod.ts";
import { queryFauna, FaunaError } from "./query.ts";
  
  serve({
    "/quotes": handleQuotes,
    "/": (request, connInfo, params) => {
        const post = `Hello, you visited ${params.slug}!`;
        return new Response(post);
      },
  });
  
  
  async function handleQuotes(request: Request) {

    const { error, body } = await validateRequest(request, {
      GET: {},
      POST: {
        body: ["quote", "author"],
      },
    });
    // 验证请求体是否符合 要求
    if (error) {
      return json({ error: error.message }, { status: error.status });
    }
  
    // 拦截Post请求
    if (request.method === "POST") {
      const { quote, author, errors } = await createQuote(
        body as { quote: string; author: string },
      );
      if (errors) {
        console.error(errors.map((error) => error.message).join("\n"));
        return json({ error: "couldn't create the quote" }, { status: 500 });
      }
  
      return json({ quote, author }, { status: 201 });
    }
  
    // 拦截get请求
    {
      const { quotes, errors } = await getAllQuotes();
      if (errors) {
        console.error(errors.map((error) => error.message).join("\n"));
        return json({ error: "couldn't fetch the quotes" }, { status: 500 });
      }
  
      return json({ quotes });
    }
  }
  
  /** 获取所有元素 分页 */
  async function getAllQuotes() {
    const query = `
      query {
        allQuotes {
          data {
            quote
            author
          }
        }
      }
    `;
  
    const { data, errors } = await queryFauna(query, {});
    if (errors) {
      return { errors };
    }
  
    const {
      allQuotes: { data: quotes },
    } = data as { allQuotes: { data: string[] } };
  
    return { quotes };
  }
  
  /** 创建一个新的无素 */
  async function createQuote({
    quote,
    author,
  }: {
    quote: string;
    author: string;
  }): Promise<{ quote?: string; author?: string; errors?: FaunaError[] }> {
    const query = `
      mutation($quote: String!, $author: String!) {
        createQuote(data: { quote: $quote, author: $author }) {
          _id
          quote
          author
        }
      }
    `;
  
    const { data, errors } = await queryFauna(query, { quote, author });
    if (errors) {
      return { errors };
    }
  
    const { createQuote } = data as {
      createQuote: {
        quote: string;
        author: string;
      };
    };
  
    return createQuote; // {quote: "*", author: "*"}
  }