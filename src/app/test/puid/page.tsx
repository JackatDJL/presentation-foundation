import { auth } from "@clerk/nextjs/server";

const Page = async () => {
  const Auth = auth();
  const uid = (await Auth).userId;
  console.log(uid);

  return (
    <div>
      <p>User ID: {uid}</p>
    </div>
  );
};

export default Page;
