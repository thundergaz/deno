export type FaunaError = {
    message: string;
};

/** Query FaunaDB GraphQL endpoint with the provided query and variables. */
export async function queryFauna(
    query: string,
    variables: { [key: string]: unknown },
): Promise<{
    data?: unknown;
    errors?: FaunaError[];
}> {
    // Grab the secret from the environment.
    const token = Deno.env.get("FAUNA_SECRET");
    if (!token) {
        throw new Error("environment variable FAUNA_SECRET not set");
    }

    try {
        // Make a POST request to fauna's graphql endpoint with body being
        // the query and its variables.
        const res = await fetch("https://graphql.fauna.com/graphql", {
            method: "POST",
            headers: {
                authorization: `Bearer ${token}`,
                "content-type": "application/json",
            },
            body: JSON.stringify({
                query,
                variables,
            }),
        });

        const { data, errors } = await res.json();
        if (errors) {
            // Return the first error if there are any.
            return { data, errors };
        }

        return { data };
    } catch (error) {
        console.error(error);
        return { errors: [{ message: "failed to fetch data from fauna" }] };
    }
}
