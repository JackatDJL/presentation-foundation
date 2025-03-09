import { headers } from "next/headers";

export default async function HeadersPage() {
  const headerList = await headers();
  const headersObject: Record<string, string> = {};

  headerList.forEach((value: string, key: string) => {
    headersObject[key] = value;
  });

  return (
    <div>
      <h1>Request Headers:</h1>
      <pre>{JSON.stringify(headersObject, null, 2)}</pre>
    </div>
  );
}
