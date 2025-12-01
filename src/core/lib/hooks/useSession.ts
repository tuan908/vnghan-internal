import { api } from "@/server/client";
import { useQuery } from "@tanstack/react-query";

const queryFn = async () => {
	const res = await api.user.$get();
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
