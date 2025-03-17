"use client";

import { Input } from "@/components/ui/input";
import { client } from "@/lib/client";
import { CreateScrewDto } from "@/server/routers/screw-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const INIT_STATE: CreateScrewDto = {
  material: 1,
  name: "",
  price: "0",
  size: 1,
  stock: 0,
  type: 1,
  note: "",
};

export const RecentPost = () => {
  const [dto, setDto] = useState<CreateScrewDto>(INIT_STATE);
  const queryClient = useQueryClient();

  const { data: recentPost, isPending: isLoadingPosts } = useQuery({
    queryKey: ["get-recent-post"],
    queryFn: async () => {
      const res = await client.screw.getAll.$get({pageNumber: 1});
      return await res.json();
    },
  });

  const { mutate: createPost, isPending } = useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      const res = await client.screw.create.$post(dto);
      return await res.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["get-recent-post"] });
      setDto(INIT_STATE);
    },
  });

  return (
    <div className="w-full max-w-sm backdrop-blur-lg bg-black/15 px-8 py-6 rounded-md text-zinc-100/75 space-y-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
          }
        }}
        className="flex flex-col gap-4"
      >
        <Input placeholder="" />
        <button
          disabled={isPending}
          type="submit"
          className="rounded-md text-base/6 ring-2 ring-offset-2 ring-offset-black focus-visible:outline-none focus-visible:ring-zinc-100 ring-transparent hover:ring-zinc-100 h-12 px-10 py-3 bg-brand-700 text-zinc-800 font-medium bg-gradient-to-tl from-zinc-300 to-zinc-200 transition hover:bg-brand-800"
        >
          {isPending ? "Creating..." : "Create Post"}
        </button>
      </form>
    </div>
  );
};
