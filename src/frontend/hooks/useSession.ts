import { clientApiV1 } from "@/shared/utils/hono-client";
import { useQuery } from "@tanstack/react-query";

const queryFn = async () => {
  const res = await clientApiV1.users.$get();
  const resJson = await res.json();
  return resJson?.data;
};

export function useSession() {
  const { data, isLoading: isFetchingUser } = useQuery({
    queryKey: ["SESSION"],
    queryFn,
  });
  return { user: data, isFetchingUser };
}
