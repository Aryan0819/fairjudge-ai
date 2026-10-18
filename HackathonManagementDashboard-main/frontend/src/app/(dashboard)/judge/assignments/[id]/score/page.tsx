import { redirect } from "next/navigation";

type ScorePageProps = {
  params: Promise<{ id: string }>;
};

export default async function ScorePage({ params }: ScorePageProps) {
  const { id } = await params;
  redirect(`/judge/assignments/${id}`);
}
