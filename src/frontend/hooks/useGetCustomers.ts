import { clientApiV1 } from "@/shared/utils/hono-client";
import { useQuery } from "@tanstack/react-query";

const getCustomers = async () => {
  const response = await clientApiV1.customers.$get();
  const resJson = await response.json();
  return Array.isArray(resJson?.data)
    ? resJson?.data?.map(x => ({
        ...x,
        nextMessageTime: new Date(x.nextMessageTime),
      }))
    : [];
};

export const useGetCustomers = () => {
  const {data: customers, isLoading: isFetchingCustomers} = useQuery({
    queryKey: ["CUSTOMERS"],
    queryFn: getCustomers,
  });
  return {customers, isFetchingCustomers};
};
